import { useContext, useState, useEffect, useRef } from 'react';
import { TiTick, TiTickOutline } from "react-icons/ti";
import { MdAddReaction } from "react-icons/md";
import { FiEdit2 } from "react-icons/fi";
import { IoPerson } from "react-icons/io5";
import { toast } from 'react-toastify';
import messageContext from '../contexts/MessageContext/messageContext';
import chatContext from '../contexts/ChatContext/chatcontext';
import AudioMessage from './AudioMessage';
import { decryptMessage } from '../utils/EncryptionUtils';
import PollMessage from './PollMessage';
import EncryptedAttachment from './EncryptedAttachment';
import EditMessageModal from './EditMessageModal';

const AllchatMsg = () => {
    const { AllMessages, Allmsg, msg, setMsg, DeleteMsg, Del, setDel, ReadBy, ReactToMsg, EditMsg, editingMsg, setEditingMsg } = useContext(messageContext);
    const { user, selectedchat, isAuthReady, MakeChat, Allchat } = useContext(chatContext); // Use isAuthReady

    const [reactionPopup, setReactionPopup] = useState(null); // stores messageId of open popup

    const Endmsg = useRef(null);

    const scrollToBottom = () => {
        (Endmsg.current?.scrollIntoView({ behavior: 'smooth' }))

    }

    useEffect(() => {
        scrollToBottom();
    }, [Allmsg, selectedchat])

    useEffect(() => {
        if (isAuthReady && selectedchat) {
            AllMessages(selectedchat._id)
        }

    }, [selectedchat, isAuthReady])

    useEffect(() => {
        Allmsg.forEach((M) => {
            if (!M.readBy?.includes(user._id)) {
                ReadBy(M._id)
            }
        });
    }, [user, Allmsg])


    return (
        <div className="flex-1 w-full p-3 sm:p-4 h-full overflow-y-auto overflow-x-hidden no-scrollbar">
            {!msg ? (
                <p className="text-gray-400 text-center mt-10">No messages yet...</p>
            ) : (
                <div className="flex flex-col gap-4 text-sm text-gray-300">
                    {Allmsg.map((m) => {
                        const isSender = m.Sender._id === user._id;
                        if (m.deletedFor?.includes(user._id)) return null;

                        return (
                            <div
                                key={m._id}
                                className={`chat ${isSender ? 'chat-end' : 'chat-start'} px-2 sm:px-3 group relative my-0.5`}
                                onContextMenu={(e) => {
                                    e.preventDefault();
                                    setDel(true);
                                    setMsg(m);
                                }}
                            >
                                {/* Avatar */}
                                <div className="chat-image avatar">
                                    <div className="w-8 sm:w-9 rounded-full">
                                        <img
                                            alt={m.Sender.name}
                                            src={
                                                m.Sender.avtar?.startsWith("data:image")
                                                    ? m.Sender.avtar
                                                    : `http://localhost:4000${m.Sender.avtar}`
                                            }
                                            className="object-cover border border-slate-700"
                                        />
                                    </div>
                                </div>

                                {/* Bubble */}
                                {(m.poll && m.poll.question) ? (
                                    <PollMessage message={m} />
                                ) : (m.message.trim() === '' && m.media.trim() === '') ? (
                                    <div
                                        className={`chat-bubble rounded-2xl ${
                                            isSender ? 'bg-indigo-950/60 border border-indigo-800/40 text-indigo-300' : 'bg-slate-800/60 border border-slate-700/50 text-slate-400'
                                        } italic text-xs max-w-xs sm:max-w-md shadow-sm`}
                                    >
                                        This message was deleted
                                    </div>
                                ) : m.media ? (
                                    <div
                                        className={`chat-bubble rounded-2xl ${
                                            isSender ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-800 text-slate-100 border border-slate-700/80 shadow-sm'
                                        } p-2 max-w-xs sm:max-w-md`}
                                    >
                                        {(() => {
                                            const fileUrl = `http://localhost:4000${m.media}`;
                                            let fileExt = m.media.split('.').pop().toLowerCase();
                                            if (fileExt === 'enc') {
                                                const parts = m.media.split('.');
                                                if (parts.length > 1) fileExt = parts[parts.length - 2].toLowerCase();
                                            }

                                            return <EncryptedAttachment url={fileUrl} type={fileExt} alt="Shared Media" />;
                                        })()}

                                        {/* Optional message under media */}
                                        {m.message && (
                                            <p className="mt-2 text-xs sm:text-sm">
                                                {decryptMessage(m.message)}
                                                {m.isEdited && <span className="text-[10px] text-slate-300 italic ml-1">(edited)</span>}
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    (() => {
                                        const decryptedText = decryptMessage(m.message);
                                        if (decryptedText.startsWith("[CONTACT_CARD]:::")) {
                                            try {
                                                const contact = JSON.parse(decryptedText.replace("[CONTACT_CARD]:::", ""));
                                                return (
                                                    <div className={`p-3.5 rounded-2xl border ${
                                                        isSender ? 'bg-indigo-900/50 border-indigo-700/60 text-white' : 'bg-slate-800/90 border-slate-700/80 text-slate-100'
                                                    } w-60 sm:w-64 shadow-md`}>
                                                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-indigo-300 mb-2">
                                                            <IoPerson className="text-xs" /> Shared Contact
                                                        </div>
                                                        <div className="flex items-center gap-3 mb-2.5">
                                                            <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-slate-600 bg-slate-900 flex items-center justify-center">
                                                                {contact.avtar ? (
                                                                    <img
                                                                        src={contact.avtar.startsWith('data:') ? contact.avtar : `http://localhost:4000${contact.avtar}`}
                                                                        alt={contact.name}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <span className="text-sm font-bold text-slate-300">{contact.name?.charAt(0) || "U"}</span>
                                                                )}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <h4 className="text-xs sm:text-sm font-semibold truncate text-white">{contact.name}</h4>
                                                                <p className="text-[11px] text-slate-400 truncate">@{contact.userName || "user"}</p>
                                                            </div>
                                                        </div>
                                                        {contact.email && (
                                                            <p className="text-[11px] text-slate-300 truncate mb-1">✉ {contact.email}</p>
                                                        )}
                                                        {contact.phonenumber && (
                                                            <p className="text-[11px] text-slate-300 truncate mb-2.5">📞 {contact.phonenumber}</p>
                                                        )}
                                                        <button
                                                            onClick={async () => {
                                                                if (contact._id && contact._id !== user._id) {
                                                                    try {
                                                                        await MakeChat(contact._id);
                                                                        await Allchat();
                                                                    } catch (e) {
                                                                        toast.error(e.message);
                                                                    }
                                                                }
                                                            }}
                                                            className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow transition flex items-center justify-center gap-1"
                                                        >
                                                            Message Contact
                                                        </button>
                                                        {m.isEdited && <span className="text-[10px] text-slate-300 italic block mt-1">(edited)</span>}
                                                    </div>
                                                );
                                            } catch (e) {
                                                console.error("Failed to parse contact card", e);
                                            }
                                        }

                                        return (
                                            <div
                                                className={`chat-bubble rounded-2xl ${
                                                    isSender ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-800 text-slate-100 border border-slate-700/80 shadow-sm'
                                                } px-3.5 py-2 text-xs sm:text-sm leading-relaxed max-w-xs sm:max-w-md`}
                                            >
                                                {decryptedText}
                                                {m.isEdited && <span className="text-[10px] text-slate-300 italic ml-1">(edited)</span>}
                                            </div>
                                        );
                                    })()
                                )}

                                {/* Timestamp & Read Receipts */}
                                <div className={`text-[11px] text-slate-400 mt-1 flex items-center gap-1 ${isSender ? 'justify-end pr-1' : 'justify-start pl-1'}`}>
                                    <span>
                                        {new Date(m.createdAt).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </span>
                                    {isSender && (
                                        m.readBy?.filter(id => id !== user._id).length > 0 ? (
                                            <TiTick className="text-emerald-400 text-base" title="Read" />
                                        ) : (
                                            <TiTickOutline className="text-slate-400 text-base" title="Delivered" />
                                        )
                                    )}
                                </div>

                                {/* Reactions Display */}
                                {m.reactions?.length > 0 && (
                                    <div className={`flex gap-1 mt-1 ${isSender ? 'justify-end' : 'justify-start'}`}>
                                        {Object.entries(
                                            m.reactions.reduce((acc, curr) => {
                                                acc[curr.emoji] = (acc[curr.emoji] || 0) + 1;
                                                return acc;
                                            }, {})
                                        ).map(([emoji, count]) => (
                                            <span key={emoji} className="text-xs bg-slate-800 px-1.5 py-0.5 rounded-lg border border-slate-700">
                                                {emoji} {count > 1 && count}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Reaction & Edit Buttons (Hover) */}
                                <div className={`absolute top-1 ${isSender ? '-left-14' : '-right-8'} opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity flex items-center gap-0.5`}>
                                    <button
                                        className="p-1 hover:bg-slate-800 rounded-full text-slate-400 hover:text-amber-400 transition"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setReactionPopup(reactionPopup === m._id ? null : m._id);
                                        }}
                                        title="React"
                                    >
                                        <MdAddReaction className="text-base" />
                                    </button>

                                    {isSender && !m.isDeleted && m.message && !m.message.includes("[CONTACT_CARD]:::") && (
                                        <button
                                            className="p-1 hover:bg-slate-800 rounded-full text-slate-400 hover:text-indigo-400 transition"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingMsg(m);
                                            }}
                                            title="Edit message"
                                        >
                                            <FiEdit2 className="text-xs sm:text-sm" />
                                        </button>
                                    )}

                                    {/* Quick Reaction Popup */}
                                    {reactionPopup === m._id && (
                                        <div className={`absolute -top-9 ${isSender ? 'right-0' : 'left-0'} bg-slate-900 border border-slate-700 rounded-full flex gap-1 p-1 shadow-2xl z-30`}>
                                            {['👍', '❤️', '😂', '😮', '😢'].map(emoji => (
                                                <button
                                                    key={emoji}
                                                    className="hover:scale-125 transition-transform px-1 text-sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        ReactToMsg(m._id, emoji);
                                                        setReactionPopup(null);
                                                    }}
                                                >
                                                    {emoji}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            <div ref={Endmsg} />

            {/* Edit Message Modal */}
            {editingMsg && (
                <EditMessageModal
                    message={editingMsg}
                    onClose={() => setEditingMsg(null)}
                    onSave={async (newText) => {
                        await EditMsg(editingMsg._id, newText, selectedchat._id);
                        setEditingMsg(null);
                    }}
                />
            )}
        </div>

    )
}

export default AllchatMsg