import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCube, faUser } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Cookies from 'universal-cookie';
import {
  fetchPreviousPrompts,
  fetchPreviousAnswers,
  fetchConversations,
  savePrompt,
  saveAnswer,
  startNewConversation,
  sendPromptToPython
} from '../logic/api';
import { getUserIDFromJWT } from '../logic/utils';
import './ChatbotCss.css';

type Prompt = {
  prompt: string;
  conversation_id: string;
  _id: string;
};

type PythonResponse = {
  data: string;
  message: string;
};

type Answer = {
  name: string;
  knownFor: string[];
};

type ConversationResponse = {
  data: Array<string>;
  status: number;
};

type Conversation = {
  conversation_id: string;
};


const cookies = new Cookies();
const jwt = cookies.get('jwt') as string;
const user_id = getUserIDFromJWT(jwt);
const ChatBot = () => {

  const navigate = useNavigate();

  const [conversationsHistory, setConversationsHistory] = useState([
    [
      { sender: 'Cube-BOT', message: 'Hello! How can I help you?' }, //Mora da se promeni
      { sender: 'User', message: 'Hi there! I have a question.' },
    ],
  ]);

  const [currentConversationIndex, setCurrentConversationIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [disableInput, setDisableInput] = useState(false);
  const [conversationsList, setConversationsList] = useState<Conversation[]>([]);

  const handleUserInput = (event: { target: { value: React.SetStateAction<string>; }; }) => {
    setUserInput(event.target.value);
  };
  useEffect(() => {
    const loadConversations = async () => {
      if (jwt && user_id) {
        try {
          const conversationsListPromise = await fetchConversations(jwt);
          if (conversationsListPromise.status === 200) {
            const conversationsListResponse = await conversationsListPromise.json() as ConversationResponse;
            const conversationsList = conversationsListResponse.data;
            console.log(conversationsList);
            setConversationsList(conversationsList);
          
          } else {
            console.error('Error fetching previous conversations');
          }
        } catch (error) {
          console.error('Error:', error);
        }
      }
    };
    loadConversations().catch(error => {
      console.error('Unhandled promise error:', error);
    });
  }, []);
  
  
  
  const handleSubmit =  async (event: { preventDefault: () => void; }) => {
    setDisableInput(true);
    event.preventDefault();
    if (userInput.trim() === '') {
      setDisableInput(false);
      return;
    }
    if (!jwt) {
      setDisableInput(false);
      return;
    }
    if (!user_id) {
      setDisableInput(false);
      return;
    }

    const responsePython = await sendPromptToPython(userInput, user_id);
    if (responsePython.status === 200) { //SAVE PROMPT AND ANSWER AT THE SAME TIME????????
      const pythonData = await responsePython.json() as PythonResponse;

      const responsePrompt = await savePrompt(jwt, user_id, userInput, "64e911933918ffaf74710c78");
      if (responsePrompt.status === 200) {
        const dataPrompt = await responsePrompt.json() as Prompt;
        await saveAnswer(jwt, user_id, pythonData.data, dataPrompt._id);
      }
      //setOutput((prevOutput) => [...prevOutput, serverResponse || '']);
    } else {
      setDisableInput(false);
      console.error('Error: Unexpected response code from the Python script');
    }
    const updatedConversation = [...conversationsHistory[currentConversationIndex]];
    updatedConversation.push({ sender: 'User', message: userInput });

    const newConversationsHistory = [...conversationsHistory];
    newConversationsHistory[currentConversationIndex] = updatedConversation;

    setConversationsHistory(newConversationsHistory);
    setUserInput('');
    setDisableInput(false);
  };

  const handleStartNewChat = async () => {
    await startNewConversation(jwt, user_id as string);
    setConversationsHistory([...conversationsHistory, []]);
    setCurrentConversationIndex(conversationsHistory.length);
  };

  const handleRestoreConversation = async (index: number) => {
    setCurrentConversationIndex(index);
  
    const conversationId = conversationsList[index].conversation_id;
    const promptsResponse = await fetchPreviousPrompts(jwt, conversationId);
  
    if (promptsResponse.status === 200) {
      const responseJson = await promptsResponse.json();
      const promptsData = responseJson.data;
      if (Array.isArray(promptsData) && promptsData.length > 0) {
        const formattedPrompts = promptsData.map((promptObj: any) => ({
          sender: 'User', 
          message: promptObj.prompt,
        }));
  
        setConversationsHistory([formattedPrompts]);
      } else {
        console.log('No prompts available for this conversation');
        const formattedPrompts2 = [{ sender: 'User', message: promptsData.prompt }]; 
        console.log(promptsData.prompt);
        setConversationsHistory([formattedPrompts2]);
      }
    } else {
      console.error('Error fetching prompts for conversation');
    }
  };

  const currentConversation = conversationsHistory[currentConversationIndex];

  return (
    <div className="chatbot-container">
      <Header handleLoginClick={function (): void {
        throw new Error('Function not implemented.');
      } } handleRegisterClick={function (): void {
        throw new Error('Function not implemented.');
      } } />
      <div className="chat-container">
        <div className="chat-sidebar">
          <button className="start-new-chat-button" onClick={handleStartNewChat}>
            New Chat
          </button>
          <div className="conversation-restore-points">
            <div className="restore-points-header">Previous Chats</div>
            {conversationsList.map((conversation, index) => (
              <div
                key={index}
                className={`restore-point ${
                  index === currentConversationIndex ? 'selected' : ''
                }`}
                onClick={() => handleRestoreConversation(index)}
              >
                {index === currentConversationIndex ? (
                  <strong>Conversation {index + 1}</strong>
                ) : (
                  <span>Conversation {index + 1}</span>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="chat-content">
          <div className="previous-conversations">
            <div className="message-bubbles">
              {currentConversation.map((msg, index) => (
                <div
                  key={index}
                  className={msg.sender === 'Cube-BOT' ? 'bot-message' : 'user-message'}
                >
                  <div className="message-avatar">
                    {msg.sender === 'Cube-BOT' ? (
                      <FontAwesomeIcon icon={faCube} />
                    ) : (
                      <FontAwesomeIcon icon={faUser} />
                    )}
                  </div>
                  <div className="message-content">
                    <strong>{msg.sender}</strong>: {msg.message}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="user-input">
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                value={userInput}
                onChange={handleUserInput}
                placeholder="Type your message..."
                disabled={disableInput}
              />
              <button className="send-button" type="submit">
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
