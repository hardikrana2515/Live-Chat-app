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

        return members.find((m) => m._id !== loggedInUser._id);
    };

    const isOnline = (userId) => {
        return onlineUsers.includes(userId);
    }

    return (
        <div className="w-full">
            {chat.length > 0 && (
                <div className="flex flex-col rounded-md w-full min-h-screen gap-2 p-2 sm:p-3 overflow-y-auto">
                    {chat.map((c) => {
                        const otherUser = !c.isGroup ? getOtherUser(user, c.members) : null;
                        const online = otherUser ? isOnline(otherUser._id) : false;

                        return (
                            <div
                                key={c._id}
                                onClick={() => setSelectedchat(c)}
                                className="flex items-center w-full gap-3 sm:gap-4 p-2 rounded-md hover:bg-gray-800 cursor-pointer transition-all duration-200"
                            >
                                <div className="relative">
                                    <img
                                        src={
                                            c.isGroup
                                                ? c.groupIcon
                                                    ? `http://localhost:4000${c.groupIcon}`
                                                    : "/group.png"
                                                : otherUser.avtar?.startsWith("data:image")
                                                    ? otherUser.avtar
                                                    : `http://localhost:4000${otherUser.avtar}`
                                        }
                                        alt={
                                            c.isGroup
                                                ? c.chatname
                                                : otherUser.userName
                                        }
                                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                                    />
                                    {online && (
                                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-gray-900 rounded-full"></span>
                                    )}
                                </div>

                                <div className="flex flex-col justify-center overflow-hidden">
                                    <h3 className="text-white font-medium text-sm sm:text-base truncate">
                                        {c.isGroup
                                            ? c.chatname
                                            : otherUser.name}
                                    </h3>
                                    <p className="text-gray-400 text-xs sm:text-sm truncate">
                                        {decryptMessage(c.lastMessage?.message) || "Start chatting..."}
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>

    )

}




export default Chat