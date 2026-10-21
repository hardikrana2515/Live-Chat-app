import { BsLayoutSidebarReverse } from "react-icons/bs";
import { TbArrowBackUp } from "react-icons/tb";
import { IoMdSettings, IoIosInformationCircleOutline } from "react-icons/io";
import { IoLogOut, IoSend } from "react-icons/io5";
import { useState, useContext, useEffect } from "react";
import chatContext from "../contexts/ChatContext/chatcontext";
import Message from "./Message";
import SocketContext from '../contexts/Socket.io.Context/socket.Context.js'
import API from '../contexts/Api.js';
import { toast } from 'react-toastify';
import TypingIndicator from './TypingIndicator';
import { IoVideocam, IoCall } from "react-icons/io5";

const ChatBox = ({ onStartCall }) => {
    const { user, setUser, selectedchat, setSelectedchat, setChatmodal, setSettingmodal, setYesmodal, handleBlock, handleUnblock, setModalType } = useContext(chatContext)
    const { socket, onlineUsers } = useContext(SocketContext);
    const [isTyping, setIsTyping] = useState(false);
    const [activeGroupCall, setActiveGroupCall] = useState(null); // { isActive, callType, participantCount }

    const isOnline = (userId) => onlineUsers.includes(userId);

    const getOtherUser = (loggedInUser, members) => {
        if (!members || !Array.isArray(members)) return null;
        return members.find((m) => (m._id || m) !== loggedInUser?._id) || null;
    };

    useEffect(() => {
        if (!socket.current) return;

        socket.current.on("typing", (room) => {
            if (selectedchat._id === room) setIsTyping(true);
        });
        socket.current.on("stop typing", (room) => {
            if (selectedchat._id === room) setIsTyping(false);
        });

        const handleGroupCallStatus = (status) => {
            if (status.chatId === selectedchat?._id) {
                setActiveGroupCall(status);
            }
        };

        socket.current.on("groupCallActiveStatus", handleGroupCallStatus);

        if (selectedchat?.isGroup) {
            socket.current.emit("checkGroupCallStatus", selectedchat._id);
        } else {
            setActiveGroupCall(null);
        }

        return () => {
            if (socket.current) {
                socket.current.off("typing");
                socket.current.off("stop typing");
                socket.current.off("groupCallActiveStatus", handleGroupCallStatus);
            }
        }
    }, [selectedchat, socket]);

    // NOTE: Call state and socket listeners ("callUser"/"callEnded") live in
    // Chatpage.jsx so incoming calls are received even when no chat is open.

    return (
        <div className="flex flex-col h-full w-full text-[var(--c-text)] relative">
            {/* Top Bar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-[var(--c-panel-95)] backdrop-blur-md border-b border-[var(--c-line)] shadow-sm sticky top-0 z-20">
                <div className="flex items-center gap-3 overflow-hidden">
                    {/* Mobile Back Button */}
                    <button
                        onClick={() => setSelectedchat(null)}
                        className="sm:hidden p-1.5 rounded-lg bg-[var(--c-surface)] text-[var(--c-text-2)] hover:text-[var(--c-text)] border border-[var(--c-line)] text-sm"
                        title="Back to conversations"
                    >
                        <TbArrowBackUp className="text-base" />
                    </button>

                    <div className="relative shrink-0">
                        <img
                            src={
                                selectedchat.isGroup
                                    ? selectedchat.groupIcon
                                        ? `http://localhost:4000${selectedchat.groupIcon}`
                                        : "/group.png"
                                    : getOtherUser(user, selectedchat.members)?.avtar?.startsWith("data:image")
                                        ? getOtherUser(user, selectedchat.members).avtar
                                        : getOtherUser(user, selectedchat.members)?.avtar
                                            ? `http://localhost:4000${getOtherUser(user, selectedchat.members).avtar}`
                                            : "/avtar.png"
                            }
                            alt={
                                selectedchat.isGroup
                                    ? selectedchat.chatname
                                    : getOtherUser(user, selectedchat.members)?.userName || "User"
                            }
                            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border border-[var(--c-line)]"
                        />
                        {!selectedchat.isGroup && isOnline(getOtherUser(user, selectedchat.members)?._id) && (
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[var(--c-online)] border-2 border-[var(--c-panel)] rounded-full" />
                        )}
                    </div>

                    <div className="flex flex-col justify-center overflow-hidden min-w-0">
                        <div className="flex items-center gap-2">
                            <h2 className="text-sm sm:text-base font-semibold text-[var(--c-text)] truncate leading-tight">
                                {selectedchat.isGroup
                                    ? selectedchat.chatname
                                    : getOtherUser(user, selectedchat.members)?.name}
                            </h2>
                            {selectedchat.isGroup && (
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--c-link)] bg-[var(--c-primary-soft)] px-1.5 py-0.2 rounded border border-[var(--c-line)] shrink-0">
                                    {selectedchat.members?.length} members
                                </span>
                            )}
                        </div>

                        {!selectedchat.isGroup && (
                            <div className="flex items-center gap-1.5 mt-0.5 h-4">
                                {isTyping ? (
                                    <TypingIndicator />
                                ) : isOnline(getOtherUser(user, selectedchat.members)?._id) ? (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--c-online)]">
                                        <span className="w-1.5 h-1.5 bg-[var(--c-online)] rounded-full animate-pulse" />
                                        Online
                                    </span>
                                ) : (
                                    <span className="text-[11px] text-[var(--c-text-2)] truncate">
                                        {getOtherUser(user, selectedchat.members)?.lastSeen
                                            ? `Last seen ${new Date(getOtherUser(user, selectedchat.members).lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                            : "Offline"}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Header Actions */}
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    {/* Call Buttons (Voice and Video for 1:1 and Groups) */}
                    <button
                        onClick={() => onStartCall?.('audio')}
                        className="p-2 rounded-xl bg-[var(--c-surface)] hover:bg-[var(--c-raised)] border border-[var(--c-line)] text-[var(--c-text-2)] hover:text-[var(--c-text)] transition-all shadow-sm"
                        title={selectedchat.isGroup ? "Start Group Voice Call" : "Start Voice Call"}
                    >
                        <IoCall className="text-base" />
                    </button>
                    <button
                        onClick={() => onStartCall?.('video')}
                        className="p-2 rounded-xl bg-[var(--c-surface)] hover:bg-[var(--c-raised)] border border-[var(--c-line)] text-[var(--c-text-2)] hover:text-[var(--c-text)] transition-all shadow-sm"
                        title={selectedchat.isGroup ? "Start Group Video Call" : "Start Video Call"}
                    >
                        <IoVideocam className="text-base" />
                    </button>

                    {/* Chat Drawer Trigger */}
                    <div className="drawer drawer-end z-40">
                        <input id="chat-drawer" type="checkbox" className="drawer-toggle" />
                        <div className="drawer-content">
                            <label
                                htmlFor="chat-drawer"
                                className="p-2 rounded-xl bg-[var(--c-surface)] hover:bg-[var(--c-raised)] border border-[var(--c-line)] text-[var(--c-text-2)] hover:text-[var(--c-text)] cursor-pointer transition-all flex items-center justify-center"
                                title="Conversation Details"
                            >
                                <BsLayoutSidebarReverse className="text-base" />
                            </label>
                        </div>

                        <div className="drawer-side">
                            <label htmlFor="chat-drawer" className="drawer-overlay"></label>
                            <ul className="menu p-4 w-72 min-h-full bg-[var(--c-panel)] border-l border-[var(--c-line)] text-[var(--c-text)] gap-1.5">
                                {/* Settings */}
                                <div
                                    className="flex items-center gap-2 p-4 rounded-md hover:bg-[var(--c-surface)] cursor-pointer text-lg transition-all duration-200"
                                    onClick={() => {
                                        setSettingmodal(true);
                                        document.getElementById('chat-drawer').checked = false;
                                    }}
                                >
                                    <IoMdSettings className="text-xl" />
                                    {selectedchat.isGroup ? "Group Setting" : "User Setting"}
                                </div>

                                {/* Info */}
                                <div
                                    className="flex items-center gap-2 p-4 rounded-md hover:bg-[var(--c-surface)] cursor-pointer text-lg transition-all duration-200"
                                    onClick={() => {
                                        setChatmodal(true);
                                        document.getElementById('chat-drawer').checked = false;
                                    }}
                                >
                                    <IoIosInformationCircleOutline className="text-xl" />
                                    {selectedchat.isGroup ? "Group Info" : "User Info"}
                                </div>

                                {/* Block/Unblock User */}
                                {!selectedchat.isGroup && (
                                    <div
                                        className="flex items-center gap-2 p-4 rounded-md hover:bg-[var(--c-surface)] cursor-pointer text-lg transition-all duration-200"
                                        onClick={() => {
                                            const otherUserId = getOtherUser(user, selectedchat.members)._id;
                                            if (user.blockedUsers?.includes(otherUserId)) {
                                                handleUnblock(otherUserId);
                                            } else {
                                                // Trigger Confirmation Modal
                                                setModalType('block');
                                                setYesmodal(true);
                                            }
                                            document.getElementById('chat-drawer').checked = false;
                                        }}
                                    >
                                        <IoLogOut className="text-xl rotate-180" /> {/* Reusing icon or invoke new one */}
                                        {user.blockedUsers?.includes(getOtherUser(user, selectedchat.members)._id) ? "Unblock User" : "Block User"}
                                    </div>
                                )}

                                {/* Delete or Leave */}
                                {selectedchat.isGroup &&
                                    (selectedchat.creator?._id === user._id ? (
                                        <div
                                            onClick={() => {
                                                setYesmodal(true);
                                                document.getElementById('chat-drawer').checked = false;
                                            }}
                                            className="flex items-center gap-2 px-4 py-2 text-[var(--c-text)] bg-[var(--c-surface)] hover:bg-[var(--c-danger)] rounded-lg cursor-pointer transition-all duration-200"
                                        >
                                            <IoLogOut className="text-xl" />
                                            <span className="text-md font-medium">Delete Group</span>
                                        </div>
                                    ) : (
                                        <div
                                            onClick={() => {
                                                setYesmodal(true);
                                                document.getElementById('chat-drawer').checked = false;
                                            }}
                                            className="flex items-center gap-2 px-4 py-2 text-[var(--c-text)] bg-[var(--c-surface)] hover:bg-[var(--c-danger)] rounded-lg cursor-pointer transition-all duration-200"
                                        >
                                            <IoLogOut className="text-xl" />
                                            <span className="text-md font-medium">Leave Group</span>
                                        </div>
                                    ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Live Group Call Banner */}
            {selectedchat.isGroup && activeGroupCall?.isActive && (
                <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-4 py-2.5 flex items-center justify-between z-10 animate-fadeIn">
                    <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Live Group {activeGroupCall.callType === 'video' ? 'Video' : 'Voice'} Call ({activeGroupCall.participantCount || 1} connected)</span>
                    </div>
                    <button
                        onClick={() => onStartCall?.(activeGroupCall.callType || 'video')}
                        className="px-3.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow transition"
                    >
                        Join Call
                    </button>
                </div>
            )}

            {/* Message Area */}
            <div className="flex-1 overflow-hidden min-h-0 flex flex-col">
                <Message onStartCall={onStartCall} />
            </div>
        </div>
    );
};

export default ChatBox;
