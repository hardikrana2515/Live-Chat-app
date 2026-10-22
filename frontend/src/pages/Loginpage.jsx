import React, { useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import SignUp from '../components/SignUp';
import userContext from '../contexts/UserContext/userContext';
import { FiShield, FiArrowLeft, FiLock } from 'react-icons/fi';

const Login = () => {
  const navigate = useNavigate();
  const { login, setLogin, setError } = useContext(userContext);

  // If already logged in, redirect straight to chat
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userInfo = localStorage.getItem('userInfo');
    if (token && userInfo) {
      navigate('/chat', { replace: true });
    }
  }, [navigate]);

  const handleTabChange = (isLoginTab) => {
    setError('');
    setLogin(isLoginTab);
  };

  return (
    <div className="landing-root min-h-screen w-full flex flex-col justify-between bg-[var(--c-warm-paper)] text-[var(--c-primary-ink)] relative overflow-x-hidden selection:bg-[#2858E8]/15 selection:text-[#2858E8]">
      {/* Top Navigation Bar */}
      <header className="w-full border-b border-[var(--c-divider)] bg-[var(--c-warm-paper)]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-[1240px] mx-auto px-5 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="group flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2858E8] rounded-md"
            aria-label="Talkyy Home"
          >
            <img
              src="/brand/talkyy-horizontal-clean.png"
              alt="Talkyy"
              className="h-8 sm:h-9 w-auto max-w-[140px] sm:max-w-[160px] object-contain transition-transform duration-200 group-hover:scale-[1.02]"
            />
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[var(--c-secondary-ink)] hover:text-[var(--c-primary-ink)] px-3.5 py-1.5 rounded-lg border border-[var(--c-divider)] bg-white/70 hover:bg-white transition-all shadow-2xs hover:shadow-xs"
          >
            <FiArrowLeft className="text-sm" />
            <span>Back to Talkyy</span>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12 relative z-10">
        {/* Subtle Warm Paper Ambient Details */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-[#E8EEFF]/40 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="w-full max-w-[490px] mx-auto flex flex-col items-center">
          {/* Header Typography */}
          <div className="flex flex-col items-center text-center mb-6 w-full">
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--c-soft-blue-surface)] px-3 py-1 text-xs font-semibold text-[#2858E8] border border-[#2858E8]/15 mb-3.5 shadow-2xs">

              <Link
                to="/"
                className="group flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2858E8] rounded-md"
                aria-label="Talkyy Home"
              >
                <img
                  src="/brand/talkyy-horizontal-clean.png"
                  alt="Talkyy"
                  className="h-8 sm:h-9 w-auto max-w-[140px] sm:max-w-[160px] object-contain transition-transform duration-200 group-hover:scale-[1.02]"
                />
              </Link>
            </div>

            <h1 className="font-display text-2xl sm:text-[1.85rem] font-bold text-[var(--c-primary-ink)] tracking-tight">
              {login ? 'Sign in to your account' : 'Create your account'}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--c-secondary-ink)] mt-1.5 max-w-sm leading-relaxed">
              {login
                ? 'Private conversations, lively groups, and crystal-clear calls.'
                : 'Start talking in seconds with zero install and end-to-end encryption.'}
            </p>
          </div>

          {/* Editorial Card */}
          <div className="w-full bg-white border border-[var(--c-divider)] rounded-2xl p-6 sm:p-7 shadow-[0_8px_30px_rgba(25,27,32,0.06)] relative">
            {/* Segmented Switcher */}
            <div className="grid grid-cols-2 p-1 mb-6 bg-[#EFECE4] border border-[var(--c-divider)] rounded-xl">
              <button
                type="button"
                onClick={() => handleTabChange(true)}
                className={`py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-150 ${login
                  ? 'bg-white text-[var(--c-primary-ink)] shadow-[0_1px_3px_rgba(25,27,32,0.08)] border border-[var(--c-divider)]/40'
                  : 'text-[var(--c-secondary-ink)] hover:text-[var(--c-primary-ink)]'
                  }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => handleTabChange(false)}
                className={`py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-150 ${!login
                  ? 'bg-white text-[var(--c-primary-ink)] shadow-[0_1px_3px_rgba(25,27,32,0.08)] border border-[var(--c-divider)]/40'
                  : 'text-[var(--c-secondary-ink)] hover:text-[var(--c-primary-ink)]'
                  }`}
              >
                Register
              </button>
            </div>

            {/* Form Component */}
            {login ? <LoginForm /> : <SignUp />}

            {/* Security Badge */}
            <div className="mt-6 pt-4 border-t border-[var(--c-divider)] flex items-center justify-center gap-1.5 text-xs text-[var(--c-secondary-ink)]">
              <FiShield className="text-[#2858E8] text-sm shrink-0" />
              <span>End-to-end encrypted · Runs in browser</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[var(--c-divider)] py-5 text-center text-xs text-[var(--c-secondary-ink)] bg-[var(--c-warm-paper)]">
        <div className="max-w-[1240px] mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} Talkyy. Good conversations bring us closer.</p>
          <div className="flex items-center gap-4">
            <Link to="/privacy-policy" className="hover:text-[var(--c-primary-ink)] hover:underline transition-colors">
              Privacy Policy
            </Link>
            <span className="text-[var(--c-divider)]">·</span>
            <Link to="/terms" className="hover:text-[var(--c-primary-ink)] hover:underline transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Login;
