import React, { useState, useEffect, useContext } from 'react';
import {
  FiShield,
  FiLock,
  FiKey,
  FiCheck,
  FiCopy,
  FiDownload,
  FiAlertTriangle,
  FiX,
  FiRefreshCw,
  FiExternalLink
} from 'react-icons/fi';
import userContext from '../contexts/UserContext/userContext';
import { toast } from 'react-toastify';

const TwoFactorModal = ({ isOpen, onClose }) => {
  const {
    user,
    get2FAStatus,
    setup2FA,
    confirm2FA,
    disable2FA,
    regenerateBackupCodes
  } = useContext(userContext);

  const [status, setStatus] = useState({ enabled: false, backupCodesRemaining: 0 });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('VIEW'); // 'VIEW' | 'SETUP' | 'SHOW_BACKUP_CODES' | 'DISABLE' | 'REGEN_CODES'
  
  // Setup data
  const [setupData, setSetupData] = useState(null); // { qrCode, manualKey, issuer, account }
  const [confirmCode, setConfirmCode] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);

  // Disable / Regen forms
  const [password, setPassword] = useState('');

  // Fetch current 2FA status on open
  useEffect(() => {
    if (isOpen) {
      loadStatus();
    } else {
      resetState();
    }
  }, [isOpen]);

  const resetState = () => {
    setStep('VIEW');
    setSetupData(null);
    setConfirmCode('');
    setBackupCodes([]);
    setPassword('');
    setLoading(false);
  };

  const loadStatus = async () => {
    setLoading(true);
    try {
      const data = await get2FAStatus();
      if (data) {
        setStatus(data);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to fetch 2FA status');
    } finally {
      setLoading(false);
    }
  };

  const handleStartSetup = async () => {
    setLoading(true);
    try {
      const data = await setup2FA();
      setSetupData(data);
      setStep('SETUP');
    } catch (err) {
      toast.error(err.message || 'Failed to initialize 2FA setup');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSetup = async (e) => {
    e.preventDefault();
    if (!confirmCode || confirmCode.length !== 6) {
      return toast.error('Please enter the 6-digit code from your authenticator app');
    }

    setLoading(true);
    try {
      const data = await confirm2FA(confirmCode.trim());
      setStatus({ enabled: true, backupCodesRemaining: data.backupCodes?.length || 8 });
      setBackupCodes(data.backupCodes || []);
      setStep('SHOW_BACKUP_CODES');
      toast.success('Two-factor authentication enabled!');
    } catch (err) {
      toast.error(err.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async (e) => {
    e.preventDefault();
    if (!password) {
      return toast.error('Password is required to disable 2FA');
    }

    setLoading(true);
    try {
      await disable2FA(password);
      setStatus({ enabled: false, backupCodesRemaining: 0 });
      setStep('VIEW');
      setPassword('');
      toast.success('Two-factor authentication disabled');
    } catch (err) {
      toast.error(err.message || 'Failed to disable 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateCodes = async (e) => {
    e.preventDefault();
    if (!password) {
      return toast.error('Password is required to regenerate backup codes');
    }

    setLoading(true);
    try {
      const data = await regenerateBackupCodes(password);
      setBackupCodes(data.backupCodes || []);
      setStatus((prev) => ({ ...prev, backupCodesRemaining: data.backupCodes?.length || 8 }));
      setStep('SHOW_BACKUP_CODES');
      setPassword('');
      toast.success('New backup codes generated!');
    } catch (err) {
      toast.error(err.message || 'Failed to regenerate backup codes');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, message = 'Copied to clipboard!') => {
    navigator.clipboard.writeText(text);
    toast.info(message);
  };

  const downloadBackupCodes = () => {
    const fileContent = `TALKYY EMERGENCY BACKUP CODES\nGenerated: ${new Date().toISOString()}\nAccount: ${user?.email || ''}\n\n` +
      backupCodes.map((code, i) => `${i + 1}. ${code}`).join('\n') +
      `\n\nKEEP THESE CODES SECURE. Each code can only be used once if you lose access to your Authenticator app.`;
    
    const element = document.createElement('a');
    const file = new Blob([fileContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `talkyy-backup-codes-${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Backup codes file downloaded!');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--c-overlay,#00000070)] backdrop-blur-md px-4 py-6 animate-fadeIn">
      <div className="bg-[var(--c-panel,#FFFFFF)] border border-[var(--c-line,#E2E8F0)] text-[var(--c-text,#0F172A)] w-full max-w-md rounded-3xl p-6 relative shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto subtle-scrollbar">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl bg-[var(--c-surface-80,#F1F5F9)] text-[var(--c-text-2,#64748B)] hover:text-[var(--c-text,#0F172A)] transition"
          title="Close"
        >
          <FiX className="text-lg" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-[var(--c-line,#E2E8F0)] pb-4 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-[#2858E8]/10 text-[#2858E8] flex items-center justify-center shrink-0">
            <FiShield className="text-xl" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--c-text,#0F172A)] leading-tight">
              Two-Factor Authentication (2FA)
            </h3>
            <p className="text-xs text-[var(--c-text-2,#64748B)]">
              Authenticator App (TOTP) Security
            </p>
          </div>
        </div>

        {/* ================= STEP: VIEW (STATUS SCREEN) ================= */}
        {step === 'VIEW' && (
          <div className="space-y-4">
            {/* Status Card */}
            <div className={`p-4 rounded-2xl border flex items-center justify-between ${
              status.enabled
                ? 'bg-[#F0FDF4] border-[#86EFAC] text-[#166534]'
                : 'bg-[#F8FAFC] border-[#E2E8F0] text-[var(--c-text,#0F172A)]'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  status.enabled ? 'bg-[#22C55E]/20 text-[#16A34A]' : 'bg-[#E2E8F0] text-[#64748B]'
                }`}>
                  <FiShield className="text-lg" />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider">
                    {status.enabled ? 'Status: Active' : 'Status: Disabled'}
                  </div>
                  <div className="text-xs opacity-80">
                    {status.enabled
                      ? `${status.backupCodesRemaining} backup code${status.backupCodesRemaining === 1 ? '' : 's'} remaining`
                      : 'Protects account with Google Authenticator'}
                  </div>
                </div>
              </div>
              <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                status.enabled ? 'bg-[#22C55E] text-white' : 'bg-[#E2E8F0] text-[#475569]'
              }`}>
                {status.enabled ? 'Protected' : 'Off'}
              </span>
            </div>

            {/* Explanatory text */}
            <p className="text-xs text-[var(--c-text-2,#64748B)] leading-relaxed">
              Two-Factor Authentication adds an extra layer of protection by requiring a 6-digit verification code from <strong>Google Authenticator</strong>, <strong>Microsoft Authenticator</strong>, or <strong>Authy</strong> in addition to your password during sign-in.
            </p>

            {/* Action Buttons */}
            {status.enabled ? (
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('REGEN_CODES')}
                  className="w-full py-2.5 px-4 rounded-xl border border-[var(--c-line,#E2E8F0)] hover:bg-[var(--c-surface-80,#F1F5F9)] text-xs font-semibold text-[var(--c-text,#0F172A)] flex items-center justify-center gap-2 transition"
                >
                  <FiKey className="text-sm text-[#2858E8]" />
                  <span>Regenerate Emergency Backup Codes</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep('DISABLE')}
                  className="w-full py-2.5 px-4 rounded-xl border border-[#FCA5A5] text-[#DC2626] hover:bg-[#FEF2F2] text-xs font-semibold flex items-center justify-center gap-2 transition"
                >
                  <FiAlertTriangle className="text-sm" />
                  <span>Disable Two-Factor Authentication</span>
                </button>
              </div>
            ) : (
              <div className="pt-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleStartSetup}
                  className="w-full py-3 px-4 rounded-xl bg-[#2858E8] hover:bg-[#173BB5] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-md cursor-pointer"
                >
                  {loading ? (
                    <span className="loading loading-spinner loading-xs" />
                  ) : (
                    <>
                      <FiShield className="text-base" />
                      <span>Set Up Authenticator App</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ================= STEP: SETUP (SCAN QR + CONFIRM) ================= */}
        {step === 'SETUP' && setupData && (
          <form onSubmit={handleConfirmSetup} className="space-y-4">
            <div className="text-xs text-[var(--c-text-2,#64748B)]">
              <span className="font-bold text-[var(--c-text,#0F172A)]">Step 1:</span> Scan this QR code in Google Authenticator or Authy.
            </div>

            {/* QR Code Canvas Display */}
            <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-[var(--c-line,#E2E8F0)] shadow-inner">
              <img
                src={setupData.qrCode}
                alt="2FA QR Code"
                className="w-48 h-48 object-contain rounded-lg"
              />
              <span className="text-[11px] text-[#64748B] mt-2 font-medium">
                Issuer: Talkyy ({setupData.account})
              </span>
            </div>

            {/* Manual Entry Key */}
            <div className="p-3 bg-[var(--c-canvas-80,#F8FAFC)] border border-[var(--c-line,#E2E8F0)] rounded-xl space-y-1">
              <div className="flex items-center justify-between text-[11px] text-[var(--c-text-2,#64748B)]">
                <span>Can't scan the code? Enter key manually:</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(setupData.manualKey, 'Secret key copied!')}
                  className="text-[#2858E8] hover:underline font-semibold flex items-center gap-1"
                >
                  <FiCopy className="text-xs" /> Copy
                </button>
              </div>
              <div className="font-mono text-xs font-bold text-[var(--c-text,#0F172A)] break-all select-all tracking-wider">
                {setupData.manualKey}
              </div>
            </div>

            {/* Step 2: Live Code Confirmation */}
            <div className="space-y-1.5 pt-1">
              <label className="block text-xs font-bold text-[var(--c-text,#0F172A)]">
                Step 2: Enter the 6-digit code to verify
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={confirmCode}
                onChange={(e) => setConfirmCode(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="••••••"
                className="w-full text-center text-xl font-mono font-bold tracking-[0.4em] py-2.5 bg-[var(--c-canvas-80,#F8FAFC)] border border-[var(--c-line,#E2E8F0)] rounded-xl text-[var(--c-text,#0F172A)] focus:outline-none focus:border-[#2858E8] focus:ring-2 focus:ring-[#2858E8]/15 transition"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep('VIEW')}
                className="flex-1 py-2.5 rounded-xl border border-[var(--c-line,#E2E8F0)] text-xs font-semibold text-[var(--c-text-2,#64748B)] hover:text-[var(--c-text,#0F172A)] transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || confirmCode.length !== 6}
                className="flex-1 py-2.5 rounded-xl bg-[#2858E8] hover:bg-[#173BB5] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition disabled:opacity-50 shadow-md"
              >
                {loading ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  <>
                    <FiCheck className="text-sm" />
                    <span>Verify & Enable</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ================= STEP: SHOW BACKUP CODES ================= */}
        {step === 'SHOW_BACKUP_CODES' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E] flex items-start gap-2.5">
              <FiAlertTriangle className="text-lg shrink-0 mt-0.5 text-[#D97706]" />
              <div className="text-xs leading-relaxed">
                <span className="font-bold block">Save these backup codes right now!</span>
                If you lose your phone or authenticator app, these codes are the <strong>ONLY</strong> way to sign in to your Talkyy account. Each code can only be used once.
              </div>
            </div>

            {/* Codes Grid */}
            <div className="grid grid-cols-2 gap-2 p-3.5 bg-[var(--c-canvas-80,#F8FAFC)] border border-[var(--c-line,#E2E8F0)] rounded-2xl font-mono text-xs font-bold text-[var(--c-text,#0F172A)] text-center">
              {backupCodes.map((code, idx) => (
                <div key={idx} className="p-2 bg-white rounded-lg border border-[var(--c-line-50,#E2E8F0)] select-all tracking-wider shadow-2xs">
                  {code}
                </div>
              ))}
            </div>

            {/* Copy / Download Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => copyToClipboard(backupCodes.join('\n'), 'All backup codes copied!')}
                className="py-2 px-3 rounded-xl border border-[var(--c-line,#E2E8F0)] hover:bg-[var(--c-surface-80,#F1F5F9)] text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <FiCopy className="text-sm" />
                <span>Copy Codes</span>
              </button>
              <button
                type="button"
                onClick={downloadBackupCodes}
                className="py-2 px-3 rounded-xl border border-[var(--c-line,#E2E8F0)] hover:bg-[var(--c-surface-80,#F1F5F9)] text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <FiDownload className="text-sm" />
                <span>Download .txt</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setStep('VIEW');
                onClose();
              }}
              className="w-full mt-2 py-3 rounded-xl bg-[#2858E8] hover:bg-[#173BB5] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-md"
            >
              <FiCheck className="text-base" />
              <span>I Have Saved My Codes</span>
            </button>
          </div>
        )}

        {/* ================= STEP: DISABLE 2FA ================= */}
        {step === 'DISABLE' && (
          <form onSubmit={handleDisable2FA} className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] flex items-start gap-2.5">
              <FiAlertTriangle className="text-lg shrink-0 mt-0.5 text-[#DC2626]" />
              <div className="text-xs leading-relaxed">
                <span className="font-bold block">Disable Two-Factor Protection?</span>
                Your account will only be protected by your password. Enter your current password to proceed.
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[var(--c-text-2,#64748B)]">
                Confirm Current Password
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-[var(--c-text-3,#94A3B8)]">
                  <FiLock className="text-sm" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-[var(--c-canvas-80,#F8FAFC)] border border-[var(--c-line,#E2E8F0)] rounded-xl text-xs text-[var(--c-text,#0F172A)] focus:outline-none focus:border-[#DC2626] transition"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep('VIEW')}
                className="flex-1 py-2.5 rounded-xl border border-[var(--c-line,#E2E8F0)] text-xs font-semibold text-[var(--c-text-2,#64748B)] hover:text-[var(--c-text,#0F172A)] transition"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading || !password}
                className="flex-1 py-2.5 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition disabled:opacity-50 shadow-md"
              >
                {loading ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  <span>Disable 2FA</span>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ================= STEP: REGENERATE BACKUP CODES ================= */}
        {step === 'REGEN_CODES' && (
          <form onSubmit={handleRegenerateCodes} className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] text-[#1E40AF] flex items-start gap-2.5">
              <FiKey className="text-lg shrink-0 mt-0.5 text-[#2858E8]" />
              <div className="text-xs leading-relaxed">
                <span className="font-bold block">Regenerate Emergency Backup Codes</span>
                Generating new backup codes will immediately invalidate all existing ones. Enter your password to continue.
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[var(--c-text-2,#64748B)]">
                Confirm Current Password
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-[var(--c-text-3,#94A3B8)]">
                  <FiLock className="text-sm" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-[var(--c-canvas-80,#F8FAFC)] border border-[var(--c-line,#E2E8F0)] rounded-xl text-xs text-[var(--c-text,#0F172A)] focus:outline-none focus:border-[#2858E8] transition"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep('VIEW')}
                className="flex-1 py-2.5 rounded-xl border border-[var(--c-line,#E2E8F0)] text-xs font-semibold text-[var(--c-text-2,#64748B)] hover:text-[var(--c-text,#0F172A)] transition"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading || !password}
                className="flex-1 py-2.5 rounded-xl bg-[#2858E8] hover:bg-[#173BB5] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition disabled:opacity-50 shadow-md"
              >
                {loading ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  <span>Regenerate Codes</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default TwoFactorModal;
