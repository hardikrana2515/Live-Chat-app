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

        return members.find((m) => m._id !== loggedInUser._id);
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
        if (callData?.from) {
            socket.current.emit("endCall", { to: callData.from });
        }
        setCallData(null);
    };

    const endCall = () => {
        const otherUserId = getOtherUser(user, selectedchat.members)._id;
        // If we are in a call, we might want to notify other user? 
        // VideoCall component handles peer destroy, but we should signal cleanup
        // socket.emit("endCall", { to: otherUserId }); 
        // Actually VideoCall component creates peer. 
        // Let's pass a function to VideoCall to emit event if needed.

        // For simplicity, just reset state. The peer connection 'close' event usually handles cleanup, 
        // but signaling endCall is good practice.
        if (callData?.from) socket.current.emit("endCall", { to: callData.from }); // If we answered
        else if (selectedchat) socket.current.emit("endCall", { to: otherUserId }); // If we started

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
            <div className="flex flex-wrap sm:flex-nowrap items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700 shadow position-sticky top-0 ">
                <div className="flex items-center gap-3">
                    <img
                        src={
                            selectedchat.isGroup
                                ? selectedchat.groupIcon
                                    ? `http://localhost:4000${selectedchat.groupIcon}`
                                    : "/group.png"
                                : getOtherUser(user, selectedchat.members).avtar?.startsWith("data:image")
                                    ? getOtherUser(user, selectedchat.members).avtar
                                    : `http://localhost:4000${getOtherUser(user, selectedchat.members).avtar}`
                        }
                        alt={
                            selectedchat.isGroup
                                ? selectedchat.chatname
                                : getOtherUser(user, selectedchat.members).userName
                        }
                        className="w-12 h-12 rounded-full object-cover"
                    />

                    <div className="flex flex-col sm:flex-row sm:items-center justify-center sm:gap-2">
                        <div className="text-lg font-semibold text-center sm:text-left flex flex-col">
                            {selectedchat.isGroup
                                ? selectedchat.chatname
                                : getOtherUser(user, selectedchat.members)?.name}

                            {!selectedchat.isGroup && (
                                <div className="flex items-center gap-1">
                                    <span className="text-sm text-gray-400 hidden sm:block">
                                        (@{getOtherUser(user, selectedchat.members)?.userName})
                                    </span>
                                    {isOnline(getOtherUser(user, selectedchat.members)?._id) ? (
                                        <div className="flex items-center gap-1">
                                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                            <span className="text-xs text-green-500 font-medium">Online</span>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-gray-500">
                                            Last seen: {getOtherUser(user, selectedchat.members)?.lastSeen
                                                ? new Date(getOtherUser(user, selectedchat.members).lastSeen).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })
                                                : "Offline"}
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Typing Indicator */}
                            {isTyping && (
                                <div className="mt-1">
                                    <TypingIndicator />
                                </div>
                            )}
                        </div>

                        {selectedchat.isGroup && (
                            <p className="text-sm text-gray-500">
                                Members: {selectedchat.members?.length}
                            </p>
                        )}
                    </div>
                </div>

                {/* Drawer Toggle & Actions */}
                <div className="flex items-center gap-4 mt-2 sm:mt-0">

                    {/* Call Buttons (Only 1:1 for now) */}
                    {!selectedchat.isGroup && (
                        <>
                            <button
                                onClick={() => startCall('audio')}
                                className="p-2 rounded-full bg-gray-700 hover:bg-green-600 text-white transition"
                                title="Start Voice Call"
                            >
                                <IoCall className="text-xl" />
                            </button>
                            <button
                                onClick={() => startCall('video')}
                                className="p-2 rounded-full bg-gray-700 hover:bg-fuchsia-600 text-white transition mr-2"
                                title="Start Video Call"
                            >
                                <IoVideocam className="text-xl" />
                            </button>
                        </>
                    )}

                    <button
                        onClick={() => setSelectedchat(null)}
                        className="sm:hidden flex items-center gap-1 text-sm px-3 py-2 text-white bg-fuchsia-600 hover:bg-fuchsia-700 rounded-lg my-2 ml-2"
                    >
                        <span><TbArrowBackUp /></span> Back
                    </button>

                    <div className="drawer drawer-end">
                        <input id="chat-drawer" type="checkbox" className="drawer-toggle" />
                        <div className="drawer-content">
                            <label htmlFor="chat-drawer" className="drawer-button text-gray-400 hover:text-white p-2 rounded-full">
                                <BsLayoutSidebarReverse className="text-xl" />
                            </label>
                        </div>

                        <div className="drawer-side z-50">
                            <label htmlFor="chat-drawer" className="drawer-overlay"></label>
                            <ul className="menu bg-base-200 gap-2 text-base-content min-h-full w-80 p-4">
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
            <div className="flex-1 overflow-y-auto ">
                <Message />
            </div>
        </div>
    );
};

export default ChatBox;
