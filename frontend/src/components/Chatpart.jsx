import { useContext } from 'react';
import Chatbox from './Chatbox';
import chatContext from '../contexts/ChatContext/chatcontext';
import { FiShield, FiLock, FiVideo, FiMessageSquare } from 'react-icons/fi';

const Chatpart = () => {
  const { selectedchat } = useContext(chatContext);

  return (
    <div className="flex-1 h-full w-full bg-slate-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.08),rgba(255,255,255,0))] relative overflow-hidden flex flex-col">
      {selectedchat ? (
        <Chatbox />
      ) : (
        <div className="flex flex-col items-center justify-center h-full px-6 text-center z-10">
          <div className="relative mb-5">
            <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 p-3.5 flex items-center justify-center shadow-2xl shadow-indigo-950/40">
              <img src="/Logo1.png" alt="Talkyy" className="w-full h-full object-contain filter drop-shadow" />
            </div>
            <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center text-xs">
              <FiLock />
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Talkyy Secure Workspace
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mt-1.5 mb-8">
            Select a direct conversation or channel from the sidebar to start collaborating, share files, or begin a call.
          </p>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg mb-8">
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex flex-col items-center text-center">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 mb-2">
                <FiLock className="text-base" />
              </div>
              <span className="text-xs font-semibold text-slate-200">Client-Side Encryption</span>
              <span className="text-[11px] text-slate-400 mt-0.5">Encrypted with AES-256</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex flex-col items-center text-center">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 mb-2">
                <FiVideo className="text-base" />
              </div>
              <span className="text-xs font-semibold text-slate-200">HD Calling</span>
              <span className="text-[11px] text-slate-400 mt-0.5">Instant Voice & Video</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex flex-col items-center text-center">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 mb-2">
                <FiMessageSquare className="text-base" />
              </div>
              <span className="text-xs font-semibold text-slate-200">Rich Media & Polls</span>
              <span className="text-[11px] text-slate-400 mt-0.5">Interactive Collaboration</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <FiShield className="text-emerald-400 text-sm" />
            <span>Encrypted socket protocol active</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatpart;