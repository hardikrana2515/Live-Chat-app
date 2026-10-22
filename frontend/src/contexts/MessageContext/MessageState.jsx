import MessageContext from '../MessageContext/messageContext.js'
import { useState, useEffect, useContext } from 'react'
import API from '../Api.js'
import { toast } from 'react-toastify'
import SocketContext from '../Socket.io.Context/socket.Context.js'
import userContext from '../UserContext/userContext.js'
import { encryptMessage } from '../../utils/EncryptionUtils.js'
import { ensureChatKey } from '../../utils/cryptoKeys.js'

const MessageState = ({ children }) => {

    const [msg, setMsg] = useState({})
    // Single source of truth: the user lives in UserState (Issue 3.1)
    const { user } = useContext(userContext)
    const [Allmsg, setAllmsg] = useState([])
    const [hasMore, setHasMore] = useState(false)
    const [loadingOlder, setLoadingOlder] = useState(false)
    const [Del, setDel] = useState(false)
    const [delForEveryone, setDelForEveryone] = useState(false)
    const [editingMsg, setEditingMsg] = useState(null)
    const { socket } = useContext(SocketContext)

    const ENDPOINT = "http://localhost:4000/"

    // Clear loaded messages whenever the logged-in user changes (logout /
    // account switch) so the next account never sees stale messages (Issue 5.3)
    const userId = user?._id
    useEffect(() => {
        setAllmsg([])
        setMsg({})
    }, [userId])

    const Send = async (message, media, chatId, poll = null) => {

        const formData = new FormData();
        formData.append("message", message);
        formData.append("chatId", chatId);
        if (media) {
            formData.append("media", media);
        }
        if (poll) {
            formData.append("poll", JSON.stringify(poll));
        }

        try {
            const res = await API.post("message/sendmessage", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                withCredentials: true
            })
            setMsg(res.data.data)
            setAllmsg(prev => [...prev, res.data.data]);
            // console.log(res.data.data)
            return (res.data.data)

        } catch (e) {
            const errorMessage = e?.response?.data?.message || "Failed to send message"
            throw new Error(errorMessage)
        }
    }

    const AllMessages = async (chatId) => {

        try {
            // Resolve the conversation's E2EE key first so messages decrypt
            // as soon as they land in state (Issue 3.2)
            try { await ensureChatKey(chatId); } catch { /* legacy fallback */ }

            const res = await API.post("message/allmessages", { chatId, limit: 50 }, {
                headers: {
                    "Content-Type": "application/json"
                },
                withCredentials: true
            })
            const { messages = [], hasMore: more = false } = res.data.data || {};
            setAllmsg(messages)
            setHasMore(more)
            // Keep the "has messages" flag in sync with the opened chat,
            // otherwise an empty chat renders without its placeholder.
            setMsg(messages.length ? messages[messages.length - 1] : null)
        } catch (e) {
            const errorMessage = e?.response?.data?.message || "Failed to fetch messages"
            throw new Error(errorMessage)
        }

    }

    // Fetch the page of messages older than the current oldest one (Issue 3.4)
    const LoadOlderMessages = async (chatId) => {
        if (!chatId || !Allmsg.length || loadingOlder || !hasMore) return;
        const before = Allmsg[0]._id;
        setLoadingOlder(true);
        try {
            const res = await API.post("message/allmessages", { chatId, before, limit: 50 }, {
                headers: {
                    "Content-Type": "application/json"
                },
                withCredentials: true
            })
            const { messages = [], hasMore: more = false } = res.data.data || {};
            setHasMore(more);
            setAllmsg(prev => {
                const seen = new Set(prev.map(m => m._id));
                const older = messages.filter(m => !seen.has(m._id));
                return [...older, ...prev];
            });
        } catch (e) {
            const errorMessage = e?.response?.data?.message || "Failed to load older messages"
            toast.error(errorMessage);
        } finally {
            setLoadingOlder(false);
        }
    }

    const DeleteMsg = async (messageId, forEveryone, chatId) => {
        try {
            await API.post("message/deleteMessage", { messageId, forEveryone }, {
                headers: {
                    "Content-Type": "application/json"
                },
                withCredentials: true
            })

            // Update local state
            if (forEveryone) {
                setAllmsg(prev => prev.map(m => m._id === messageId ? { ...m, isDeleted: true, message: "", media: "", poll: null } : m));
            } else {
                setAllmsg(prev => prev.filter(m => m._id !== messageId));
            }

            if (socket.current && chatId) {
                socket.current.emit("delete message", { messageId, chatId, forEveryone });
            }
            toast.success(forEveryone ? "Message deleted for everyone" : "Message deleted for you");
        } catch (e) {
            const errorMessage = e?.response?.data?.message || "Failed to delete message";
            toast.error(errorMessage);
            throw new Error(errorMessage);
        }
    }

    const ReadBy = async (messageIdOrIds, chatId) => {
        try {
            const isBatch = Array.isArray(messageIdOrIds);
            const body = isBatch ? { messageIds: messageIdOrIds } : { messageId: messageIdOrIds };
            const res = await API.put("message/markread", body, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: user.token
                },
                withCredentials: true
            });
            const data = res.data.data;
            const myId = user._id;

            // Update local state
            setAllmsg(prev => prev.map(m => {
                const isTarget = isBatch ? messageIdOrIds.includes(m._id) : m._id === messageIdOrIds;
                if (isTarget) {
                    const existing = m.readBy || [];
                    if (!existing.some(id => String(id?._id ?? id) === String(myId))) {
                        return { ...m, readBy: [...existing, myId] };
                    }
                }
                return m;
            }));

            // Emit live socket event to notify other participants immediately
            if (socket.current) {
                socket.current.emit("messages read", {
                    messageIds: isBatch ? messageIdOrIds : [messageIdOrIds],
                    readerId: myId,
                    chatId
                });
            }
            return data;
        } catch (e) {
            const errorMessage = e?.response?.data?.message || "Failed to mark message as read";
            console.error(errorMessage);
        }
    };

    const ReactToMsg = async (messageId, emoji) => {
        try {
            const res = await API.put("message/react", { messageId, emoji }, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: user.token
                },
                withCredentials: true
            })
            // Update local state
            setAllmsg(prev => prev.map(m => m._id === messageId ? res.data.data : m));

            // Emit socket event
            if (socket.current) {
                socket.current.emit("new reaction", res.data.data);
            }

        } catch (e) {
            const errorMessage = e?.response?.data?.message || "Failed to react"
            toast.error(errorMessage);
        }
    }

    const VotePoll = async (messageId, optionIndex) => {
        try {
            const res = await API.put("message/vote", { messageId, optionIndex }, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: user.token
                },
                withCredentials: true
            })
            // Update local state
            setAllmsg(prev => prev.map(m => m._id === messageId ? res.data.data : m));

            // Emit socket event
            if (socket.current) {
                socket.current.emit("poll update", res.data.data);
            }
            toast.success("Vote recorded");

        } catch (e) {
            const errorMessage = e?.response?.data?.message || "Failed to vote"
            toast.error(errorMessage);
        }
    }

    const EditMsg = async (messageId, newContent, chatId) => {
        try {
            const encryptedMessage = await encryptMessage(newContent, chatId);
            const res = await API.put("message/editMessage", { messageId, message: encryptedMessage }, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: user.token
                },
                withCredentials: true
            });

            const updatedMsg = res.data.data;
            setAllmsg(prev => prev.map(m => m._id === messageId ? updatedMsg : m));

            if (socket.current) {
                socket.current.emit("edit message", updatedMsg);
            }
            toast.success("Message edited successfully");
            return updatedMsg;
        } catch (e) {
            const errorMessage = e?.response?.data?.message || "Failed to edit message";
            toast.error(errorMessage);
            throw new Error(errorMessage);
        }
    };

    return (
        <MessageContext.Provider value={{
            Send, msg, setMsg, AllMessages, setAllmsg, Allmsg,
            DeleteMsg, Del, setDel, ReadBy, ENDPOINT, ReactToMsg, VotePoll, EditMsg,
            editingMsg, setEditingMsg, delForEveryone, setDelForEveryone,
            hasMore, LoadOlderMessages, loadingOlder
        }}>
            {children}
        </MessageContext.Provider>
    )
}

export default MessageState