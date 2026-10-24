import { useState, useContext, useEffect, useRef } from 'react'
import { FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { IoCloseSharp } from "react-icons/io5";
import { MdOutlineArrowBack } from "react-icons/md";
import chatContext from '../contexts/ChatContext/chatcontext'
import { getSafeMediaUrl } from '../contexts/Api.js'

const Group = () => {
    const { setGroupchat, CreateGroup,
        GroupUsersearch, setGLoading, setGSearchUser, GsearchUser, GLoading, Allchat } = useContext(chatContext);
    const [search, setSearch] = useState('');
    const [icon, setIcon] = useState('');
    const [groupName, setGroupName] = useState("");
    const [selectedMembers, setSelectedMembers] = useState([]);
    const debounceRef = useRef(null);

    // Live search: results appear as you type (debounced), matching the rest
    // of the app's search UX (Search.jsx / Addmember.jsx). (UI flaw 5.4)
    useEffect(() => {
        const q = search.trim();
        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (!q) {
            setGSearchUser([]);
            return;
        }

        debounceRef.current = setTimeout(async () => {
            try {
                await GroupUsersearch(q, true); // silent: no toast while typing
            } catch (e) {
                toast.error(e.message);
            }
        }, 350);

        return () => clearTimeout(debounceRef.current);
    }, [search]);

    // Clear search state when the modal unmounts
    useEffect(() => () => { setGSearchUser([]); setGLoading(false); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!search.trim()) return;
        if (debounceRef.current) clearTimeout(debounceRef.current);
        try {
            await GroupUsersearch(search.trim());
        } catch (e) {
            toast.error(e.message);
        }
    };

    const handleChange = (e) => {
        setSearch(e.target.value);
    };

    const handleCreateGroup = async () => {
        try {
            const memberIds = selectedMembers.map((m) => m._id);
            await CreateGroup(groupName, memberIds, icon);
            await Allchat();
            setGroupchat(false);
        } catch (e) {
            toast.error(e.message);
        }
    }

    const handleSelectUser = (u) => {
        if (!selectedMembers.some((m) => m._id === u._id)) {
            setSelectedMembers([...selectedMembers, u]);
        } else {
            toast.info("User already added to group");
        }
    };

    const handleRemoveUser = (id) => {
        setSelectedMembers(selectedMembers.filter((m) => m._id !== id));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="scrim" />
            <div className="modal-card max-w-lg p-6 animate-fadeIn">

                {/* Title + Close */}
                <h2 className="text-xl font-semibold text-center mb-4 text-[var(--c-text)]">Create Group</h2>
                <button
                    className="absolute top-3 right-3 text-2xl text-[var(--c-text-2)] hover:text-[var(--c-danger)] transition-transform hover:scale-110"
                    onClick={() => setGroupchat(false)}
                >
                    <IoCloseSharp />
                </button>

                {/* Search Input */}
                <form
                    onSubmit={handleSubmit}
                    className="flex items-center border-2 rounded-full border-[var(--c-line)] px-3 py-1 w-full"
                >
                    <input
                        type="text"
                        value={search}
                        onChange={handleChange}
                        className="flex-grow bg-transparent border-none outline-none focus:outline-none focus:border-none focus:ring-0 focus-visible:outline-none shadow-none text-[var(--c-text)] text-sm px-2 ring-0"
                        placeholder="Search users..."
                    />
                    <button
                        type="submit"
                        disabled={search.length === 0}
                        className="btn btn-circle h-10 w-10 bg-[var(--c-primary)] text-[var(--c-on-primary)] ml-2"
                    >
                        {GLoading ? <span className="loading loading-spinner loading-sm text-[var(--c-primary)]" /> : <FaSearch />}
                    </button>
                    {GsearchUser.length > 0 && (
                        <MdOutlineArrowBack
                            onClick={() => setGSearchUser([])}
                            className="text-[var(--c-text)] ml-3 rounded-full h-7 w-7 p-1 cursor-pointer text-xl hover:bg-[var(--c-primary-soft)]"
                        />
                    )}
                </form>

                {/* Search Results */}
                <div className="flex flex-col gap-2 mt-4 overflow-y-auto max-h-60">
                    {GsearchUser.map((u) => (
                        <div
                            key={u._id}
                            onClick={() => handleSelectUser(u)}
                            className="flex items-center w-full gap-4 p-2 rounded-md hover:bg-[var(--c-hover)] cursor-pointer transition-all duration-200"
                        >
                            <img
                                src={getSafeMediaUrl(u.avtar, '/avtar.png')}
                                alt={u.userName}
                                className="w-12 h-12 rounded-full object-cover"
                            />
                            <div className="flex flex-col justify-center overflow-hidden">
                                <h3 className="text-[var(--c-text)] font-medium truncate">{u.name}</h3>
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
                                <div key={u._id} className="flex items-center gap-2 px-3 py-1 bg-[var(--c-surface)] rounded-md">
                                    <img
                                        src={getSafeMediaUrl(u.avtar, '/avtar.png')}
                                        alt={u.userName}
                                        className="w-6 h-6 rounded-full object-cover"
                                    />
                                    <span className="text-sm">{u.name}</span>
                                    <button
                                        onClick={() => handleRemoveUser(u._id)}
                                        className="text-[var(--c-danger)] hover:brightness-125 ml-1"
                                    >
                                        <IoCloseSharp />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Group Name & Icon */}
                <div className="w-full mt-6 p-4 bg-[var(--c-surface)] rounded-lg space-y-4">
                    <input
                        type="text"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        placeholder="Group Name"
                        className="w-full px-4 py-2 rounded-md bg-[var(--c-panel)] text-[var(--c-text)] border border-[var(--c-line)] focus:ring-[var(--c-primary)]"
                    />
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setIcon(e.target.files[0])}
                        className="w-full px-4 py-2 rounded-md bg-[var(--c-panel)] text-[var(--c-text)] border border-[var(--c-line)] focus:ring-[var(--c-primary)]"
                    />

                    <button
                        disabled={groupName.length < 2 || selectedMembers.length < 2}
                        onClick={handleCreateGroup}
                        className={`w-full py-2 rounded-md font-medium transition ${groupName.length < 2 || selectedMembers.length < 2
                                ? 'bg-[var(--c-primary-soft)] cursor-not-allowed opacity-50 text-[var(--c-text)]'
                                : 'bg-[var(--c-primary)] text-[var(--c-on-primary)] hover:bg-[var(--c-primary-hover)] cursor-pointer'
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
