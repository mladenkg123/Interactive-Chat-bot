import pymongo
import requests
import openai
import replicate
import os
import re
from flask_cors import CORS
from flask import Flask, request
from bardapi import Bard
import yagmail

openai.api_key = os.environ["OPENAI_API_KEY"]

replicate_api = os.environ['REPLICATE_API_TOKEN']

#yag_email = os.environ['YAG_EMAIL']

#yag_pass = os.environ['YAG_PASS']

# Replicate Credentials
if not (replicate_api.startswith('r8_') and len(replicate_api) == 40):
    exit(1)

'''
token = os.environ['BARD_API_KEY']
session = requests.Session()
session.headers = {
            "Host": "bard.google.com",
            "X-Same-Domain": "1",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36",
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
            "Origin": "https://bard.google.com",
            "Referer": "https://bard.google.com/",
        }
session.cookies.set("__Secure-1PSID", token)
bard = Bard(token=token, session=session, timeout=30)

'''

#yag = yagmail.SMTP(yag_email, yag_pass)

llm = 'replicate/llama70b-v2-chat:2796ee9483c3fd7aa2e171d38f4ca12251a30609463dcfd4cd76703f22e96cdf'

temperature = 0.1
top_p = 0.9
max_length = 512

# Initialize chat history
messages = [{"role": "assistant", "content": "Hello! How may I assist you today?"}]
'''
def generate_bard_response(input_text):
    response = bard.get_answer(input_text)
    print(input_text)
    print(response)

    if(response['status_code'] == 200):
        return response["content"]
    else:
        return ""
'''
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

def update_question(jwt, question_id, questions):
    headers = {
    'Content-Type': 'application/json',
    'Authorization': f'Bearer {jwt}'
    }
    data = {
        'questions': questions
    }
    url = f'http://localhost:8000/questions/{question_id}'
    
    response = requests.patch(url, json=data, headers=headers)
    return response

def update_answers_and_grade(jwt, user_id, user_answer, bot_answer, index):
    headers = {
    'Content-Type': 'application/json',
    'Authorization': f'Bearer {jwt}'
    }
    data = {
            "user_answer": user_answer,
            "bot_answer": bot_answer,
            "index": index
    }
    url = f'http://localhost:8000/user/answers_and_grades/{user_id}'
    
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

def parse_sql(sql):
    # Define regular expressions to match tables and questions
    table_pattern = r'(\d+\.\s*Tabela\s+".+?":\s*\n(?:- .+\n)+)'
    question_pattern = r'(\d+\.\s*Pitanja:\s*\n(?:\d+\..+?\n)+)'

    # Extract tables and questions using regular expressions
    tables = re.findall(table_pattern, sql, re.DOTALL)
    questions = re.findall(question_pattern, sql, re.DOTALL)
    #print("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA")
    #print(tables, questions)

    # Convert tables and questions to arrays
    tables_array = [table.strip() for table in tables]
    questions_array = [question.strip() for question in questions]
    if(len(tables_array) == 0 or len(questions_array) < 5):
        '''
        table_pattern2 = r'\d+\.\s+Tabela:\s+([A-Za-z]+)([\s\S]*?)(?=\d+\.\s+Tabela:|$)'
        question_pattern2 = r'\d+\.\s+(?!Tabela:)(.+)'

        table_matches = re.finditer(table_pattern2, sql)
        questions2 = re.findall(question_pattern2, sql)
        # Extract table information into a list of dictionaries
        tables_info = []

        for match in table_matches:
            table_name = match.group(1)
            table_content = match.group(2)
            
            # Extract column names and attributes
            column_pattern = r'-\s+([A-Za-z_]+)\s+\(([^)]+)\)'
            columns = re.findall(column_pattern, table_content)
            
            table_info = {
                "table_name": table_name,
                "columns": [{"name": col[0], "attributes": col[1]} for col in columns]
            }
            
            tables_info.append(table_info)
        '''
        # The regex pattern to match the tables
        tables_regex = r"(?P<table_name>.*)\n(?P<table_data>.*)"

        tables = re.findall(tables_regex, sql)
        table_list = []
        questions_list = []
        rex = False
        for idx, table in enumerate(tables):
            if(table[1] == "Pitanja:"):
                rex = True
            if(not rex):
                table_list.append(table)
            else:
                if(len(table[1]) > 5 and (table[1][1] == "." or table[1][2] == ".")):
                    questions_list.append(table[1])
        result = '\n'.join(['\n' if not any(t) else ' '.join(t) for t in table_list])
        #print(result)
        #print("------------------------------------------------")
        #print(questions_list)
        return [result, questions_list]
    return [tables_array, questions_array]

app = Flask(__name__)
CORS(app)
client = pymongo.MongoClient("localhost", 27017, maxPoolSize=50)
db = client["DiplomskiDB"]

@app.route("/chat", methods=["POST"]) #Add error handling
def handle_post_chat():
    data = request.get_json() 
    user_id = data.get("user_id")
    if not user_id:
        return {"error": "No user ID provided"}, 400
    conversation = []
    messages = []
    response = ''
    model = data.get("selectedModel").get("value")
    for i in data.get("conversation"):
        if(i.get("sender") == "User"): #Build and send the whole context to Llama
            messages.append({"role": "user", "content": f"User: {i.get('message')}"})
        elif(i.get("sender") == "Cube-BOT"):
            messages.append({"role": "assistant", "content": f"User: {i.get('message')}"})
        conversation.append(i.get("message"))
    if(model == "Cube-BOT"):
        response = chat("", conversation) #Send the whole context to Cube-BOT
    elif(model == "Llama"):
        response_generator = generate_llama2_response(messages)
        for item in response_generator:
            response += item
    #elif(model == "Bard"):
    #    response = generate_bard_response(data.get("conversation")[len(conversation) - 1].get("message")) #Only send the last propmt as we are keeping the session, though may have to change this if we go to another convo
    prompt_response = save_prompt(data.get("jwt"), data.get("user_id"), data.get("prompt"), data.get("conversation_id")).json()
    if(prompt_response.get("status") == 200):
        prompt_id = prompt_response.get("data").get("prompt_id")
        save_answer(data.get("jwt"), response, prompt_id, data.get("conversation_id")).json()
        update_conversation_time(data.get("jwt"), data.get("conversation_id"))
        user_propmts = []
        if (len(conversation) <= 4):
            for i in range(len(conversation)):
                if (i % 2 == 0):
                    user_propmts.append(conversation[i])
        chat_description = chat("Generate a very brief title that describes the user prompts and what he wants to talk about", user_propmts)
        update_conversation_description(data.get("jwt"), data.get("conversation_id"), chat_description)
        return response, 200
    elif(prompt_response.get("status") == 403):
        return prompt_response.get("message"), 403

@app.route("/SQL", methods=["POST"]) #Add error handling
def handle_post_SQL():
    data = request.get_json() 
    user_id = data.get("user_id")
    if not user_id:
        return {"error": "No user ID provided"}, 400
    model = data.get("selectedModel").get("value")
    if(model == "SQL"):
        prompt = data.get("prompt")
        response = chat("You are a university teacher in a Software Engineering university. You are teaching a course on databases.", [prompt])
        return response, 200
    elif(model == "generate_questions"):
        prompt = data.get("prompt")
        response = ""
        if(prompt):
            response = parse_sql(prompt)
        update_question(data.get("jwt"), data.get("conversation_id"), response)
        return response, 200
    elif(model == "oceni_odgovor"):
        response = chat("You are a university teacher in a Software Engineering university. You are teaching a course on databases. Given the table, the question and the students answer. Grade the answer to the SQL question from 1 to 10. Do not give the answer to the question just grade it. Send the answer in Serbian language.", conversation)
        update_answers_and_grade(data.get("jwt"), data.get("user_id"), data.get("prompt"), response, data.get("conversation_id"))
        return response, 200
    else:
        return 'SERVER ERROR', 500

@app.route("/email", methods=["POST"])
def handle_post_email():
    data = request.get_json()
    subject = data.get("email")
    contents = [data.get("message")]
    yag.send("cvetkovicmladen00@gmail.com", subject, contents)
    return "OK", 200

def main():
    app.run()


if __name__ == "__main__":
    main()
