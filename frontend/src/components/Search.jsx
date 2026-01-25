import { useState, useContext, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { MdOutlineArrowBack } from "react-icons/md";
import InfiniteScroll from "react-infinite-scroll-component";
import 'react-toastify/dist/ReactToastify.css';
import userContext from '../contexts/UserContext/userContext';
import chatContext from '../contexts/ChatContext/chatcontext';


const Search = () => {
  const { loading, setLoading, Alluser, setSearchUser, searchUser } = useContext(userContext);
  const { MakeChat } = useContext(chatContext)
  const [search, setSearch] = useState('');
  const [displayUser, setDisplayUser] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [visibleCount, setVisibleCount] = useState(15);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await Alluser(search.trim());
      setVisibleCount(15);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const { user, sendRequest } = useContext(userContext); // Access my own user info to check friends

  const handleClick = async (targetUser) => {
    if (targetUser.connectionStatus === 'friend') {
      await MakeChat(targetUser._id);
      setSearchUser([]);
    } else if (targetUser.connectionStatus === 'none') {
      const success = await sendRequest(targetUser._id);
      if (success) {
        // Optimistically update UI
        setSearchUser(prev => prev.map(u => u._id === targetUser._id ? { ...u, connectionStatus: 'pending' } : u));
      }
    }
  }

  const isFriend = (targetId) => {
    return user.friends && user.friends.some(f => f === targetId || f._id === targetId);
  }

  const hasPendingRequest = (targetId) => {
    // Optimization: checking outgoing requests is tricky unless we fetch them or return them in AllUser.
    // For now, simplicity: backend blocks duplicates. Frontend just assumes "Add".
    return false;
  }

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
    }, 500);
  };

  const handleChange = (e) => {
    setSearch(e.target.value);
  };

  return (
    <div className="w-full relative">
      {/* Search Bar */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center bg-transparent backdrop-blur-2xl border-2 rounded-full border-amber-100 px-3 py-2 w-full"
      >
        <input
          type="text"
          value={search}
          onChange={handleChange}
          className="flex-grow bg-transparent outline-none text-white px-2 placeholder:text-gray-400 text-sm"
          placeholder="Search users..."
        />

        <button
          type="submit"
          disabled={search.length === 0}
          className="btn btn-circle bg-gray-400 text-white ml-2"
        >
          {loading ? (
            <span className="loading loading-spinner loading-sm" />
          ) : (
            <FaSearch />
          )}
        </button>

        {searchUser.length > 0 && (
          <MdOutlineArrowBack
            onClick={() => setSearchUser([])}
            className="text-white ml-3 rounded-full h-8 w-8 p-1.5 cursor-pointer text-xl hover:bg-fuchsia-400 transition"
          />
        )}
      </form>

      {/* Search Result List */}
      {searchUser.length > 0 && (
        <div className="flex flex-col rounded-md bg-gray-700 w-full max-h-[60vh] overflow-y-auto gap-2 mt-3 p-2 z-10 absolute top-12 left-0 shadow-2xl border border-gray-600">
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
              <p className="text-center text-gray-400 text-sm mt-4">
                <b>No more contacts to display</b>
              </p>
            }
          >
            {displayUser.map((u) => (
              <div
                key={u._id}
                className="flex items-center justify-between w-full gap-3 p-2 rounded-md hover:bg-gray-800 transition-all duration-200"
              >
                <div className="flex items-center gap-3 flex-1 overflow-hidden">
                  <img
                    src={
                      u.avtar?.startsWith('data:image')
                        ? u.avtar
                        : `http://localhost:4000${u.avtar}`
                    }
                    alt={u.userName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex flex-col justify-center overflow-hidden">
                    <h3 className="text-white font-medium truncate text-sm">{u.name}</h3>
                    <span className="text-gray-400 text-xs">@{u.userName}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleClick(u)}
                  disabled={u.connectionStatus === 'pending' || u.connectionStatus === 'received'}
                  className={`btn btn-sm ${u.connectionStatus === 'friend' ? 'btn-primary' :
                    u.connectionStatus === 'pending' ? 'btn-warning' :
                      u.connectionStatus === 'received' ? 'btn-info' :
                        'btn-accent text-white'
                    } rounded-full px-4`}
                >
                  {u.connectionStatus === 'friend' ? 'Chat' :
                    u.connectionStatus === 'pending' ? 'Pending' :
                      u.connectionStatus === 'received' ? 'Check Req' : 'Connect'}
                </button>
              </div>
            ))}
          </InfiniteScroll>
        </div>
      )}
    </div>

  );
};

export default Search