
import { Route, Routes } from 'react-router-dom'
import HomePage from './routes/HomePage';
import './App.css'
import ChatBot from './routes/Chatbot';

function App() {

    return(
      
      <Routes>
        <Route path="/" element={<HomePage/>}/>
        <Route path="/Chatbot" element={<ChatBot/>}/>
      </Routes>
      
    )
  
}

export default App
