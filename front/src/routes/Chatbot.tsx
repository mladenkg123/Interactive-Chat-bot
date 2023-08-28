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

type PromptResponse = {
  data: Prompt;
  status: number;
};

type Prompt = {
  prompt: string;
  conversation_id: string;
  prompt_id: string;
};

type PythonResponse = {
  data: string;
  message: string;
};

type Answer = {
  answer: string;
  prompt_id: string;
  conversation_id: string;
};

type ConversationResponse = {
  data: Array<Conversation>;
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
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);


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
            //console.log(conversationsList);
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
  
  
  
  const handleSubmit = async (event: { preventDefault: () => void }) => {
    setDisableInput(true);
    event.preventDefault();
    if (userInput.trim() === '') {
      setDisableInput(false);
      return;
    }
    if (!jwt || !user_id) {
      setDisableInput(false);
      return;
    }

    const responsePython = await sendPromptToPython(userInput, user_id);
    if (responsePython.status === 200 || responsePython.status === 500) {
      const conversation_id = conversationsList[currentConversationIndex].conversation_id;
      console.log(conversation_id, currentConversationIndex);
      const responsePrompt = await savePrompt(jwt, user_id, userInput, conversation_id);
      if (responsePrompt.status === 200) {
        const dataPrompt = await responsePrompt.json() as PromptResponse;
        //console.log(dataPrompt);
        const prompt_id = dataPrompt.data.prompt_id; 
        //console.log(prompt_id);
        await saveAnswer(jwt, "pythonData.data", prompt_id, conversation_id);
      }
    } else {
      setDisableInput(false);
      console.error('Error: Unexpected response code from the Python script');
    }
    const updatedConversation = [...conversationsHistory[0]];
    updatedConversation.push({ sender: 'User', message: userInput });
    updatedConversation.push({ sender: 'Cube-BOT', message: "pythonData.data" });
    const newConversationsHistory = [...conversationsHistory];
    newConversationsHistory[0] = updatedConversation;
    //console.log(conversationsHistory);
    setConversationsHistory(newConversationsHistory);
    setUserInput('');
    setDisableInput(false);
  };

  const handleStartNewChat = async () => {
    /*
    if (!conversationsHistory[0].length) {
      // If the conversation is empty, create a new chat and write a prompt
      const responsePrompt = await savePrompt(jwt, user_id as string, "Hello! How can I help you?", conversationsList[0].conversation_id);
      if (responsePrompt.status === 200) {
        const dataPrompt = await responsePrompt.json() as Prompt;
        await startNewConversation(jwt, user_id as string);
        setConversationsHistory([
          ...conversationsHistory,
          [{ sender: 'User', message: "Hello! How can I help you?" }]
        ]);
        //setCurrentConversationIndex(conversationsHistory.length);
      }
    } else {
      // If the conversation is not empty, simply switch to the chat
      //setCurrentConversationIndex(conversationsHistory.length - 1);
    }
    */
  };

  const handleNewChat = async () => {

    setConversationsHistory([
      [
        { sender: 'Cube-BOT', message: 'Hello! How can I help you?' },
        { sender: 'User', message: 'Hi there! I have a question.' },
      ],
    ]);
  
    navigate('/ChatBot');
  }

  const handleRestoreConversation = async (index: number) => {
    setCurrentConversationIndex(index);
    const conversationId = conversationsList[index].conversation_id;
    const promptsResponse = await fetchPreviousPrompts(jwt, conversationId);
    const answersResponse = await fetchPreviousAnswers(jwt, conversationId);
    if (promptsResponse.status === 200 && answersResponse.status === 200) {
      const responseJson = await promptsResponse.json();
      const promptsData = responseJson.data;
      const responseJson2 = await answersResponse.json();
      const answersData = responseJson2.data;
      if (Array.isArray(promptsData) && promptsData.length > 0 && Array.isArray(answersData) && answersData.length > 0) {
        const formattedPrompts = promptsData.map((promptObj: Prompt) => ({
          sender: 'User',
          message: promptObj.prompt,
        }));

        const formattedAnswers = answersData.map((answerObj: Answer) => ({
          sender: 'Cube-BOT',
          message: answerObj.answer,
        }));

        let final = [];

        for (let i = 0; i < promptsData.length * 2; i++) {
          if(i%2 == 0) {
            final[i] = formattedPrompts[i/2];
          }
          else {
            final[i] = formattedAnswers[i%2];
          }
        }
        setConversationsHistory([final]);
      } else {
        console.log('No prompts available for this conversation');
        const formattedPrompts2 = [{ sender: 'User', message: promptsData.prompt }];
        setConversationsHistory([formattedPrompts2]);
      }
    } else {
      console.error('Error fetching prompts for conversation');
    }
  };

  return (
    <div className="chatbot-container">
      <Header handleLoginClick={function (): void {
        throw new Error('Function not implemented.');
      } } handleRegisterClick={function (): void {
        throw new Error('Function not implemented.');
      } } />
      <div className="chat-container">
        <div className="chat-sidebar">
          <button className="start-new-chat-button" onClick={handleNewChat}>
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
              {conversationsHistory[0].map((msg, index) => (
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
                  <button className="send-button" type="submit" onClick={handleStartNewChat}>
                    {conversationsHistory[0].length ? 'Send' : 'New Chat'}
                  </button>
                </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
