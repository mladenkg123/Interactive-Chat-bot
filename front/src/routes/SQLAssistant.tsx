import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCube, faTrash, faUser, faCircle} from '@fortawesome/free-solid-svg-icons';
import Cookies from 'universal-cookie';
import Swal from 'sweetalert2';
import { getUserIDFromJWT } from '../logic/utils';
import './ChatbotCss.css';
import {
  deleteAllSQLListsByUserId,
  deleteSQLList,
  fetchQuestions,
  fetchSQLListById,
  fetchSQLLists,
  fetchUserData,
  modifySQLListById,
  sendPromptToPython,
  setActiveById,
  startNewSQLList
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
    <div className={`message-content ${msg.sender === 'SQLAssistant' ? 'sql-data' : ''}`}>
      <strong>{msg.sender}</strong>: {msg.message}
    </div>
  </div>
), (prevProps, nextProps) => {
  return prevProps.msg.message === nextProps.msg.message &&
    prevProps.msg.sender === nextProps.msg.sender;
});
  

let userData: UserData = {user_id: "", role: "TEACHER", remaining_prompts: 0, username: ""};
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
  const [hideInput, setHideInput] = useState(false);
  
  useEffect(() => {
    loadUserData().catch(error => {
      console.error('Failed loading remaining prompts', error);
    });
  }, []);
  

  if(!jwt || !user_id || ["TEACHER", "STUDENT"].indexOf(userData.role) <= -1) {
    window.location.href = "/";
    return;
  }
  
  const loadUserData = async () => {
    try {
      const userDataReq = await fetchUserData(jwt, user_id);
      if (userDataReq.status === 200) {
        const userDataResp = await userDataReq.json() as UserDataResponse;
        const userDatax = userDataResp.data;
        userData = userDatax;
        setHideInput(userDatax.role !== "TEACHER");
        if(userDatax.role === "STUDENT") {
          setConversationsHistory([{ sender: 'SQLAssistant', message: 'Hello i will grade your answers to the SQL questions. Hope you are ready.' }]);
        }
      } else {
        console.error('Error fetching user data');
      }
    } catch (error) {
      console.error('Error:', error);
    }
    
    loadSQLLists().catch(error => {
      console.error('Unhandled promise error:', error);
    });
  };
  const loadSQLLists = async () => {
    if (userData.role == "TEACHER") {
      try {
        const SQLListPromise = await fetchSQLLists(jwt);
        if (SQLListPromise.status === 200) {
          const SQLListResponse = await SQLListPromise.json() as SQLListsResponse;
          setSQLListList(SQLListResponse.data);
          //await handleRestoreConversation(0);
          setCurrentSQLListIndex(0);
  
         
        const activeSQLList = SQLListResponse.data.find((item) => item.active === true);
        console.log(activeSQLList);
        if (activeSQLList.active = true) {
          const activeCircle = document.querySelector('.activeCircle');
          activeCircle.style.visibility = 'visible';
        }
        }
        else {
          console.error('Error fetching SQL lists');
        }
      }
      catch (error) {
        console.error('Error:', error);
      }
    }
    else if(userData.role == "STUDENT") {
      try {
        const questionsPromise = await fetchQuestions(jwt);
        if (questionsPromise.status === 200) {
          const questionsResponse = await questionsPromise.json() as Array<object>;
          setSQLListList(questionsResponse[0].questions);
          //await handleRestoreConversation(0);
          setCurrentSQLListIndex(0);
        }
        else {
          console.error('Error fetching questions');
        }
      }
      catch (error) {
        console.error('Error:', error);
      }
    }
  };

  const handleUserInput = (event: { target: { value: React.SetStateAction<string>; }; }) => {
    setUserInput(event.target.value);
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
                active: false
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
    if (userData.role == "TEACHER") {
    setCurrentSQLListIndex(index);
    const SQLListId = SQLListList[index].SQL_id;
    const SQLListResponse = await fetchSQLListById(jwt, SQLListId);
    if (SQLListResponse.status === 200) {
      const responseJson = await SQLListResponse.json() as SQLListResponse;
      const sqlListData = responseJson.data;
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
      const button = document.querySelector('.send-button1');
      if (button) {
        button.style.visibility = 'visible';
      }
      if(sqlListData.SQLList.length < 1) {
        button.style.visibility = 'hidden';
      }
      console.log(sqlListData.active);
      let activeCircle = document.querySelector('.activeCircle');
      console.log(activeCircle);
      if(sqlListData.active === true){

        activeCircle.style.visibility = 'visible';
      }     
    } else {
      console.error('Error fetching prompts for conversation');
    }
  }
  else if(userData.role == "STUDENT") {
    setCurrentSQLListIndex(index);
    const formattedquestions: Message[] = [{
      sender: 'SQLAssistant',
      message: SQLListList[index],
    }];
    setConversationsHistory(formattedquestions);
  }
};

  const handleSubmit = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    if (userData.role == "TEACHER") {
    const SQL_id = SQLListList[currentSQLListIndex].SQL_id;
    const SQLListResponse = await sendPromptToPython(jwt, String.raw`Izmisli primere tabela databaze(najvise do 3 tabele) i za njih izmisli 10 SQL pitanja od laksih ka tezim. Nemoj da dajes odgovore na pitanja. Prvo izlistaj sve tabele u ovakvom formatu: 

    1. Tabela ime tabele:
       - kolona 1 (PK)
       - kolona 2
       - kolona 3
       - kolona 4
       - kolona 5
    A onda izlistaj pitanja. Nemoj da dodajes ikakv dodatni tekst.`, SQL_id, [], user_id, { value: 'SQL', label: 'SQL(GPT3.5)' });
    if (SQLListResponse.status === 200) {
        const SQLListdata = await SQLListResponse.text();
  
        const sender = 'SQLAssistant';
        const message = SQLListdata;
        const newArray = [...SQLListList];

        // Modify the element at the specified index
        newArray[currentSQLListIndex].SQLList = SQLListdata;
        
        setSQLListList(newArray);
        setConversationsHistory([ {sender,message,}, ]);
        await modifySQLListById(jwt, SQL_id, SQLListdata);
        await setActiveById(jwt, SQL_id, false);
        const questionsResp = await fetchQuestions(jwt);
        const questionsData = await questionsResp.json();
        await sendPromptToPython(jwt, "", questionsData[0]._id, [] , user_id, { value: 'generate_questions', label: 'SQL(GPT3.5)' });//SCUFFED
          const button = document.querySelector('.send-button1');
          if (button) {
            button.style.visibility = 'visible';
          }
          let activeCircle = document.querySelector('.activeCircle');
          activeCircle.style.visibility = 'visible';
          
        
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
  }
  else if(userData.role == "STUDENT") {
    const newArray = [...conversationsHistory];
    newArray.push({sender: userData.username, message: userInput})
    const response = await sendPromptToPython(jwt, userInput, "", newArray, user_id, { value: 'oceni_odgovor', label: 'SQL(GPT3.5)' }) // Give him the table aswell
    if (response.status === 200) {
      const data = await response.text();
      newArray.push({sender: 'SQLAssistant', message: data})
      setConversationsHistory(newArray);
    }
  }
};

  const handleSetActive = async () => {
    let SQL_id2:string = '';
    const SQLList = SQLListList[currentSQLListIndex];
    const activeCircle = document.querySelector('.activeCircle');
    SQLListList.forEach((SQLList, index) => {
      if(SQLList.active === true && index !== currentSQLListIndex) {
        SQLList.active = false;
        SQL_id2 = SQLList.SQL_id;      
        activeCircle.style.visibility = 'visible';
      }
    });
    if(SQL_id2) {
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
            await setActiveById(jwt, SQL_id2, false);
            await setActiveById(jwt, SQLList.SQL_id, true);
            
            const questionsResp = await fetchQuestions(jwt);
            const questionsData = await questionsResp.json();
            await sendPromptToPython(jwt, SQLList.SQLList, questionsData[0]._id, [] , user_id, { value: 'generate_questions', label: 'SQL(GPT3.5)' });
            SQLList.active = true;
            let activeCircle = document.querySelector('.activeCircle');
            activeCircle.style.visibility = 'visible';
 
            await  Swal.fire({
              icon: 'success',
              title: 'Uspesno',
              text: 'Uspesno.',
            });
          }
    });
  }
  else {
    await setActiveById(jwt, SQLList.SQL_id, true);
    const questionsResp = await fetchQuestions(jwt);
    const questionsData = await questionsResp.json();
    await sendPromptToPython(jwt, SQLList.SQLList, questionsData[0]._id, [] , user_id, { value: 'generate_questions', label: 'SQL(GPT3.5)' });
            
    SQLList.active = true;
    let activeCircle = document.querySelector('.activeCircle');
    activeCircle.style.visibility = 'visible';
    await  Swal.fire({
      icon: 'success',
      title: 'Uspesno',
      text: 'Uspesno.',
    });
  }
}
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
              {userData.role === "TEACHER" ?
              <><button className="start-new-chat-button" onClick={handleNewChat}>
                Novi Čet
              </button><button className="delete-all-chat-button" onClick={handleDeleteAllSQL}>
                  Obrisi sve
                </button></> : <></>
              }
            </div>
            <div className="conversation-restore-points">
            {userData.role === "TEACHER" ?
              <><div className="restore-points-header">Prethodne liste</div></> : <><div className="restore-points-header">Lista pitanja</div></>
            }
            {SQLListList.map((_, index) => {
            return (
              <div
                key={index}
                className={`restore-point ${index === currentSQLListIndex ? 'selected' : ''}`}
                onClick={() => handleRestoreConversation(index)}
              >
                {index === currentSQLListIndex ? (
                  <><FontAwesomeIcon className="activeCircle" icon={faCircle} style={{marginRight:"5px", visibility:'hidden',color:'green' }} onClick={() => handleDeleteSQL(index)} />
                  <strong>Aktivan</strong></>
                ) : (
                  <><FontAwesomeIcon className="activeCircle" icon={faCircle} style={{ marginRight: "5px", visibility: 'hidden', color:'green' }} onClick={() => handleDeleteSQL(index)} />
                  <span>Ostalo</span></>
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
                <div></div>
              </div>
            </div>
            <div className="user-input">
                  <form onSubmit={handleSubmit}>
                    { hideInput ? 
                    <input
                      type="text"
                      value={userInput}
                      onChange={handleUserInput}
                      placeholder="Unesite vašu poruku..."
                    /> : <input
                    type="text"
                    value={userInput}
                    style={{visibility:'hidden'}}
                    onChange={handleUserInput}
                    placeholder="Unesite vašu poruku..."
                  /> }
                    {userData.role === "TEACHER" ? <>
                    <button className="send-button" type="submit">
                      Generisi SQL Pitanja
                    </button></> : <>
                    <button className="send-button" type="submit">
                      Posalji odgovor
                    </button> </>
                    }
                  </form>
                  {userData.role === "TEACHER" ?
                    <>
                    <button className="send-button1" type="button" style={{visibility: 'hidden', display:'block',marginLeft:'285px', inlineSize:'max-content'}} onClick={() => handleSetActive()} >
                        Sacuvaj pitanja
                    </button></> : <></>
                  }
            </div>
          </div>
          <div className='chat-sidebar2'>
          </div>
        </div>
      </div>
    );
};

export default SQLAssistant;