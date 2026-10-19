
import { Routes, Route } from 'react-router-dom'
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

import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

function App() {

  return (
    <UserState>
      <SocketStates ENDPOINT="http://localhost:4000">
        <ChatState>
          <MessageState>
            <ToastContainer
              position="bottom-center"
              theme="dark"
              autoClose={2500}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              pauseOnHover
              toastClassName="!bg-[var(--c-surface)] !text-[var(--c-text)] !border !border-[var(--c-border)] !rounded-xl !shadow-xl"
            />
            <div className="app ">
              <Routes>
                <Route path="/" element={<ProtectedRoute Component={Home} />} />
                <Route path="/login" element={<Login />} />
                <Route path="/password/forgot" element={<ForgotPassword />} />
                <Route path="/password/reset/:token" element={<ResetPassword />} />
                <Route path="/chat" element={<ProtectedRoute Component={Chatpage} />} />

                <Route path="*" element={<NotFoundpage />} />
              </Routes>
            </div>
          </MessageState>
        </ChatState>
      </SocketStates>
    </UserState>
  )
}

export default App
