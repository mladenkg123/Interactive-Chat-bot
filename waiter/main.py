import pymongo
import requests
import json
import openai
import replicate
import os
from flask_cors import CORS
from flask import Flask, request

openai.api_key = os.environ["OPENAI_API_KEY"]

replicate_api = os.environ['REPLICATE_API_TOKEN']
# Replicate Credentials
if not (replicate_api.startswith('r8_') and len(replicate_api) == 40):
    exit(1)

llm = 'replicate/llama70b-v2-chat:2796ee9483c3fd7aa2e171d38f4ca12251a30609463dcfd4cd76703f22e96cdf'

temperature = 0.1
top_p = 0.9
max_length = 512

# Initialize chat history
messages = [{"role": "assistant", "content": "Hello! How may I assist you today?"}]

def generate_llama2_response(messages):
    string_dialogue = "You are a helpful, enthusiastic assistant. You do not respond as 'User' or pretend to be 'User'. You only respond once as 'Assistant'.You are curious, funny and intelligent. You do not respond or answer as 'User', it's important that you only respond as an 'Assistant' and end the answer."
    
    for dict_message in messages:
        if dict_message["role"] == "user":
            string_dialogue += dict_message["content"] + "\\n\\n"
        else:
            string_dialogue += "Assistant: " + dict_message["content"] + "\\n\\n"
    
    output = replicate.run(llm,
        input={"prompt": f"{string_dialogue} Assistant: ",
               "temperature": temperature, "top_p": top_p, "max_length": max_length, "repetition_penalty": 1})
    
    return output

def save_prompt(jwt, user_id, prompt, conversation_id):
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {jwt}'
    }
    data = {
        'user_id': user_id,
        'prompt': prompt,
        'conversation_id': conversation_id
    }
    url = 'http://localhost:8000/prompt'
    
    response = requests.post(url, json=data, headers=headers)
    return response

def save_answer(jwt, answer, prompt_id, conversation_id):
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {jwt}'
    }
    data = {
        'answer': answer,
        'prompt_id': prompt_id,
        'conversation_id': conversation_id
    }
    url = 'http://localhost:8000/answer'
    
    response = requests.post(url, json=data, headers=headers)
    return response

def update_conversation_time(jwt, conversation_id):
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {jwt}'
    }
    url = f'http://localhost:8000/conversation/{conversation_id}'
    
    response = requests.patch(url, headers=headers)
    return response

def update_conversation_description(jwt, conversation_id, conversation_description):
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {jwt}'
    }
    data = {
        'conversation_description': conversation_description
    }
    url = f'http://localhost:8000/conversation/description/{conversation_id}'
    
    response = requests.patch(url, json=data, headers=headers)
    return response

def chat(system, user_assistant):
  assert isinstance(system, str), "`system` should be a string"
  assert isinstance(user_assistant, list), "`user_assistant` should be a list"
  system_msg = [{"role": "system", "content": system}]
  user_assistant_msgs = [
      {"role": "assistant", "content": user_assistant[i]} if i % 2 else {"role": "user", "content": user_assistant[i]}
      for i in range(len(user_assistant))]

  msgs = system_msg + user_assistant_msgs
  response = openai.ChatCompletion.create(model="gpt-3.5-turbo",
                                          messages=msgs)
  status_code = response["choices"][0]["finish_reason"]
  assert status_code == "stop", f"The status code was {status_code}."
  return response["choices"][0]["message"]["content"]

app = Flask(__name__)
CORS(app)
client = pymongo.MongoClient("localhost", 27017, maxPoolSize=50)
db = client["DiplomskiDB"]

@app.route("/", methods=["POST"]) #Add error handling
def handle_post():
    data = request.get_json()  # Get the JSON data from the request
    user_id = data.get("user_id")
    if not user_id:
        return {"error": "No user ID provided"}, 400
    # Return a response
    #response = {"message": "POST request received", "data": data}
    conversation = []
    messages = []
    model = data.get("selectedModel").get("value")
    if(model == "Cube-BOT"):
        for i in data.get("conversation"):
            conversation.append(i.get("message"))
        response = chat("", conversation)
    elif(model == "Llama"):
        for i in data.get("conversation"):
            if(i.get("sender") == "User"):
                messages.append({"role": "user", "content": f"User: {i.get('message')}"})
            elif(i.get("sender") == "Cube-BOT"):
                messages.append({"role": "assistant", "content": f"User: {i.get('message')}"})
        response_generator = generate_llama2_response(messages)
        response = ''
        for item in response_generator:
            response += item
    prompt_response = save_prompt(data.get("jwt"), data.get("user_id"), data.get("prompt"), data.get("conversation_id")).json()
    if(prompt_response.get("status") == 200):
        prompt_id = prompt_response.get("data").get("prompt_id")
        answer_response = save_answer(data.get("jwt"), response, prompt_id, data.get("conversation_id")).json()
        update_conversation_time(data.get("jwt"), data.get("conversation_id"))
        print(conversation)
        user_propmts = []
        if (len(conversation) <= 4):
            for i in range(len(conversation)):
                if (i % 2 == 0):
                    user_propmts.append(conversation[i])
        print(user_propmts)
        chat_description = chat("Generate a very brief title that describes the user prompts and what he wants to talk about", user_propmts)
        print(chat_description)
        update_conversation_description(data.get("jwt"), data.get("conversation_id"), chat_description)
        return response, 200
    elif(prompt_response.get("status") == 150):
        return prompt_response.get("message"), 150


def main():
    app.run()


if __name__ == "__main__":
    main()
