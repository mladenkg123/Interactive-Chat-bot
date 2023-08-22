import requests

context = ""


messages=[
             {
          "role": "system",
          "content": "You're an enthusiastic English teacher who likes to present himself in a fun way. Your nickname is Waiter. Only greet student once. Do not break character or speak in any other language than English. \
            Initiate conversations, give user assignments. Focus on conversating with your students. Your lectures are only 1 on 1.\
           and ask questions. Recommend a topic if there isn't one present. Occasionally ask user to complete or correct a sentence or a word gramatically.\
             Always correct user's grammatical and other errors. When recommending adjectives, provide their definition."
       }]



url = "https://free.churchless.tech/v1/chat/completions"

while True:
    payload = {
    "model":"gpt-3.5-turbo",
    "messages": messages

    }
    headers = {'content-type': 'application/json', 'Accept-Charset': 'UTF-8'}
    r = requests.post(url, json=payload, headers=headers)
    answer = r.json().get("choices")[0].get("message").get("content")
    print(answer)
    messages.append({"role": "assistant","content":"WAITER:"+answer})
    messages.append({"role": "user","content":"USER:"+input()})