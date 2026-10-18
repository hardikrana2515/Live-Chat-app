
import { GiHamburgerMenu } from "react-icons/gi";
import { useContext, useEffect } from "react";
import { IoMdSettings } from "react-icons/io";
import { TiGroup } from "react-icons/ti";
import { FiPlus, FiSettings, FiLogOut } from "react-icons/fi";
import Profile from './Profile';
import Search from './Search';
import Logout from './Logout';
import chatContext from "../contexts/ChatContext/chatcontext";
import userContext from '../contexts/UserContext/userContext';
import Chat from "./Chat";
import Requests from "./Requests";

const Sidebar = () => {
  const { setGroupchat, user: chatUser, Allchat, isAuthReady, chat } = useContext(chatContext);
  const { setpass, setCard, user: authUser } = useContext(userContext);
  const user = authUser?.name ? authUser : chatUser;

  useEffect(() => {
    if (isAuthReady && user && user.token) {
      Allchat();
    }
  }, [user, isAuthReady]);

  return (
    <div className="w-full h-full bg-slate-950 flex flex-col justify-between overflow-hidden relative">
      {/* Top Section */}
      <div className="p-3.5 sm:p-4 border-b border-slate-800/80 flex flex-col gap-3">
        {/* Workspace Brand & Actions Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center p-1">
              <img src="/Logo1.png" alt="Talkyy" className="w-full h-full object-contain" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight leading-none">Talkyy</h2>
              <span className="text-[10px] text-slate-400">Workspace</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Quick Create Group Button */}
            <button
              onClick={() => setGroupchat(true)}
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all text-sm flex items-center gap-1"
              title="Create New Group"
            >
              <FiPlus className="text-base text-indigo-400" />
            </button>

            {/* Hamburger Drawer */}
            <div className="drawer drawer-start z-50">
              <input id="my-drawer" type="checkbox" className="drawer-toggle" />
              <div className="drawer-content">
                <label
                  htmlFor="my-drawer"
                  className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white cursor-pointer transition-all flex items-center justify-center"
                >
                  <GiHamburgerMenu className="text-sm" />
                </label>
              </div>

              {/* Drawer Side Menu */}
              <div className="drawer-side">
                <label htmlFor="my-drawer" className="drawer-overlay"></label>
                <div className="menu p-4 w-72 min-h-full bg-slate-900 border-r border-slate-800 text-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="pb-4 mb-3 border-b border-slate-800">
                      <Profile />
                    </div>

                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          setGroupchat(true);
                          document.getElementById('my-drawer').checked = false;
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800/80 text-slate-300 hover:text-white text-sm font-medium transition-all"
                      >
                        <TiGroup className="text-lg text-indigo-400" /> Create Group
                      </button>

                      <button
                        onClick={() => {
                          setpass(true);
                          document.getElementById('my-drawer').checked = false;
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800/80 text-slate-300 hover:text-white text-sm font-medium transition-all"
                      >
                        <IoMdSettings className="text-lg text-slate-400" /> Security & Password
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800">
                    <Logout />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <Search />
      </div>

      {/* Chat List Section */}
      <div className="flex-1 overflow-y-auto subtle-scrollbar px-2 sm:px-2.5 py-2">
        <div className="px-2 py-1 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
          <span>Conversations</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-800/60 text-slate-400">
            {chat?.length || 0}
          </span>
        </div>
        <Chat />
      </div>

      {/* User Bottom Bar Dock */}
      {user && user.name && (
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/90 flex items-center justify-between">
          <div
            onClick={() => setCard(true)}
            className="flex items-center gap-2.5 overflow-hidden cursor-pointer hover:opacity-90 transition-opacity flex-1"
            title="Edit Profile"
          >
            <div className="relative">
              <img
                src={
                  user.avtar?.startsWith('data:image')
                    ? user.avtar
                    : user.avtar
                    ? `http://localhost:4000${user.avtar}`
                    : '/avtar.png'
                }
                alt={user.name}
                className="w-9 h-9 rounded-full object-cover border border-slate-700"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-950 rounded-full" />
            </div>
            <div className="flex flex-col overflow-hidden">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-xs font-semibold text-white truncate leading-tight">{user.name}</span>
                <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 shrink-0">
                  Owner
                </span>
              </div>
              <span className="text-[11px] text-slate-400 truncate">@{user.userName || 'user'}</span>
            </div>
          </div>

          <button
            onClick={() => setCard(true)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            title="Account Settings"
          >
            <FiSettings className="text-sm" />
          </button>
        </div>
      )}

      {/* Friend / Connection Requests Popup */}
      <Requests />
    </div>
  );
};

export default Sidebar;