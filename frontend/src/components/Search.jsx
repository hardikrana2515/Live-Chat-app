import { useState, useContext,useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import {   toast } from 'react-toastify';
import { MdOutlineArrowBack } from "react-icons/md";
import InfiniteScroll from "react-infinite-scroll-component";
import 'react-toastify/dist/ReactToastify.css';
import userContext from '../contexts/UserContext/userContext';
import chatContext from '../contexts/ChatContext/chatcontext';


const Search = () => {
    const { loading, setLoading, Alluser, setSearchUser, searchUser } = useContext(userContext);
    const {MakeChat} = useContext(chatContext)
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

    const handleClick =async (id)=>{
                await MakeChat(id)
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
   <div className="w-full">
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
    <div className="flex flex-col rounded-md bg-gray-700 w-full max-h-[60vh] overflow-y-auto gap-2 mt-3 p-2 z-10">
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
        {displayUser.map((user) => (
          <div
            key={user._id}
            onClick={() => handleClick(user._id)}
            className="flex items-center w-full gap-3 p-2 rounded-md hover:bg-gray-800 cursor-pointer transition-all duration-200"
          >
            <img
              src={
                user.avtar?.startsWith('data:image')
                  ? user.avtar
                  : `http://localhost:4000${user.avtar}`
              }
              alt={user.userName}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex flex-col justify-center overflow-hidden">
              <h3 className="text-white font-medium truncate text-sm">{user.name}</h3>
            </div>
          </div>
        ))}
      </InfiniteScroll>
    </div>
  )}
</div>

    );
};

export default Search