import React, { useContext, useEffect, useState, useRef } from "react";
import chatContext from "../contexts/ChatContext/chatcontext";
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
        GLoading,
        setGLoading,
        setGSearchUser, AddinGroup,
        GsearchUser, Allchat
    } = useContext(chatContext);

    const [search, setSearch] = useState("");
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [hasSearched, setHasSearched] = useState(false);
    const debounceRef = useRef(null);

    useEffect(() => {
        const q = search.trim();
        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (!q) {
            setGSearchUser([]);
            setHasSearched(false);
            return;
        }

        debounceRef.current = setTimeout(async () => {
            try {
                await GroupUsersearch(q, true);
                setHasSearched(true);
            } catch (e) {
                toast.error(e.message);
            }
        }, 350);

        return () => clearTimeout(debounceRef.current);
    }, [search]);

    useEffect(() => () => { setGSearchUser([]); setGLoading(false); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!search.trim()) return;
        if (debounceRef.current) clearTimeout(debounceRef.current);
        try {
            await GroupUsersearch(search.trim());
            setHasSearched(true);
        } catch (e) {
            toast.error(e.message);
        }
    };

    const handleSelectUser = (u) => {
        if (!selectedMembers.some((m) => m._id === u._id)) {
            setSelectedMembers([...selectedMembers, u]);
        } else {
            toast.info("User already selected");
        }
    };

    const handleChange = (e) => {
        setSearch(e.target.value);
    };

    const handleRemoveUser = (id) => {
        setSelectedMembers(selectedMembers.filter((m) => m._id !== id));
    };

    const handleAddmem = async () => {
        try {
            const res = await AddinGroup(selectedMembers, selectedchat._id);

            setSelectedchat(res);
            await Allchat();
            setAddmodal(false);
            toast.success("Member added to group!");
        } catch (e) {
            toast.error(e.message);
        }
    };

    const results = GsearchUser.filter(
        (u) => u._id !== selectedchat?.creator &&
            !selectedchat?.members?.some((member) => member._id === u._id)
    );

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-[var(--c-overlay)] backdrop-blur-md px-4 transition-all duration-300 ease-in-out">
            <div className="bg-[var(--c-surface)]  text-[var(--c-text)]  w-full max-w-lg rounded-2xl p-6 relative shadow-2xl animate-fadeIn border border-[var(--c-line)] ">

                {/* Title + Close */}
                <h2 className="text-xl font-semibold text-center mb-4 text-[var(--c-text)] ">
                    Add Member
                </h2>
                <button
                    className="absolute top-3 right-3 text-2xl text-[var(--c-text-2)] hover:text-[var(--c-danger)] transition-transform hover:scale-110"
                    onClick={() => setAddmodal(false)}
                >
                    <IoCloseSharp />
                </button>

                {/* Live Search Form */}
                <form
                    onSubmit={handleSubmit}
                    className="flex items-center bg-transparent backdrop-blur-2xl border-2 rounded-full border-[var(--c-line)] px-3 py-2 w-full focus-within:border-[var(--c-primary)] transition-colors"
                >
                    <input
                        type="text"
                        value={search}
                        onChange={handleChange}
                        className="flex-grow bg-transparent border-none outline-none focus:outline-none focus:border-none focus:ring-0 focus-visible:outline-none shadow-none text-[var(--c-text)] text-sm px-2 ring-0"
                        placeholder="Search users..."
                        autoFocus
                    />
                    <button
                        type="submit"
                        disabled={search.length === 0 || GLoading}
                        className="btn btn-circle bg-[var(--c-primary)] text-white ml-2 disabled:opacity-40"
                    >
                        {GLoading ? (
                            <span className="loading loading-spinner loading-sm" />
                        ) : (
                            <FaSearch />
                        )}
                    </button>
                    {GsearchUser.length > 0 && (
                        <MdOutlineArrowBack
                            onClick={() => { setGSearchUser([]); setSearch(""); setHasSearched(false); }}
                            className="text-[var(--c-text)] ml-3 rounded-full h-8 w-8 p-1.5 cursor-pointer text-xl hover:bg-[var(--c-primary)] transition"
                        />
                    )}
                </form>

                {/* Search Results (live) */}
                <div className="flex flex-col gap-2 mt-4 overflow-y-auto max-h-60 pr-1 custom-scrollbar">
                    {GLoading && (
                        <div className="flex justify-center py-6">
                            <span className="loading loading-spinner loading-md text-[var(--c-primary)]" />
                        </div>
                    )}

                    {!GLoading && hasSearched && results.length === 0 && (
                        <p className="text-center text-sm text-[var(--c-text-3)] py-6">
                            No users found. Try a different name, username, or email.
                        </p>
                    )}

                    {!GLoading && results.map((u) => (
                            <div
                                key={u._id}
                                onClick={() => handleSelectUser(u)}
                                className="flex items-center w-full gap-4 p-2 rounded-md hover:bg-[var(--c-surface)] cursor-pointer transition-all duration-200"
                            >
                                <img
                                    src={
                                        u.avtar?.startsWith("data:image")
                                            ? u.avtar
                                            : `http://localhost:4000${u.avtar}`
                                    }
                                    alt={u.userName}
                                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                                />
                                <div className="flex flex-col justify-center overflow-hidden">
                                    <h3 className="text-[var(--c-text)] font-medium truncate text-sm">{u.name}</h3>
                                    <span className="text-[var(--c-text-2)] text-xs">@{u.userName}</span>
                                </div>
                            </div>
                        ))}
                </div>

                {/* Selected Members */}
                {selectedMembers.length > 0 && (
                    <div className="mt-4 p-2 rounded-md bg-[var(--c-raised)] text-[var(--c-text)]">
                        <h4 className="mb-2 font-semibold">Selected Members:</h4>
                        <div className="flex flex-wrap gap-2 p-2">
                            {selectedMembers.map((u) => (
                                <div
                                    key={u._id}
                                    className="flex items-center gap-2 px-3 py-1 bg-[var(--c-surface)] rounded-md"
                                >
                                    <img
                                        src={
                                            u.avtar?.startsWith("data:image")
                                                ? u.avtar
                                                : `http://localhost:4000${u.avtar}`
                                        }
                                        alt={u.userName}
                                        className="w-6 h-6 rounded-full object-cover"
                                    />
                                    <span className="text-sm">{u.name}</span>
                                    <button
                                        onClick={() => handleRemoveUser(u._id)}
                                        className="text-[var(--c-danger)] hover:text-[var(--c-danger)] ml-1"
                                    >
                                        <IoCloseSharp />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Add Button */}
                <button
                    disabled={selectedMembers.length < 1}
                    onClick={handleAddmem}
                    className={`flex w-full py-2 mt-4 items-center justify-center rounded-md font-medium transition ${selectedMembers.length < 1
                            ? 'bg-[var(--c-primary)] opacity-50 cursor-not-allowed text-[var(--c-text)]'
                            : 'bg-[var(--c-primary)] text-[var(--c-text)] hover:brightness-110'
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
