import pymongo
import requests
import json
import openai
import os
from flask_cors import CORS
from flask import Flask, request

openai.api_key = os.environ["OPENAI_API_KEY"]

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

@app.route("/", methods=["POST"])
def handle_post():
    data = request.get_json()  # Get the JSON data from the request
    user_id = data.get("user_id")
    if not user_id:
        return {"error": "No user ID provided"}, 400
    # Return a response
    response = {"message": "POST request received", "data": data}
    conversation = []
    for i in data.get("conversation"):
        conversation.append(i.get("message"))
    response_fn_test = chat("", conversation)
    print(conversation)
    return response_fn_test, 200


def main():
    app.run()


if __name__ == "__main__":
    main()
