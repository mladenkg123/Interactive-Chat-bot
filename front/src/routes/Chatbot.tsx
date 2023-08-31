import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCube, faTrash, faUser } from '@fortawesome/free-solid-svg-icons';
import Cookies from 'universal-cookie';
import Swal from 'sweetalert2';
import {
  deleteConversation,
  fetchConversations,
  fetchPreviousAnswers,
  fetchPreviousPrompts,
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

type AnswerResponse = {
  data: Answer;
  status: number;
};

type Answer = {
  answer: string;
  prompt_id: string;
  conversation_id: string;
};

type ConversationsResponse = {
  data: Array<Conversation>;
  status: number;
};

type ConversationResponse = {
  data: Conversation;
  status: number;
};

type Conversation = {
  conversation_id: string;
};

type Message = {
  sender: string;
  message: string;
};

interface ChatMessageProps {
  msg: Message;
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
  return prevProps.msg.message === nextProps.msg.message &&
    prevProps.msg.sender === nextProps.msg.sender;
});

const Header = React.lazy(() => import('../components/Header'));

const ChatBot = () => {

  const cookies = new Cookies();
  const jwt = cookies.get('jwt') as string;
  const user_id = getUserIDFromJWT(jwt);

  const [conversationsHistory, setConversationsHistory] = useState<Message[]>([
    { sender: 'Cube-BOT', message: 'Hello! How can I help you?' },
    { sender: 'User', message: 'Hi there! I have a question.' },
  ]);
  const [conversationCache, setConversationCache] = useState<{ [key: string]: Message[] }>({});
  const [currentConversationIndex, setCurrentConversationIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [disableInput, setDisableInput] = useState(false);
  const [conversationsList, setConversationsList] = useState<Conversation[]>([]);


  const handleUserInput = (event: { target: { value: React.SetStateAction<string>; }; }) => {
    setUserInput(event.target.value);
  };

  const loadConversations = async () => {
    if (jwt && user_id) {
      try {
        const conversationsListPromise = await fetchConversations(jwt);
        if (conversationsListPromise.status === 200) {
          const conversationsListResponse = await conversationsListPromise.json() as ConversationsResponse;
          const conversationsList = conversationsListResponse.data;
          setConversationsList(conversationsList);
          handleActiveConversation();
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
    const currentContext = [...conversationsHistory];
    currentContext.push({sender: 'User', message: userInput});
    const conversation_id = conversationsList[currentConversationIndex].conversation_id;
    const pythonResponse = await sendPromptToPython(jwt, userInput, conversation_id, currentContext, user_id);
    if (pythonResponse.status === 200 || pythonResponse.status === 500) {
        const pythonData = await pythonResponse.text();
        const updatedConversation = [...conversationsHistory];
        updatedConversation.push({ sender: 'User', message: userInput });
        updatedConversation.push({ sender: 'Cube-BOT', message: pythonData });
        setConversationsHistory(updatedConversation);
        setConversationCache(prevCache => ({
          ...prevCache,
          [conversationsList[currentConversationIndex].conversation_id]: updatedConversation,
      }));
    } else {
      setDisableInput(false);
      console.error('Error: Unexpected response code from the Python script');
    }
    setUserInput('');
    setDisableInput(false);
  };

  const handleEmptyChat = () => {
    const predefinedMessages = [
      { sender: 'Cube-BOT', message: 'Hello! How can I help you?' },
      { sender: 'User', message: 'Hi there! I have a question.' }
    ];
  
    return (
      conversationsHistory[0]?.sender === predefinedMessages[0].sender &&
      conversationsHistory[0]?.message === predefinedMessages[0].message &&
      conversationsHistory[1]?.sender === predefinedMessages[1].sender &&
      conversationsHistory[1]?.message === predefinedMessages[1].message
    );
  };

const handleNewChat = async () => {
      if (jwt && user_id) {
        try {
          if (handleEmptyChat() && conversationsList.length === 0 || handleEmptyChat() && conversationsHistory[2]?.sender ) {
            const conversationsListPromise = await startNewConversation(jwt);
            if (conversationsListPromise.status === 200) {
              const conversationsListResponse = await conversationsListPromise.json() as ConversationResponse;
              const conversationsListId = conversationsListResponse.data.conversation_id;
              setConversationsList(prevList => [
                ...prevList,
                { conversation_id: conversationsListId }
              ]);
            } else {
              console.error('Error fetching previous conversations');
            }
          }
          else if (handleEmptyChat()) {
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'Input some text!',
            })
          }
          else {
            const conversationsListPromise = await startNewConversation(jwt);
            if (conversationsListPromise.status === 200) {
              const conversationsListResponse = await conversationsListPromise.json() as ConversationResponse;
              const conversationsListId = conversationsListResponse.data.conversation_id;
              setConversationsList(prevList => [
                ...prevList,
                { conversation_id: conversationsListId }
              ]);
            } else {
              console.error('Error fetching previous conversations');
            }
          }
        } catch (error) {
          console.error('Error:', error);
        }
      } 
};

const handleDeleteChat = () => {
  const conversation_id = conversationsList[currentConversationIndex].conversation_id;
  if (jwt && conversation_id) {
    try {
      Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
      }).then(async (result) => {
        if (result.isConfirmed) {
          const conversationsListPromise = await deleteConversation(jwt, conversation_id);
          if (conversationsListPromise.status === 200) {
            const conversationsListResponse = await conversationsListPromise.json() as ConversationsResponse;
            const index = conversationsList.indexOf(conversation_id);
            const updatedconversationsList = conversationsList.splice(index, 1);
            setConversationsList(updatedconversationsList);
            handleActiveConversation();
            Swal.fire(
              'Deleted!',
              'Your conversation has been deleted.',
              'success'
            );
          } else {
            console.error('Error Deleting Conversation');
          }
        }
      });
    } catch (error) {
      console.error('Error:', error);
    }
  }
};

  const handleActiveConversation = () => {   
    const conversationId = conversationsList[currentConversationIndex]?.conversation_id; 
    

  };
 
  const handleRestoreConversation = async (index: number) => {
    setCurrentConversationIndex(index);
    const conversationId = conversationsList[index].conversation_id;

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
        const formattedPrompts: Message[] = promptsData.map((promptObj: Prompt) => ({
          sender: 'User',
          message: promptObj.prompt,
        }));

        const formattedAnswers: Message[] = answersData.map((answerObj: Answer) => ({
          sender: 'Cube-BOT',
          message: answerObj.answer,
        }));
        const formattedMessages: Message[] = [];
        for (let i = 0; i < promptsData.length; i++) {
          formattedMessages[i * 2] = formattedPrompts[i];
          formattedMessages[i * 2 + 1] = formattedAnswers[i];
        }
        setConversationsHistory(formattedMessages);
        setConversationCache(prevCache => ({
          ...prevCache,
          [conversationsList[index].conversation_id]: formattedMessages,
      }));
      } else {
        const formattedPrompts2 = [
        { sender: 'Cube-BOT', message: 'Hello! How can I help you?' }, 
        { sender: 'User', message: 'Hi there! I have a question.' },];
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
                onLoad={() => handleActiveConversation()}
                onClick={() => handleRestoreConversation(index)}
              >
                {index === currentConversationIndex ? (
                  <strong>Conversation {index + 1}</strong>
                ) : (
                  <span>Conversation {index + 1}</span>
                )}
                <FontAwesomeIcon className="DeleteIcon" icon={faTrash} style={{paddingLeft: '10px' }} onClick={() => handleDeleteChat()}/>
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
                  <button className="send-button" type="submit" onClick={handleEmptyChat}>
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
