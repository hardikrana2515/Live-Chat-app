import { Routes, Route } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from './pages/Loginpage'
import LandingRoute from './components/landing/LandingRoute'
import UserState from './contexts/UserContext/UserState'
import ProtectedRoute from './routes/protected.routes'
import Chatpage from './pages/Chatpage'
import ChatState from './contexts/ChatContext/ChatState'
import MessageState from './contexts/MessageContext/MessageState';
import SocketStates from './contexts/Socket.io.Context/SocketStates';
import NotFoundpage from './pages/NotFoundpage';

import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import GlobePrototypePage from './pages/GlobePrototypePage';
import AssetShowcasePage from './pages/AssetShowcasePage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';

function App() {
  const SOCKET_ENDPOINT =
    import.meta.env.VITE_SOCKET_URL ||
    (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/ChatApp\/?$/, '') : '') ||
    (import.meta.env.PROD ? "" : "http://localhost:4000");

  return (
    <ErrorBoundary>
    <UserState>
      <SocketStates ENDPOINT={SOCKET_ENDPOINT}>
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
                {/* Landing page: show to unauthenticated users, redirect authenticated to chat */}
                <Route path="/" element={<LandingRoute />} />
                <Route path="/login" element={<Login />} />
                <Route path="/password/forgot" element={<ForgotPassword />} />
                <Route path="/password/reset/:token" element={<ResetPassword />} />
                <Route path="/chat" element={<ProtectedRoute Component={Chatpage} />} />
                <Route path="/prototype/globe" element={<GlobePrototypePage />} />
                <Route path="/prototype/assets" element={<AssetShowcasePage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="/terms" element={<TermsOfServicePage />} />

                <Route path="*" element={<NotFoundpage />} />
              </Routes>
            </div>
          </MessageState>
        </ChatState>
      </SocketStates>
    </UserState>
    </ErrorBoundary>
  )
}
export default App