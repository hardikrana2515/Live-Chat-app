import { useState, useContext, useEffect } from 'react'
import { FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { IoCloseSharp } from "react-icons/io5";
import { MdOutlineArrowBack } from "react-icons/md";
import userContext from '../contexts/UserContext/userContext'
import chatContext from '../contexts/ChatContext/chatcontext'

const Group = () => {
    const { loading } = useContext(userContext);
    const { groupchat, setGroupchat, group, setGroup, CreateGroup,
        GroupUsersearch, setGLoading, setGSearchUser, GsearchUser, Allchat } = useContext(chatContext);
    const [search, setSearch] = useState('');
    const [icon, setIcon] = useState('');
    const [groupName, setGroupName] = useState("");
    const [selectedMembers, setSelectedMembers] = useState([]);



    const handleSubmit = async (e) => {
        e.preventDefault();
        setGLoading(true);
        try {
            await GroupUsersearch(search.trim());
        } catch (e) {
            toast.error(e.message);
        } finally {
            setGLoading(false);
        }
    };

    const handleChange = (e) => {
        setSearch(e.target.value);
    };

    const handleCreateGroup = async () => {
        await CreateGroup(groupName, selectedMembers, icon);
        await Allchat()
    }

    const handleSelectUser = (id) => {
        if (!selectedMembers.includes(id)) {
            setSelectedMembers([...selectedMembers, id]);
        } else {
            toast.info("User already added to group");
        }
    };

    const handleRemoveUser = (id) => {
        setSelectedMembers(selectedMembers.filter((memberId) => memberId !== id));
    };





    return (
        <div className="fixed inset-0 bg-opacity-5 flex items-center justify-center z-50 backdrop-blur-xl px-4 transition-all duration-300 ease-in-out">
            <div className="bg-white dark:bg-gray-900 text-black dark:text-white w-full max-w-lg rounded-2xl p-6 relative shadow-2xl animate-fadeIn border border-gray-300 dark:border-gray-700">

                {/* Title + Close */}
                <h2 className="text-xl font-semibold text-center mb-4 text-fuchsia-600 dark:text-fuchsia-400">Create Group</h2>
                <button
                    className="absolute top-3 right-3 text-2xl text-gray-400 hover:text-red-500 transition-transform hover:scale-110"
                    onClick={() => setGroupchat(false)}
                >
                    <IoCloseSharp />
                </button>

                {/* Search Input */}
                <form
                    onSubmit={handleSubmit}
                    className="flex items-center bg-transparent backdrop-blur-2xl border-2 rounded-full border-amber-100 px-3 py-1 w-full"
                >
                    <input
                        type="text"
                        value={search}
                        onChange={handleChange}
                        className="flex-grow bg-transparent outline-none text-white placeholder:text-gray-300 px-2"
                        placeholder="Search users..."
                    />
                    <button
                        type="submit"
                        disabled={search.length === 0}
                        className="btn btn-circle h-10 w-10 bg-gray-400 text-white ml-2"
                    >
                        {loading ? <span className="loading loading-spinner loading-sm" /> : <FaSearch />}
                    </button>
                    {GsearchUser.length > 0 && (
                        <MdOutlineArrowBack
                            onClick={() => setGSearchUser([])}
                            className="text-white ml-3 rounded-full h-7 w-7 p-1 cursor-pointer text-xl hover:bg-fuchsia-400"
                        />
                    )}
                </form>

                {/* Search Results */}
                <div className="flex flex-col gap-2 mt-4 overflow-y-auto max-h-60">
                    {GsearchUser.map((user) => (
                        <div
                            key={user._id}
                            onClick={() => handleSelectUser(user._id)}
                            className="flex items-center w-full gap-4 p-2 rounded-md hover:bg-gray-800 cursor-pointer transition-all duration-200"
                        >
                            <img
                                src={user.avtar?.startsWith('data:image') ? user.avtar : `http://localhost:4000${user.avtar}`}
                                alt={user.userName}
                                className="w-12 h-12 rounded-full object-cover"
                            />
                            <div className="flex flex-col justify-center overflow-hidden">
                                <h3 className="text-white font-medium truncate">{user.name}</h3>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Selected Members */}
                {selectedMembers.length > 0 && (
                    <div className="mt-4 p-2 rounded-md bg-gray-700 text-white">
                        <h4 className="mb-2 font-semibold">Selected Members:</h4>
                        <div className="flex flex-wrap gap-2 p-2">
                            {selectedMembers.map((id) => {
                                const user = GsearchUser.find(u => u._id === id);
                                return user ? (
                                    <div key={id} className="flex items-center gap-2 px-3 py-1 bg-gray-800 rounded-md">
                                        <img
                                            src={user.avtar?.startsWith('data:image') ? user.avtar : `http://localhost:4000${user.avtar}`}
                                            alt={user.userName}
                                            className="w-6 h-6 rounded-full object-cover"
                                        />
                                        <span className="text-sm">{user.name}</span>
                                        <button
                                            onClick={() => handleRemoveUser(id)}
                                            className="text-red-500 hover:text-red-700 ml-1"
                                        >
                                            <IoCloseSharp />
                                        </button>
                                    </div>
                                ) : null;
                            })}
                        </div>
                    </div>
                )}

                {/* Group Name & Icon */}
                <div className="w-full mt-6 p-4 bg-gray-800 rounded-lg space-y-4">
                    <input
                        type="text"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        placeholder="Group Name"
                        className="w-full px-4 py-2 rounded-md bg-gray-900 text-white border border-gray-600 focus:ring-fuchsia-500"
                    />
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setIcon(e.target.files[0])}
                        className="w-full px-4 py-2 rounded-md bg-gray-900 text-white border border-gray-600 focus:ring-fuchsia-500"
                    />

                    <button
                        disabled={groupName.length < 2 || selectedMembers.length < 2}
                        onClick={handleCreateGroup}
                        className={`w-full py-2 rounded-md font-medium transition ${groupName.length < 2 || selectedMembers.length < 2
                                ? 'bg-fuchsia-400 cursor-not-allowed opacity-50 text-white'
                                : 'bg-fuchsia-600 text-white hover:bg-fuchsia-700 cursor-pointer'
                            }`}
                    >
                        Create Group
                    </button>
                </div>
            </div>
        </div>

    );
}

export default Group
