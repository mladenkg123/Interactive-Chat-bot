import React, { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCube, faTrash, faUser } from '@fortawesome/free-solid-svg-icons';
import Cookies from 'universal-cookie';
import Swal from 'sweetalert2';
import Select from 'react-select';
import {
  deleteConversation,
  fetchConversationById,
  fetchConversations,
  fetchPreviousAnswers,
  fetchPreviousPrompts,
  fetchUserData,
  sendPromptToPython,
  startNewConversation,
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
  user_id: string;
  last_accessed: Date;
  conversation_description: string;
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

let conversationList2  : Conversation[] = [];

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
  const [selectedModel, setSelectedModel] = useState({ value: 'Cube-BOT', label: 'Cube-BOT(GPT3.5)' });
  const [promptTexts, setPromptTexts] = useState<string[]>([]);
  const [promptsLeft, setPromptsLeft] = useState(Number);
  const options=[
    { value: 'Cube-BOT', label: 'Cube-BOT(GPT3.5)' },
    { value: 'Llama', label: 'Llama' },
    { value: 'SQL Prompts', label: 'SQL Propmts', },
  ];
  const chatContentLastMessage = useRef(null);

  const handleUserInput = (event: { target: { value: React.SetStateAction<string>; }; }) => {
    setUserInput(event.target.value);
  };

  const loadConversations = async () => {
    if (jwt && user_id) {
      try {
        const conversationsListPromise = await fetchConversations(jwt);
        if (conversationsListPromise.status === 200) {
          const conversationsListResponse = await conversationsListPromise.json() as ConversationsResponse;
          const loadedConversationsList = conversationsListResponse.data.map((conversation) => ({
            ...conversation,
            last_accessed: new Date(conversation.last_accessed),
          }));          
          
          
          conversationList2 =  loadedConversationsList.sort((a, b) => b.last_accessed.getTime() - a.last_accessed.getTime());
          //console.log(conversationsHistory[0]?.sender);

          if(conversationList2.length > 0) {
            const updatedPromptTexts = [...promptTexts]; 
            conversationList2.forEach((conversation, index) => {
              updatedPromptTexts[index] = conversation.conversation_description
                ? conversation.conversation_description.substring(0, 15)
                : 'No prompt available';
            });
            setPromptTexts(updatedPromptTexts);
          await handleRestoreConversation(0);
          }
          setCurrentConversationIndex(0);
        } else {
          console.error('Error fetching previous conversations');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
    //console.log(conversationList2);

  };
  
  const scrollToBottom = () => {
    if (chatContentLastMessage.current) {
      chatContentLastMessage.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    loadConversations().catch(error => {
      console.error('Unhandled promise error:', error);
    });
  }, []);

  useEffect(() => {
      
    scrollToBottom();

  }, [conversationsHistory]);
  
  useEffect(()  => {
      
     loadRemainingPropmts().catch(error => {
      console.error('Failed loading remaining prompts', error);
     });

  }, []);
  


  const loadConversationByID = async (index : number) => {

    const conversation_id = conversationList2[index].conversation_id;
    //console.log(conversation_id);

    if (jwt && user_id) {
      try {
        const conversationsListPromise = await fetchConversationById(jwt, conversation_id);
        if (conversationsListPromise.status === 200) {
          const conversationsListResponse = await conversationsListPromise.json() as ConversationsResponse;
          
          const loadedConversationDescripition = conversationsListResponse.data.conversation_description;
                  
          const updatedPromptTexts = [...promptTexts];
          updatedPromptTexts[index] = loadedConversationDescripition.substring(0, 15);
          setPromptTexts(updatedPromptTexts);
          //console.log(loadedConversationDescripition);

        } else {
          console.error('Error fetching previous conversations');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
   

  }; 


  const loadRemainingPropmts = async () => {

    if (jwt && user_id) {
      try {
        const userPromptRem = await fetchUserData(jwt, user_id);
        if (userPromptRem.status === 200) {
          const userPromptCount = await userPromptRem.json() as ConversationsResponse;
          const remainingPrompts = userPromptCount.data.remaining_prompts;
          setPromptsLeft(remainingPrompts);

        } else {
          console.error('Error fetching remaining propmts');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
   

  }; 


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

    if(conversationsHistory[0]?.sender == 'Cube-BOT'){
      await handleNewChat();
      setConversationsHistory([]);
      console.log(conversationsHistory);
    }

    const currentContext = [...conversationsHistory];
    currentContext.push({sender: 'User', message: userInput});
    const conversation_id = conversationList2[currentConversationIndex].conversation_id;
    const pythonResponse = await sendPromptToPython(jwt, userInput, conversation_id, currentContext, user_id, selectedModel);
    if (pythonResponse.status === 200) {
        const pythonData = await pythonResponse.text();
        let updatedConversation = [];
        if(conversationsHistory[0]?.sender == 'Cube-BOT') {
          updatedConversation.push({ sender: 'User', message: userInput });
          updatedConversation.push({ sender: 'Cube-BOT', message: pythonData });
        }
        else {
          updatedConversation = [...conversationsHistory];
          updatedConversation.push({ sender: 'User', message: userInput });
          updatedConversation.push({ sender: 'Cube-BOT', message: pythonData });
        }
        setConversationsHistory(updatedConversation);
        console.log(conversationsHistory);
        const conversationIndex = conversationList2.findIndex(conversation => conversation.conversation_id === conversation_id);
        //console.log(conversationIndex);
        if (conversationIndex !== -1) {
          conversationList2[conversationIndex].last_accessed = new Date();
        }    
        setConversationCache(prevCache => ({
          ...prevCache,
          [conversationList2[currentConversationIndex].conversation_id]: updatedConversation,
      }));

      await loadConversationByID(currentConversationIndex);
      setUserInput('');
    } else if(pythonResponse.status === 403) {
      alert("No prompts available");
      console.error('No prompts available');
    }
    else {
      console.error('No prompts available');
    }
    setDisableInput(false);
  };

  const handleEmptyChat = () => {
    return (
      conversationsHistory[0]?.sender === undefined
    )
  };

const handleNewChat = async () => {
  //console.log(conversationsHistory[0]?.sender);
      if (jwt && user_id) {
        try {
          if (handleEmptyChat() && conversationList2.length === 0 || handleEmptyChat() && conversationsHistory[2]?.sender ) {
            const conversationsListPromise = await startNewConversation(jwt);
            if (conversationsListPromise.status === 200) {
              const conversationsListResponse = await conversationsListPromise.json() as ConversationResponse;
              const conversationsListId = conversationsListResponse.data.conversation_id;
              //console.log(conversationsListId);
              conversationList2.push({
                conversation_id : conversationsListId,
                user_id: user_id,
                last_accessed: new Date(),
                conversation_description: ""
              })             
            await handleNewChatActive();
            } else {
              console.error('Error fetching previous conversations');
            }
          }
          else if (handleEmptyChat()) {
            await Swal.fire({
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
              conversationList2.push({
                conversation_id : conversationsListId,
                user_id: user_id,
                last_accessed: new Date(),
                conversation_description: ""
              })             
              await handleNewChatActive();
            } else {
              console.error('Error fetching previous conversations');
            }
          }
        } catch (error) {
          console.error('Error:', error);
        }
      } 
};

const handleDeleteChat = async () => {
  const conversation_id = conversationList2[currentConversationIndex].conversation_id;
  if (jwt && conversation_id) {
    try {
     await Swal.fire({
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
            await conversationsListPromise.json() as ConversationsResponse;
            const index = conversationList2.findIndex(conversation => conversation.conversation_id === conversation_id);
            if (index !== -1) {
              conversationList2.splice(index, 1);
              
              if (conversationList2.length === 0){
              const updatedCache = { ...conversationCache };
              delete updatedCache[conversation_id];
              setConversationCache(updatedCache);
              //console.log(conversationsHistory)
              setConversationsHistory([{ 
                sender: 'Cube-BOT', message: 'Hello! How can I help you?' },
              { sender: 'User', message: 'Hi there! I have a question.' },]);
              }
              

              setCurrentConversationIndex(0);
              await loadConversationByID(currentConversationIndex);
              await handleRestoreConversation(0);

              await Swal.fire(
                'Deleted!',
                'Your conversation has been deleted.',
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

const handleNewChatActive = async () => {
  
  const reversedConversationsList = conversationList2.slice().reverse();
  const lastIndex = reversedConversationsList.findIndex(conversation => conversation.conversation_id);
  if (lastIndex !== -1) { 
    const lastCreatedIndex = conversationList2.length - lastIndex - 1; 
    setCurrentConversationIndex(lastCreatedIndex);
    await handleRestoreConversation(lastCreatedIndex);
  }
};

  const handleRestoreConversation = async (index: number) => {
    setCurrentConversationIndex(index);
    const conversationId = conversationList2[index].conversation_id;
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
          [conversationList2[index].conversation_id]: formattedMessages,
      }));
      } else {
        setConversationsHistory([]);
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
          <div className='buttons'>
            <button className="start-new-chat-button" onClick={handleNewChat}>
              Novi Čet
            </button>
            <button className="delete-all-chat-button">
              Obiši
            </button>
          </div>
          <div className="conversation-restore-points">
          <div className="restore-points-header">Previous Chats</div>
          {conversationList2.map((_, index) => {

            const promptText = promptTexts[index];

            return (
              <div
                key={index}
                className={`restore-point ${index === currentConversationIndex ? 'selected' : ''}`}
                onClick={() => handleRestoreConversation(index)}
              >
                {index === currentConversationIndex ? (
                  <strong>{promptText}</strong>
                ) : (
                  <span>{promptText}</span>
                )}
                <FontAwesomeIcon className="DeleteIcon" icon={faTrash} style={{ paddingLeft: '10px' }} onClick={() => handleDeleteChat()} />
              </div>
            );
          })}
        </div>
        </div>
        <div className="chat-content">
          <div className='remaining-prompts'>Ostalo vam je jos : {promptsLeft}  promptova</div>
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
                  <button className="send-button" type="submit" onClick={handleEmptyChat}>
                    Pošalji
                  </button>
                </form>
          </div>
        </div>
        <div className='chat-sidebar2'>
          <div className="model-selection">
            <label htmlFor="CubeBOT-model">Izaberi Cube-BOT model :</label>
            <Select
             defaultValue={selectedModel}
              onChange={setSelectedModel}
              options={options}
              />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
