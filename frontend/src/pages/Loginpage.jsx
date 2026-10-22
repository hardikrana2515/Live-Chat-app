import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import SignUp from '../components/SignUp';
import userContext from '../contexts/UserContext/userContext';
import { FiShield, FiLock } from 'react-icons/fi';

const Login = () => {
  const { login, setLogin, setError } = useContext(userContext);

  const handleTabChange = (isLoginTab) => {
    setError('');
    setLogin(isLoginTab);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[var(--c-canvas)] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.18),rgba(255,255,255,0))] relative overflow-hidden p-3 sm:p-6">
      {/* Subtle formal ambient gradients */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-[var(--c-primary)]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-[var(--c-primary)]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md mx-auto flex flex-col items-center">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="relative mb-3">
            <div className="w-16 h-16 rounded-2xl bg-[var(--c-panel)] border border-[var(--c-line)] p-2.5 flex items-center justify-center shadow-xl ">
              <img
                src="/brand/talkyy-symbol-transparent.png"
                alt="Talkyy"
                className="w-full h-full object-contain filter drop-shadow"
              />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--c-text)] tracking-tight flex items-center gap-2">
            Talkyy
            <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--c-primary-soft)] text-[var(--c-link)] border border-[var(--c-line)]">
              Workspace
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-[var(--c-text-2)] mt-1 max-w-xs">
            {login ? 'Sign in to access your secure chat workspace' : 'Create an account to start communicating'}
          </p>
        </div>

        {/* Formal Glass Card */}
        <div className="w-full bg-[var(--c-panel-95)] backdrop-blur-xl border border-[var(--c-line)] rounded-2xl p-6 sm:p-7 shadow-2xl ">
          {/* Segmented Switcher */}
          <div className="grid grid-cols-2 p-1 mb-6 bg-[var(--c-canvas-80)] border border-[var(--c-line-50)] rounded-xl">
            <button
              type="button"
              onClick={() => handleTabChange(true)}
              className={`py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-200 ${
                login
                  ? 'bg-[var(--c-primary)] text-[var(--c-text)] shadow-md '
                  : 'text-[var(--c-text-2)] hover:text-[var(--c-text)]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => handleTabChange(false)}
              className={`py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-200 ${
                !login
                  ? 'bg-[var(--c-primary)] text-[var(--c-text)] shadow-md '
                  : 'text-[var(--c-text-2)] hover:text-[var(--c-text)]'
              }`}
            >
              Register
            </button>
          </div>

          {/* Form */}
          {login ? <LoginForm /> : <SignUp />}

          {/* Footer security badge */}
          <div className="mt-5 pt-4 border-t border-[var(--c-line-50)] flex items-center justify-center gap-1.5 text-[11px] text-[var(--c-text-2)]">
            <FiLock className="text-[var(--c-online)]" />
            <span>Client-Side Encrypted Communication</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
