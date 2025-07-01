import { useContext, useEffect } from 'react';
import userContext from '../contexts/UserContext/userContext';



const Profile = () => {
  const { GetUser, user, setCard } = useContext(userContext);

  useEffect(() => {
    const fetchUser = async () => {
      await GetUser();
    };
    fetchUser();
  }, [])

  const hanldeCLick = () => {
    setCard(true)
    document.getElementById('my-drawer').checked = false
  }

  if (!user) {
    return <div className="text-white">Loading profile...</div>;
  }

  return (
    <div
      onClick={hanldeCLick}
      className="flex items-center w-full gap-4 p-3 sm:p-2 rounded-md hover:bg-gray-800 cursor-pointer transition-all duration-200"
    >
      {/* Avatar */}
      <img
        src={
          user.avtar?.startsWith('data:image')
            ? user.avtar
            : `http://localhost:4000${user.avtar}`
        }
        alt={user.userName}
        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shadow-md"
      />

      {/* Name + Username */}
      <div className="flex flex-col justify-center overflow-hidden">
        <h3 className="text-white font-medium text-sm sm:text-base truncate">
          {user.name}
        </h3>
        <p className="text-xs sm:text-sm text-gray-400 truncate">
          @{user.userName}
        </p>
      </div>
    </div>

  );
};

export default Profile;
