import { API_BASE_URL } from './constants';

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

export async function deleteAllConversationsByUserId(jwt: string, user_id: string): Promise<Response> {
  const requestOptions: RequestInit = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt}` },
  };

  const response = await fetch(`${API_BASE_URL}/conversation/delete/user/${user_id}`, requestOptions);
  return response;
}

export async function fetchConversations(jwt: string): Promise<Response> {
  const requestOptions = generateRequestOptionsGet(jwt);

  const response = await fetch(`${API_BASE_URL}/conversation`, requestOptions);
  return response;
}

export async function fetchConversationById(jwt: string, conversation_id: string): Promise<Response> {
  const requestOptions = generateRequestOptionsGet(jwt);

  const response = await fetch(`${API_BASE_URL}/conversation/${conversation_id}`, requestOptions);
  return response;
}

export async function startNewSQLList(jwt: string): Promise<Response> {
  const requestOptions: RequestInit = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt}` },
  };

  const response = await fetch(`${API_BASE_URL}/SQL`, requestOptions);
  return response;
}

export async function deleteSQLList(jwt: string, SQLList_id: string): Promise<Response> {
  const requestOptions: RequestInit = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt}` },
  };

  const response = await fetch(`${API_BASE_URL}/SQL/delete/${SQLList_id}`, requestOptions);
  return response;
}

export async function deleteAllSQLListsByUserId(jwt: string, user_id: string): Promise<Response> {
  const requestOptions: RequestInit = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt}` },
  };

  const response = await fetch(`${API_BASE_URL}/SQL/delete/user/${user_id}`, requestOptions);
  return response;
}

export async function modifySQLListById(jwt: string, SQLList_id: string, SQLList: string): Promise<Response> {
  const requestOptions: RequestInit = {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt}` },
    body: JSON.stringify( {SQLList} ),
  };

  const response = await fetch(`${API_BASE_URL}/SQL/SQLList/${SQLList_id}`, requestOptions);
  return response;
}

export async function setActiveById(jwt: string, SQLList_id: string, active: boolean): Promise<Response> {
  const requestOptions: RequestInit = {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt}` },
    body: JSON.stringify( {active} ),
  };

  const response = await fetch(`${API_BASE_URL}/SQL/active/${SQLList_id}`, requestOptions);
  return response;
}

export async function fetchSQLLists(jwt: string): Promise<Response> {
  const requestOptions = generateRequestOptionsGet(jwt);

  const response = await fetch(`${API_BASE_URL}/SQL/`, requestOptions);
  return response;
}

export async function fetchSQLListById(jwt: string, SQLList_id: string): Promise<Response> {
  const requestOptions = generateRequestOptionsGet(jwt);

  const response = await fetch(`${API_BASE_URL}/SQL/${SQLList_id}`, requestOptions);
  return response;
}

export async function fetchUserData(jwt: string, user_id: string): Promise<Response> {
  const requestOptions = generateRequestOptionsGet(jwt);

  const response = await fetch(`${API_BASE_URL}/user/${user_id}`, requestOptions);
  return response;
}

export async function fetchPreviousPrompts(jwt: string, conversation_id: string): Promise<Response> {
  const requestOptions = generateRequestOptionsGet(jwt);

  const response = await fetch(`${API_BASE_URL}/prompt/conversation/${conversation_id}`, requestOptions);
  return response;
}

export async function fetchPreviousAnswers(jwt: string, conversation_id: string): Promise<Response> {
  const requestOptions = generateRequestOptionsGet(jwt);

  const response = await fetch(`${API_BASE_URL}/answer/conversation/${conversation_id}`, requestOptions);
  return response;
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
