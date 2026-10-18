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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md px-4 py-6 transition-all duration-300">
      <div className="bg-slate-900 border border-slate-800 text-white w-full max-w-md rounded-3xl p-6 relative shadow-2xl shadow-slate-950/90 animate-fadeIn">
        {/* Title & Close */}
        <button
          className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition"
          onClick={() => setpass(false)}
          title="Close"
        >
          <IoCloseSharp className="text-lg" />
        </button>

        <div className="flex items-center gap-2.5 mb-5 border-b border-slate-800 pb-3">
          <div className="p-2 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400">
            <FiLock className="text-lg" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight leading-tight">
              Security & Password
            </h2>
            <span className="text-xs text-slate-400">
              Update your workspace account credentials
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
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
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/30 transition pr-9"
              />
              <button
                type="button"
                onClick={() => setShowOldPass(!showOldPass)}
                className="absolute right-2.5 text-slate-500 hover:text-slate-300 transition"
              >
                {showOldPass ? <FiEyeOff className="text-sm" /> : <FiEye className="text-sm" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
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
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/30 transition pr-9"
              />
              <button
                type="button"
                onClick={() => setShowNewPass(!showNewPass)}
                className="absolute right-2.5 text-slate-500 hover:text-slate-300 transition"
              >
                {showNewPass ? <FiEyeOff className="text-sm" /> : <FiEye className="text-sm" />}
              </button>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">
              Min 8 chars, 1 uppercase, 1 lowercase, 1 number
            </span>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
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
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/30 transition pr-9"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPass(!showConfirmPass)}
                className="absolute right-2.5 text-slate-500 hover:text-slate-300 transition"
              >
                {showConfirmPass ? <FiEyeOff className="text-sm" /> : <FiEye className="text-sm" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-600/30 transition duration-150 flex items-center justify-center gap-1.5 mt-2"
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
