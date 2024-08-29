import requests
import json

ACCOUNT_ID = ''
AUTH_TOKEN = ''

url = f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/ai/run/@cf/meta/llama-3.1-8b-instruct-fp8"
headers = {"Authorization": f"Bearer {AUTH_TOKEN}"}
current_scene = None
stories = {}


def response(data):
  s = requests.Session()
  with s.post(url, headers=headers, json=data, stream=True) as response:
      tokenized_response = ''
      for line in response.iter_lines():
          if line:
              token = line.decode('utf-8')
              try:
                  token = json.loads(token.split('data: ')[1])
              except json.JSONDecodeError:
                  break
              tokenized_response += token['response']
  return tokenized_response  
  
def create_story(prompt):
  data = {
  "messages": [
      {"role": "system", "content": f"You are the host of a decision-making game, where you take the user through an adventure using this sentence/words: {prompt}. Format the output where before you produce the decisions, state this: Here are your options: (1: decision, 2: decision, etc.) and each decision ends in a newline. After you produce all the decisions, end the sentence and dont say anything else."},
  ],
  "stream": True
  }
  stories = {1: [{"current_scene": response(data), "decision": None}]}
  print(stories[1])
  
prompt = input()
create_story(prompt)
