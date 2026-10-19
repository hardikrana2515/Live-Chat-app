import React, { useState, useEffect, useContext } from 'react';
import { IoCloseSharp, IoSearch, IoPerson } from 'react-icons/io5';
import chatContext from '../contexts/ChatContext/chatcontext';
import API from '../contexts/Api';
import { toast } from 'react-toastify';

const ShareContactModal = ({ onClose, onShare }) => {
    const { chat, user } = useContext(chatContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [contacts, setContacts] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);

    // Extract unique other users from current chats (self pinned first so you
    // can share your own contact card too)
    useEffect(() => {
        const uniqueContactsMap = new Map();

        if (user?._id) {
            uniqueContactsMap.set(user._id, { ...user, isSelf: true });
        }

        (chat || []).forEach(c => {
            if (c.isGroup) {
                (c.members || []).forEach(m => {
                    if (m._id !== user._id && !uniqueContactsMap.has(m._id)) {
                        uniqueContactsMap.set(m._id, m);
                    }
                });
            } else {
                const other = (c.members || []).find(m => m._id !== user._id);
                if (other && !uniqueContactsMap.has(other._id)) {
                    uniqueContactsMap.set(other._id, other);
                }
            }
        });

        setContacts(Array.from(uniqueContactsMap.values()));
    }, [chat, user]);

    // Handle searching
    useEffect(() => {
        if (!searchTerm.trim()) {
            setSearchResults([]);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await API.get("user/Alluser", {
                    params: { search: searchTerm },
                    headers: { "Content-Type": "application/json" },
                    withCredentials: true
                });
                // Keep self in the results (marked below) so you can share your own contact
                const filtered = (res.data.data || []).map(u => (
                    u._id === user._id ? { ...u, isSelf: true } : u
                ));
                setSearchResults(filtered);
            } catch (e) {
                console.error("Search error in ShareContactModal", e);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, user]);

    const displayList = searchTerm.trim() ? searchResults : contacts;

    return (
        <div className="fixed inset-0 bg-[var(--c-overlay)] backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-[var(--c-panel)] border border-[var(--c-line)] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
                
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[var(--c-line)] bg-[var(--c-panel-80)]">
                    <div className="flex items-center gap-2 text-[var(--c-text)] font-semibold text-base">
                        <div className="p-2 rounded-xl bg-[var(--c-info-10)] text-[var(--c-info)]">
                            <IoPerson className="text-lg" />
                        </div>
                        <span>Share Contact</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-[var(--c-text-2)] hover:text-[var(--c-text)] p-1.5 rounded-lg hover:bg-[var(--c-surface)] transition"
                    >
                        <IoCloseSharp className="text-xl" />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="p-4 border-b border-[var(--c-line)]">
                    <div className="relative">
                        <IoSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--c-text-2)] text-base" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search name, username, or email..."
                            className="w-full pl-10 pr-4 py-2 bg-[var(--c-canvas-80)] border border-[var(--c-line)] rounded-xl text-xs sm:text-sm text-[var(--c-text)]  focus:outline-none focus:border-[var(--c-primary)] transition"
                        />
                    </div>
                </div>

                {/* Contact List */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2 no-scrollbar">
                    {loading ? (
                        <div className="flex justify-center items-center py-10">
                            <span className="loading loading-spinner text-[var(--c-primary)]" />
                        </div>
                    ) : displayList.length === 0 ? (
                        <div className="text-center py-10 text-[var(--c-text-3)] text-xs sm:text-sm">
                            {searchTerm ? "No users found matching search" : "No recent contacts found. Use the search bar above."}
                        </div>
                    ) : (
                        displayList.map(contact => (
                            <div
                                key={contact._id}
                                className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--c-canvas-80)] hover:bg-[var(--c-surface-80)] border border-[var(--c-line)]/60 transition group"
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-[var(--c-line)] bg-[var(--c-surface)] flex items-center justify-center">
                                        {contact.avtar ? (
                                            <img
                                                src={contact.avtar.startsWith('data:') ? contact.avtar : `http://localhost:4000${contact.avtar}`}
                                                alt={contact.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-sm font-bold text-[var(--c-text-2)]">
                                                {contact.name?.charAt(0) || "U"}
                                            </span>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-xs sm:text-sm font-semibold text-[var(--c-text)] truncate flex items-center gap-1.5">
                                            <span className="truncate">{contact.name}</span>
                                            {contact.isSelf && (
                                                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-[var(--c-primary)]/15 text-[var(--c-primary)] shrink-0">
                                                    You
                                                </span>
                                            )}
                                        </h4>
                                        <p className="text-[11px] text-[var(--c-text-2)] truncate">
                                            @{contact.userName || contact.email}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => onShare(contact)}
                                    className="px-3 py-1.5 bg-[var(--c-primary)] hover:bg-[var(--c-primary-hover)] text-white rounded-lg text-xs font-semibold shadow-sm transition active:scale-95 shrink-0"
                                >
                                    Share
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-[var(--c-line)] bg-[var(--c-canvas-80)] flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-1.5 text-xs font-medium text-[var(--c-text-2)] hover:text-[var(--c-text)] rounded-lg hover:bg-[var(--c-surface)] transition"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShareContactModal;
