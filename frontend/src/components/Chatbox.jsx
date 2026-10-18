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
import VideoCall from './VideoCall';
import IncomingCallModal from './IncomingCallModal';
import { IoVideocam, IoCall } from "react-icons/io5";

const ChatBox = () => {
    const { user, setUser, selectedchat, setSelectedchat, setChatmodal, setSettingmodal, setYesmodal, handleBlock, handleUnblock, setModalType } = useContext(chatContext)
    const { socket, onlineUsers } = useContext(SocketContext);
    const [isTyping, setIsTyping] = useState(false);

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

        return () => {
            socket.current.off("typing");
            socket.current.off("stop typing");
        }
    }, [selectedchat, socket]);


    // Call State
    const [callData, setCallData] = useState(null); // { isIncoming: bool, signalData, from, name, callType }
    const [inCall, setInCall] = useState(false);
    const [callType, setCallType] = useState('video'); // 'video' | 'audio'

    useEffect(() => {
        if (!socket.current) return;

        socket.current.on("callUser", ({ from, name, signal, callType }) => {
            console.log("Receiving call from", name, "Type:", callType);
            setCallData({ isIncoming: true, from, name, signalData: signal, callType: callType || 'video' });
        });

        socket.current.on("callEnded", () => {
            setInCall(false);
            setCallData(null);
        });

        return () => {
            socket.current.off("callUser");
            socket.current.off("callEnded");
        }
    }, [socket]);

    const startCall = (type = 'video') => {
        setInCall(true);
        setCallType(type);
        setCallData({ isIncoming: false, callType: type });
    };

    const acceptCall = () => {
        setInCall(true);
        setCallType(callData.callType);
    };

    const declineCall = () => {
        if (callData?.from && socket?.current) {
            socket.current.emit("endCall", { to: callData.from });
        }
        setCallData(null);
    };

    const endCall = () => {
        const otherUserObj = selectedchat?.members ? getOtherUser(user, selectedchat.members) : null;
        const otherUserId = callData?.isIncoming ? callData?.from : otherUserObj?._id;

        if (socket?.current && otherUserId) {
            socket.current.emit("endCall", { to: otherUserId });
        }

        setInCall(false);
        setCallData(null);
    };


    return (
        <div className="flex flex-col h-full w-full text-white relative">
            {/* Call Modals */}
            {callData?.isIncoming && !inCall && (
                <IncomingCallModal
                    callerName={callData.name}
                    onAccept={acceptCall}
                    onDecline={declineCall}
                    callType={callData.callType}
                />
            )}

            {inCall && (
                <VideoCall
                    socket={socket.current}
                    user={user}
                    chat={selectedchat}
                    isIncoming={callData?.isIncoming}
                    signalData={callData}
                    EndCall={endCall}
                    callType={callType}
                />
            )}

            {/* Top Bar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-sm sticky top-0 z-20">
                <div className="flex items-center gap-3 overflow-hidden">
                    {/* Mobile Back Button */}
                    <button
                        onClick={() => setSelectedchat(null)}
                        className="sm:hidden p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-sm"
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
                            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border border-slate-700"
                        />
                        {!selectedchat.isGroup && isOnline(getOtherUser(user, selectedchat.members)?._id) && (
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
                        )}
                    </div>

                    <div className="flex flex-col justify-center overflow-hidden min-w-0">
                        <div className="flex items-center gap-2">
                            <h2 className="text-sm sm:text-base font-semibold text-white truncate leading-tight">
                                {selectedchat.isGroup
                                    ? selectedchat.chatname
                                    : getOtherUser(user, selectedchat.members)?.name}
                            </h2>
                            {selectedchat.isGroup && (
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-1.5 py-0.2 rounded border border-indigo-500/20 shrink-0">
                                    {selectedchat.members?.length} members
                                </span>
                            )}
                        </div>

                        {!selectedchat.isGroup && (
                            <div className="flex items-center gap-1.5 mt-0.5">
                                {isOnline(getOtherUser(user, selectedchat.members)?._id) ? (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                                        Online
                                    </span>
                                ) : (
                                    <span className="text-[11px] text-slate-400 truncate">
                                        {getOtherUser(user, selectedchat.members)?.lastSeen
                                            ? `Last seen ${new Date(getOtherUser(user, selectedchat.members).lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                            : "Offline"}
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Typing Indicator */}
                        {isTyping && (
                            <div className="mt-0.5">
                                <TypingIndicator />
                            </div>
                        )}
                    </div>
                </div>

                {/* Header Actions */}
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    {/* Call Buttons (1:1 direct chats) */}
                    {!selectedchat.isGroup && (
                        <>
                            <button
                                onClick={() => startCall('audio')}
                                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-slate-300 hover:text-white transition-all shadow-sm"
                                title="Start Voice Call"
                            >
                                <IoCall className="text-base" />
                            </button>
                            <button
                                onClick={() => startCall('video')}
                                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-slate-300 hover:text-white transition-all shadow-sm"
                                title="Start Video Call"
                            >
                                <IoVideocam className="text-base" />
                            </button>
                        </>
                    )}

                    {/* Chat Drawer Trigger */}
                    <div className="drawer drawer-end z-40">
                        <input id="chat-drawer" type="checkbox" className="drawer-toggle" />
                        <div className="drawer-content">
                            <label
                                htmlFor="chat-drawer"
                                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-slate-300 hover:text-white cursor-pointer transition-all flex items-center justify-center"
                                title="Conversation Details"
                            >
                                <BsLayoutSidebarReverse className="text-base" />
                            </label>
                        </div>

                        <div className="drawer-side">
                            <label htmlFor="chat-drawer" className="drawer-overlay"></label>
                            <ul className="menu p-4 w-72 min-h-full bg-slate-900 border-l border-slate-800 text-slate-200 gap-1.5">
                                {/* Settings */}
                                <div
                                    className="flex items-center gap-2 p-4 rounded-md hover:bg-gray-800 cursor-pointer text-lg transition-all duration-200"
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
                                    className="flex items-center gap-2 p-4 rounded-md hover:bg-gray-800 cursor-pointer text-lg transition-all duration-200"
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
                                        className="flex items-center gap-2 p-4 rounded-md hover:bg-gray-800 cursor-pointer text-lg transition-all duration-200"
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
                                            className="flex items-center gap-2 px-4 py-2 text-white bg-gray-800 hover:bg-red-600 rounded-lg cursor-pointer transition-all duration-200"
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
                                            className="flex items-center gap-2 px-4 py-2 text-white bg-gray-800 hover:bg-red-600 rounded-lg cursor-pointer transition-all duration-200"
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

            {/* Message Area */}
            <div className="flex-1 overflow-hidden min-h-0 flex flex-col">
                <Message />
            </div>
        </div>
    );
};

export default ChatBox;
