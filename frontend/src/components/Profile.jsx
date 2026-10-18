import { useState, useContext, useEffect } from 'react';
import userContext from '../contexts/UserContext/userContext';

const Profile = () => {
  const { GetUser, user, setCard } = useContext(userContext);
  const [fetchError, setFetchError] = useState(false);

  const fetchUser = async () => {
    setFetchError(false);
    try {
      await GetUser();
    } catch {
      setFetchError(true);
    }
  };

  useEffect(() => {
    if (!user || !user.name) {
      fetchUser();
    }
  }, []);

  const handleClick = () => {
    setCard(true);
    const drawer = document.getElementById('my-drawer');
    if (drawer) drawer.checked = false;
  };

  if (!user || !user.name) {
    if (fetchError) {
      return (
        <div className="flex items-center justify-between p-2 text-slate-400 text-xs w-full bg-slate-800/40 rounded-xl border border-slate-700/50">
          <span className="text-red-400 truncate">Failed to load profile</span>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={fetchUser}
              className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[11px] font-medium transition"
            >
              Retry
            </button>
            <button
              onClick={handleClick}
              className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-[11px] font-medium transition"
              title="Open Account Settings"
            >
              Account
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-3 p-2 text-slate-400 text-xs">
        <span className="loading loading-spinner loading-xs text-indigo-400" />
        <span>Loading profile...</span>
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      className="flex items-center w-full gap-3 p-2 rounded-xl hover:bg-slate-800/80 cursor-pointer transition-all duration-200 group border border-transparent hover:border-slate-800"
      title="View Owner Profile & Settings"
    >
      {/* Avatar with Status */}
      <div className="relative shrink-0">
        <img
          src={
            user.avtar?.startsWith('data:image')
              ? user.avtar
              : user.avtar
              ? `http://localhost:4000${user.avtar}`
              : '/avtar.png'
          }
          alt={user.userName}
          className="w-10 h-10 rounded-full object-cover border border-slate-700 group-hover:border-indigo-500/50 transition-colors shadow-sm"
        />
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
      </div>

      {/* Name + Username */}
      <div className="flex flex-col justify-center overflow-hidden min-w-0">
        <div className="flex items-center gap-1.5">
          <h3 className="text-white font-semibold text-xs sm:text-sm truncate leading-tight group-hover:text-indigo-300 transition-colors">
            {user.name}
          </h3>
          <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 shrink-0">
            Owner
          </span>
        </div>
        <p className="text-[11px] text-slate-400 truncate">
          @{user.userName}
        </p>
      </div>
    </div>
  );
};

export default Profile;
