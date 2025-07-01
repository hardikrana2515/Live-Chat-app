import { useContext, useEffect, useState } from 'react'
import chatContext from '../contexts/ChatContext/chatcontext'

const Chat = () => {
    const { user, chat, Allchat, setSelectedchat, selectedchat } = useContext(chatContext)

    useEffect(() => {
        Allchat();
    }, []);


    const getOtherUser = (loggedInUser, members) => {

        return members.find((m) => m._id !== loggedInUser._id);
    };

    return (
        <div className="w-full">
            {chat.length > 0 && (
                <div className="flex flex-col rounded-md w-full min-h-screen gap-2 p-2 sm:p-3 overflow-y-auto">
                    {chat.map((c) => (
                        <div
                            key={c._id}
                            onClick={() => setSelectedchat(c)}
                            className="flex items-center w-full gap-3 sm:gap-4 p-2 rounded-md hover:bg-gray-800 cursor-pointer transition-all duration-200"
                        >
                            <img
                                src={
                                    c.isGroup
                                        ? c.groupIcon
                                            ? `http://localhost:4000${c.groupIcon}`
                                            : "/group.png"
                                        : getOtherUser(user, c.members).avtar?.startsWith("data:image")
                                            ? getOtherUser(user, c.members).avtar
                                            : `http://localhost:4000${getOtherUser(user, c.members).avtar}`
                                }
                                alt={
                                    c.isGroup
                                        ? c.chatname
                                        : getOtherUser(user, c.members).userName
                                }
                                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                            />
                            <div className="flex flex-col justify-center overflow-hidden">
                                <h3 className="text-white font-medium text-sm sm:text-base truncate">
                                    {c.isGroup
                                        ? c.chatname
                                        : getOtherUser(user, c.members).name}
                                </h3>
                                <p className="text-gray-400 text-xs sm:text-sm truncate">
                                    {c.lastMessage?.message || "Start chatting..."}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

    )

}




export default Chat