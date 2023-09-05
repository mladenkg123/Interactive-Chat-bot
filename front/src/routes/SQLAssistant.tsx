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
  sendPromptToPython,
} from '../logic/api';
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
                SQLList: "",
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

  const handleDeleteSQL = async (index: number) => {
    const sql_id = SQLListList[index].SQL_id;
    if (sql_id) {
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
            const SQLListPromise = await deleteSQLList(jwt, sql_id);
            if (SQLListPromise.status === 200) {
              await SQLListPromise.json() as ConversationsResponse;
              const index = SQLListList.findIndex(sql => sql.SQL_id === sql_id);
              if (index !== -1) {
                SQLListList.splice(index, 1);
  
                
                setCurrentSQLListIndex(0);
        
                await handleRestoreConversation(0);
  
                await Swal.fire(
                  'Izbrisano!',
                  'Vaša konverzacija je uspešno izbrisana!',
                  'success'
                );
              } else {
                console.error('Error.');
              }
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
    

  const handleRestoreConversation = async (index: number) => {
    setCurrentSQLListIndex(index);
    const SQLListId = SQLListList[index].SQL_id;
    const SQLListResponse = await fetchSQLListById(jwt, SQLListId);
    if (SQLListResponse.status === 200) {
      const responseJson = await SQLListResponse.json() as SQLListResponse;
      const sqlListData = responseJson.data;
      console.log(sqlListData.SQLList);
      if (sqlListData.SQLList.length > 0) {
        const formattedSQLList: Message[] = [{
          sender: 'SQLAssistant',
          message: sqlListData.SQLList,
        }];
        //console.log(formattedSQLList);
        setConversationsHistory(formattedSQLList);
      } else {
        setConversationsHistory([]);
      }
    } else {
      console.error('Error fetching prompts for conversation');
    }
};
  const handleSubmit = async (event: { preventDefault: () => void }) => {
    setDisableInput(true);
    event.preventDefault();
    const SQL_id = SQLListList[currentSQLListIndex].SQL_id;
    const SQLListResponse = await sendPromptToPython(jwt, "Izmisli primere tabela databaze i za njih izmisli 10 SQL pitanja od laksih ka tezim", SQL_id, [], user_id, { value: 'SQL', label: 'SQL(GPT3.5)' });
    if (SQLListResponse.status === 200) {
        const SQLListdata = await SQLListResponse.text();
        setConversationsHistory([{ sender: 'SQL-Assistent', message: SQLListdata }]);
        const SQLListModifyResponse = await modifySQLListById(jwt, SQL_id, SQLListdata);
        console.log(SQLListModifyResponse);
        //console.log(conversationsHistory);

      //await loadConversationByID(currentConversationIndex);
      setUserInput('');
    }
    else if(SQLListResponse.status === 403) {
      await Swal.fire({
          icon: 'error',
          title: 'Nema dostupnih obaveštenja',
          text: 'Nema dostupnih obaveštenja.',
        });
console.error('No prompts available');
    }
    else if(SQLListResponse.status === 500) {
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
                onClick={() => handleRestoreConversation(index)}
              >
                {index === currentSQLListIndex ? (
                  <strong>1</strong>
                ) : (
                  <span>2</span>
                )}
                <FontAwesomeIcon className="DeleteIcon" icon={faTrash} style={{ paddingLeft: '10px' }} onClick={() => handleDeleteSQL(index)} />
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
                    { true ? 
                    <input
                      type="text"
                      value={userInput}
                      onChange={handleUserInput}
                      placeholder="Unesite vašu poruku..."
                      disabled={disableInput}
                    /> : <input
                    type="text"
                    value={userInput}
                    style={{visibility:'hidden'}}
                    onChange={handleUserInput}
                    placeholder="Unesite vašu poruku..."
                    disabled={disableInput}
                  /> }
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