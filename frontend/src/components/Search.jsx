import { useState, useContext, useEffect, useRef } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import InfiniteScroll from "react-infinite-scroll-component";
import 'react-toastify/dist/ReactToastify.css';
import userContext from '../contexts/UserContext/userContext';
import chatContext from '../contexts/ChatContext/chatcontext';
import SocketContext from '../contexts/Socket.io.Context/socket.Context';
import Loader from './Loader';
import { getSafeMediaUrl } from '../contexts/Api.js';

const Search = () => {
  const { loading, Alluser, setSearchUser, searchUser, sendRequest } = useContext(userContext);
  const { MakeChat, chat } = useContext(chatContext);
  const { socket } = useContext(SocketContext);
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
        if (socket?.current) {
          socket.current.emit("friend request sent", { targetUserId: String(targetUser._id) });
        }
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
      <div className="flex items-center bg-[var(--c-panel-95)] border border-[var(--c-line)] rounded-xl px-3 py-2 w-full focus-within:border-[var(--c-primary)] focus-within:ring-2 focus-within:ring-[var(--ring-brand)] transition-all">
        {/* Search Icon */}
        <span className="text-[var(--c-text-2)] text-sm pl-0.5 shrink-0 flex items-center">
          <FiSearch className="text-base text-[var(--c-text-2)]" />
        </span>

        {/* Input */}
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setOpen(true);
          }}
          className="flex-grow bg-transparent outline-none text-[var(--c-text)] px-2.5  text-xs sm:text-sm font-normal"
          placeholder="Search teammates, users..."
        />

        {/* Loading Spinner or Clear Button */}
        {loading ? (
          <span className="loading loading-spinner loading-xs text-[var(--c-link)] shrink-0" />
        ) : (
          search.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="text-[var(--c-text-2)] hover:text-[var(--c-text)] p-1 rounded-md hover:bg-[var(--c-surface)] transition shrink-0"
              title="Clear search"
            >
              <FiX className="text-sm" />
            </button>
          )
        )}
      </div>

      {/* Live Search Results Dropdown */}
      {open && search.trim().length > 0 && searchUser.length > 0 && (
        <div className="flex flex-col rounded-2xl bg-[var(--c-panel-95)] backdrop-blur-xl w-full max-h-[60vh] overflow-y-auto subtle-scrollbar gap-1.5 mt-2 p-2 z-50 absolute top-12 left-0 shadow-2xl border border-[var(--c-line)]  animate-fadeIn">
          <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--c-text-2)] border-b border-[var(--c-line)] flex items-center justify-between">
            <span>Live Results</span>
            <span className="text-[var(--c-link)]">{searchUser.length} found</span>
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
              <p className="text-center text-[var(--c-text-3)] text-xs py-2">
                End of results
              </p>
            }
          >
            {displayUser.map((u) => (
              <div
                key={u._id}
                className="flex items-center justify-between w-full gap-2.5 p-2 rounded-xl hover:bg-[var(--c-surface-80)] transition-all duration-150"
              >
                <div className="flex items-center gap-2.5 flex-1 overflow-hidden">
                  <img
                    src={getSafeMediaUrl(u.avtar, '/avtar.png')}
                    alt={u.userName}
                    className="w-9 h-9 rounded-full object-cover border border-[var(--c-line)] shrink-0"
                  />
                  <div className="flex flex-col justify-center overflow-hidden">
                    <h3 className="text-[var(--c-text)] font-medium truncate text-xs sm:text-sm">{u.name}</h3>
                    <span className="text-[var(--c-text-2)] text-[11px] truncate">@{u.userName}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleClick(u)}
                  disabled={!isAlreadyConnected(u) && (u.connectionStatus === 'pending' || u.connectionStatus === 'received')}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 ${isAlreadyConnected(u)
                      ? 'bg-[var(--c-primary)] hover:bg-[var(--c-primary-hover)] text-[var(--c-text)] shadow-sm'
                      : u.connectionStatus === 'pending'
                        ? 'bg-[var(--c-surface)] text-[var(--c-text-2)] border border-[var(--c-line)] cursor-not-allowed'
                        : u.connectionStatus === 'received'
                          ? 'bg-[var(--c-warning-15)] text-[var(--c-warning)] border border-[var(--c-warning-40)]'
                          : 'bg-[var(--c-surface)] hover:bg-[var(--c-raised)] text-[var(--c-text)] border border-[var(--c-line)] hover:text-[var(--c-text)]'
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
        <div className="flex flex-col rounded-2xl bg-[var(--c-panel-95)] backdrop-blur-xl w-full p-4 mt-2 z-50 absolute top-12 left-0 shadow-2xl border border-[var(--c-line)]  animate-fadeIn text-center">
          <p className="text-xs text-[var(--c-text-2)]">
            No users found matching "<span className="text-[var(--c-text)] font-medium">{search.trim()}</span>"
          </p>
        </div>
      )}
    </div>
  );
};

export default Search;