import { useState, useContext, useEffect, useRef } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import InfiniteScroll from "react-infinite-scroll-component";
import 'react-toastify/dist/ReactToastify.css';
import userContext from '../contexts/UserContext/userContext';
import chatContext from '../contexts/ChatContext/chatcontext';
import Loader from './Loader';

const Search = () => {
  const { loading, Alluser, setSearchUser, searchUser, sendRequest } = useContext(userContext);
  const { MakeChat, chat } = useContext(chatContext);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [displayUser, setDisplayUser] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [visibleCount, setVisibleCount] = useState(15);
  const searchContainerRef = useRef(null);

  // Live search with debounce
  useEffect(() => {
    const trimmed = search.trim();
    if (!trimmed) {
      setSearchUser([]);
      return;
    }

    const timer = setTimeout(() => {
      Alluser(trimmed, true);
      setVisibleCount(15);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isAlreadyConnected = (targetUser) => {
    if (!targetUser) return false;
    if (targetUser.connectionStatus === 'friend') return true;
    if (chat && Array.isArray(chat)) {
      return chat.some((c) => !c.isGroup && c.members?.some((m) => (m._id || m) === targetUser._id));
    }
    return false;
  };

  const handleClick = async (targetUser) => {
    if (isAlreadyConnected(targetUser)) {
      try {
        await MakeChat(targetUser._id);
        setSearchUser([]);
        setSearch('');
        setOpen(false);
      } catch (err) {
        toast.error(err.message || 'Failed to open chat');
      }
    } else if (targetUser.connectionStatus === 'none' || !targetUser.connectionStatus) {
      const success = await sendRequest(targetUser._id);
      if (success) {
        setSearchUser((prev) =>
          prev.map((u) => (u._id === targetUser._id ? { ...u, connectionStatus: 'pending' } : u))
        );
      }
    }
  };

  useEffect(() => {
    setDisplayUser(searchUser.slice(0, visibleCount));
    setHasMore(searchUser.length > visibleCount);
  }, [searchUser, visibleCount]);

  const fetchMoreData = () => {
    if (displayUser.length >= searchUser.length) {
      setHasMore(false);
      return;
    }
    setTimeout(() => {
      const newCount = visibleCount + 5;
      setVisibleCount(newCount);
      setDisplayUser(searchUser.slice(0, newCount));
    }, 400);
  };

  const handleClear = () => {
    setSearch('');
    setSearchUser([]);
    setOpen(false);
  };

  return (
    <div className="w-full relative" ref={searchContainerRef}>
      {/* Live Search Input Bar */}
      <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-2 w-full focus-within:border-indigo-500/80 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
        {/* Search Icon */}
        <span className="text-slate-400 text-sm pl-0.5 shrink-0 flex items-center">
          <FiSearch className="text-base text-slate-400" />
        </span>

        {/* Input */}
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setOpen(true);
          }}
          className="flex-grow bg-transparent outline-none text-white px-2.5 placeholder:text-slate-500 text-xs sm:text-sm font-normal"
          placeholder="Search teammates, users..."
        />

        {/* Loading Spinner or Clear Button */}
        {loading ? (
          <span className="loading loading-spinner loading-xs text-indigo-400 shrink-0" />
        ) : (
          search.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition shrink-0"
              title="Clear search"
            >
              <FiX className="text-sm" />
            </button>
          )
        )}
      </div>

      {/* Live Search Results Dropdown */}
      {open && search.trim().length > 0 && searchUser.length > 0 && (
        <div className="flex flex-col rounded-2xl bg-slate-900/95 backdrop-blur-xl w-full max-h-[60vh] overflow-y-auto subtle-scrollbar gap-1.5 mt-2 p-2 z-50 absolute top-12 left-0 shadow-2xl border border-slate-800 shadow-slate-950/80 animate-fadeIn">
          <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800 flex items-center justify-between">
            <span>Live Results</span>
            <span className="text-indigo-400">{searchUser.length} found</span>
          </div>

          <InfiniteScroll
            dataLength={displayUser.length}
            next={fetchMoreData}
            hasMore={hasMore}
            loader={
              loading && (
                <div className="flex justify-center items-center py-4">
                  <Loader />
                </div>
              )
            }
            endMessage={
              <p className="text-center text-slate-500 text-xs py-2">
                End of results
              </p>
            }
          >
            {displayUser.map((u) => (
              <div
                key={u._id}
                className="flex items-center justify-between w-full gap-2.5 p-2 rounded-xl hover:bg-slate-800/70 transition-all duration-150"
              >
                <div className="flex items-center gap-2.5 flex-1 overflow-hidden">
                  <img
                    src={
                      u.avtar?.startsWith('data:image')
                        ? u.avtar
                        : u.avtar
                          ? `http://localhost:4000${u.avtar}`
                          : '/avtar.png'
                    }
                    alt={u.userName}
                    className="w-9 h-9 rounded-full object-cover border border-slate-700/60 shrink-0"
                  />
                  <div className="flex flex-col justify-center overflow-hidden">
                    <h3 className="text-white font-medium truncate text-xs sm:text-sm">{u.name}</h3>
                    <span className="text-slate-400 text-[11px] truncate">@{u.userName}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleClick(u)}
                  disabled={!isAlreadyConnected(u) && (u.connectionStatus === 'pending' || u.connectionStatus === 'received')}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 ${isAlreadyConnected(u)
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
                      : u.connectionStatus === 'pending'
                        ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
                        : u.connectionStatus === 'received'
                          ? 'bg-amber-600/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:text-white'
                    }`}
                >
                  {isAlreadyConnected(u) ? 'Chat' :
                    u.connectionStatus === 'pending' ? 'Pending' :
                      u.connectionStatus === 'received' ? 'Request' : 'Connect'}
                </button>
              </div>
            ))}
          </InfiniteScroll>
        </div>
      )}

      {/* No results popover when user typed but no matches */}
      {open && search.trim().length > 0 && !loading && searchUser.length === 0 && (
        <div className="flex flex-col rounded-2xl bg-slate-900/95 backdrop-blur-xl w-full p-4 mt-2 z-50 absolute top-12 left-0 shadow-2xl border border-slate-800 shadow-slate-950/80 animate-fadeIn text-center">
          <p className="text-xs text-slate-400">
            No users found matching "<span className="text-slate-200 font-medium">{search.trim()}</span>"
          </p>
        </div>
      )}
    </div>
  );
};

export default Search;