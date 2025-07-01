import React, { useContext, useEffect, useState } from "react";
import chatContext from "../contexts/ChatContext/chatcontext";
import userContext from "../contexts/UserContext/userContext";
import { IoCloseSharp } from "react-icons/io5";
import { FaSearch } from "react-icons/fa";
import { MdOutlineArrowBack } from "react-icons/md";
import { IoMdAdd } from "react-icons/io";
import { toast } from "react-toastify";

const Addmember = () => {
    const {
        selectedchat,
        setSelectedchat,
        setAddmodal,
        GroupUsersearch,
        setGLoading,
        setGSearchUser, AddinGroup,
        GsearchUser, Allchat
    } = useContext(chatContext);

    // const [GLoading,setGLoading] = useState(false)
    const [search, setSearch] = useState("");
    const [selectedMembers, setSelectedMembers] = useState([]);

    const { loading } = useContext(userContext);

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

    const handleSelectUser = (id) => {
        if (!selectedMembers.includes(id)) {
            setSelectedMembers([...selectedMembers, id]);
        } else {
            toast.info("User already added to group");
        }
    };

    const handleChange = (e) => {
        setSearch(e.target.value);
    };

    const handleRemoveUser = (id) => {
        setSelectedMembers(selectedMembers.filter((memberId) => memberId !== id));
    };


    const handleAddmem = async (memberIds) => {

        try {
            const res = await AddinGroup(memberIds, selectedchat._id);

            setSelectedchat((prev) => ({
                ...prev,
                admins: res.admins,
            }));
            await Allchat();
        } catch (e) {
            toast.error(e.message);
        }
    };

    return (
        <div className="fixed inset-0 bg-opacity-10 flex items-center justify-center z-50 backdrop-blur-xl px-4 transition-all duration-300 ease-in-out">
            <div className="bg-white dark:bg-gray-900 text-black dark:text-white w-full max-w-lg rounded-2xl p-6 relative shadow-2xl animate-fadeIn border border-gray-300 dark:border-gray-700">

                {/* Title + Close */}
                <h2 className="text-xl font-semibold text-center mb-4 text-fuchsia-600 dark:text-fuchsia-400">
                    Add Member
                </h2>
                <button
                    className="absolute top-3 right-3 text-2xl text-gray-400 hover:text-red-500 transition-transform hover:scale-110"
                    onClick={() => setAddmodal(false)}
                >
                    <IoCloseSharp />
                </button>

                {/* Search Form */}
                <form
                    onSubmit={handleSubmit}
                    className="flex items-center bg-transparent backdrop-blur-2xl border-2 rounded-full border-amber-100 px-3 py-2 w-full"
                >
                    <input
                        type="text"
                        value={search}
                        onChange={handleChange}
                        className="flex-grow bg-transparent outline-none text-white placeholder:text-gray-300 text-sm px-2"
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
                    {GsearchUser.length > 0 && (
                        <MdOutlineArrowBack
                            onClick={() => setGSearchUser([])}
                            className="text-white ml-3 rounded-full h-8 w-8 p-1.5 cursor-pointer text-xl hover:bg-fuchsia-400 transition"
                        />
                    )}
                </form>

                {/* Search Results */}
                <div className="flex flex-col gap-2 mt-4 overflow-y-auto max-h-60 pr-1 custom-scrollbar">
                    {GsearchUser.length > 0 &&
                        GsearchUser.filter(
                            (user) => !selectedchat.members.some((member) => member._id === user._id)
                        ).map((user) => (
                            <div
                                key={user._id}
                                onClick={() => handleSelectUser(user._id)}
                                className="flex items-center w-full gap-4 p-2 rounded-md hover:bg-gray-800 cursor-pointer transition-all duration-200"
                            >
                                <img
                                    src={
                                        user.avtar?.startsWith("data:image")
                                            ? user.avtar
                                            : `http://localhost:4000${user.avtar}`
                                    }
                                    alt={user.userName}
                                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                                />
                                <div className="flex flex-col justify-center overflow-hidden">
                                    <h3 className="text-white font-medium truncate text-sm">{user.name}</h3>
                                </div>
                            </div>
                        ))}
                </div>

                {/* Selected Members */}
                {selectedMembers.length > 0 && (
                    <div className="mt-4 p-2 rounded-md bg-gray-700 text-white">
                        <h4 className="mb-2 font-semibold">Selected Members:</h4>
                        <div className="flex flex-wrap gap-2 p-2">
                            {[...new Set(selectedMembers)].map((id) => {
                                const user = GsearchUser.find((u) => u._id === id);
                                return user ? (
                                    <div
                                        key={id}
                                        className="flex items-center gap-2 px-3 py-1 bg-gray-800 rounded-md"
                                    >
                                        <img
                                            src={
                                                user.avtar?.startsWith("data:image")
                                                    ? user.avtar
                                                    : `http://localhost:4000${user.avtar}`
                                            }
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

                {/* Add Button */}
                <button
                    disabled={selectedMembers.length < 1}
                    onClick={() => handleAddmem(selectedMembers)}
                    className={`flex w-full py-2 mt-4 items-center justify-center rounded-md font-medium transition ${selectedMembers.length < 1
                            ? 'bg-fuchsia-400 opacity-50 cursor-not-allowed text-white'
                            : 'bg-fuchsia-600 text-white hover:bg-fuchsia-700'
                        }`}
                >
                    <IoMdAdd className="mr-2" />
                    Add Member
                </button>
            </div>
        </div>

    );
};

export default Addmember;
