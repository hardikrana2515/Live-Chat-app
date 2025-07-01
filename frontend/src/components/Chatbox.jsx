import {  BsLayoutSidebarReverse } from "react-icons/bs";
import { TbArrowBackUp } from "react-icons/tb";
import { IoMdSettings, IoIosInformationCircleOutline } from "react-icons/io";
import { IoLogOut, IoSend } from "react-icons/io5";
import { useContext } from "react";
import chatContext from "../contexts/ChatContext/chatcontext";
import Message from "./Message";

const ChatBox = () => {
    const { user, selectedchat,setSelectedchat, setChatmodal, setSettingmodal, setYesmodal } = useContext(chatContext)

    const getOtherUser = (loggedInUser, members) => {

        return members.find((m) => m._id !== loggedInUser._id);
    };


    return (
        <div className="flex flex-col h-full w-full text-white">

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
                        <div className="text-lg font-semibold text-center sm:text-left">
                            {selectedchat.isGroup
                                ? selectedchat.chatname
                                : getOtherUser(user, selectedchat.members)?.name}

                            {!selectedchat.isGroup && (
                                <span className="text-sm text-gray-400 ml-1 block sm:inline">
                                    (@{getOtherUser(user, selectedchat.members)?.userName})
                                </span>
                            )}
                        </div>

                        {selectedchat.isGroup && (
                            <p className="text-sm text-gray-500">
                                Members: {selectedchat.members?.length}
                            </p>
                        )}
                    </div>
                </div>

                {/* Drawer Toggle */}
                <div className="flex items-center gap-4 mt-2 sm:mt-0">

                    <button
                        onClick={() => setSelectedchat(null)}
                        className="sm:hidden flex items-center gap-1 text-sm px-3 py-2 text-white bg-fuchsia-600 hover:bg-fuchsia-700 rounded-lg my-2 ml-2"
                    >
                        <span><TbArrowBackUp/></span> Back
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
