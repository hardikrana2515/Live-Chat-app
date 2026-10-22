import React, { useState, useEffect, useContext } from 'react';
import userContext from '../contexts/UserContext/userContext';
import { generateRecoverySecret } from '../utils/keyVault';
import { FiShield, FiCopy, FiCheck, FiDownload, FiAlertTriangle, FiLoader, FiLock } from 'react-icons/fi';
import { IoCloseSharp } from 'react-icons/io5';
import { toast } from 'react-toastify';

const KeySetupModal = () => {
  const { showSetupModal, setShowSetupModal, performInitialSetup } = useContext(userContext);

  const [recoverySecret, setRecoverySecret] = useState('');
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (showSetupModal && !recoverySecret) {
      setRecoverySecret(generateRecoverySecret());
    }
  }, [showSetupModal, recoverySecret]);

  if (!showSetupModal) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(recoverySecret);
      setCopied(true);
      toast.success('Recovery key copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.info('Please manually select and copy your recovery key.');
    }
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob(
      [
        `TALKYY END-TO-END ENCRYPTION RECOVERY KEY\n` +
          `==========================================\n\n` +
          `Your Recovery Key:\n${recoverySecret}\n\n` +
          `IMPORTANT SECURITY NOTICE:\n` +
          `- Keep this key safe and private. Anyone with this key and your account could decrypt your messages.\n` +
          `- Talkyy does not store this key. If you lose this key and clear your browser storage, your message history cannot be restored.\n` +
          `- Date Generated: ${new Date().toISOString()}\n`,
      ],
      { type: 'text/plain;charset=utf-8' }
    );
    element.href = URL.createObjectURL(file);
    element.download = `talkyy-recovery-key-${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Backup file downloaded!');
  };

  const handleSaveAndEnable = async () => {
    if (!confirmed) {
      toast.error('Please confirm that you have saved your recovery key.');
      return;
    }

    setSubmitting(true);
    try {
      await performInitialSetup(recoverySecret);
      setShowSetupModal(false);
    } catch (err) {
      toast.error(err.message || 'Failed to setup encryption vault');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[85] flex items-center justify-center bg-[var(--c-overlay)] backdrop-blur-md px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="setup-modal-title"
    >
      <div
        className="relative w-full max-w-lg bg-[var(--c-surface)] text-[var(--c-text)] border border-[var(--c-border)] rounded-2xl sm:rounded-3xl p-6 sm:p-7 shadow-2xl animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dismiss Button (only allowed if confirmed or modal dismissible) */}
        <button
          type="button"
          onClick={() => setShowSetupModal(false)}
          className="absolute top-4 right-4 p-1.5 text-[var(--c-text-3)] hover:text-[var(--c-text)] hover:bg-[var(--c-hover)] rounded-full transition-all cursor-pointer"
          aria-label="Close"
        >
          <IoCloseSharp className="text-xl" />
        </button>

        {/* Icon & Title */}
        <div className="flex items-center gap-3.5 mb-4">
          <span className="w-12 h-12 rounded-2xl bg-[#2858E8]/10 border border-[#2858E8]/30 flex items-center justify-center text-[#2858E8] shrink-0">
            <FiShield className="text-2xl" />
          </span>
          <div>
            <h2 id="setup-modal-title" className="text-lg sm:text-xl font-bold font-display text-[var(--c-text)]">
              Secure Your Conversations
            </h2>
            <p className="text-xs text-[var(--c-text-2)]">
              End-to-End Encryption & Key Backup Setup
            </p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-[var(--c-text-2)] mb-4 leading-relaxed">
          Talkyy protects your private messages with client-side encryption. Save this <strong>Recovery Key</strong> in a safe place. You will need it to unlock your chat history if you clear browser data or sign in from a new device.
        </p>

        {/* Recovery Key Display Box */}
        <div className="p-3.5 bg-[var(--c-panel)] border border-[var(--c-border)] rounded-xl mb-3 flex flex-col gap-2">
          <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--c-text-3)] uppercase tracking-wider">
            <span>Your Personal Recovery Key</span>
            <span className="text-[#2858E8] flex items-center gap-1 font-mono">
              <FiLock className="text-xs" /> 128-bit Zero-Knowledge
            </span>
          </div>

          <div className="font-mono text-sm sm:text-base font-semibold text-[var(--c-text)] tracking-wider select-all break-all bg-[var(--c-surface)] p-2.5 rounded-lg border border-[var(--c-border-soft)] text-center">
            {recoverySecret || 'Generating key...'}
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--c-raised)] hover:bg-[var(--c-hover)] text-[var(--c-text)] border border-[var(--c-border-soft)] transition-all cursor-pointer"
            >
              {copied ? <FiCheck className="text-emerald-500" /> : <FiCopy />}
              <span>{copied ? 'Copied!' : 'Copy Key'}</span>
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--c-raised)] hover:bg-[var(--c-hover)] text-[var(--c-text)] border border-[var(--c-border-soft)] transition-all cursor-pointer"
            >
              <FiDownload />
              <span>Download .txt</span>
            </button>
          </div>
        </div>

        {/* Warning Notice */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs mb-4">
          <FiAlertTriangle className="shrink-0 text-sm mt-0.5" />
          <p className="leading-relaxed">
            Talkyy servers <strong>never receive your private key or recovery key in plaintext</strong>. If you lose this key, your past messages cannot be recovered.
          </p>
        </div>

        {/* Confirmation Checkbox */}
        <label className="flex items-start gap-2.5 cursor-pointer text-xs sm:text-sm text-[var(--c-text-2)] mb-5 select-none">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-[var(--c-border)] text-[#2858E8] focus:ring-[#2858E8]"
          />
          <span>I have saved my Recovery Key safely. I understand Talkyy cannot restore my historical messages without it.</span>
        </label>

        {/* Submit Action */}
        <button
          type="button"
          onClick={handleSaveAndEnable}
          disabled={!confirmed || submitting}
          className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold bg-[#2858E8] hover:bg-[#1f47c2] text-white transition-all shadow-md disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <FiLoader className="text-base animate-spin" />
              <span>Creating Encrypted Backup...</span>
            </>
          ) : (
            <>
              <FiShield className="text-base" />
              <span>Activate & Save Backup</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default KeySetupModal;
