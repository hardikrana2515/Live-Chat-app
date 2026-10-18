import { useState, useContext, useRef } from 'react';
import { IoCloseSharp } from "react-icons/io5";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiShield,
  FiCamera,
  FiLock,
  FiEye,
  FiEyeOff,
  FiSettings,
  FiCheck,
  FiLogOut
} from "react-icons/fi";
import userContext from '../contexts/UserContext/userContext';
import { toast } from 'react-toastify';
import {
  getPreference,
  setPreference,
  requestDesktopNotificationPermission,
  playNotificationSound,
  showDesktopNotification
} from '../utils/SoundUtils';

const Account = () => {
  const { setCard, user, GetUser, UploadImg, updatePassword, logout } = useContext(userContext);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'settings'

  // Workspace preferences states
  const [desktopNotifications, setDesktopNotifications] = useState(() => getPreference("desktopNotifications", true));
  const [chatSounds, setChatSounds] = useState(() => getPreference("chatSounds", true));

  // Photo upload states
  const [img, setImg] = useState(null);
  const [imgPreview, setImgPreview] = useState(null);
  const [uploadingImg, setUploadingImg] = useState(false);
  const fileInputRef = useRef(null);

  // Password update form
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [updatingPass, setUpdatingPass] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImg(file);
      setImgPreview(URL.createObjectURL(file));
    }
  };

  const handleCancelImage = () => {
    setImg(null);
    setImgPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUploadImage = async (e) => {
    e.preventDefault();
    if (!img) {
      toast.warning("No image selected!");
      return;
    }
    const formData = new FormData();
    formData.append('avtar', img);

    setUploadingImg(true);
    try {
      await UploadImg(formData);
      await GetUser();
      toast.success("Profile picture updated!");
      handleCancelImage();
    } catch (e) {
      toast.error(e.message || "Failed to update profile picture");
    } finally {
      setUploadingImg(false);
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return toast.error("New and Confirm passwords do not match!");
    }
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    if (!passwordRegex.test(passwordForm.newPassword)) {
      return toast.error("Password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, and one number!");
    }

    setUpdatingPass(true);
    try {
      await updatePassword(passwordForm.oldPassword, passwordForm.newPassword);
      toast.success("Password updated successfully!");
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.message || "Failed to update password");
    } finally {
      setUpdatingPass(false);
    }
  };

  const handleLogout = async () => {
    setCard(false);
    await logout();
  };

  const avatarSrc = imgPreview || (
    user?.avtar?.startsWith('data:image')
      ? user.avtar
      : user?.avtar
      ? `http://localhost:4000${user.avtar}`
      : '/avtar.png'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md px-4 py-6 transition-all duration-300">
      <div className="bg-slate-900 border border-slate-800 text-white w-full max-w-lg rounded-3xl p-6 relative shadow-2xl shadow-slate-950/90 animate-fadeIn flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition"
          onClick={() => setCard(false)}
          title="Close"
        >
          <IoCloseSharp className="text-lg" />
        </button>

        {/* Header & Tabs */}
        <div className="border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="p-2 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400">
              <FiUser className="text-lg" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight leading-tight">
                Account & Preferences
              </h2>
              <span className="text-xs text-slate-400">
                Manage your profile identity, security, and workspace settings
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex bg-slate-950/60 p-1 rounded-xl border border-slate-800/80">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                activeTab === 'profile'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FiUser className="text-sm" />
              Owner Profile
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                activeTab === 'settings'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FiSettings className="text-sm" />
              Security & Settings
            </button>
          </div>
        </div>

        {/* Tab Contents (Scrollable body) */}
        <div className="flex-1 overflow-y-auto subtle-scrollbar pr-1 space-y-4">
          
          {/* ================= PROFILE TAB ================= */}
          {activeTab === 'profile' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Profile Card Header with Avatar */}
              <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-950/40 border border-slate-800/60 relative">
                <div className="relative group">
                  <img
                    src={avatarSrc}
                    alt={user?.userName || "User"}
                    className="w-24 h-24 rounded-full object-cover border-2 border-indigo-500/40 shadow-xl shadow-indigo-950/50"
                  />
                  <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full shadow" />
                  
                  {/* Camera overlay button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-slate-950/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs font-medium text-slate-200 gap-1 backdrop-blur-xs"
                    title="Change Avatar"
                  >
                    <FiCamera className="text-xl text-indigo-400" />
                    <span>Change</span>
                  </button>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {/* Name & Handle */}
                <div className="text-center mt-3">
                  <div className="flex items-center justify-center gap-2">
                    <h3 className="text-base font-bold text-white">{user?.name}</h3>
                    <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                      Owner
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">@{user?.userName}</p>
                </div>

                {/* Upload Action Strip when image picked */}
                {imgPreview && (
                  <div className="mt-3 flex items-center gap-2 w-full max-w-xs justify-center animate-fadeIn">
                    <button
                      onClick={handleUploadImage}
                      disabled={uploadingImg}
                      className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/30"
                    >
                      {uploadingImg ? (
                        <span className="loading loading-spinner loading-xs" />
                      ) : (
                        <>
                          <FiCheck className="text-sm" /> Save Photo
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleCancelImage}
                      disabled={uploadingImg}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {/* Owner Details Grid */}
              <div className="space-y-2.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-1">
                  Owner Information
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Full Name */}
                  <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-800 text-slate-400 shrink-0">
                      <FiUser className="text-sm" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Full Name</span>
                      <span className="text-xs font-semibold text-slate-200 truncate">{user?.name}</span>
                    </div>
                  </div>

                  {/* Username */}
                  <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-800 text-slate-400 shrink-0">
                      <span className="text-xs font-bold">@</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Username</span>
                      <span className="text-xs font-semibold text-slate-200 truncate">@{user?.userName}</span>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-800 text-slate-400 shrink-0">
                      <FiMail className="text-sm" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Email</span>
                      <span className="text-xs font-semibold text-slate-200 truncate">{user?.email}</span>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-800 text-slate-400 shrink-0">
                      <FiPhone className="text-sm" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Phone Number</span>
                      <span className="text-xs font-semibold text-slate-200 truncate">{user?.phonenumber || 'Not specified'}</span>
                    </div>
                  </div>
                </div>

                {/* Account Type Card */}
                <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/20 flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2.5">
                    <FiShield className="text-indigo-400 text-base shrink-0" />
                    <div>
                      <h4 className="text-xs font-semibold text-white">Owner Account Protection</h4>
                      <p className="text-[11px] text-slate-400">Client-side storage encryption active</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                    Active
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ================= SETTINGS TAB ================= */}
          {activeTab === 'settings' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Security & Password Form */}
              <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/80 space-y-3.5">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                  <FiLock className="text-indigo-400 text-sm" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Change Security Password
                  </h3>
                </div>

                <form onSubmit={handlePasswordSubmit} className="space-y-3">
                  {/* Old Password */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Current Password
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type={showOldPass ? "text" : "password"}
                        name="oldPassword"
                        value={passwordForm.oldPassword}
                        onChange={handlePasswordChange}
                        required
                        placeholder="••••••••"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/30 transition pr-9"
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

                  {/* New Password */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      New Password
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type={showNewPass ? "text" : "password"}
                        name="newPassword"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordChange}
                        required
                        minLength={8}
                        pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                        title="Must contain at least one number, one lowercase, one uppercase, and be at least 8 characters"
                        placeholder="••••••••"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/30 transition pr-9"
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

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Confirm New Password
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type={showConfirmPass ? "text" : "password"}
                        name="confirmPassword"
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordChange}
                        required
                        placeholder="••••••••"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/30 transition pr-9"
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
                    disabled={updatingPass}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-600/30 transition duration-150 flex items-center justify-center gap-1.5"
                  >
                    {updatingPass ? (
                      <span className="loading loading-spinner loading-xs" />
                    ) : (
                      <>
                        <FiCheck className="text-sm" /> Update Password
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Workspace Preferences Section */}
              <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/80 space-y-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                  Workspace Preferences
                </span>

                <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                  <div>
                    <h5 className="text-xs font-medium text-slate-200">Desktop Notifications</h5>
                    <p className="text-[11px] text-slate-500">Alert for incoming direct messages</p>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!desktopNotifications) {
                        const permission = await requestDesktopNotificationPermission();
                        if (permission === "granted") {
                          setDesktopNotifications(true);
                          setPreference("desktopNotifications", true);
                          toast.success("Desktop notifications enabled!");
                          showDesktopNotification("Notifications Active", { body: "You will receive desktop alerts for incoming messages." });
                        } else if (permission === "denied") {
                          toast.warn("Notifications blocked in browser. Please enable notifications in your browser address bar.");
                          setDesktopNotifications(false);
                          setPreference("desktopNotifications", false);
                        } else {
                          toast.info("Notifications not supported in this browser.");
                        }
                      } else {
                        setDesktopNotifications(false);
                        setPreference("desktopNotifications", false);
                        toast.info("Desktop notifications disabled.");
                      }
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                      desktopNotifications ? 'bg-indigo-600' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        desktopNotifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between py-1">
                  <div>
                    <h5 className="text-xs font-medium text-slate-200">Chat Sounds</h5>
                    <p className="text-[11px] text-slate-500">Play tone on message send & receive</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const nextVal = !chatSounds;
                      setChatSounds(nextVal);
                      setPreference("chatSounds", nextVal);
                      if (nextVal) {
                        toast.success("Chat sounds enabled!");
                        playNotificationSound();
                      } else {
                        toast.info("Chat sounds muted.");
                      }
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                      chatSounds ? 'bg-indigo-600' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        chatSounds ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Account Signout */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full py-2.5 px-4 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <FiLogOut className="text-sm" />
                  Sign Out from Workspace
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Account;