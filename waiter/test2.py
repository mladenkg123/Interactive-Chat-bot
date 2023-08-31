import pymongo
import requests
import json
import openai
import os
from flask_cors import CORS
from flask import Flask, request

openai.api_key = os.environ["OPENAI_API_KEY"]


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
    response = {"message": "POST request received", "data": data}
    conversation = []
    #print(data)
    for i in data.get("conversation"):
        conversation.append(i.get("message"))
    response_fn_test = chat("", conversation)
    prompt_id = save_prompt(data.get("jwt"), data.get("user_id"), data.get("prompt"), data.get("conversation_id")).json().get("data").get("prompt_id")
    answer_response = save_answer(data.get("jwt"), response_fn_test, prompt_id, data.get("conversation_id")).json()
    #print(conversation)
    return response_fn_test, 200


def main():
    app.run()


if __name__ == "__main__":
    main()
