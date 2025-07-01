import React, { useContext } from 'react';
import { IoCall, IoCloseSharp, IoMail } from "react-icons/io5";
import { GiCrownedSkull } from "react-icons/gi";
import chatContext from '../contexts/ChatContext/chatcontext';

const Groupinfo = () => {
    const { chatmodal, setChatmodal, selectedchat, user } = useContext(chatContext);

    const getOtherUser = (loggedInUser, members) => {
        return members.find((m) => m._id !== loggedInUser._id);
    };

    const otherUser = !selectedchat.isGroup ? getOtherUser(user, selectedchat.members) : null;

    return (
        <div className="fixed inset-0 bg-transparent bg-opacity-40 backdrop-blur-sm z-50 flex items-center justify-center px-4">
            <div className="bg-white dark:bg-gray-900 text-black dark:text-white w-full max-w-md rounded-2xl p-6 relative shadow-2xl transition-all duration-300 ease-in-out overflow-hidden">

                {/* Close Button */}
                <button
                    className="absolute top-3 right-3 text-2xl text-gray-500 hover:text-red-500 transition"
                    onClick={() => setChatmodal(false)}
                >
                    <IoCloseSharp />
                </button>

                {/* Title */}
                <h2 className="text-xl font-semibold text-center mb-6 text-fuchsia-600 dark:text-fuchsia-400">
                    {selectedchat.isGroup ? "Group Info" : "User Info"}
                </h2>

                {/* Avatar + Details */}
                <div className="flex items-center gap-4">
                    <img
                        src={
                            selectedchat.isGroup
                                ? (selectedchat.groupIcon ? `http://localhost:4000${selectedchat.groupIcon}` : "/group.png")
                                : (otherUser?.avtar?.startsWith('data:image')
                                    ? otherUser.avtar
                                    : `http://localhost:4000${otherUser?.avtar}`)
                        }
                        alt={selectedchat.isGroup ? selectedchat.chatname : otherUser?.userName}
                        className="w-20 h-20 rounded-full object-cover border-4 border-amber-300"
                    />

                    <div className="flex flex-col overflow-hidden">
                        <h3 className="text-xl font-semibold truncate">
                            {selectedchat.isGroup ? selectedchat.chatname : otherUser?.name}
                        </h3>
                        {!selectedchat.isGroup && (
                            <span className="text-sm text-gray-500 truncate">@{otherUser?.userName}</span>
                        )}
                        {selectedchat.lastMessage?.createdAt && (
                            <p className="text-sm text-gray-400 mt-1">
                                Last seen:{" "}
                                {new Date(selectedchat.lastMessage.createdAt).toLocaleString("en-IN", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                    day: "numeric",
                                    month: "short"
                                })}
                            </p>
                        )}
                    </div>
                </div>

                {/* Contact Info */}
                {!selectedchat.isGroup && otherUser?.phonenumber && (
                    <div className="mt-6 space-y-4">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                            <IoCall className="text-xl" />
                            <span className="text-md">{otherUser.phonenumber}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                            <IoMail className="text-xl" />
                            <span className="text-md">{otherUser.email}</span>
                        </div>
                    </div>
                )}

                {/* Group Members */}
                {selectedchat.isGroup && (
                    <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-3 text-white">Group Members:</h3>
                        <div className="flex flex-col gap-2 overflow-y-auto max-h-[300px] pr-1 custom-scrollbar">
                            {selectedchat.members.length > 0 ? (
                                selectedchat.members.map((member) => (
                                    <div
                                        key={member._id}
                                        className="flex items-center gap-4 p-2 rounded-md hover:bg-gray-800 cursor-pointer transition-all duration-200"
                                    >
                                        <img
                                            src={
                                                member?.avtar?.startsWith("data:image")
                                                    ? member.avtar
                                                    : `http://localhost:4000${member.avtar}`
                                            }
                                            alt={member.name}
                                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                                        />
                                        <div className="flex flex-col justify-center overflow-hidden">
                                            <h3 className="text-white font-medium truncate flex items-center gap-1">
                                                {member.name}
                                                {selectedchat.admins.some(admin =>
                                                    (admin._id ? admin._id.toString() : admin.toString()) === member._id.toString()
                                                ) && (
                                                        <GiCrownedSkull className="text-yellow-500 text-xl" />
                                                    )}
                                            </h3>
                                            <p className="text-gray-400 text-sm truncate">@{member.userName}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-400">No members found.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>

    );
};

export default Groupinfo;
