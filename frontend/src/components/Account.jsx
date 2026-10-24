import { useState, useContext, useRef, useEffect } from 'react';
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
  FiLogOut,
  FiEdit2,
  FiCalendar,
  FiInfo,
  FiSmile
} from "react-icons/fi";
import userContext from '../contexts/UserContext/userContext';
import { getApiBaseUrl, getSafeMediaUrl } from '../contexts/Api.js';
import { toast } from 'react-toastify';
import TwoFactorModal from './TwoFactorModal.jsx';
import {
  getPreference,
  setPreference,
  requestDesktopNotificationPermission,
  playNotificationSound,
  showDesktopNotification
} from '../utils/SoundUtils';

const Account = () => {
  const { setCard, user, GetUser, UploadImg, updatePassword, updateProfile, setLogoutModal, setShowSetupModal, setShowRecoveryModal, vaultData, identityState } = useContext(userContext);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'settings'
  const [show2FAModal, setShow2FAModal] = useState(false);

  // Profile editing states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phonenumber: user?.phonenumber || '',
    gender: user?.gender || 'male',
    bio: user?.bio || ''
  });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user?.name || '',
        email: user?.email || '',
        phonenumber: user?.phonenumber || '',
        gender: user?.gender || 'male',
        bio: user?.bio || ''
      });
    }
  }, [user]);

  const handleStartEdit = () => {
    setProfileForm({
      name: user?.name || '',
      email: user?.email || '',
      phonenumber: user?.phonenumber || '',
      gender: user?.gender || 'male',
      bio: user?.bio || ''
    });
    setIsEditingProfile(true);
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    setProfileForm({
      name: user?.name || '',
      email: user?.email || '',
      phonenumber: user?.phonenumber || '',
      gender: user?.gender || 'male',
      bio: user?.bio || ''
    });
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) {
      return toast.error("Full Name cannot be empty!");
    }
    if (!profileForm.email.trim()) {
      return toast.error("Email Address cannot be empty!");
    }
    if (!profileForm.phonenumber.trim()) {
      return toast.error("Phone number cannot be empty!");
    }

    setSavingProfile(true);
    try {
      await updateProfile({
        name: profileForm.name.trim(),
        email: profileForm.email.trim(),
        phonenumber: profileForm.phonenumber.trim(),
        gender: profileForm.gender,
        bio: profileForm.bio.trim()
      });
      await GetUser();
      toast.success("Profile updated successfully!");
      setIsEditingProfile(false);
    } catch (err) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

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

  const handleLogout = () => {
    setCard(false);
    setLogoutModal(true);
  };

  const avatarSrc = imgPreview || getSafeMediaUrl(user?.avtar, '/avtar.png');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--c-overlay)] backdrop-blur-md px-4 py-6 transition-all duration-300">
      <div className="bg-[var(--c-panel)] border border-[var(--c-line)] text-[var(--c-text)] w-full max-w-lg rounded-3xl p-6 relative shadow-2xl  animate-fadeIn flex flex-col max-h-[90vh] overflow-hidden">

        {/* Close Button */}
        <button
          className="absolute top-4 right-4 p-1.5 rounded-xl bg-[var(--c-surface-80)] text-[var(--c-text-2)] hover:text-[var(--c-text)] hover:bg-[var(--c-raised)] transition"
          onClick={() => setCard(false)}
          title="Close"
        >
          <IoCloseSharp className="text-lg" />
        </button>

        {/* Header & Tabs */}
        <div className="border-b border-[var(--c-line)] pb-4 mb-4">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="p-2 rounded-xl bg-[var(--c-primary)]/10 border border-[var(--c-line)] text-[var(--c-link)]">
              <FiUser className="text-lg" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--c-text)] tracking-tight leading-tight">
                Account & Preferences
              </h2>
              <span className="text-xs text-[var(--c-text-2)]">
                Manage your profile identity, security, and workspace settings
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex bg-[var(--c-canvas)]/60 p-1 rounded-xl border border-[var(--c-line-50)]">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'profile'
                  ? 'bg-[var(--c-primary)] text-[var(--c-text)] shadow-sm'
                  : 'text-[var(--c-text-2)] hover:text-[var(--c-text)]'
                }`}
            >
              <FiUser className="text-sm" />
              Owner Profile
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'settings'
                  ? 'bg-[var(--c-primary)] text-[var(--c-text)] shadow-sm'
                  : 'text-[var(--c-text-2)] hover:text-[var(--c-text)]'
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
            <div className="space-y-4 animate-fadeIn">
              {/* Profile Card Header with Avatar */}
              <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[var(--c-canvas-80)] border border-[var(--c-line)]/60 relative">
                <div className="relative group">
                  <img
                    src={avatarSrc}
                    alt={user?.userName || "User"}
                    className="w-24 h-24 rounded-full object-cover border-2 border-[var(--c-primary-50)] shadow-xl "
                  />
                  <span className="absolute bottom-1 right-1 w-4 h-4 bg-[var(--c-online)] border-2 border-[var(--c-panel)] rounded-full shadow" />

                  {/* Camera overlay button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-[var(--c-canvas)]/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs font-medium text-[var(--c-text)] gap-1 "
                    title="Change Avatar"
                  >
                    <FiCamera className="text-xl text-[var(--c-link)]" />
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

                {/* Name, Badge & Handle */}
                <div className="text-center mt-3">
                  <div className="flex items-center justify-center gap-2">
                    <h3 className="text-base font-bold text-[var(--c-text)]">{user?.name}</h3>
                    <span className="text-[11px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-[var(--c-primary-soft)] border border-[var(--c-line)] text-[var(--c-link)]">
                      Owner
                    </span>
                  </div>
                  <p className="text-xs text-[var(--c-text-2)] mt-0.5">@{user?.userName}</p>
                  {user?.bio && (
                    <p className="text-xs text-[var(--c-text-3)] italic mt-1.5 max-w-sm px-2 line-clamp-2">
                      &ldquo;{user.bio}&rdquo;
                    </p>
                  )}
                </div>

                {/* Upload Action Strip when image picked */}
                {imgPreview && (
                  <div className="mt-3 flex items-center gap-2 w-full max-w-xs justify-center animate-fadeIn">
                    <button
                      onClick={handleUploadImage}
                      disabled={uploadingImg}
                      className="px-3.5 py-1.5 rounded-lg bg-[var(--c-primary)] hover:bg-[var(--c-primary-hover)] text-[var(--c-text)] text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md "
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
                      className="px-3 py-1.5 rounded-lg bg-[var(--c-surface)] hover:bg-[var(--c-raised)] text-[var(--c-text-2)] text-xs font-medium transition"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {/* Owner Details Section */}
              <div className="space-y-3">
                {/* Section Header with Edit Profile Action */}
                <div className="flex items-center justify-between px-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--c-text-2)]">
                    Owner Information
                  </span>
                  {!isEditingProfile && (
                    <button
                      type="button"
                      onClick={handleStartEdit}
                      className="px-3 py-1 rounded-lg bg-[var(--c-primary-soft)] hover:bg-[var(--c-primary)] hover:text-[var(--c-text)] text-[var(--c-link)] border border-[var(--c-line)] text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                      title="Edit Profile Information"
                    >
                      <FiEdit2 className="text-xs" />
                      <span>Edit Profile</span>
                    </button>
                  )}
                </div>

                {/* EDIT MODE: Interactive Profile Update Form */}
                {isEditingProfile ? (
                  <form onSubmit={handleProfileSubmit} className="p-4 rounded-2xl bg-[var(--c-canvas-80)] border border-[var(--c-primary-50)] shadow-lg space-y-3.5 animate-fadeIn">
                    <div className="flex items-center justify-between pb-2 border-b border-[var(--c-line)]">
                      <span className="text-xs font-bold uppercase tracking-wider text-[var(--c-link)] flex items-center gap-1.5">
                        <FiEdit2 className="text-sm" /> Edit Profile Details
                      </span>
                      <span className="text-[10px] text-[var(--c-text-3)] flex items-center gap-1">
                        <FiLock className="text-[10px]" /> Username is locked
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Full Name */}
                      <div>
                        <label className="block text-[11px] font-semibold text-[var(--c-text-2)] uppercase tracking-wider mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={profileForm.name}
                          onChange={handleProfileChange}
                          required
                          maxLength={100}
                          placeholder="Your full name"
                          className="w-full bg-[var(--c-panel)] border border-[var(--c-line)] rounded-xl px-3 py-2 text-xs text-[var(--c-text)] focus:outline-none focus:border-[var(--c-primary)] focus:ring-1 focus:ring-[var(--c-primary)] transition"
                        />
                      </div>

                      {/* Username (Disabled / Immutable per requirements) */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[11px] font-semibold text-[var(--c-text-3)] uppercase tracking-wider">
                            Username
                          </label>
                          <span className="text-[10px] text-[var(--c-text-3)]">Cannot change</span>
                        </div>
                        <input
                          type="text"
                          disabled
                          value={`@${user?.userName || ''}`}
                          title="Username is permanent and cannot be changed"
                          className="w-full bg-[var(--c-surface)]/50 border border-[var(--c-line-50)] rounded-xl px-3 py-2 text-xs text-[var(--c-text-3)] cursor-not-allowed select-none font-medium opacity-80"
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-[11px] font-semibold text-[var(--c-text-2)] uppercase tracking-wider mb-1">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={profileForm.email}
                          onChange={handleProfileChange}
                          required
                          placeholder="email@example.com"
                          className="w-full bg-[var(--c-panel)] border border-[var(--c-line)] rounded-xl px-3 py-2 text-xs text-[var(--c-text)] focus:outline-none focus:border-[var(--c-primary)] focus:ring-1 focus:ring-[var(--c-primary)] transition"
                        />
                      </div>

                      {/* Phone Number */}
                      <div>
                        <label className="block text-[11px] font-semibold text-[var(--c-text-2)] uppercase tracking-wider mb-1">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          name="phonenumber"
                          value={profileForm.phonenumber}
                          onChange={handleProfileChange}
                          required
                          placeholder="+1234567890"
                          className="w-full bg-[var(--c-panel)] border border-[var(--c-line)] rounded-xl px-3 py-2 text-xs text-[var(--c-text)] focus:outline-none focus:border-[var(--c-primary)] focus:ring-1 focus:ring-[var(--c-primary)] transition"
                        />
                      </div>

                      {/* Gender Selector */}
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-[var(--c-text-2)] uppercase tracking-wider mb-1">
                          Gender
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {['male', 'female', 'other'].map((g) => (
                            <button
                              key={g}
                              type="button"
                              onClick={() => setProfileForm((prev) => ({ ...prev, gender: g }))}
                              className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all capitalize flex items-center justify-center gap-1.5 ${
                                profileForm.gender === g
                                  ? 'bg-[var(--c-primary)] border-[var(--c-primary)] text-[var(--c-text)] shadow-sm'
                                  : 'bg-[var(--c-panel)] border-[var(--c-line)] text-[var(--c-text-2)] hover:text-[var(--c-text)] hover:bg-[var(--c-raised)]'
                              }`}
                            >
                              {profileForm.gender === g && <FiCheck className="text-xs" />}
                              {g}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Bio / About */}
                      <div className="sm:col-span-2">
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[11px] font-semibold text-[var(--c-text-2)] uppercase tracking-wider">
                            Bio & Status
                          </label>
                          <span className="text-[10px] text-[var(--c-text-3)]">
                            {profileForm.bio.length}/200
                          </span>
                        </div>
                        <textarea
                          name="bio"
                          rows={2}
                          maxLength={200}
                          value={profileForm.bio}
                          onChange={handleProfileChange}
                          placeholder="Tell others a little about yourself or your status..."
                          className="w-full bg-[var(--c-panel)] border border-[var(--c-line)] rounded-xl p-2.5 text-xs text-[var(--c-text)] focus:outline-none focus:border-[var(--c-primary)] focus:ring-1 focus:ring-[var(--c-primary)] transition resize-none"
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--c-line)]/60">
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        disabled={savingProfile}
                        className="px-4 py-2 rounded-xl bg-[var(--c-surface)] hover:bg-[var(--c-raised)] text-[var(--c-text-2)] text-xs font-medium transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={savingProfile}
                        className="px-5 py-2 rounded-xl bg-[var(--c-primary)] hover:bg-[var(--c-primary-hover)] text-[var(--c-text)] font-semibold text-xs transition duration-150 flex items-center gap-1.5 shadow-md"
                      >
                        {savingProfile ? (
                          <>
                            <span className="loading loading-spinner loading-xs" /> Saving...
                          </>
                        ) : (
                          <>
                            <FiCheck className="text-sm" /> Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  /* VIEW MODE: Informational Cards Grid */
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {/* Full Name */}
                      <div className="p-3 rounded-xl bg-[var(--c-canvas-80)] border border-[var(--c-line-50)] flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-[var(--c-surface)] text-[var(--c-text-2)] shrink-0">
                          <FiUser className="text-sm" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[11px] text-[var(--c-text-3)] font-medium uppercase tracking-wider">Full Name</span>
                          <span className="text-xs font-semibold text-[var(--c-text)] truncate">{user?.name}</span>
                        </div>
                      </div>

                      {/* Username */}
                      <div className="p-3 rounded-xl bg-[var(--c-canvas-80)] border border-[var(--c-line-50)] flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-[var(--c-surface)] text-[var(--c-text-2)] shrink-0">
                          <span className="text-xs font-bold">@</span>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[11px] text-[var(--c-text-3)] font-medium uppercase tracking-wider">Username</span>
                          <span className="text-xs font-semibold text-[var(--c-text)] truncate">@{user?.userName}</span>
                        </div>
                      </div>

                      {/* Email */}
                      <div className="p-3 rounded-xl bg-[var(--c-canvas-80)] border border-[var(--c-line-50)] flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-[var(--c-surface)] text-[var(--c-text-2)] shrink-0">
                          <FiMail className="text-sm" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[11px] text-[var(--c-text-3)] font-medium uppercase tracking-wider">Email</span>
                          <span className="text-xs font-semibold text-[var(--c-text)] truncate">{user?.email}</span>
                        </div>
                      </div>

                      {/* Phone */}
                      <div className="p-3 rounded-xl bg-[var(--c-canvas-80)] border border-[var(--c-line-50)] flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-[var(--c-surface)] text-[var(--c-text-2)] shrink-0">
                          <FiPhone className="text-sm" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[11px] text-[var(--c-text-3)] font-medium uppercase tracking-wider">Phone Number</span>
                          <span className="text-xs font-semibold text-[var(--c-text)] truncate">{user?.phonenumber || 'Not specified'}</span>
                        </div>
                      </div>

                      {/* Gender */}
                      <div className="p-3 rounded-xl bg-[var(--c-canvas-80)] border border-[var(--c-line-50)] flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-[var(--c-surface)] text-[var(--c-text-2)] shrink-0">
                          <FiSmile className="text-sm" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[11px] text-[var(--c-text-3)] font-medium uppercase tracking-wider">Gender</span>
                          <span className="text-xs font-semibold text-[var(--c-text)] capitalize truncate">
                            {user?.gender || 'Not specified'}
                          </span>
                        </div>
                      </div>

                      {/* Member Since / Created Date */}
                      <div className="p-3 rounded-xl bg-[var(--c-canvas-80)] border border-[var(--c-line-50)] flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-[var(--c-surface)] text-[var(--c-text-2)] shrink-0">
                          <FiCalendar className="text-sm" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[11px] text-[var(--c-text-3)] font-medium uppercase tracking-wider">Member Since</span>
                          <span className="text-xs font-semibold text-[var(--c-text)] truncate">
                            {user?.createdAt
                              ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
                              : 'Active Member'}
                          </span>
                        </div>
                      </div>

                      {/* Bio Card (Full Width) */}
                      <div className="p-3 rounded-xl bg-[var(--c-canvas-80)] border border-[var(--c-line-50)] sm:col-span-2">
                        <div className="flex items-center gap-2 mb-1.5">
                          <FiInfo className="text-xs text-[var(--c-link)]" />
                          <span className="text-[11px] text-[var(--c-text-3)] font-medium uppercase tracking-wider">Bio & Status</span>
                        </div>
                        <p className="text-xs text-[var(--c-text)] leading-relaxed italic">
                          {user?.bio?.trim() ? (
                            `"${user.bio}"`
                          ) : (
                            <span className="text-[var(--c-text-3)] not-italic">No bio added yet. Click &apos;Edit Profile&apos; to add one.</span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Account Type Card */}
                    <div className="p-3.5 rounded-xl bg-[var(--c-primary-soft)] border border-[var(--c-line)] flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2.5">
                        <FiShield className="text-[var(--c-link)] text-base shrink-0" />
                        <div>
                          <h4 className="text-xs font-semibold text-[var(--c-text)]">Owner Account Protection</h4>
                          <p className="text-[11px] text-[var(--c-text-2)]">Client-side storage encryption active</p>
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-[var(--c-online)] bg-[var(--c-online)]/10 px-2 py-0.5 rounded-md border border-[var(--c-online-30)]">
                        Active
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ================= SETTINGS TAB ================= */}
          {activeTab === 'settings' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Security & Password Form */}
              <div className="p-4 rounded-2xl bg-[var(--c-canvas-80)] border border-[var(--c-line-50)] space-y-3.5">
                <div className="flex items-center gap-2 border-b border-[var(--c-line)] pb-2">
                  <FiLock className="text-[var(--c-link)] text-sm" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--c-text-2)]">
                    Change Security Password
                  </h3>
                </div>

                <form onSubmit={handlePasswordSubmit} className="space-y-3">
                  {/* Old Password */}
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--c-text-2)] uppercase tracking-wider mb-1">
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
                        className="w-full bg-[var(--c-panel)] border border-[var(--c-line)] rounded-xl px-3 py-2 text-xs text-[var(--c-text)] focus:outline-none focus:border-[var(--c-primary)] focus:ring-1 focus:ring-[var(--c-primary)] transition pr-9"
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

                  {/* New Password */}
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--c-text-2)] uppercase tracking-wider mb-1">
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
                        className="w-full bg-[var(--c-panel)] border border-[var(--c-line)] rounded-xl px-3 py-2 text-xs text-[var(--c-text)] focus:outline-none focus:border-[var(--c-primary)] focus:ring-1 focus:ring-[var(--c-primary)] transition pr-9"
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

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--c-text-2)] uppercase tracking-wider mb-1">
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
                        className="w-full bg-[var(--c-panel)] border border-[var(--c-line)] rounded-xl px-3 py-2 text-xs text-[var(--c-text)] focus:outline-none focus:border-[var(--c-primary)] focus:ring-1 focus:ring-[var(--c-primary)] transition pr-9"
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
                    disabled={updatingPass}
                    className="w-full py-2.5 bg-[var(--c-primary)] hover:bg-[var(--c-primary-hover)] text-[var(--c-text)] font-semibold text-xs rounded-xl shadow-md  transition duration-150 flex items-center justify-center gap-1.5"
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

              {/* Two-Factor Authentication (2FA) Card */}
              <div className="p-4 rounded-2xl bg-[var(--c-canvas-80)] border border-[var(--c-line-50)] space-y-3">
                <div className="flex items-center justify-between border-b border-[var(--c-line)] pb-2">
                  <div className="flex items-center gap-2">
                    <FiShield className="text-[var(--c-link)] text-sm" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--c-text-2)]">
                      Two-Factor Authentication (2FA)
                    </h3>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    user?.twoFactor?.enabled
                      ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30'
                      : 'bg-zinc-500/10 text-zinc-500 border border-zinc-500/20'
                  }`}>
                    {user?.twoFactor?.enabled ? 'Active' : 'Not Active'}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h5 className="text-xs font-semibold text-[var(--c-text)]">
                      Authenticator App Protection
                    </h5>
                    <p className="text-[11px] text-[var(--c-text-3)] leading-relaxed mt-0.5">
                      Protect your account with Google Authenticator, Microsoft Authenticator, or Authy. Requires a 6-digit code on every login.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShow2FAModal(true)}
                    className="shrink-0 px-3.5 py-1.5 rounded-xl bg-[var(--c-primary)] hover:bg-[var(--c-primary-hover)] text-[var(--c-text)] font-semibold text-xs shadow-sm transition cursor-pointer"
                  >
                    {user?.twoFactor?.enabled ? 'Manage 2FA' : 'Configure'}
                  </button>
                </div>
              </div>

              {/* Workspace Preferences Section */}
              <div className="p-4 rounded-2xl bg-[var(--c-canvas-80)] border border-[var(--c-line-50)] space-y-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--c-text-2)] block">
                  Workspace Preferences
                </span>

                <div className="flex items-center justify-between py-1 border-b border-[var(--c-line)]/60">
                  <div>
                    <h5 className="text-xs font-medium text-[var(--c-text)]">Desktop Notifications</h5>
                    <p className="text-[11px] text-[var(--c-text-3)]">Alert for incoming direct messages</p>
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
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${desktopNotifications ? 'bg-[var(--c-primary)]' : 'bg-[var(--c-raised)]'
                      }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-[var(--c-surface)] transition-transform ${desktopNotifications ? 'translate-x-6' : 'translate-x-1'
                        }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between py-1">
                  <div>
                    <h5 className="text-xs font-medium text-[var(--c-text)]">Chat Sounds</h5>
                    <p className="text-[11px] text-[var(--c-text-3)]">Play tone on message send & receive</p>
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
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${chatSounds ? 'bg-[var(--c-primary)]' : 'bg-[var(--c-raised)]'
                      }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-[var(--c-surface)] transition-transform ${chatSounds ? 'translate-x-6' : 'translate-x-1'
                        }`}
                    />
                  </button>
                </div>
              </div>

              {/* Encryption & Security Key Vault */}
              <div className="p-3.5 bg-[var(--c-surface)] border border-[var(--c-border-soft)] rounded-2xl flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FiShield className="text-[#2858E8] text-sm" />
                    <span className="text-xs font-semibold text-[var(--c-text)]">End-to-End Encryption</span>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${vaultData?.hasVault ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                    }`}>
                    {vaultData?.hasVault ? 'Vault Active' : 'Backup Pending'}
                  </span>
                </div>
                <p className="text-[11px] text-[var(--c-text-3)] leading-relaxed">
                  Your identity key is backed up zero-knowledge. You can generate a new recovery key or restore existing keys.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setCard(false);
                      setShowSetupModal(true);
                    }}
                    className="flex-1 py-1.5 px-2.5 bg-[var(--c-raised)] hover:bg-[var(--c-hover)] text-[var(--c-text)] text-xs font-medium rounded-lg border border-[var(--c-border-soft)] transition cursor-pointer text-center"
                  >
                    {vaultData?.hasVault ? 'Generate New Backup' : 'Set Up Vault'}
                  </button>
                  {identityState === 'RECOVERY_REQUIRED' && (
                    <button
                      type="button"
                      onClick={() => {
                        setCard(false);
                        setShowRecoveryModal(true);
                      }}
                      className="flex-1 py-1.5 px-2.5 bg-[#2858E8] hover:bg-[#1f47c2] text-white text-xs font-medium rounded-lg transition cursor-pointer text-center"
                    >
                      Restore Key
                    </button>
                  )}
                </div>
              </div>

              {/* Account Signout */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full py-2.5 px-4 bg-[var(--c-danger-10)] hover:bg-[var(--c-danger)]/20 border border-[var(--c-danger-40)] text-[var(--c-danger)] font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <FiLogOut className="text-sm" />
                  Sign Out from Workspace
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2FA Configuration & Management Modal */}
      <TwoFactorModal
        isOpen={show2FAModal}
        onClose={() => setShow2FAModal(false)}
      />
    </div>
  );
};

export default Account;
