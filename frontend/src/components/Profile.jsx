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
        <div className="flex items-center justify-between p-2 text-[var(--c-text-2)] text-xs w-full bg-[var(--c-surface)]/40 rounded-xl border border-[var(--c-line)]/50">
          <span className="text-[var(--c-danger)] truncate">Failed to load profile</span>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={fetchUser}
              className="btn-primary px-2 py-1 text-[11px] font-medium transition"
            >
              Retry
            </button>
            <button
              onClick={handleClick}
              className="px-2 py-1 bg-[var(--c-raised)] hover:bg-[var(--c-hover)] text-[var(--c-text)] rounded-lg text-[11px] font-medium transition"
              title="Open Account Settings"
            >
              Account
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-3 p-2 text-[var(--c-text-2)] text-xs">
        <span className="loading loading-spinner loading-xs text-[var(--c-link)]" />
        <span>Loading profile...</span>
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      className="flex items-center w-full gap-3 p-2 rounded-xl hover:bg-[var(--c-surface-80)] cursor-pointer transition-all duration-200 group border border-transparent hover:border-[var(--c-line)]"
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
          className="w-10 h-10 rounded-full object-cover border border-[var(--c-line)] group-hover:border-[var(--c-primary-50)] transition-colors shadow-sm"
        />
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[var(--c-online)] border-2 border-[var(--c-panel)] rounded-full" />
      </div>

      {/* Name + Username */}
      <div className="flex flex-col justify-center overflow-hidden min-w-0">
        <div className="flex items-center gap-1.5">
          <h3 className="text-[var(--c-text)] font-semibold text-xs sm:text-sm truncate leading-tight group-hover:text-[var(--c-link)] transition-colors">
            {user.name}
          </h3>
          <span className="text-[11px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-[var(--c-primary-soft)] border border-[var(--c-line)] text-[var(--c-link)] shrink-0">
            Owner
          </span>
        </div>
        <p className="text-[11px] text-[var(--c-text-2)] truncate">
          @{user.userName}
        </p>
      </div>
    </div>
  );
};

export default Profile;
