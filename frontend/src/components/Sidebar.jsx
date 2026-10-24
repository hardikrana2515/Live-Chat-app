
import { useContext, useEffect, useState } from "react";
import { TiGroup, TiTick, TiTimes } from "react-icons/ti";
import { FiSettings, FiSun, FiMoon, FiUserPlus, FiMessageSquare } from "react-icons/fi";
import { IoClose } from "react-icons/io5";
import Profile from './Profile';
import Search from './Search';
import Logout from './Logout';
import chatContext from "../contexts/ChatContext/chatcontext";
import userContext from '../contexts/UserContext/userContext';
import SocketContext from '../contexts/Socket.io.Context/socket.Context';
import { registerChat, ensureChatKey } from '../utils/cryptoKeys';
import { getApiBaseUrl, getSafeMediaUrl } from '../contexts/Api.js';
import Chat, { isChatUnread } from "./Chat";

const ThemeToggle = () => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('talkyy-theme');
    return saved === 'mint' ? 'light' : (saved || 'dark');
  });

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('talkyy-theme', next);
    document.documentElement.setAttribute('data-theme', next);
  };

  return (
    <button
      onClick={toggle}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--c-hover)] text-[var(--c-text-2)] hover:text-[var(--c-text)] text-sm font-medium transition-all"
      title={theme === 'dark' ? 'Switch to Sky (light)' : 'Switch to Aurora Night (dark)'}
    >
      {theme === 'dark' ? <FiSun className="text-lg text-[var(--c-link)]" /> : <FiMoon className="text-lg text-[var(--c-accent)]" />}
      {theme === 'dark' ? 'Sky (light)' : 'Aurora Night (dark)'}
    </button>
  );
};

const Sidebar = () => {
  const { setGroupchat, user: chatUser, Allchat, isAuthReady, chat, setSelectedchat } = useContext(chatContext);
  const { setCard, user: authUser, friendRequests, getFriendRequests, acceptRequest, refreshUser } = useContext(userContext);
  const { socket, isConnected } = useContext(SocketContext);
  const user = authUser?.name ? authUser : chatUser;

  const [chatFilter, setChatFilter] = useState('all');
  const [showRequests, setShowRequests] = useState(false);

  useEffect(() => {
    if (isAuthReady && user && user.token) {
      Allchat();
      getFriendRequests();
    }
  }, [user, isAuthReady]);

  // Live socket listeners for friend requests so request counts appear in real time
  useEffect(() => {
    if (!socket?.current) return;

    const handleFriendRequestReceived = (data) => {
      console.log("[Sidebar] Friend request received live:", data);
      getFriendRequests();
    };

    const handleFriendRequestUpdated = (data) => {
      console.log("[Sidebar] Friend request updated live:", data);
      getFriendRequests();
      refreshUser();
      Allchat();
    };

    socket.current.on("friend request received", handleFriendRequestReceived);
    socket.current.on("friend request updated", handleFriendRequestUpdated);

    return () => {
      if (socket.current) {
        socket.current.off("friend request received", handleFriendRequestReceived);
        socket.current.off("friend request updated", handleFriendRequestUpdated);
      }
    };
  }, [socket, isConnected]);

  // Filter valid incoming pending requests
  const visibleRequests = (friendRequests || []).filter(
    (r) => r?.sender && !['accepted', 'rejected'].includes(r?.status)
  );
  const requestsCount = visibleRequests.length;

  // Count unread conversations
  const unreadCount = (chat || []).filter((c) => isChatUnread(c, user?._id)).length;

  // Auto-reset filter if no unread chats exist
  useEffect(() => {
    if (unreadCount === 0 && chatFilter === 'unread') {
      setChatFilter('all');
    }
  }, [unreadCount, chatFilter]);

  // Auto-close requests panel if no requests remain
  useEffect(() => {
    if (requestsCount === 0 && showRequests) {
      setShowRequests(false);
    }
  }, [requestsCount, showRequests]);

  const handleRequestAction = async (senderId, status) => {
    const resData = await acceptRequest(senderId, status);
    if (resData) {
      if (socket?.current) {
        socket.current.emit("friend request responded", {
          targetUserId: String(senderId),
          status
        });
      }
      getFriendRequests();
      refreshUser();
      await Allchat();

      const newChat = resData?.chat;
      if (status === 'accepted' && newChat) {
        registerChat(newChat);
        await ensureChatKey(newChat, user?._id);
        setSelectedchat(newChat);
      }
    }
  };

  return (
    <div className="drawer drawer-start w-full h-full bg-[var(--c-panel)]">
      <input id="my-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content w-full h-full flex flex-col overflow-hidden relative bg-[var(--c-panel)]">
        {/* Top Section: Brand, Profile & Actions */}
        <div className="p-3.5 sm:p-4 border-b border-[var(--c-line-50)] flex flex-col gap-3 shrink-0">
          {/* Workspace Brand + Profile */}
          <div className="flex items-center justify-between gap-2">
            {/* User section — opens the left drawer */}
            <button
              onClick={() => {
                const d = document.getElementById('my-drawer');
                if (d) d.checked = true;
              }}
              className="flex items-center gap-2.5 min-w-0 text-left"
              title="Menu"
            >
            <div className="relative shrink-0">
              <img
                src={getSafeMediaUrl(user?.avtar, '/avtar.png')}
                alt={user?.name || 'You'}
                className="w-10 h-10 rounded-full object-cover avatar-ring"
              />
              <span className="presence-dot" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <h2 className="text-sm font-bold text-[var(--c-text)] tracking-tight leading-none truncate" style={{ fontFamily: 'var(--font-display)' }}>
                  {user?.name || 'Talkyy'}
                </h2>
                <span className="chip shrink-0">You</span>
              </div>
              <span className="text-[11px] text-[var(--c-text-3)] truncate">@{user?.userName || 'user'}</span>
            </div>
          </button>

          {/* Compact Brand Symbol */}
          <a
            href="/"
            className="shrink-0 p-1 rounded-lg hover:bg-[var(--c-hover)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2858E8]"
            title="Talkyy Home"
            aria-label="Talkyy Home"
          >
            <img
              src="/brand/talkyy-symbol-transparent.png"
              alt="Talkyy"
              className="w-7 h-7 object-contain"
            />
          </a>
        </div>

        {/* Bio below User Profile */}
        {user?.bio?.trim() && (
          <div className="px-3 py-1.5 rounded-xl bg-[var(--c-canvas-80)] border border-[var(--c-line-50)] text-left">
            <p className="text-xs text-[var(--c-text-2)] italic truncate leading-snug" title={user.bio}>
              {user.bio}
            </p>
          </div>
        )}

        {/* Search */}
        <Search />
      </div>

      {/* Chat List Section — the ONLY scrollable region */}
      <div className="flex-1 min-h-0 overflow-y-auto subtle-scrollbar px-2 sm:px-2.5 py-2 flex flex-col">
        {/* Dynamic Tags Bar: Appears ONLY when unread messages or requests exist */}
        {(unreadCount > 0 || requestsCount > 0) && (
          <div className="flex items-center gap-1.5 px-1 pb-2 pt-0.5 flex-wrap shrink-0">
            {unreadCount > 0 && (
              <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all select-none ${
                  chatFilter === 'unread'
                    ? 'bg-[var(--c-primary)] text-white shadow-sm ring-1 ring-[var(--c-primary)]'
                    : 'bg-[var(--c-surface)] text-[var(--c-text-2)] hover:text-[var(--c-text)] hover:bg-[var(--c-hover)] border border-[var(--c-line)]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setChatFilter((prev) => (prev === 'unread' ? 'all' : 'unread'))}
                  className="inline-flex items-center gap-1.5 cursor-pointer"
                  title={chatFilter === 'unread' ? 'Show all conversations' : 'Filter to unread messages'}
                >
                  <FiMessageSquare className="text-xs shrink-0" />
                  <span>Unread</span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                      chatFilter === 'unread'
                        ? 'bg-white/25 text-white'
                        : 'bg-[#22c55e] text-black shadow-[0_0_6px_rgba(34,197,94,0.5)]'
                    }`}
                  >
                    {unreadCount}
                  </span>
                </button>
                {chatFilter === 'unread' && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setChatFilter('all');
                    }}
                    className="ml-0.5 p-0.5 rounded-full hover:bg-white/20 text-white/90 hover:text-white transition-colors cursor-pointer"
                    title="Clear filter (show all)"
                  >
                    <IoClose className="text-xs" />
                  </button>
                )}
              </div>
            )}

            {requestsCount > 0 && (
              <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all select-none ${
                  showRequests
                    ? 'bg-[var(--c-warning)]/20 text-[var(--c-warning)] border border-[var(--c-warning)]/40 shadow-sm'
                    : 'bg-[var(--c-surface)] text-[var(--c-text-2)] hover:text-[var(--c-text)] hover:bg-[var(--c-hover)] border border-[var(--c-line)]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setShowRequests((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 cursor-pointer"
                  title={showRequests ? 'Hide requests' : 'View connection requests'}
                >
                  <FiUserPlus className="text-xs shrink-0 text-[var(--c-warning)]" />
                  <span>Requests</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[var(--c-warning)] text-black">
                    {requestsCount}
                  </span>
                </button>
                {showRequests && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowRequests(false);
                    }}
                    className="ml-0.5 p-0.5 rounded-full hover:bg-[var(--c-warning)]/20 text-[var(--c-warning)] transition-colors cursor-pointer"
                    title="Close requests panel"
                  >
                    <IoClose className="text-xs" />
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Inline Requests Accordion Panel */}
        {showRequests && requestsCount > 0 && (
          <div className="mb-2 p-2.5 rounded-xl bg-[var(--c-surface)] border border-[var(--c-line)] shadow-sm shrink-0">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs font-bold text-[var(--c-text)]">
                Connection Requests ({requestsCount})
              </span>
              <button
                onClick={() => setShowRequests(false)}
                className="text-[11px] text-[var(--c-text-3)] hover:text-[var(--c-text)]"
              >
                Close
              </button>
            </div>
            <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto subtle-scrollbar">
              {visibleRequests.map((req) => (
                <div
                  key={req._id}
                  className="flex items-center justify-between bg-[var(--c-panel)] p-2 rounded-lg border border-[var(--c-line-50)]"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={getSafeMediaUrl(req.sender.avtar, '/avtar.png')}
                      alt={req.sender.name || req.sender.userName}
                      className="w-7 h-7 rounded-full object-cover shrink-0"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-medium text-[var(--c-text)] truncate">
                        {req.sender.name || req.sender.userName}
                      </span>
                      <span className="text-[10px] text-[var(--c-text-3)] truncate">
                        @{req.sender.userName}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <button
                      onClick={() => handleRequestAction(req.sender._id, 'accepted')}
                      className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md transition-colors"
                      title="Accept request"
                    >
                      <TiTick className="text-xs" />
                    </button>
                    <button
                      onClick={() => handleRequestAction(req.sender._id, 'rejected')}
                      className="p-1.5 bg-[var(--c-danger)] hover:opacity-90 text-white rounded-md transition-opacity"
                      title="Decline request"
                    >
                      <TiTimes className="text-xs" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Chat filter={chatFilter} />
      </div>
      </div>

      {/* Drawer Side Menu — opened by the top user section */}
      <div className="drawer-side z-50">
        <label htmlFor="my-drawer" className="drawer-overlay"></label>
        <div className="menu p-4 w-72 min-h-full bg-[var(--c-panel)] border-r border-[var(--c-line)] text-[var(--c-text)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-[var(--c-line-50)]">
              <a href="/" className="inline-block" title="Talkyy Home" aria-label="Talkyy Home">
                <img
                  src="/brand/talkyy-horizontal.png"
                  alt="Talkyy"
                  className="h-7 w-auto max-w-[130px] object-contain"
                />
              </a>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--c-primary-soft)] text-[var(--c-link)]">
                Chat
              </span>
            </div>

            <div className="pb-4 mb-3 border-b border-[var(--c-line-50)]">
              <Profile />
            </div>

            <div className="space-y-1">
              <button
                onClick={() => {
                  setGroupchat(true);
                  document.getElementById('my-drawer').checked = false;
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--c-hover)] text-[var(--c-text-2)] hover:text-[var(--c-text)] text-sm font-medium transition-all"
              >
                <TiGroup className="text-lg text-[var(--c-link)]" /> Create Group
              </button>

              <button
                onClick={() => {
                  setCard(true);
                  document.getElementById('my-drawer').checked = false;
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--c-hover)] text-[var(--c-text-2)] hover:text-[var(--c-text)] text-sm font-medium transition-all"
              >
                <FiSettings className="text-lg text-[var(--c-text-3)]" /> Account Settings
              </button>

              <ThemeToggle />
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--c-line-50)]">
            <Logout />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
