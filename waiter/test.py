import pymongo
import os
import openai

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

def main():
    openai.api_key = "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"
    # Define the system message
    response_fn_test = chat("You are a machine learning expert.",["Explain what a neural network is."])


if __name__ == "__main__":
    main()
