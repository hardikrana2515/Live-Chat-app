import { useContext, useEffect, useState } from 'react'
import chatContext from '../contexts/ChatContext/chatcontext'
import SocketContext from '../contexts/Socket.io.Context/socket.Context'
import { decryptMessage } from '../utils/EncryptionUtils'

const Chat = () => {
    const { user, chat, Allchat, setSelectedchat, selectedchat } = useContext(chatContext)
    const { onlineUsers } = useContext(SocketContext)

    useEffect(() => {
        Allchat();
    }, []);


    const getOtherUser = (loggedInUser, members) => {
        if (!members || !Array.isArray(members)) return null;
        return members.find((m) => m && m._id !== loggedInUser?._id) || null;
    };

    const isOnline = (userId) => {
        if (!userId) return false;
        return onlineUsers.includes(userId);
    }

    return (
        <div className="w-full">
            {chat && chat.length > 0 ? (
                <div className="flex flex-col gap-1 w-full pb-2">
                    {chat.map((c) => {
                        const otherUser = !c.isGroup ? getOtherUser(user, c.members) : null;
                        const online = otherUser ? isOnline(otherUser._id) : false;
                        const isSelected = selectedchat?._id === c._id;

                        return (
                            <div
                                key={c._id}
                                onClick={() => setSelectedchat(c)}
                                className={`flex items-center w-full gap-3 p-2.5 rounded-xl cursor-pointer transition-all duration-150 ${
                                    isSelected
                                        ? 'bg-slate-800/90 border border-slate-700/80 shadow-sm text-white'
                                        : 'hover:bg-slate-900/80 text-slate-300 hover:text-white'
                                }`}
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
                                        className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border border-slate-700/60"
                                    />
                                    {online && (
                                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-950 rounded-full" />
                                    )}
                                </div>

                                <div className="flex flex-col justify-center overflow-hidden flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-1">
                                        <h3 className={`font-semibold text-xs sm:text-sm truncate leading-tight ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                                            {c.isGroup
                                                ? c.chatname
                                                : otherUser?.name || "Unknown User"}
                                        </h3>
                                        {c.isGroup && (
                                            <span className="text-[10px] uppercase font-semibold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.2 rounded border border-indigo-500/20 shrink-0">
                                                Group
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-slate-400 text-xs truncate mt-0.5">
                                        {decryptMessage(c.lastMessage?.message) || "No messages yet"}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-10 px-4 text-slate-500 text-xs">
                    No active conversations. Search a user to connect.
                </div>
            )}
        </div>
    );
}




export default Chat