import React, { useState } from 'react';
import Header from '../components/Header'
import './ChatbotCss.css';

const ChatBot = () => {
    const [conversation, setConversation] = useState([
      { sender: 'Cube-BOT', message: 'Hello! How can I help you?' },
      { sender: 'User', message: 'Hi there! I have a question.' },
    ]);
  
    const [userInput, setUserInput] = useState('');
  
    const handleUserInput = (event: { target: { value: React.SetStateAction<string>; }; }) => {
      setUserInput(event.target.value);
    };
  
    const handleSubmit = (event: { preventDefault: () => void; }) => {
      event.preventDefault();
      if (userInput.trim() !== '') {
        setConversation([...conversation, { sender: 'User', message: userInput }]);
        
        setUserInput('');
      }
    };
  
    return (
    <div>
        <Header/>
      <div className="chat-container">
        <div className="previous-conversations">
          {conversation.map((msg, index) => (
            <div key={index} className={msg.sender === 'Bot' ? 'bot-message' : 'user-message'}>
              <strong>{msg.sender}</strong>: {msg.message}
            </div>
          ))}
        </div>
        <div className="user-input">
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={userInput}
              onChange={handleUserInput}
              placeholder="Type your message..."
            />
            <button type="submit">Send</button>
          </form>
        </div>
      </div>
      </div>
    );
  };
export default ChatBot;