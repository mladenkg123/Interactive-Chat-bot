import { API_BASE_URL } from './constants';

export async function fetchPreviousPrompts(jwt: string, user_id: string): Promise<any[]> {
  const requestOptions = {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt}` },
  };

  const promptResponse = await fetch(`${API_BASE_URL}/prompt/user/${user_id}`, requestOptions);
  const promptData = await promptResponse.json();
  return promptData;
}

export async function fetchPreviousAnswers(jwt: string, user_id: string): Promise<any[]> {
  const requestOptions: RequestInit = {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt}` },
  };

  const answerResponse = await fetch(`${API_BASE_URL}/answer/user/${user_id}`, requestOptions);
  const answerData = await answerResponse.json();
  return answerData;
}

export async function savePrompt(jwt: string, user_id: string, prompt: string, conversation_id: string): Promise<Response> {
  const requestOptions: RequestInit = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt}` },
    body: JSON.stringify({ user_id, prompt, conversation_id: conversation_id}),
  };

  const response = await fetch(`${API_BASE_URL}/prompt`, requestOptions);
  return response;
}

export async function saveAnswer(jwt: string, user_id: string, answer: string, prompt_id: string): Promise<any> {
  const requestOptions: RequestInit = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt}` },
    body: JSON.stringify({ answer, prompt_id, user_id }),
  };

  const response = await fetch(`${API_BASE_URL}/answer`, requestOptions);
  return response.json();
}
export async function sendPromptToPython(prompt: string, user_id: string) : Promise<any> {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, user_id }),
    };

    const response = await fetch('http://localhost:5000', requestOptions);
    return response;
}