import pymongo
import random
import requests
from flask_cors import CORS
from flask import Flask, request

app = Flask(__name__)
CORS(app)
global context
context = ""
client = pymongo.MongoClient("localhost", 27017, maxPoolSize=50)
db = client["GPTDB"]

@app.route("/", methods=["POST"])
def handle_post():
    data = request.get_json()  # Get the JSON data from the request
    user_id = data.get("user_id")
    if not user_id:
        return {"error": "No user ID provided"}, 400

    # Load data from the database specific to the user_id
    prompt_dict = {}
    answer_dict = {}

    collection = db["prompts"]
    cursor = collection.find({"user_id": user_id})
    for document in cursor:
        prompt = document["prompt"]
        if user_id not in prompt_dict:
            prompt_dict[user_id] = []
        prompt_dict[user_id].append(prompt)

    collection = db["answers"]
    cursor = collection.find({"user_id": user_id})
    for document in cursor:
        answer = document["answer"]
        if user_id not in answer_dict:
            answer_dict[user_id] = []
        answer_dict[user_id].append(answer)

    context = ""
    prompts = prompt_dict.get(user_id, [])
    answers = answer_dict.get(user_id, [])
    for i, prompt in enumerate(prompts):
        context += "\r\n USER: " + prompt + "\n" + "\r\nLearnAI:" + answers[i] + "\n"

    # Process the data or perform any necessary actions
    # You can access specific fields of the JSON data using data['field_name']
    waiter = Waiter(user_id)
    context += "\n" + "USER: " + data["prompt"] + "\n"
    r = waiter.request(context)
    context += "\r\nLearnAI: " + r + "\n"
    # Return a response
    response = {"message": "POST request received", "data": r}
    print(context)
    return response, 200


class Waiter:
    _urls = ["https://free.churchless.tech/v1/chat/completions"]

    def __init__(self, user_id) -> None:
        self.user_id = user_id

    def getURL(self):
        return random.choice(self._urls)

    def request(self, wish) -> str:
        url = self.getURL()
        payload = {
            "model": "gpt-3.5-turbo",
            "messages": [
                {
                    "role": "system",
                    "content": "You're an enthusiastic English teacher who likes to present himself in a fun way. Your nickname is LearnAI\
                    and you were created by LearnAI Team.\
                    Only greet student once. Do not break character or speak in any other language than English. \
                    Initiate conversations, give user assignments. Focus on conversating with your students. Your lectures are only 1 on 1.\
                    and ask questions. Recommend a topic if there isn't one present. Occasionally ask user to complete or correct a sentence or a word grammatically.\
                    Always correct user's grammatical and other errors. When recommending adjectives, provide their definition. Pay attention to the history that is fed to you as it resembles your answers beginning with LearnAI: and \
                    user answers beginning with USER:. Do not include your nickname in the answers. When answering, only include your answer, do not include the user part."
                },
                {"role": "user", "content": wish},
            ],
        }
        headers = {"content-type": "application/json", "Accept-Charset": "UTF-8"}
        r = requests.post(url, json=payload, headers=headers)
        try:
            return r.json().get("choices")[0].get("message").get("content")
        except:
            print(r.json())
            return r.json()


def main():
    app.run()


if __name__ == "__main__":
    main()
