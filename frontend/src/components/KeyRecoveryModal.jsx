import React, { useState, useContext } from 'react';
import userContext from '../contexts/UserContext/userContext';
import { FiKey, FiEye, FiEyeOff, FiClipboard, FiAlertCircle, FiLoader, FiShield, FiAlertTriangle } from 'react-icons/fi';
import { toast } from 'react-toastify';

const KeyRecoveryModal = () => {
  const {
    showRecoveryModal,
    setShowRecoveryModal,
    performIdentityRecovery,
    setShowResetModal,
    identityState,
  } = useContext(userContext);

  const [inputKey, setInputKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!showRecoveryModal && identityState !== 'RECOVERY_REQUIRED') return null;

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInputKey(text.trim());
        setErrorMessage('');
      }
    } catch {
      toast.info('Please manually paste your recovery key into the input field.');
    }
  };

  const handleRestore = async (e) => {
    e.preventDefault();
    if (!inputKey.trim()) {
      setErrorMessage('Please enter your recovery key.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      await performIdentityRecovery(inputKey);
      setShowRecoveryModal(false);
    } catch (err) {
      setErrorMessage(err.message || 'Decryption failed. Please check your recovery key.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenReset = () => {
    setShowRecoveryModal(false);
    setShowResetModal(true);
  };

  return (
    <div
      className="fixed inset-0 z-[85] flex items-center justify-center bg-[var(--c-overlay)] backdrop-blur-md px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="recovery-modal-title"
    >
      <div
        className="relative w-full max-w-lg bg-[var(--c-surface)] text-[var(--c-text)] border border-[var(--c-border)] rounded-2xl sm:rounded-3xl p-6 sm:p-7 shadow-2xl animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Icon */}
        <div className="flex items-center gap-3.5 mb-4">
          <span className="w-12 h-12 rounded-2xl bg-[#2858E8]/10 border border-[#2858E8]/30 flex items-center justify-center text-[#2858E8] shrink-0">
            <FiKey className="text-2xl" />
          </span>
          <div>
            <h2 id="recovery-modal-title" className="text-lg sm:text-xl font-bold font-display text-[var(--c-text)]">
              Restore your encrypted conversations
            </h2>
            <p className="text-xs text-[var(--c-text-2)]">
              Zero-Knowledge Identity Recovery
            </p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-[var(--c-text-2)] mb-5 leading-relaxed">
          Talkyy needs your recovery key to restore your existing encryption identity. Your recovery key is used locally to unlock your encrypted key backup and is <strong>never sent to Talkyy&apos;s servers</strong>.
        </p>

        {errorMessage && (
          <div className="flex items-start gap-2.5 p-3 text-xs text-[#991B1B] bg-[#FEF2F2] dark:bg-[#991B1B]/15 border border-[#FCA5A5] dark:border-[#991B1B]/40 rounded-xl mb-4 animate-fadeIn">
            <FiAlertCircle className="shrink-0 text-sm mt-0.5 text-[#DC2626]" />
            <span className="font-medium leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Recovery Form */}
        <form onSubmit={handleRestore} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-[var(--c-text)]">
              <label htmlFor="recovery-key-input">Enter Recovery Key</label>
              <button
                type="button"
                onClick={handlePaste}
                className="text-[#2858E8] hover:underline flex items-center gap-1 cursor-pointer font-normal"
              >
                <FiClipboard className="text-xs" /> Paste from clipboard
              </button>
            </div>

            <div className="relative flex items-center">
              <input
                id="recovery-key-input"
                type={showKey ? 'text' : 'password'}
                required
                value={inputKey}
                onChange={(e) => {
                  setInputKey(e.target.value);
                  setErrorMessage('');
                }}
                placeholder="TLKY-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX"
                className="w-full pl-3.5 pr-10 py-2.5 bg-[var(--c-panel)] border border-[var(--c-border)] rounded-xl text-xs sm:text-sm font-mono text-[var(--c-text)] placeholder:text-[var(--c-text-3)] focus:outline-none focus:border-[#2858E8] focus:ring-2 focus:ring-[#2858E8]/15 tracking-wider transition-all"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 text-[var(--c-text-3)] hover:text-[var(--c-text)] p-1 cursor-pointer"
                aria-label={showKey ? 'Hide recovery key' : 'Show recovery key'}
              >
                {showKey ? <FiEyeOff className="text-base" /> : <FiEye className="text-base" />}
              </button>
            </div>
            <span className="text-[11px] text-[var(--c-text-3)]">
              Format: 7 blocks of 4 characters prefixed with TLKY- (hyphens optional)
            </span>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting || !inputKey.trim()}
              className="flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold bg-[#2858E8] hover:bg-[#1f47c2] text-white transition-all shadow-md disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <FiLoader className="text-base animate-spin" />
                  <span>Unlocking Vault...</span>
                </>
              ) : (
                <>
                  <FiShield className="text-base" />
                  <span>Restore My Key</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer / Lost Key link */}
        <div className="mt-5 pt-4 border-t border-[var(--c-border-soft)] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[var(--c-text-3)]">
          <span>Never share your recovery key with anyone.</span>
          <button
            type="button"
            onClick={handleOpenReset}
            className="text-amber-500 hover:text-amber-600 hover:underline flex items-center gap-1 cursor-pointer font-medium"
          >
            <FiAlertTriangle className="text-xs" /> Lost your key?
          </button>
        </div>
      </div>
    </div>
  );
};

export default KeyRecoveryModal;
