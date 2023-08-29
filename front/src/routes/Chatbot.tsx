import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCube, faUser } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import Cookies from 'universal-cookie';
import {
  fetchConversations,
  fetchPreviousAnswers,
  fetchPreviousPrompts,
  saveAnswer,
  savePrompt,
  sendPromptToPython,
  startNewConversation
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

type AnswerResponse = {
  data: Answer;
  status: number;
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

type Message = {
    sender: string;
    message: string;
}

interface ChatMessageProps {
  msg: {
    sender: string;
    message: string;
  };
}


const ChatMessage: React.FC<ChatMessageProps> = React.memo(({ msg }) => (
  <div className={msg.sender === 'Cube-BOT' ? 'bot-message' : 'user-message'}>
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
), (prevProps, nextProps) => {
  // Determine whether the component should re-render based on props changes
  return prevProps.msg.message === nextProps.msg.message &&
    prevProps.msg.sender === nextProps.msg.sender;
});

const Header = React.lazy(() => import('../components/Header'));

const ChatBot = () => {

  const navigate = useNavigate();
  const cookies = new Cookies();
  const jwt = cookies.get('jwt') as string;
  const user_id = getUserIDFromJWT(jwt);

  const [conversationsHistory, setConversationsHistory] = useState(
    [
      { sender: 'Cube-BOT', message: 'Hello! How can I help you?' }, //Mora da se promeni
      { sender: 'User', message: 'Hi there! I have a question.' },
    ],
  );
  
  const [conversationCache, setConversationCache] = useState<{ [key: string]: Message[] }>({});
  const [currentConversationIndex, setCurrentConversationIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [disableInput, setDisableInput] = useState(false);
  const [conversationsList, setConversationsList] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);


  const handleUserInput = (event: { target: { value: React.SetStateAction<string>; }; }) => {
    setUserInput(event.target.value);
  };

  const loadConversations = async () => {
    if (jwt && user_id) {
      try {
        const conversationsListPromise = await fetchConversations(jwt);
        if (conversationsListPromise.status === 200) {
          const conversationsListResponse = await conversationsListPromise.json() as ConversationResponse;
          const conversationsList = conversationsListResponse.data;
          setConversationsList(conversationsList);
        } else {
          console.error('Error fetching previous conversations');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };
  

  useEffect(() => {
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

    const pythonResponse = await sendPromptToPython(userInput, user_id);
    if (pythonResponse.status === 200 || pythonResponse.status === 500) {
      const conversation_id = conversationsList[currentConversationIndex].conversation_id;
      //console.log(conversation_id, currentConversationIndex);
      const promptResponse = await savePrompt(jwt, user_id, userInput, conversation_id);
      if (promptResponse.status === 200) {
        const promptData = await promptResponse.json() as PromptResponse;
        //console.log(promptData);
        const prompt_id = promptData.data.prompt_id; 
        //console.log(prompt_id);
        await saveAnswer(jwt, "pythonData.data", prompt_id, conversation_id);
      }
    } else {
      setDisableInput(false);
      console.error('Error: Unexpected response code from the Python script');
    }
    const updatedConversation = [...conversationsHistory];
    updatedConversation.push({ sender: 'User', message: userInput });
    updatedConversation.push({ sender: 'Cube-BOT', message: "pythonData.data" });
    //console.log(conversationsHistory);
    setConversationsHistory(updatedConversation);
    setUserInput('');
    setDisableInput(false);
  };

  const handleStartNewChat = async () => {
    /*
    if (!conversationsHistory.length) {
      // If the conversation is empty, create a new chat and write a prompt
      const promptResponse = await savePrompt(jwt, user_id as string, "Hello! How can I help you?", conversationsList[0].conversation_id);
      if (promptResponse.status === 200) {
        const promptData = await promptResponse.json() as Prompt;
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

  const handleNewChat =  () => {

    setConversationsHistory(
      [
        { sender: 'Cube-BOT', message: 'Hello! How can I help you?' },
        { sender: 'User', message: 'Hi there! I have a question.' },
      ],
    );
  
    navigate('/ChatBot');
  }

  const handleRestoreConversation = async (index: number) => {
    setCurrentConversationIndex(index);
    const conversationId = conversationsList[index].conversation_id;
    console.log(conversationCache);
    console.log(conversationsList);
    // Check if the conversation data is in the cache
    if (conversationCache[conversationId]) {
      setConversationsHistory(conversationCache[conversationId]);
    } else {
    const promptsResponse = await fetchPreviousPrompts(jwt, conversationId);
    const answersResponse = await fetchPreviousAnswers(jwt, conversationId);
    if (promptsResponse.status === 200 && answersResponse.status === 200) {
      const responseJson = await promptsResponse.json() as PromptResponse;
      const promptsData = responseJson.data;
      const responseJson2 = await answersResponse.json() as AnswerResponse;
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
        const formattedMessages = [];
        for (let i = 0; i < promptsData.length * 2; i++) {
          if(i%2 == 0) {
            formattedMessages[i] = formattedPrompts[i/2];
          }
          else {
            formattedMessages[i] = formattedAnswers[i%2];
          }
        }
        setConversationsHistory(formattedMessages);
        setConversationCache(prevCache => ({
          ...prevCache,
          [conversationsList[index].conversation_id]: formattedMessages,
      }));
      } else {
        console.log('No prompts available for this conversation');
        const formattedPrompts2 = [{ sender: 'User', message: promptsData.prompt }];
        setConversationsHistory(formattedPrompts2);
      }
    } else {
      console.error('Error fetching prompts for conversation');
    }
  }
};

  return (
    <div className="chatbot-container">
      <React.Suspense fallback={<div>Loading...</div>}>
        <Header
          handleLoginClick={() => { /* Handle login click */ }}
          handleRegisterClick={() => { /* Handle register click */ }}
        />
      </React.Suspense>
      <div className="chat-container">
        <div className="chat-sidebar">
          <button className="start-new-chat-button" onClick={handleNewChat}>
            New Chat
          </button>
          <div className="conversation-restore-points">
            <div className="restore-points-header">Previous Chats</div>
            {conversationsList.map((_, index) => (
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
              {conversationsHistory.map((msg, index) => (
                <ChatMessage key={index} msg={msg} />
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
                    {conversationsHistory.length ? 'Send' : 'New Chat'}
                  </button>
                </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
