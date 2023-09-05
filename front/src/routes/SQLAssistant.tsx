import React, { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCube, faTrash, faUser } from '@fortawesome/free-solid-svg-icons';
import Cookies from 'universal-cookie';
import Swal from 'sweetalert2';
import { getUserIDFromJWT } from '../logic/utils';
import './ChatbotCss.css';
import {
  startNewSQLList,
  deleteSQLList,
  deleteAllSQLListsByUserId,
  modifySQLListById,
  fetchSQLLists,
  fetchSQLListById,
  fetchUserData,
} from '../logic/api';
let SQLListList  : SQLList[] = [];
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
  const [SQLListList, setSQLListList] = useState<SQLList[]>([]);
  const [currentSQLListIndex, setCurrentSQLListIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [disableInput, setDisableInput] = useState(false);


  const loadSQLLists = async () => {
    try {
      const SQLListPromise = await fetchSQLLists(jwt);
      if (SQLListPromise.status === 200) {
        const SQLListResponse = await SQLListPromise.json() as SQLListsResponse;
        setSQLListList(SQLListResponse.data);
        //await handleRestoreConversation(0);
        setCurrentSQLListIndex(0);
        console.log(SQLListList);
      }
       else {
        console.error('Error fetching previous conversations');
      }
    }
    catch (error) {
      console.error('Error:', error);
    }
};

useEffect(() => {
  loadSQLLists().catch(error => {
    console.error('Unhandled promise error:', error);
  });
}, []);

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

  const handleNewChat = async () => {
        try {
            const SQLListPromise = await startNewSQLList(jwt);
            if (SQLListPromise.status === 200) {
              const SQLListResponse = await SQLListPromise.json() as SQLListResponse;
              const SQLListId = SQLListResponse.data.SQL_id;
              const newSQLListItem = {
                SQL_id: SQLListId,
                user_id: user_id,
                SQLList: [],
              };
              
              setSQLListList(prevSQLList => [...prevSQLList, newSQLListItem]);
            } else {
              console.error('Error fetching previous conversations');
            }
        } catch (error) {
          console.error('Error:', error);
        }
  };

  const handleDeleteAllSQL = async () => {
    try {
      await Swal.fire({
        title: 'Da li ste sigurni?',
        text: "Necete moci da ispravite!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Da, izbriši!',
      }).then(async (result) => {
        if (result.isConfirmed) {
          const SQLListPromise = await deleteAllSQLListsByUserId(jwt, user_id);
          if (SQLListPromise.status === 200) {
            await SQLListPromise.json() as SQLListsResponse;
              setSQLListList([]);
              setConversationsHistory([{ sender: 'SQLAssistant', message: 'Hello! I am here to help you generate SQL questions. To get strated click the GenerateSQL button.' }]);

              await Swal.fire(
                'Izbrisano!',
                'Vase SQLListe su uspešno izbrisane.',
                'success'
              );
            } else {
              console.error('Error.');
            }
          } else {
            console.error('Error Deleting SQLList');
          }
        });
    } catch (error) {
      console.error('Error:', error);
    }
  };
    
  const handleSubmit = async (event: { preventDefault: () => void }) => {
    setDisableInput(true);
    event.preventDefault();
    const SQLList_id = SQLListList[currentSQLListIndex].SQLList_id;
    const pythonResponse = await sendPromptToPython(jwt, userInput, conversation_id, currentContext, user_id, selectedModel);
    if (pythonResponse.status === 200) {
        const pythonData = await pythonResponse.text();
        let updatedConversation: Message[] = [];
        if(conversationsHistory[0]?.sender == 'Cube-BOT') {
          updatedConversation.push({ sender: username , message: userInput });
          updatedConversation.push({ sender: 'Cube-BOT', message: pythonData });
        }
        else {
          updatedConversation = [...conversationsHistory];
          updatedConversation.push({ sender: username, message: userInput });
          updatedConversation.push({ sender: 'Cube-BOT', message: pythonData });
        }
        setConversationsHistory(updatedConversation);
        //console.log(conversationsHistory);
        const conversationIndex = conversationList.findIndex(conversation => conversation.conversation_id === conversation_id);
        //console.log(conversationIndex);
        if (conversationIndex !== -1) {
          conversationList[conversationIndex].last_accessed = new Date();
        }
        setConversationCache(prevCache => ({
          ...prevCache,
          [conversationList[currentConversationIndex].conversation_id]: updatedConversation,
      }));

      await loadConversationByID(currentConversationIndex);
      setUserInput('');
      setPromptsLeft(promptsLeft-1);
    }
    else if(pythonResponse.status === 403) {
      await Swal.fire({
          icon: 'error',
          title: 'Nema dostupnih obaveštenja',
          text: 'Nema dostupnih obaveštenja.',
        });
console.error('No prompts available');
    }
    else if(pythonResponse.status === 500) {
      await Swal.fire({
        icon: 'error',
        title: 'Neočekivan problem na serveru',
        text: 'Došlo je do neočekivanog problema na serveru. Molimo pokušajte ponovo.',
      });
      console.error('Unexpected server problem please try again');
    }
    else {
    await  Swal.fire({
        icon: 'error',
        title: 'Neočekivan problem na serveru',
        text: 'Došlo je do neočekivanog problema na serveru. Molimo pokušajte ponovo.',
      });
      console.error('Unexpected server problem please try again 2');
    }
    setDisableInput(false);
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
              <button className="start-new-chat-button" onClick={handleNewChat}>
                Novi Čet
              </button>
              <button className="delete-all-chat-button" onClick={handleDeleteAllSQL}>
                Obrisi sve
              </button>
            </div>
            <div className="conversation-restore-points">
            <div className="restore-points-header">Previous Chats</div>
            {SQLListList.map((_, index) => {
            return (
              <div
                key={index}
                className={`restore-point ${index === currentSQLListIndex ? 'selected' : ''}`}
              >
                {index === currentSQLListIndex ? (
                  <strong>1</strong>
                ) : (
                  <span>2</span>
                )}
                <FontAwesomeIcon className="DeleteIcon" icon={faTrash} style={{ paddingLeft: '10px' }} />
              </div>
            );
            })}
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
                  <form onSubmit={handleSubmit}>
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