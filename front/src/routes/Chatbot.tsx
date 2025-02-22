import React, { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCube, faTrash, faUser } from '@fortawesome/free-solid-svg-icons';
import Cookies from 'universal-cookie';
import Swal from 'sweetalert2';
import Select from 'react-select';
import {
  deleteAllConversationsByUserId,
  deleteConversation,
  fetchConversationById,
  fetchConversations,
  fetchPreviousAnswers,
  fetchPreviousPrompts,
  fetchUserData,
  sendPromptToPythonChatBot,
  startNewConversation,
} from '../logic/api';
import { getUserIDFromJWT } from '../logic/utils';
import './ChatbotCss.css';
import '../components/headerCss.css';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
interface ChatMessageProps {
  msg: Message;
}
const ChatMessage: React.FC<ChatMessageProps> = React.memo(
  ({ msg }) => (
    <div className={msg?.sender === 'Cube-BOT' ? 'bot-message' : 'user-message'}>
      <div className="message-avatar">{msg?.sender === 'Cube-BOT' ? <FontAwesomeIcon icon={faCube as IconProp} /> : <FontAwesomeIcon icon={faUser as IconProp} />}</div>
      <div className="message-content">
        <strong>{msg?.sender}</strong>: {msg?.message}
      </div>
    </div>
  ),
  (prevProps, nextProps) => {
    return prevProps.msg.message === nextProps.msg.message && prevProps.msg.sender === nextProps.msg.sender;
  },
);

let conversationList: Conversation[] = [];
let username = '';

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
  const options = [
    { value: 'Cube-BOT', label: 'Cube-BOT(GPT3.5)' },
    { value: 'Llama', label: 'Llama' },
    { value: 'Bard', label: 'Bard' },
  ];
  const chatContentLastMessage = useRef<HTMLDivElement>(null);

  const handleUserInput = (event: { target: { value: React.SetStateAction<string> } }) => {
    setUserInput(event.target.value);
  };

  const loadConversations = async () => {
    try {
      const conversationsListPromise = await fetchConversations(jwt);
      if (conversationsListPromise.status === 200) {
        const conversationsListResponse = (await conversationsListPromise.json()) as ConversationsResponse;
        const loadedConversationsList = conversationsListResponse.data.map((conversation) => ({
          ...conversation,
          last_accessed: new Date(conversation.last_accessed),
        }));

        loadedConversationsList.sort((a, b) => b.last_accessed.getTime() - a.last_accessed.getTime());
        conversationList = loadedConversationsList;
        //console.log(conversationsHistory[0]?.sender);

        if (conversationList.length > 0) {
          const updatedPromptTexts = [...promptTexts];
          conversationList.forEach((conversation, index) => {
            updatedPromptTexts[index] = conversation.conversation_description ? conversation.conversation_description.substring(0, 12) : 'Prazna konverzacija';
          });
          setPromptTexts(updatedPromptTexts);
          await handleRestoreConversation(0);
          //console.log(username);
        }
        //console.log(conversationList);
        setCurrentConversationIndex(0);
      } else {
        console.error('Error fetching previous conversations');
      }
    } catch (error) {
      console.error('Error:', error);
    }
    //console.log(conversationList);
  };

  const scrollToBottom = () => {
    if (chatContentLastMessage.current) {
      chatContentLastMessage.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    loadConversations().catch((error) => {
      console.error('Unhandled promise error:', error);
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [conversationsHistory]);

  useEffect(() => {
    loadRemainingPropmts().catch((error) => {
      console.error('Failed loading remaining prompts', error);
    });
  }, []);

  if (!jwt || !user_id) {
    window.location.href = '/';
    return;
  }

  const loadConversationByID = async (index: number) => {
    const conversation_id = conversationList[index].conversation_id;
    //console.log(conversation_id);
    try {
      const conversationsListPromise = await fetchConversationById(jwt, conversation_id);
      if (conversationsListPromise.status === 200) {
        const conversationsListResponse = (await conversationsListPromise.json()) as ConversationResponse;

        const loadedConversationDescripition = conversationsListResponse.data.conversation_description;

        const updatedPromptTexts = [...promptTexts];
        updatedPromptTexts[index] = loadedConversationDescripition.substring(0, 12);
        setPromptTexts(updatedPromptTexts);
        //console.log(loadedConversationDescripition);
      } else {
        console.error('Error fetching previous conversations');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const loadRemainingPropmts = async () => {
    try {
      const userPromptRem = await fetchUserData(jwt, user_id);
      if (userPromptRem.status === 200) {
        const userPromptCount = (await userPromptRem.json()) as UserDataResponse;
        const remainingPrompts = userPromptCount.data.remaining_prompts;
        const fetchUsername = userPromptCount.data.username;
        setPromptsLeft(remainingPrompts);
        username = fetchUsername;
      } else {
        console.error('Error fetching remaining propmts');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (event: { preventDefault: () => void }) => {
    setDisableInput(true);
    event.preventDefault();
    if (userInput.trim() === '') {
      setDisableInput(false);
      return;
    }

    if (conversationsHistory[0]?.sender == 'Cube-BOT') {
      await handleNewChat();
      setConversationsHistory([]);
      //console.log(conversationsHistory);
    }
    const currentContext = [...conversationsHistory];
    currentContext.push({ sender: username, message: userInput });
    const conversation_id = conversationList[currentConversationIndex].conversation_id;
    const pythonResponse = await sendPromptToPythonChatBot(jwt, userInput, conversation_id, currentContext, user_id, selectedModel);
    if (pythonResponse.status === 200) {
      const pythonData = await pythonResponse.text();
      let updatedConversation: Message[] = [];
      if (conversationsHistory[0]?.sender == 'Cube-BOT') {
        updatedConversation.push({ sender: username, message: userInput });
        updatedConversation.push({ sender: 'Cube-BOT', message: pythonData });
      } else {
        updatedConversation = [...conversationsHistory];
        updatedConversation.push({ sender: username, message: userInput });
        updatedConversation.push({ sender: 'Cube-BOT', message: pythonData });
      }
      setConversationsHistory(updatedConversation);
      //console.log(conversationsHistory);
      const conversationIndex = conversationList.findIndex((conversation) => conversation.conversation_id === conversation_id);
      //console.log(conversationIndex);
      if (conversationIndex !== -1) {
        conversationList[conversationIndex].last_accessed = new Date();
      }
      setConversationCache((prevCache) => ({
        ...prevCache,
        [conversationList[currentConversationIndex].conversation_id]: updatedConversation,
      }));

      await loadConversationByID(currentConversationIndex);
      setUserInput('');
      setPromptsLeft(promptsLeft - 1);
    } else if (pythonResponse.status === 403) {
      await Swal.fire({
        icon: 'error',
        title: 'Nema dostupnih obaveštenja',
        text: 'Nema dostupnih obaveštenja.',
      });
      console.error('No prompts available');
    } else if (pythonResponse.status === 500) {
      await Swal.fire({
        icon: 'error',
        title: 'Neočekivan problem na serveru',
        text: 'Došlo je do neočekivanog problema na serveru. Molimo pokušajte ponovo.',
      });
      console.error('Unexpected server problem please try again');
    } else {
      await Swal.fire({
        icon: 'error',
        title: 'Neočekivan problem na serveru',
        text: 'Došlo je do neočekivanog problema na serveru. Molimo pokušajte ponovo.',
      });
      console.error('Unexpected server problem please try again 2');
    }
    setDisableInput(false);
  };

  const handleEmptyChat = () => {
    return conversationsHistory[0]?.sender === undefined;
  };

  const handleNewChat = async () => {
    try {
      if (handleEmptyChat() && (conversationList.length === 0 || conversationsHistory[2]?.sender)) {
        await createNewConversation();
      } else if (handleEmptyChat()) {
        await Swal.fire({
          icon: 'error',
          title: 'Greška.',
          text: 'Napišite neku rečenicu!',
        });
      } else {
        await createNewConversation();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const createNewConversation = async () => {
    const conversationsListPromise = await startNewConversation(jwt);
    if (conversationsListPromise.status === 200) {
      const conversationsListResponse = (await conversationsListPromise.json()) as ConversationResponse;
      const conversationsListId = conversationsListResponse.data.conversation_id;
      conversationList.push({
        conversation_id: conversationsListId,
        user_id: user_id,
        last_accessed: new Date(),
        conversation_description: '',
      });
      await handleNewChatActive();
    } else {
      console.error('Error fetching previous conversations');
    }
  };

  const handleDeleteChat = async (index: number) => {
    const conversation_id = conversationList[index].conversation_id;
    if (conversation_id) {
      try {
        await Swal.fire({
          title: 'Da li ste sigurni?',
          text: 'Necete moci da ispravite!',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Da, izbriši!',
        }).then(async (result) => {
          if (result.isConfirmed) {
            const conversationsListPromise = await deleteConversation(jwt, conversation_id);
            if (conversationsListPromise.status === 200) {
              (await conversationsListPromise.json()) as ConversationsResponse;
              const index = conversationList.findIndex((conversation) => conversation.conversation_id === conversation_id);
              if (index !== -1) {
                conversationList.splice(index, 1);
                if (conversationList.length === 0) {
                  const updatedCache = { ...conversationCache };
                  delete updatedCache[conversation_id];
                  setConversationCache(updatedCache);
                  //console.log(conversationsHistory)
                  setConversationsHistory([
                    {
                      sender: 'Cube-BOT',
                      message: 'Hello! How can I help you?',
                    },
                    { sender: 'User', message: 'Hi there! I have a question.' },
                  ]);
                }
                promptTexts.splice(index, 1);
                setCurrentConversationIndex(0);
                await loadConversationByID(currentConversationIndex);
                await handleRestoreConversation(0);

                await Swal.fire('Izbrisano!', 'Vaša konverzacija je uspešno izbrisana!', 'success');
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
  const handleDeleteAllChat = async () => {
    try {
      await Swal.fire({
        title: 'Da li ste sigurni?',
        text: 'Necete moci da ispravite!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Da, izbriši!',
      }).then(async (result) => {
        if (result.isConfirmed) {
          const conversationsListPromise = await deleteAllConversationsByUserId(jwt, user_id);
          if (conversationsListPromise.status === 200) {
            (await conversationsListPromise.json()) as ConversationsResponse;

            if (conversationList.length > 0) {
              conversationList = [];
              setConversationCache({});
              setConversationsHistory([
                {
                  sender: 'Cube-BOT',
                  message: 'Hello! How can I help you?',
                },
                { sender: 'User', message: 'Hi there! I have a question.' },
              ]);
            }
            setPromptTexts([]);

            await Swal.fire('Izbrisano!', 'Vasa konverzacije su uspešno izbrisane.', 'success');
          } else {
            console.error('Error.');
          }
        } else {
          console.error('Error Deleting Conversation');
        }
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleNewChatActive = async () => {
    const reversedConversationsList = conversationList.slice().reverse();
    const lastIndex = reversedConversationsList.findIndex((conversation) => conversation.conversation_id);
    if (lastIndex !== -1) {
      const lastCreatedIndex = conversationList.length - lastIndex - 1;
      setCurrentConversationIndex(lastCreatedIndex);
      await handleRestoreConversation(lastCreatedIndex);
    }
  };

  const handleRestoreConversation = async (index: number) => {
    setCurrentConversationIndex(index);
    const conversationId = conversationList[index].conversation_id;
    // Check if the conversation data is in the cache
    if (conversationCache[conversationId]) {
      setConversationsHistory(conversationCache[conversationId]);
    } else {
      const promptsResponse = await fetchPreviousPrompts(jwt, conversationId);
      const answersResponse = await fetchPreviousAnswers(jwt, conversationId);
      if (promptsResponse.status === 200 && answersResponse.status === 200) {
        const responseJson = (await promptsResponse.json()) as PromptResponse;
        const promptsData = responseJson.data;
        const responseJson2 = (await answersResponse.json()) as AnswerResponse;
        const answersData = responseJson2.data;
        if (Array.isArray(promptsData) && promptsData.length > 0 && Array.isArray(answersData) && answersData.length > 0) {
          const formattedPrompts: Message[] = promptsData.map((promptObj: Prompt) => ({
            sender: username,
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
          setConversationCache((prevCache) => ({
            ...prevCache,
            [conversationList[index].conversation_id]: formattedMessages,
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
          handleLoginClick={() => {
            /* Handle login click */
          }}
          handleRegisterClick={() => {
            /* Handle register click */
          }}
          handleSignOut={() => {
            /* Handle sign out */
          }}
          isAuthenticated={true}
        />
      </React.Suspense>
      <div className="chat-container">
        <div className="chat-sidebar">
          <div className="buttons">
            <button className="start-new-chat-button" onClick={handleNewChat}>
              Novi Čet
            </button>
            <button className="delete-all-chat-button" onClick={handleDeleteAllChat}>
              Obrisi sve
            </button>
          </div>
          <div className="conversation-restore-points">
            <div className="restore-points-header">Prethodni četovi</div>
            {conversationList.map((conversation, index) => {
              const promptText = promptTexts[index];

              return (
                <button
                  key={conversation.conversation_id}
                  className={`restore-point ${index === currentConversationIndex ? 'selected' : ''}`}
                  onClick={() => handleRestoreConversation(index)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRestoreConversation(index);
                  }}>
                  {index === currentConversationIndex ? <strong>{promptText}</strong> : <span>{promptText}</span>}
                  <FontAwesomeIcon
                    className="DeleteIcon"
                    icon={faTrash as IconProp}
                    style={{ paddingLeft: '10px' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteChat(index);
                    }}
                  />
                </button>
              );
            })}
          </div>
        </div>
        <div className="chat-content">
          <div className="remaining-prompts">Ostalo vam je jos : {promptsLeft} promptova</div>
          <div className="previous-conversations">
            <div className="message-bubbles">
              {conversationsHistory.map((msg) => (
                <ChatMessage key={`${msg.sender}-${msg.message.substring(0, 20)}`} msg={msg} />
              ))}
              <div ref={chatContentLastMessage}></div>
            </div>
          </div>
          <div className="user-input">
            <form onSubmit={handleSubmit}>
              <input type="text" value={userInput} onChange={handleUserInput} placeholder="Unesite vašu poruku..." disabled={disableInput} />
              <button className="send-button" type="submit" onClick={handleEmptyChat}>
                Pošalji
              </button>
            </form>
          </div>
        </div>
        <div className="chat-sidebar2">
          <div className="model-selection">
            <label htmlFor="CubeBOT-model">Izaberi Cube-BOT model:</label>
            <Select defaultValue={selectedModel} onChange={setSelectedModel} options={options} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
