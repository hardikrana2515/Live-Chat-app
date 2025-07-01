
import './App.css'
import { Routes,Route } from 'react-router-dom'
import Home from './pages/Home'
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from './pages/Loginpage'
import UserState from './contexts/UserContext/UserState'
import ProtectedRoute from './routes/protected.routes'
import Chatpage from './pages/Chatpage'
import ChatState from './contexts/ChatContext/ChatState'
import MessageState from './contexts/MessageContext/MessageState';
import SocketStates from './contexts/Socket.io.Context/Socketstates';
import NotFoundpage from './pages/NotFoundpage';

function App() {

  return (
      <SocketStates ENDPOINT="http://localhost:4000">
      <ChatState>
        <MessageState>
     <UserState>
      <ToastContainer />
    <div className="app ">
      <Routes>
        <Route path="/" element={<ProtectedRoute Component={Home}/>}/>
        <Route path="/login" element={<Login/>}/>
         <Route path="/chat" element={<ProtectedRoute Component={Chatpage}/>}/>

        <Route path="*" element={<NotFoundpage/>}/>
      </Routes>
    </div>
    </UserState>
    </MessageState>
    </ChatState>
    </SocketStates>
  )
}

export default App
