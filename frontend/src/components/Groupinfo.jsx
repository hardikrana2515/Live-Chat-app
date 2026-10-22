import React, { useContext } from 'react';
import { IoCall, IoCloseSharp, IoMail } from "react-icons/io5";
import { LuCrown } from "react-icons/lu";
import chatContext from '../contexts/ChatContext/chatcontext';

const Groupinfo = () => {
    const { setChatmodal, selectedchat, user } = useContext(chatContext);

    const getOtherUser = (loggedInUser, members) => {
        return members.find((m) => m._id !== loggedInUser._id);
    };

    const otherUser = !selectedchat.isGroup ? getOtherUser(user, selectedchat.members) : null;

    return (
        <div className="fixed inset-0 bg-[var(--c-overlay)] backdrop-blur-md z-50 flex items-center justify-center px-4">
            <div className="bg-[var(--c-surface)]  text-[var(--c-text)]  w-full max-w-md rounded-2xl p-6 relative shadow-2xl transition-all duration-300 ease-in-out overflow-hidden">

                {/* Close Button */}
                <button
                    className="absolute top-3 right-3 text-2xl text-[var(--c-text-3)] hover:text-[var(--c-danger)] transition"
                    onClick={() => setChatmodal(false)}
                >
                    <IoCloseSharp />
                </button>

                {/* Title */}
                <h2 className="text-xl font-semibold text-center mb-6 text-[var(--c-text)] ">
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
                        className="w-20 h-20 rounded-full object-cover border-4 border-[var(--c-primary-50)]"
                    />

                    <div className="flex flex-col overflow-hidden">
                        <h3 className="text-xl font-semibold truncate">
                            {selectedchat.isGroup ? selectedchat.chatname : otherUser?.name}
                        </h3>
                        {!selectedchat.isGroup && (
                            <span className="text-sm text-[var(--c-text-3)] truncate">@{otherUser?.userName}</span>
                        )}
                        {selectedchat.lastMessage?.createdAt && (
                            <p className="text-sm text-[var(--c-text-2)] mt-1">
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
                        <div className="flex items-center gap-2 text-[var(--c-text-3)] ">
                            <IoCall className="text-xl" />
                            <span className="text-md">{otherUser.phonenumber}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[var(--c-text-3)] ">
                            <IoMail className="text-xl" />
                            <span className="text-md">{otherUser.email}</span>
                        </div>
                    </div>
                )}

                {/* Group Members */}
                {selectedchat.isGroup && (
                    <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-3 text-[var(--c-text)]">Group Members:</h3>
                        <div className="flex flex-col gap-2 overflow-y-auto max-h-[300px] pr-1 custom-scrollbar">
                            {selectedchat.members.length > 0 ? (
                                selectedchat.members.map((member) => {
                                    const currentUserId = (user?._id || user?.id)?.toString();
                                    const creatorId = (selectedchat?.creator?._id || selectedchat?.creator)?.toString();
                                    const memberId = (member?._id || member)?.toString();
                                    const isSelf = Boolean(currentUserId && currentUserId === memberId);
                                    const isCreator = Boolean(creatorId && creatorId === memberId);
                                    const memberIsAdmin = Boolean(
                                        (selectedchat?.admins || []).some(admin =>
                                            (admin?._id ? admin._id.toString() : admin?.toString()) === memberId
                                        ) || (creatorId && creatorId === memberId)
                                    );

                                    return (
                                        <div
                                            key={memberId}
                                            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[var(--c-panel)] transition-all duration-200"
                                        >
                                            <img
                                                src={
                                                    member?.avtar?.startsWith("data:image") || member?.avtar?.startsWith("http")
                                                        ? member.avtar
                                                        : (member?.avtar ? `http://localhost:4000${member.avtar}` : "/user.png")
                                                }
                                                alt={member.name}
                                                className="w-10 h-10 rounded-full object-cover shrink-0 border border-[var(--c-line)]"
                                            />
                                            <div className="flex flex-col justify-center overflow-hidden flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <span className="text-[var(--c-text)] font-medium truncate">
                                                        {member.name}
                                                    </span>
                                                    {isSelf && (
                                                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--c-primary)]/20 text-[var(--c-primary)] border border-[var(--c-primary)]/30 shrink-0">
                                                            (You)
                                                        </span>
                                                    )}
                                                    {isCreator && (
                                                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1 shrink-0">
                                                            <LuCrown className="text-xs" />
                                                            <span>Creator</span>
                                                        </span>
                                                    )}
                                                    {!isCreator && memberIsAdmin && (
                                                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shrink-0">
                                                            Admin
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[var(--c-text-3)] text-xs truncate">@{member.userName}</p>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-sm text-[var(--c-text-2)]">No members found.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>

    );
};

export default Groupinfo;
