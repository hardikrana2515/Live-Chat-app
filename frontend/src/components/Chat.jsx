import { useContext, useEffect } from 'react'
import chatContext from '../contexts/ChatContext/chatcontext'
import SocketContext from '../contexts/Socket.io.Context/socket.Context'
import { decryptMessage } from '../utils/EncryptionUtils'
import { registerChat, clearChatKey, dropChat } from '../utils/cryptoKeys'
import { toast } from 'react-toastify'
import { IoPerson, IoImage, IoVideocam, IoDocumentText, IoMic, IoCall } from 'react-icons/io5'

// Helper to detect if a conversation has unread incoming messages for current user
export const isChatUnread = (c, currentUserId) => {
    if (!c || !c.lastMessage) return false;
    const lastMsg = c.lastMessage;
    if (lastMsg.isDeleted) return false;

    const senderId = (lastMsg.Sender?._id || lastMsg.Sender)?.toString();
    const myId = currentUserId?.toString();
    if (!senderId || !myId) return false;
    if (senderId === myId) return false; // Self sent messages are not unread

    const readBy = lastMsg.readBy || [];
    const isRead = readBy.some(id => (id?._id || id)?.toString() === myId);
    return !isRead;
};

const Chat = ({ filter = 'all' }) => {
    const { user, chat, Allchat, setSelectedchat, selectedchat, setChat, healGroupKeys } = useContext(chatContext)
    const { socket, onlineUsers, isConnected } = useContext(SocketContext)

    useEffect(() => {
        Allchat();
    }, []);

    useEffect(() => {
        if (!socket?.current) return;

        const handleNewMessage = (newMsg) => {
            const chatId = newMsg.chat?._id || newMsg.chat;
            if (setChat) {
                setChat((prevChats) => {
                    if (!prevChats) return prevChats;
                    return prevChats.map((c) => {
                        if (c._id === chatId) {
                            return { ...c, lastMessage: newMsg, updatedAt: new Date().toISOString() };
                        }
                        return c;
                    }).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                });
            }
        };

        const handleMessageEdited = (updatedMsg) => {
            const chatId = updatedMsg.chatId?._id || updatedMsg.chatId || updatedMsg.chat?._id || updatedMsg.chat;
            if (setChat) {
                setChat((prevChats) => {
                    if (!prevChats) return prevChats;
                    return prevChats.map((c) => {
                        if (c._id === chatId && c.lastMessage?._id === updatedMsg._id) {
                            return { ...c, lastMessage: updatedMsg };
                        }
                        return c;
                    });
                });
            }
        };

        const handleMessageDeleted = ({ messageId }) => {
            if (setChat) {
                setChat((prevChats) => {
                    if (!prevChats) return prevChats;
                    return prevChats.map((c) => {
                        if (c.lastMessage?._id === messageId) {
                            return {
                                ...c,
                                lastMessage: {
                                    ...c.lastMessage,
                                    isDeleted: true,
                                    message: "",
                                    media: "",
                                    poll: null
                                }
                            };
                        }
                        return c;
                    });
                });
            }
        };

        // Group lifecycle events (created/renamed/members added/removed/roles/deleted)
        const handleGroupUpdated = ({ chatId, action, chat: updatedGroup, actorId, addedUserIds, removedUserId } = {}) => {
            const myId = user?._id;
            const isMe = (id) => Boolean(id) && String(id) === String(myId);

            // E2EE bookkeeping (Issue 3.2): membership/keys may have changed,
            // so drop the cached conversation key (it will be re-derived from
            // the fresh chat doc) or forget deleted chats entirely.
            if (action === 'deleted') {
                dropChat(chatId);
            } else {
                if (['member removed', 'member left', 'keys changed'].includes(action)) {
                    clearChatKey(chatId);
                }
                if (updatedGroup) registerChat(updatedGroup);
            }

            // Always refresh the sidebar list from the server
            Allchat();

            // Keep the currently open chat in sync (or close it if I no longer belong)
            if (selectedchat?._id === chatId) {
                if (action === 'deleted' || action === 'member removed') {
                    if (action === 'member removed' && !isMe(removedUserId)) {
                        // Someone else was removed — just refresh member list
                        if (updatedGroup) setSelectedchat(prev => (prev?._id === chatId ? { ...prev, ...updatedGroup } : prev));
                    } else {
                        setSelectedchat(null);
                        if (action === 'member removed') toast.info('You were removed from the group');
                    }
                } else if (updatedGroup) {
                    setSelectedchat(prev => (prev?._id === chatId ? { ...prev, ...updatedGroup } : prev));
                }
            } else if (action === 'member removed' && isMe(removedUserId)) {
                toast.info('You were removed from the group');
            }

            // Light notifications for changes involving me
            if (action === 'created' && !isMe(actorId)) {
                toast.info(`You were added to group "${updatedGroup?.chatname || 'New Group'}"`);
            }
            if (action === 'members added' && Array.isArray(addedUserIds) && addedUserIds.some(isMe) && !isMe(actorId)) {
                toast.info(`You were added to "${updatedGroup?.chatname || 'a group'}"`);
            }
            if (action === 'deleted' && !isMe(actorId)) {
                toast.info(`Group "${updatedGroup?.chatname || 'conversation'}" was deleted`);
            }
        };

        const handleMessagesRead = ({ messageIds, readerId, chatId }) => {
            if (setChat) {
                setChat(prevChats => {
                    if (!prevChats) return prevChats;
                    return prevChats.map(c => {
                        if (c._id === chatId && c.lastMessage && (!messageIds || messageIds.includes(c.lastMessage._id))) {
                            const existing = c.lastMessage.readBy || [];
                            if (!existing.some(id => String(id?._id ?? id) === String(readerId))) {
                                return {
                                    ...c,
                                    lastMessage: {
                                        ...c.lastMessage,
                                        readBy: [...existing, readerId]
                                    }
                                };
                            }
                        }
                        return c;
                    });
                });
            }
        };

        const handleGroupKeyRequested = async ({ chatId, userId: reqUid }) => {
            if (!chatId || String(reqUid) === String(user?._id)) return;
            const targetChat = (chat || []).find(c => c._id === chatId) || (selectedchat?._id === chatId ? selectedchat : null);
            if (targetChat && healGroupKeys) {
                await healGroupKeys(targetChat, reqUid);
            }
        };

        const handleLocalKeyRequest = (e) => {
            const { chatId, userId } = e.detail || {};
            if (chatId && socket?.current) {
                socket.current.emit("request group key", { chatId, userId: userId || user?._id });
            }
        };
        window.addEventListener('talkyy:request-group-key', handleLocalKeyRequest);

        socket.current.on("message received", handleNewMessage);
        socket.current.on("message edited", handleMessageEdited);
        socket.current.on("message deleted", handleMessageDeleted);
        socket.current.on("group updated", handleGroupUpdated);
        socket.current.on("messages read", handleMessagesRead);
        socket.current.on("group key requested", handleGroupKeyRequested);

        return () => {
            window.removeEventListener('talkyy:request-group-key', handleLocalKeyRequest);
            if (socket.current) {
                socket.current.off("message received", handleNewMessage);
                socket.current.off("message edited", handleMessageEdited);
                socket.current.off("message deleted", handleMessageDeleted);
                socket.current.off("group updated", handleGroupUpdated);
                socket.current.off("messages read", handleMessagesRead);
                socket.current.off("group key requested", handleGroupKeyRequested);
            }
        };
    }, [socket, isConnected, setChat, Allchat, setSelectedchat, selectedchat, user, healGroupKeys, chat]);


    const getOtherUser = (loggedInUser, members) => {
        if (!members || !Array.isArray(members)) return null;
        return members.find((m) => m && m._id !== loggedInUser?._id) || null;
    };

    const isOnline = (userId) => {
        if (!userId) return false;
        return onlineUsers.includes(userId);
    }

    const renderMessagePreview = (lastMessage, chatId) => {
        if (!lastMessage) return "No messages yet";
        if (lastMessage.isDeleted) {
            return <span className="italic text-[var(--c-text-3)]">This message was deleted</span>;
        }
        if (lastMessage.poll && lastMessage.poll.question) {
            return (
                <span className="inline-flex items-center gap-1 truncate max-w-full">
                    <span className="text-[var(--c-info)] shrink-0 font-medium">📊</span>
                    <span className="truncate">Poll: {decryptMessage(lastMessage.poll.question, chatId)}</span>
                </span>
            );
        }
        if (lastMessage.media) {
            const lowerMedia = (lastMessage.media || "").toLowerCase();
            if (lowerMedia.includes('voice') || lowerMedia.endsWith('.webm') || lowerMedia.endsWith('.mp3') || lowerMedia.endsWith('.wav') || lowerMedia.endsWith('.m4a') || lowerMedia.endsWith('.ogg')) {
                return (
                    <span className="inline-flex items-center gap-1 truncate max-w-full">
                        <IoMic className="text-[var(--c-accent)] shrink-0 text-xs" />
                        <span className="truncate">Voice message</span>
                    </span>
                );
            } else if (lowerMedia.match(/\.(jpg|jpeg|png|webp|gif)/)) {
                return (
                    <span className="inline-flex items-center gap-1 truncate max-w-full">
                        <IoImage className="text-[var(--c-accent)] shrink-0 text-xs" />
                        <span className="truncate">Photo</span>
                    </span>
                );
            } else if (lowerMedia.match(/\.(mp4|mov|mkv)/)) {
                return (
                    <span className="inline-flex items-center gap-1 truncate max-w-full">
                        <IoVideocam className="text-[var(--c-accent)] shrink-0 text-xs" />
                        <span className="truncate">Video</span>
                    </span>
                );
            }
            return (
                <span className="inline-flex items-center gap-1 truncate max-w-full">
                    <IoDocumentText className="text-[var(--c-accent)] shrink-0 text-xs" />
                    <span className="truncate">Attachment</span>
                </span>
            );
        }

        if (lastMessage.message) {
            const text = decryptMessage(lastMessage.message, chatId);
            if (!text) return "No messages yet";

            if (text.startsWith("[CALL_LOG]:::")) {
                try {
                    const callLog = JSON.parse(text.replace("[CALL_LOG]:::", ""));
                    const isVideo = callLog.type === 'video';
                    const isMissed = callLog.status === 'missed' || callLog.status === 'declined';
                    return (
                        <span className="inline-flex items-center gap-1.5 truncate max-w-full">
                            {isMissed ? (
                                <span className="text-[var(--c-danger)] shrink-0 font-medium text-xs">📵</span>
                            ) : isVideo ? (
                                <IoVideocam className="text-[var(--c-link)] shrink-0 text-xs" />
                            ) : (
                                <IoCall className="text-[var(--c-link)] shrink-0 text-xs" />
                            )}
                            <span className={isMissed ? 'text-[var(--c-danger)] font-medium truncate' : 'text-[var(--c-text)] truncate'}>
                                {callLog.isGroup
                                    ? `Group ${isVideo ? 'video' : 'voice'} call`
                                    : isMissed
                                        ? `Missed ${isVideo ? 'video' : 'voice'} call`
                                        : `${isVideo ? 'Video' : 'Voice'} call`}
                            </span>
                        </span>
                    );
                } catch {
                    return "Call";
                }
            }

            if (text.startsWith("[CONTACT_CARD]:::")) {
                try {
                    const contact = JSON.parse(text.replace("[CONTACT_CARD]:::", ""));
                    return (
                        <span className="inline-flex items-center gap-1 truncate max-w-full">
                            <IoPerson className="text-[var(--c-link)] shrink-0 text-xs" />
                            <span className="text-[var(--c-link)] font-semibold shrink-0">Contact:</span>
                            <span className="text-[var(--c-text)] truncate">{contact.name || contact.userName || "Shared Contact"}</span>
                        </span>
                    );
                } catch {
                    return (
                        <span className="inline-flex items-center gap-1 text-[var(--c-link)] truncate max-w-full">
                            <IoPerson className="text-[var(--c-link)] shrink-0 text-xs" />
                            <span>Shared Contact</span>
                        </span>
                    );
                }
            }

            return text;
        }

        return "No messages yet";
    };

    const handleChatClick = (c) => {
        setSelectedchat(c);
        // Optimistically clear the unread indicator for this chat immediately
        if (c?.lastMessage && user?._id && isChatUnread(c, user._id)) {
            const myId = user._id.toString();
            setChat(prevChats => {
                if (!prevChats) return prevChats;
                return prevChats.map(item => {
                    if (item._id === c._id && item.lastMessage) {
                        return {
                            ...item,
                            lastMessage: {
                                ...item.lastMessage,
                                readBy: [...(item.lastMessage.readBy || []), myId]
                            }
                        };
                    }
                    return item;
                });
            });
        }
    };

    const filteredChats = filter === 'unread'
        ? (chat || []).filter(c => isChatUnread(c, user?._id))
        : (chat || []);

    return (
        <div className="w-full">
            {filteredChats && filteredChats.length > 0 ? (
                <div className="flex flex-col gap-1 w-full pb-2">
                    {filteredChats.map((c) => {
                        const otherUser = !c.isGroup ? getOtherUser(user, c.members) : null;
                        const online = otherUser ? isOnline(otherUser._id) : false;
                        const isSelected = selectedchat?._id === c._id;
                        const isUnread = isChatUnread(c, user?._id);

                        return (
                            <div
                                key={c._id}
                                onClick={() => handleChatClick(c)}
                                className={`chat-row ${isSelected ? 'is-active' : ''}`}
                            >
                                <div className="relative shrink-0">
                                    <img
                                        src={
                                            c.isGroup
                                                ? c.groupIcon
                                                    ? `http://localhost:4000${c.groupIcon}`
                                                    : "/group.png"
                                                : otherUser?.avtar?.startsWith("data:image")
                                                    ? otherUser.avtar
                                                    : otherUser?.avtar
                                                        ? `http://localhost:4000${otherUser.avtar}`
                                                        : "/avtar.png"
                                        }
                                        alt={
                                            c.isGroup
                                                ? c.chatname
                                                : otherUser?.userName || "User"
                                        }
                                        className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover avatar-ring"
                                    />
                                    {online && <span className="presence-dot border-[var(--c-panel)]" />}
                                </div>

                                <div className="flex flex-col justify-center overflow-hidden flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-1">
                                        <h3 className={`text-xs sm:text-sm truncate leading-tight ${isUnread ? 'font-bold text-[var(--c-text)]' : 'font-semibold text-[var(--c-text)]'}`}>
                                            {c.isGroup
                                                ? c.chatname
                                                : otherUser?.name || "Unknown User"}
                                        </h3>
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            {c.isGroup && (
                                                <span className="chip shrink-0">Group</span>
                                            )}
                                            {isUnread && (
                                                <span
                                                    className="relative flex h-2.5 w-2.5 shrink-0"
                                                    title="Unread message"
                                                >
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#22c55e] shadow-[0_0_8px_#22c55e]"></span>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className={`text-xs truncate mt-0.5 overflow-hidden ${isUnread ? 'text-[var(--c-text)] font-semibold' : 'text-[var(--c-text-3)]'}`}>
                                        {renderMessagePreview(c.lastMessage, c._id)}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-10 px-4 text-[var(--c-text-3)] text-xs">
                    {filter === 'unread'
                        ? "No unread messages."
                        : "No active conversations. Search a user to connect."}
                </div>
            )}
        </div>
    );
};




export default Chat
