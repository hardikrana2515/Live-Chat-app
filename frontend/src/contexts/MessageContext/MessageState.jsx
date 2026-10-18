
import messageContext from '../MessageContext/messageContext.js'
import { useState, useEffect, useContext } from 'react'
import { useNavigate } from "react-router-dom"
import API from '../Api.js'
import { toast } from 'react-toastify'
import SocketContext from '../Socket.io.Context/socket.Context.js'
import { encryptMessage } from '../../utils/EncryptionUtils.js'

const MessageState = ({ children }) => {

    const [msg, setMsg] = useState({})
    const [user, setUser] = useState({})
    const [Allmsg, setAllmsg] = useState([])
    const [Del, setDel] = useState(false)
    const [editingMsg, setEditingMsg] = useState(null)
    const navigate = useNavigate()
    const { socket } = useContext(SocketContext)

    const ENDPOINT = "http://localhost:4000/"

    useEffect(() => {
        const userinfo = JSON.parse(localStorage.getItem("userInfo"))
        setUser(userinfo)
        if (!userinfo) {
            navigate("/login")
        }
    }, [])

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
            const res = await API.post("message/allmessages", { chatId }, {
                headers: {
                    "Content-Type": "application/json"
                },
                withCredentials: true
            })
            // console.log(res.data.data)
            setAllmsg(res.data.data)
        } catch (e) {
            const errorMessage = e?.response?.data?.message || "Failed to fetch messages"
            throw new Error(errorMessage)
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

    const ReadBy = async (messageId) => {
        try {
            const res = await API.put("message/markread", { messageId }, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: user.token
                },
                withCredentials: true
            })
            return res.data.data;
        } catch (e) {
            const errorMessage = e?.response?.data?.message || "Failed to mark message as read";
            console.error(errorMessage);
        }
    }

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
            const encryptedMessage = encryptMessage(newContent);
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
        <messageContext.Provider value={{
            Send, msg, setMsg, AllMessages, setAllmsg, Allmsg,
            DeleteMsg, Del, setDel, ReadBy, ENDPOINT, ReactToMsg, VotePoll, EditMsg,
            editingMsg, setEditingMsg
        }}>
            {children}
        </messageContext.Provider>
    )
}

export default MessageState