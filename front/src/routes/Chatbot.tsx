import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCube, faUser } from '@fortawesome/free-solid-svg-icons';
import Header from '../components/Header';
import Cookies from 'universal-cookie';
import type { Cookie as CookieType } from 'universal-cookie';
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

const cookies: CookieType = new Cookies();
const jwt = cookies.get('jwt');
const user_id = getUserIDFromJWT(jwt);
const ChatBot = () => {
  const [conversationsHistory, setConversationsHistory] = useState([
    [
      { sender: 'Cube-BOT', message: 'Hello! How can I help you?' },
      { sender: 'User', message: 'Hi there! I have a question.' },
    ],
  ]);

  const [currentConversationIndex, setCurrentConversationIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [disableInput, setDisableInput] = useState(false);

  const handleUserInput = (event: { target: { value: React.SetStateAction<string>; }; }) => {
    setUserInput(event.target.value);
  };

  
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

    const response = await sendPromptToPython(userInput, user_id);
    if (response.status === 200) { //SAVE PROMPT AND ANSWER AT THE SAME TIME????????
      const data = await response.json();
      const responseP = await savePrompt(jwt, user_id, userInput, "64e911933918ffaf74710c78");
      if (responseP.status === 200) {
        const data1 = await responseP.json();
        console.log(data1._id)
        await saveAnswer(jwt, user_id, data.data, data1._id);
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
    await startNewConversation(jwt, user_id);
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
