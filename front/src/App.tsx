import { Route, Routes } from 'react-router-dom';

import HomePage from './routes/HomePage';
import './App.css';
import ChatBot from './routes/Chatbot';
import SQLAssistant from './routes/SQLAssistant';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/Chatbot" element={<ChatBot />} />
      <Route path="/SQLAssistant" element={<SQLAssistant />} />
    </Routes>
  );
}

export default App;
