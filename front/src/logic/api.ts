import { API_BASE_URL } from './constants';

type Message = {
  sender: string;
  message: string;
};

function generateRequestOptionsGet(jwt: string): RequestInit {
  return {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt}` },
  };
}

export async function startNewConversation(jwt: string): Promise<Response> {
  const requestOptions: RequestInit = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt}` },
  };

  const response = await fetch(`${API_BASE_URL}/conversation`, requestOptions);
  return response;
}

export async function deleteConversation(jwt: string, conversation_id: string): Promise<Response> {
  const requestOptions: RequestInit = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt}` },
  };

  const response = await fetch(`${API_BASE_URL}/conversation/delete/${conversation_id}`, requestOptions);
  return response;
}

export async function fetchConversations(jwt: string): Promise<Response> {
  const requestOptions = generateRequestOptionsGet(jwt);

  const conversationsResponse = await fetch(`${API_BASE_URL}/conversation`, requestOptions);
  return conversationsResponse;
}

export async function fetchPreviousPrompts(jwt: string, conversation_id: string): Promise<Response> {
  const requestOptions = generateRequestOptionsGet(jwt);

  const promptResponse = await fetch(`${API_BASE_URL}/prompt/conversation/${conversation_id}`, requestOptions);
  return promptResponse;
}

export async function fetchPreviousAnswers(jwt: string, conversation_id: string): Promise<Response> {
  const requestOptions = generateRequestOptionsGet(jwt);

  const answerResponse = await fetch(`${API_BASE_URL}/answer/conversation/${conversation_id}`, requestOptions);
  return answerResponse;
}

export async function sendPromptToPython(jwt: string, prompt: string, conversation_id: string, conversation: Message[], user_id: string, selectedModel: object) : Promise<Response> {
  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jwt, prompt, conversation_id, conversation, user_id, selectedModel }),
  };

  const response = await fetch('http://localhost:5000', requestOptions);
  return response;
}