import React, { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCube, faUser } from '@fortawesome/free-solid-svg-icons';
import Cookies from 'universal-cookie';
import Swal from 'sweetalert2';
import Select from 'react-select';
import './SQLAssistant.css';

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

const [conversationsHistory, setConversationsHistory] = useState<Message[]>([
        { sender: 'Cube-BOT', message: 'Hello! How can I help you?' },
        { sender: 'User', message: 'Hi there! I have a question.' },
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
          <div className="chat-container">
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
                        Pošalji
                      </button>
                    </form>
              </div>
            </div>
            <div className='chat-sidebar2'>
              <div className="model-selection">
                <label htmlFor="CubeBOT-model">Izaberi Cube-BOT model :</label>
              </div>
            </div>
          </div>
        </div>
       
      );

};

export default SQLAssistant;