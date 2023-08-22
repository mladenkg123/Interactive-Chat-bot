import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faCube } from '@fortawesome/free-solid-svg-icons';
import Header from '../components/Header';
import './ChatbotCss.css';

const ChatBot = () => {
  const [conversationsHistory, setConversationsHistory] = useState([
    [
      { sender: 'Cube-BOT', message: 'Hello! How can I help you?' },
      { sender: 'User', message: 'Hi there! I have a question.' },
    ],
  ]);

  const [currentConversationIndex, setCurrentConversationIndex] = useState(0);
  const [userInput, setUserInput] = useState('');

  const handleUserInput = (event: { target: { value: React.SetStateAction<string>; }; }) => {
    setUserInput(event.target.value);
  };

  const handleSubmit = (event: { preventDefault: () => void; }) => {
    event.preventDefault();
    if (userInput.trim() !== '') {
      const updatedConversation = [...conversationsHistory[currentConversationIndex]];
      updatedConversation.push({ sender: 'User', message: userInput });

      const newConversationsHistory = [...conversationsHistory];
      newConversationsHistory[currentConversationIndex] = updatedConversation;

      setConversationsHistory(newConversationsHistory);
      setUserInput('');
    }
  };

  const handleStartNewChat = () => {
    setConversationsHistory([...conversationsHistory, []]);
    setCurrentConversationIndex(conversationsHistory.length);
  };

  const handleRestoreConversation = (index: React.SetStateAction<number>) => {
    setCurrentConversationIndex(index);
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
            {conversationsHistory.map((_, index) => (
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
