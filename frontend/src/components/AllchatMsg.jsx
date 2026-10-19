import { useContext, useState, useEffect, useRef } from 'react';
import { MdAddReaction } from "react-icons/md";
import { FiEdit2, FiCopy, FiTrash2, FiGlobe } from "react-icons/fi";
import { IoPerson, IoCall, IoVideocam, IoVideocamOff, IoCheckmarkDone, IoCheckmark } from "react-icons/io5";
import { toast } from 'react-toastify';
import messageContext from '../contexts/MessageContext/messageContext';
import chatContext from '../contexts/ChatContext/chatcontext';
import AudioMessage from './AudioMessage';
import { decryptMessage } from '../utils/EncryptionUtils';
import PollMessage from './PollMessage';
import EncryptedAttachment from './EncryptedAttachment';
import EditMessageModal from './EditMessageModal';

const formatCallDuration = (seconds) => {
    if (!seconds || seconds <= 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

/* Single row of the right-click message menu */
const MenuRow = ({ icon, label, danger, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
            danger
                ? 'text-[var(--c-danger)] hover:bg-[var(--c-danger-10)]'
                : 'text-[var(--c-text)] hover:bg-[var(--c-hover)]'
        }`}
    >
        <span className="text-base shrink-0">{icon}</span>
        {label}
    </button>
);

const AllchatMsg = ({ onStartCall }) => {
    const { AllMessages, Allmsg, msg, setMsg, DeleteMsg, Del, setDel, ReadBy, ReactToMsg, EditMsg, editingMsg, setEditingMsg, setDelForEveryone, hasMore, LoadOlderMessages, loadingOlder } = useContext(messageContext);
    const { user, selectedchat, isAuthReady, MakeChat, Allchat } = useContext(chatContext); // Use isAuthReady

    const [reactionPopup, setReactionPopup] = useState(null); // stores messageId of open popup
    const [ctxMenu, setCtxMenu] = useState(null); // { x, y, m } right-click menu

    const Endmsg = useRef(null);
    const scrollRef = useRef(null); // scroll container
    // When prepending older messages, remember where the user was scrolled to
    // so the viewport doesn't jump to the bottom. (Issue 3.4)
    const anchorRef = useRef(null);
    // Message ids we already fired a mark-read request for (prevents duplicate
    // requests while the request is still in flight or in StrictMode double-renders)
    const markedReadRef = useRef(new Set());

    const scrollToBottom = () => {
        (Endmsg.current?.scrollIntoView({ behavior: 'smooth' }))

    }

    // Resolve the owning chat id for a message (message payloads come with
    // either a populated `chatId`, a `chat` alias, or neither) for E2EE keys
    const chatIdOf = (m) => m?.chatId?._id ?? m?.chatId ?? m?.chat?._id ?? m?.chat ?? selectedchat?._id;

    useEffect(() => {
        const anchor = anchorRef.current;
        const el = scrollRef.current;
        if (anchor && el) {
            // Restore the pre-prepend scroll offset
            el.scrollTop = el.scrollHeight - anchor.sh + anchor.st;
            anchorRef.current = null;
        } else {
            scrollToBottom();
        }
    }, [Allmsg, selectedchat])

    useEffect(() => {
        if (isAuthReady && selectedchat) {
            AllMessages(selectedchat._id)
        }

    }, [selectedchat, isAuthReady])

    useEffect(() => {
        if (!user?._id) return;
        const unreadIds = [];
        Allmsg.forEach((M) => {
            if (M.isDeleted) return; // no point marking deleted messages as read
            const alreadyRead = M.readBy?.some(id => String(id?._id ?? id) === String(user._id));
            if (alreadyRead || markedReadRef.current.has(M._id)) return;
            markedReadRef.current.add(M._id);
            unreadIds.push(M._id);
        });
        if (unreadIds.length > 0) {
            ReadBy(unreadIds, selectedchat?._id);
        }
    }, [user, Allmsg, selectedchat])

    // Close the right-click menu on outside click, scroll or Escape
    useEffect(() => {
        if (!ctxMenu) return;
        const onDown = (e) => {
            // Keep the menu alive while clicking its own rows (click fires after mousedown)
            if (e.target.closest?.('[data-ctx-menu]')) return;
            setCtxMenu(null);
        };
        const onScroll = () => setCtxMenu(null);
        const onKey = (e) => { if (e.key === 'Escape') setCtxMenu(null); };
        document.addEventListener('mousedown', onDown);
        document.addEventListener('scroll', onScroll, true);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onDown);
            document.removeEventListener('scroll', onScroll, true);
            document.removeEventListener('keydown', onKey);
        };
    }, [ctxMenu]);


    const handleLoadOlder = async () => {
        const el = scrollRef.current;
        if (el) anchorRef.current = { sh: el.scrollHeight, st: el.scrollTop };
        try {
            await LoadOlderMessages(selectedchat._id);
        } catch {
            anchorRef.current = null;
        }
    };

    return (
        <div ref={scrollRef} className="flex-1 w-full p-3 sm:p-4 h-full overflow-y-auto overflow-x-hidden no-scrollbar">
            {!msg ? (
                <p className="text-[var(--c-text-2)] text-center mt-10">No messages yet...</p>
            ) : (
                <div className="flex flex-col gap-4 text-sm text-[var(--c-text)]">
                    {/* Pagination: fetch older history on demand (Issue 3.4) */}
                    {hasMore && (
                        <div className="flex justify-center">
                            <button
                                onClick={handleLoadOlder}
                                disabled={loadingOlder}
                                className="text-xs font-medium px-4 py-1.5 rounded-full bg-[var(--c-surface)] hover:bg-[var(--c-raised)] border border-[var(--c-line)] text-[var(--c-text-2)] hover:text-[var(--c-text)] transition disabled:opacity-60"
                            >
                                {loadingOlder ? 'Loading…' : 'Load earlier messages'}
                            </button>
                        </div>
                    )}
                    {Allmsg.map((m) => {
                        const sender = m.Sender || {};
                        const isSender = (sender._id || m.Sender) === user._id;
                        if (m.deletedFor?.includes(user._id)) return null;

                        return (
                            <div
                                key={m._id}
                                className={`chat ${isSender ? 'chat-end' : 'chat-start'} px-2 sm:px-3 group relative my-0.5`}
                                onContextMenu={(e) => {
                                    e.preventDefault();
                                    if (m.isDeleted) return;
                                    setReactionPopup(null);
                                    const MENU_W = 220, MENU_H = 280;
                                    setCtxMenu({
                                        x: Math.max(8, Math.min(e.clientX, window.innerWidth - MENU_W)),
                                        y: Math.max(8, Math.min(e.clientY, window.innerHeight - MENU_H)),
                                        m,
                                    });
                                }}
                            >
                                {/* Avatar */}
                                <div className="chat-image avatar">
                                    <div className="w-8 sm:w-9 rounded-full">
                                        <img
                                            alt={sender.name || "User"}
                                            src={
                                                sender.avtar?.startsWith("data:image")
                                                    ? sender.avtar
                                                    : sender.avtar
                                                        ? `http://localhost:4000${sender.avtar}`
                                                        : "/avtar.png"
                                            }
                                            className="object-cover border border-[var(--c-line)]"
                                        />
                                    </div>
                                </div>

                                {/* Bubble */}
                                {(m.poll && m.poll.question) ? (
                                    <PollMessage message={m} />
                                ) : (m.message.trim() === '' && m.media.trim() === '') ? (
                                    <div
                                        className={`chat-bubble rounded-2xl ${
                                            isSender ? 'bg-[var(--c-surface)] border border-[var(--c-line)] text-[var(--c-link)]' : 'bg-[var(--c-surface-80)] border border-[var(--c-line)] text-[var(--c-text-2)]'
                                        } italic text-xs max-w-xs sm:max-w-md shadow-sm`}
                                    >
                                        This message was deleted
                                    </div>
                                ) : m.media ? (
                                    <div
                                        className={`chat-bubble rounded-2xl ${
                                            isSender ? 'bg-[var(--c-primary)] text-[var(--c-text)] shadow-md' : 'bg-[var(--c-surface)] text-[var(--c-text)] border border-[var(--c-line)] shadow-sm'
                                        } p-2 max-w-xs sm:max-w-md`}
                                    >
                                        {(() => {
                                            const fileUrl = `http://localhost:4000${m.media}`;
                                            let fileExt = m.media.split('.').pop().toLowerCase();
                                            if (fileExt === 'enc') {
                                                const parts = m.media.split('.');
                                                if (parts.length > 1) fileExt = parts[parts.length - 2].toLowerCase();
                                            }

                                            return <EncryptedAttachment url={fileUrl} type={fileExt} alt="Shared Media" chatId={chatIdOf(m)} />;
                                        })()}

                                        {/* Optional message under media */}
                                        {m.message && (
                                            <p className="mt-2 text-xs sm:text-sm">
                                                {decryptMessage(m.message, chatIdOf(m))}
                                                {m.isEdited && <span className="text-[11px] text-[var(--c-text-2)] italic ml-1">(edited)</span>}
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    (() => {
                                        const decryptedText = decryptMessage(m.message, chatIdOf(m));
                                        if (decryptedText.startsWith("[CALL_LOG]:::")) {
                                            try {
                                                const callLog = JSON.parse(decryptedText.replace("[CALL_LOG]:::", ""));
                                                const isVideo = callLog.type === 'video';
                                                const isMissed = callLog.status === 'missed' || callLog.status === 'declined';

                                                return (
                                                    <div className={`p-3.5 rounded-2xl border ${
                                                        isSender
                                                            ? 'bg-[var(--c-surface)] border-[var(--c-line)] text-[var(--c-text)]'
                                                            : 'bg-[var(--c-surface-80)] border-[var(--c-line)] text-[var(--c-text)]'
                                                    } min-w-[210px] sm:min-w-[250px] shadow-sm select-none`}>
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                                                                isMissed
                                                                    ? 'bg-red-500/15 text-red-500 border border-red-500/30'
                                                                    : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                                            }`}>
                                                                {isVideo ? (
                                                                    isMissed ? <IoVideocamOff className="text-lg" /> : <IoVideocam className="text-lg" />
                                                                ) : (
                                                                    isMissed ? <IoCall className="text-lg rotate-[135deg]" /> : <IoCall className="text-lg" />
                                                                )}
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex items-center gap-1.5">
                                                                    <span className="text-xs sm:text-sm font-semibold truncate text-[var(--c-text)]">
                                                                        {isMissed
                                                                            ? `Missed ${isVideo ? 'video' : 'voice'} call`
                                                                            : `${isVideo ? 'Video' : 'Voice'} call`}
                                                                    </span>
                                                                </div>
                                                                <p className="text-[11px] text-[var(--c-text-2)] mt-0.5">
                                                                    {isMissed ? 'No answer' : (callLog.duration ? `${formatCallDuration(callLog.duration)}` : 'Call ended')}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {onStartCall && !selectedchat?.isGroup && (
                                                            <button
                                                                onClick={() => onStartCall(callLog.type || 'video')}
                                                                className="mt-2.5 w-full py-1.5 px-3 rounded-xl bg-[var(--c-hover)] hover:bg-[var(--c-primary)] hover:text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5 border border-[var(--c-line)] text-[var(--c-text)]"
                                                            >
                                                                {isVideo ? <IoVideocam className="text-xs" /> : <IoCall className="text-xs" />}
                                                                <span>Call back</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                );
                                            } catch (e) {
                                                console.error("Failed to parse call log", e);
                                            }
                                        }

                                        if (decryptedText.startsWith("[CONTACT_CARD]:::")) {
                                            try {
                                                const contact = JSON.parse(decryptedText.replace("[CONTACT_CARD]:::", ""));
                                                return (
                                                    <div className={`p-3.5 rounded-2xl border ${
                                                        isSender ? 'bg-[var(--c-surface)] border-[var(--c-line)] text-[var(--c-text)]' : 'bg-[var(--c-surface-80)] border-[var(--c-line)] text-[var(--c-text)]'
                                                    } w-60 sm:w-64 shadow-md`}>
                                                        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--c-link)] mb-2">
                                                            <IoPerson className="text-xs" /> Shared Contact
                                                        </div>
                                                        <div className="flex items-center gap-3 mb-2.5">
                                                            <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-[var(--c-line)] bg-[var(--c-panel)] flex items-center justify-center">
                                                                {contact.avtar ? (
                                                                    <img
                                                                        src={contact.avtar.startsWith('data:') ? contact.avtar : `http://localhost:4000${contact.avtar}`}
                                                                        alt={contact.name}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <span className="text-sm font-bold text-[var(--c-text-2)]">{contact.name?.charAt(0) || "U"}</span>
                                                                )}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <h4 className="text-xs sm:text-sm font-semibold truncate text-[var(--c-text)]">{contact.name}</h4>
                                                                <p className="text-[11px] text-[var(--c-text-2)] truncate">@{contact.userName || "user"}</p>
                                                            </div>
                                                        </div>
                                                        {contact.email && (
                                                            <p className="text-[11px] text-[var(--c-text-2)] truncate mb-1">✉ {contact.email}</p>
                                                        )}
                                                        {contact.phonenumber && (
                                                            <p className="text-[11px] text-[var(--c-text-2)] truncate mb-2.5">📞 {contact.phonenumber}</p>
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
                                                            className="w-full py-1.5 bg-[var(--c-primary)] hover:bg-[var(--c-primary-hover)] text-[var(--c-text)] text-xs font-semibold rounded-xl shadow transition flex items-center justify-center gap-1"
                                                        >
                                                            Message Contact
                                                        </button>
                                                        {m.isEdited && <span className="text-[11px] text-[var(--c-text-2)] italic block mt-1">(edited)</span>}
                                                    </div>
                                                );
                                            } catch (e) {
                                                console.error("Failed to parse contact card", e);
                                            }
                                        }

                                        return (
                                            <div
                                                className={`chat-bubble rounded-2xl ${
                                                    isSender ? 'bg-[var(--c-primary)] text-[var(--c-text)] shadow-md' : 'bg-[var(--c-surface)] text-[var(--c-text)] border border-[var(--c-line)] shadow-sm'
                                                } px-3.5 py-2 text-xs sm:text-sm leading-relaxed max-w-xs sm:max-w-md`}
                                            >
                                                {decryptedText}
                                                {m.isEdited && <span className="text-[11px] text-[var(--c-text-2)] italic ml-1">(edited)</span>}
                                            </div>
                                        );
                                    })()
                                )}

                                {/* Timestamp & Read Receipts */}
                                <div className={`text-[11px] text-[var(--c-text-2)] mt-1 flex items-center gap-1 ${isSender ? 'justify-end pr-10 sm:pr-11' : 'justify-start pl-11 sm:pl-12'}`}>
                                    <span>
                                        {new Date(m.createdAt).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </span>
                                    {isSender && (
                                        m.readBy?.some(id => String(id?._id ?? id) !== String(user._id)) ? (
                                            <span className="flex items-center text-[#38bdf8]" title="Read">
                                                <IoCheckmarkDone className="text-base" />
                                            </span>
                                        ) : (
                                            <span className="flex items-center text-[var(--c-text-3)] opacity-75" title="Delivered">
                                                <IoCheckmarkDone className="text-base" />
                                            </span>
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
                                            <span key={emoji} className="text-xs bg-[var(--c-surface)] px-1.5 py-0.5 rounded-lg border border-[var(--c-line)]">
                                                {emoji} {count > 1 && count}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Quick Reaction Popup (opened from the right-click menu) */}
                                {reactionPopup === m._id && (
                                    <div className={`absolute -top-10 ${isSender ? 'right-2' : 'left-11'} bg-[var(--c-panel)] border border-[var(--c-line)] rounded-full flex gap-1 p-1 shadow-2xl z-30`}>
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
                        );
                    })}
                </div>
            )}
            <div ref={Endmsg} />

            {/* Right-click message menu */}
            {ctxMenu && (
                (() => {
                    const m = ctxMenu.m;
                    const isOwn = (m.Sender?._id || m.Sender) === user._id;
                    const withinOneHour = m.createdAt
                        ? (Date.now() - new Date(m.createdAt).getTime()) < 60 * 60 * 1000
                        : false;
                    const hasText = !!m.message && !m.message.includes('[CONTACT_CARD]:::');
                    const canTimeEdit = isOwn && withinOneHour && hasText && !m.isDeleted;

                    const close = () => setCtxMenu(null);

                    return (
                        <div
                            data-ctx-menu
                            onContextMenu={(e) => e.preventDefault()}
                            className="fixed z-50 min-w-[220px] py-1.5 rounded-xl border border-[var(--c-line)] bg-[var(--c-panel)] shadow-2xl animate-fadeIn overflow-hidden"
                            style={{ left: ctxMenu.x, top: ctxMenu.y }}
                        >
                            <MenuRow
                                icon={<MdAddReaction />}
                                label="React"
                                onClick={() => { setReactionPopup(m._id); close(); }}
                            />
                            {hasText && !m.isDeleted && (
                                <MenuRow
                                    icon={<FiCopy />}
                                    label="Copy"
                                    onClick={() => {
                                        navigator.clipboard?.writeText(decryptMessage(m.message, chatIdOf(m)))
                                            .then(() => toast.info('Message copied'))
                                            .catch(() => toast.error('Could not copy'));
                                        close();
                                    }}
                                />
                            )}
                            {canTimeEdit && (
                                <MenuRow
                                    icon={<FiEdit2 />}
                                    label="Edit message"
                                    onClick={() => { setEditingMsg(m); close(); }}
                                />
                            )}

                            <div className="my-1.5 h-px bg-[var(--c-line-50)]" />

                            <MenuRow
                                icon={<FiTrash2 />}
                                label="Delete"
                                danger
                                onClick={() => { setMsg(m); setDelForEveryone(false); setDel(true); close(); }}
                            />
                            {isOwn && withinOneHour && !m.isDeleted && (
                                <MenuRow
                                    icon={<FiGlobe />}
                                    label="Delete for everyone"
                                    danger
                                    onClick={() => { setMsg(m); setDelForEveryone(true); setDel(true); close(); }}
                                />
                            )}
                        </div>
                    );
                })()
            )}

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