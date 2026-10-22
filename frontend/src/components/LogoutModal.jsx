import React, { useContext, useState, useEffect } from 'react';
import userContext from '../contexts/UserContext/userContext';
import { TbLogout2 } from 'react-icons/tb';
import { IoCloseSharp } from 'react-icons/io5';
import { FiAlertTriangle, FiLoader } from 'react-icons/fi';
import { toast } from 'react-toastify';

const LogoutModal = () => {
  const { user, logout, logoutModal, setLogoutModal } = useContext(userContext);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Close on Escape key press
  useEffect(() => {
    if (!logoutModal) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isSubmitting) {
        setLogoutModal(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [logoutModal, isSubmitting, setLogoutModal]);

  if (!logoutModal) return null;

  const handleConfirmLogout = async () => {
    setIsSubmitting(true);
    try {
      await logout();
      setLogoutModal(false);
    } catch (err) {
      toast.error(err.message || 'Logout failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setLogoutModal(false);
    }
  };

  const avatarSrc = user?.avtar?.startsWith('data:image')
    ? user.avtar
    : user?.avtar
    ? `http://localhost:4000${user.avtar}`
    : '/avtar.png';

  const displayName = user?.name || user?.userName || 'User';
  const displayHandle = user?.userName
    ? (user.userName.startsWith('@') ? user.userName : `@${user.userName}`)
    : (user?.email || '');

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-[var(--c-overlay)] backdrop-blur-md px-4 py-6 transition-all duration-200"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-modal-title"
    >
      <div
        className="relative w-full max-w-md bg-[var(--c-surface)] text-[var(--c-text)] border border-[var(--c-border)] rounded-2xl sm:rounded-3xl p-6 sm:p-7 shadow-2xl animate-fadeIn transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 p-1.5 text-[var(--c-text-3)] hover:text-[var(--c-text)] hover:bg-[var(--c-hover)] rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-[var(--c-primary)] disabled:opacity-50 cursor-pointer"
          aria-label="Close logout modal"
        >
          <IoCloseSharp className="text-xl" />
        </button>

        {/* Visual Badge Header */}
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-4">
            <span className="w-16 h-16 rounded-2xl bg-[#DC2626]/10 border border-[#DC2626]/30 flex items-center justify-center text-[#DC2626] shadow-inner">
              <TbLogout2 className="text-3xl translate-x-0.5" />
            </span>
            <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[var(--c-surface)] border border-[var(--c-border)] flex items-center justify-center text-[#DC2626]">
              <FiAlertTriangle className="text-xs" />
            </span>
          </div>

          <h2
            id="logout-modal-title"
            className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--c-text)] font-display mb-1.5"
          >
            Log out of Talkyy?
          </h2>

          <p className="text-xs sm:text-sm text-[var(--c-text-2)] max-w-sm mb-5 leading-relaxed">
            Are you sure you want to end your current session? You will need to sign back in with your credentials to access your chats.
          </p>

          {/* User Preview Card */}
          {user && (user.name || user.userName || user.email) && (
            <div className="w-full flex items-center gap-3 p-3 mb-6 bg-[var(--c-panel)] border border-[var(--c-border-soft)] rounded-xl text-left">
              <img
                src={avatarSrc}
                alt={displayName}
                className="w-10 h-10 rounded-full object-cover border border-[var(--c-border)] shrink-0 bg-[var(--c-hover)]"
                onError={(e) => {
                  e.currentTarget.src = '/avtar.png';
                }}
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-semibold text-[var(--c-text)] truncate">
                  {displayName}
                </p>
                {displayHandle && (
                  <p className="text-[11px] sm:text-xs text-[var(--c-text-3)] truncate">
                    {displayHandle}
                  </p>
                )}
              </div>
              <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--c-text-3)] px-2 py-0.5 rounded-md bg-[var(--c-surface)] border border-[var(--c-border-soft)]">
                Active
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="w-full flex flex-col-reverse sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="w-full sm:flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold bg-[var(--c-raised)] hover:bg-[var(--c-hover)] text-[var(--c-text)] border border-[var(--c-border)] transition-all disabled:opacity-50 cursor-pointer shadow-xs"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleConfirmLogout}
              disabled={isSubmitting}
              className="w-full sm:flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold bg-[#DC2626] hover:bg-[#B91C1C] text-white transition-all shadow-md hover:shadow-lg hover:shadow-red-500/20 active:scale-[0.98] disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <FiLoader className="text-base animate-spin" />
                  <span>Signing out...</span>
                </>
              ) : (
                <>
                  <TbLogout2 className="text-base" />
                  <span>Yes, Log Out</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
