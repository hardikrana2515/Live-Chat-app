import { useState, useContext } from 'react';
import userContext from '../contexts/UserContext/userContext';
import { toast } from 'react-toastify';
import { IoCloseSharp } from "react-icons/io5";
import { FiLock, FiEye, FiEyeOff, FiCheck } from "react-icons/fi";

const UpdatePassword = () => {
  const { updatePassword, setpass } = useContext(userContext);
  const [form, setForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      return toast.error('New and Confirm Password do not match');
    }
    if (form.newPassword.length < 8) {
      return toast.error('Password must be at least 8 characters');
    }

    setLoading(true);
    try {
      await updatePassword(form.oldPassword, form.newPassword);
      toast.success('Password updated successfully');
      setForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setpass(false), 500);
    } catch (err) {
      toast.error(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--c-overlay)] backdrop-blur-md px-4 py-6 transition-all duration-300">
      <div className="bg-[var(--c-panel)] border border-[var(--c-line)] text-[var(--c-text)] w-full max-w-md rounded-3xl p-6 relative shadow-2xl  animate-fadeIn">
        {/* Title & Close */}
        <button
          className="absolute top-4 right-4 p-1.5 rounded-xl bg-[var(--c-surface-80)] text-[var(--c-text-2)] hover:text-[var(--c-text)] hover:bg-[var(--c-raised)] transition"
          onClick={() => setpass(false)}
          title="Close"
        >
          <IoCloseSharp className="text-lg" />
        </button>

        <div className="flex items-center gap-2.5 mb-5 border-b border-[var(--c-line)] pb-3">
          <div className="p-2 rounded-xl bg-[var(--c-primary)]/10 border border-[var(--c-line)] text-[var(--c-link)]">
            <FiLock className="text-lg" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[var(--c-text)] tracking-tight leading-tight">
              Security & Password
            </h2>
            <span className="text-xs text-[var(--c-text-2)]">
              Update your workspace account credentials
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-semibold text-[var(--c-text-2)] uppercase tracking-wider mb-1">
              Current Password
            </label>
            <div className="relative flex items-center">
              <input
                type={showOldPass ? "text" : "password"}
                name="oldPassword"
                value={form.oldPassword}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="w-full bg-[var(--c-canvas-70)] border border-[var(--c-line)] rounded-xl px-3 py-2 text-xs text-[var(--c-text)] focus:outline-none focus:border-[var(--c-primary)] focus:ring-1 focus:ring-[var(--c-primary)] transition pr-9"
              />
              <button
                type="button"
                onClick={() => setShowOldPass(!showOldPass)}
                className="absolute right-2.5 text-[var(--c-text-3)] hover:text-[var(--c-text-2)] transition"
              >
                {showOldPass ? <FiEyeOff className="text-sm" /> : <FiEye className="text-sm" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[var(--c-text-2)] uppercase tracking-wider mb-1">
              New Password
            </label>
            <div className="relative flex items-center">
              <input
                type={showNewPass ? "text" : "password"}
                name="newPassword"
                value={form.newPassword}
                onChange={handleChange}
                required
                minLength="8"
                pattern="(?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                title="Must contain at least one number, one lowercase, one uppercase, and be at least 8 characters"
                placeholder="••••••••"
                className="w-full bg-[var(--c-canvas-70)] border border-[var(--c-line)] rounded-xl px-3 py-2 text-xs text-[var(--c-text)] focus:outline-none focus:border-[var(--c-primary)] focus:ring-1 focus:ring-[var(--c-primary)] transition pr-9"
              />
              <button
                type="button"
                onClick={() => setShowNewPass(!showNewPass)}
                className="absolute right-2.5 text-[var(--c-text-3)] hover:text-[var(--c-text-2)] transition"
              >
                {showNewPass ? <FiEyeOff className="text-sm" /> : <FiEye className="text-sm" />}
              </button>
            </div>
            <span className="text-[11px] text-[var(--c-text-3)] mt-1 block">
              Min 8 chars, 1 uppercase, 1 lowercase, 1 number
            </span>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[var(--c-text-2)] uppercase tracking-wider mb-1">
              Confirm New Password
            </label>
            <div className="relative flex items-center">
              <input
                type={showConfirmPass ? "text" : "password"}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="w-full bg-[var(--c-canvas-70)] border border-[var(--c-line)] rounded-xl px-3 py-2 text-xs text-[var(--c-text)] focus:outline-none focus:border-[var(--c-primary)] focus:ring-1 focus:ring-[var(--c-primary)] transition pr-9"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPass(!showConfirmPass)}
                className="absolute right-2.5 text-[var(--c-text-3)] hover:text-[var(--c-text-2)] transition"
              >
                {showConfirmPass ? <FiEyeOff className="text-sm" /> : <FiEye className="text-sm" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[var(--c-primary)] hover:bg-[var(--c-primary-hover)] text-[var(--c-text)] font-semibold text-xs rounded-xl shadow-md  transition duration-150 flex items-center justify-center gap-1.5 mt-2"
          >
            {loading ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              <>
                <FiCheck className="text-sm" /> Update Password
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdatePassword;
