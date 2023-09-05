import React, { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCube, faUser } from '@fortawesome/free-solid-svg-icons';
import Cookies from 'universal-cookie';
import { getUserIDFromJWT } from '../logic/utils';
import './ChatbotCss.css';

const Header = React.lazy(() => import('../components/Header'));


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
  

const SQLAssistant = () => {
  const cookies = new Cookies();
  const jwt = cookies.get('jwt') as string;
  const user_id = getUserIDFromJWT(jwt);
const [conversationsHistory, setConversationsHistory] = useState<Message[]>([
        { sender: 'SQLAssistant', message: 'Hello! I am here to help you generate SQL questions. To get strated click the GenerateSQL button.' }
      ]);
const [userInput, setUserInput] = useState('');
const [disableInput, setDisableInput] = useState(false);



const handleUserInput = (event: { target: { value: React.SetStateAction<string>; }; }) => {
        setUserInput(event.target.value);
      };
const chatContentLastMessage = useRef(null);

useEffect(() => {
      
    scrollToBottom();

  }, [conversationsHistory]);

  if(!jwt || !user_id) {
    window.location.href = "/";
    return;
  }
const scrollToBottom = () => {
    if (chatContentLastMessage.current) {
      chatContentLastMessage.current.scrollIntoView({ behavior: 'smooth' });
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
          <div className="chat-container2">
            <div className="chat-sidebar">
              <div className='buttons'>
                <button className="start-new-chat-button" >
                  Novi Čet
                </button>
                <button className="delete-all-chat-button" >
                  Obrisi sve
                </button>
              </div>
              <div className="conversation-restore-points">
              <div className="restore-points-header">Previous Chats</div>
            </div>
            </div>
            <div className="chat-content">
              <div className="previous-conversations">
                <div className="message-bubbles">
                  {conversationsHistory.map((msg, index) => (
                    <ChatMessage key={index} msg={msg} />
                  ))}
                  <div ref={chatContentLastMessage}></div>
                </div>
              </div>
              <div className="user-input">
                    <form /*onSubmit={handleSubmit}*/>
                      <input
                        type="text"
                        value={userInput}
                        onChange={handleUserInput}
                        placeholder="Unesite vašu poruku..."
                        disabled={disableInput}
                      />
                      <button className="send-button" type="submit" /*onClick={handleEmptyChat}*/>
                        Generate SQL Questions
                      </button>
                    </form>
              </div>
            </div>
            <div className='chat-sidebar2'>
            </div>
          </div>
        </div>
       
      );

};

export default SQLAssistant;