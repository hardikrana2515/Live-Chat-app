import React, { useState, useContext } from 'react';
import userContext from '../contexts/UserContext/userContext';
import { FiAlertTriangle, FiLock, FiLoader } from 'react-icons/fi';
import { IoCloseSharp } from 'react-icons/io5';

const ResetIdentityModal = () => {
  const { showResetModal, setShowResetModal, performIdentityReset, setShowRecoveryModal } =
    useContext(userContext);

  const [password, setPassword] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!showResetModal) return null;

  const handleReset = async (e) => {
    e.preventDefault();
    if (!password) {
      setError('Please enter your account password.');
      return;
    }
    if (!confirmed) {
      setError('Please confirm that you understand historical messages will remain unreadable.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await performIdentityReset(password);
      setShowResetModal(false);
    } catch (err) {
      setError(err.message || 'Identity reset failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-[var(--c-overlay)] backdrop-blur-md px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reset-modal-title"
    >
      <div
        className="relative w-full max-w-md bg-[var(--c-surface)] text-[var(--c-text)] border border-[var(--c-border)] rounded-2xl sm:rounded-3xl p-6 sm:p-7 shadow-2xl animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => {
            setShowResetModal(false);
            setShowRecoveryModal(true);
          }}
          className="absolute top-4 right-4 p-1.5 text-[var(--c-text-3)] hover:text-[var(--c-text)] hover:bg-[var(--c-hover)] rounded-full transition-all cursor-pointer"
          aria-label="Close"
        >
          <IoCloseSharp className="text-xl" />
        </button>

        <div className="flex items-center gap-3.5 mb-4">
          <span className="w-12 h-12 rounded-2xl bg-[#DC2626]/10 border border-[#DC2626]/30 flex items-center justify-center text-[#DC2626] shrink-0">
            <FiAlertTriangle className="text-2xl" />
          </span>
          <div>
            <h2 id="reset-modal-title" className="text-lg sm:text-xl font-bold font-display text-[var(--c-text)]">
              Reset Encryption Identity
            </h2>
            <p className="text-xs text-[var(--c-text-2)]">Irreversible Cryptographic Action</p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs mb-4 leading-relaxed">
          <p className="font-semibold mb-1">Warning: Historical Messages Cannot Be Recovered</p>
          <p>
            Resetting your identity generates a new cryptographic keypair for future chats. Because Talkyy is zero-knowledge, past messages encrypted with your old key <strong>cannot be decrypted</strong> without your recovery key.
          </p>
        </div>

        {error && (
          <div className="p-2.5 mb-3 text-xs text-[#991B1B] bg-[#FEF2F2] dark:bg-[#991B1B]/15 border border-[#FCA5A5] dark:border-[#991B1B]/40 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleReset} className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[var(--c-text)]">
              Confirm Account Password
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-[var(--c-text-3)] pointer-events-none">
                <FiLock className="text-sm" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="Enter your account password"
                className="w-full pl-9 pr-3 py-2 bg-[var(--c-panel)] border border-[var(--c-border)] rounded-xl text-xs sm:text-sm text-[var(--c-text)] focus:outline-none focus:border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/15"
              />
            </div>
          </div>

          <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[var(--c-text-2)] select-none">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-[var(--c-border)] text-[#DC2626] focus:ring-[#DC2626]"
            />
            <span>
              I understand that historical messages encrypted under my old identity will remain permanently unreadable.
            </span>
          </label>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setShowResetModal(false);
                setShowRecoveryModal(true);
              }}
              className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-[var(--c-raised)] hover:bg-[var(--c-hover)] text-[var(--c-text)] border border-[var(--c-border)] transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !confirmed || !password}
              className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-[#DC2626] hover:bg-[#b91c1c] text-white transition-all shadow-md disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
            >
              {submitting ? (
                <>
                  <FiLoader className="text-sm animate-spin" />
                  <span>Resetting...</span>
                </>
              ) : (
                <span>Reset Identity</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetIdentityModal;
