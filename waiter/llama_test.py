import replicate
import os



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

# Function for generating LLaMA2 response
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

# Chat loop
while True:
    prompt = input('You: ')
    messages.append({"role": "user", "content": f"User: {prompt}"})
    response_generator = generate_llama2_response(messages)
    full_response = ''
    for item in response_generator:
        full_response += item
    print(full_response)

    # Optionally, you can handle conversation termination
    if "bye" in prompt.lower():
        print("Goodbye!")
        break
