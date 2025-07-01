import { useContext, useState, useEffect } from 'react';
import { IoSend, IoCloseSharp } from 'react-icons/io5';
import { LuPaperclip } from "react-icons/lu";
import { GrEmoji } from "react-icons/gr";
import messageContext from '../contexts/MessageContext/messageContext';
import chatContext from '../contexts/ChatContext/chatcontext';
import AllchatMsg from './AllchatMsg'
import { toast } from 'react-toastify';
import SocketContext from '../contexts/Socket.io.Context/socket.Context.js'
import EmojiPicker from 'emoji-picker-react'

const Message = () => {

    const { Send, msg, setMsg, AllMessages, setAllmsg, Allmsg } = useContext(messageContext);
    const { user, selectedchat } = useContext(chatContext);
    const socket = useContext(SocketContext);

    const [message, setMessage] = useState('');
    const [media, setMedia] = useState(null);
    const [emoji, setEmoji] = useState(false);

    useEffect(() => {
        if (!socket.current || !selectedchat?._id) return;

        socket.current.emit("join chat", selectedchat._id);

        socket.current.on("message received", (newMsg) => {
            if (newMsg.chat._id === selectedchat._id) {
                setAllmsg((prev) => [...prev, newMsg]);
            }
        });

        return () => {
            socket.current.off("message received");
        };
    }, [selectedchat]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!message.trim() && !media) {
            return toast.warn("Message cannot be empty");
        }
        try {
            const sentMsg = await Send(message, media, selectedchat._id);
            if (socket.current) {
                socket.current.emit("new message", sentMsg);
                setMessage('');
                setMedia(null);
            }
        } catch (e) {
            toast.error(e.message);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setMedia(file);
            toast.success("Media attached!");
        }
    };

    return (
        <div className="flex flex-col h-full w-full text-white">

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto">
                <AllchatMsg />
            </div>

            {/* Media Preview */}
            {media && (
                <div className="flex items-center justify-between bg-gray-700 p-2 rounded-lg mt-2">
                    <p className="text-sm sm:text-base text-neutral-300 truncate">{media.name}</p>
                    <IoCloseSharp className="hover:text-red-500 cursor-pointer" onClick={() => setMedia(null)} />
                </div>
            )}

            {/* Input Area */}
            <div className="p-4 mb-3">
                <form
                    className="flex flex-col sm:flex-row gap-3 sm:gap-2 items-stretch"
                    onSubmit={handleSend}
                >
                    {/* Input + Icons */}
                    <div className="flex items-center gap-2 w-full px-4 py-2 rounded-full bg-gray-800 border border-gray-600 focus-within:ring-2 focus-within:ring-fuchsia-600">
                        <input
                            type="text"
                            placeholder="Type a message..."
                            onChange={(e) => setMessage(e.target.value)}
                            value={message}
                            className="flex-1 bg-transparent outline-none text-white placeholder:text-gray-400 text-sm sm:text-base"
                        />

                        {/* Emoji Picker w/ toggle + dropdown */}
                        <div className="relative">
                            <div onClick={() => setEmoji(!emoji)} className="cursor-pointer">
                                <GrEmoji className="text-xl text-gray-400 hover:text-white" />
                            </div>

                            {emoji && (
                                <div className="absolute bottom-12 right-0 z-50" >
                                    <EmojiPicker
                                        onEmojiClick={(e) => {
                                            setMessage((prev) => prev + e.emoji);
                                        }}
                                        disableSearchBar
                                        disableSkinTonePicker
                                        emojiStyle="native"
                                        width="280px"
                                        height="320px"
                                        className="rounded-lg shadow-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800"
                                    />
                                </div>
                            )}
                        </div>

                        {/* File Upload */}
                        <div className="relative">
                            <label htmlFor="media-upload" className="cursor-pointer">
                                <LuPaperclip className="text-xl text-gray-400 hover:text-gray-200" />
                            </label>
                            <input
                                type="file"
                                id="media-upload"
                                accept="*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </div>
                    </div>

                    {/* Send Button */}
                    <button
                        type="submit"
                        className="p-3 rounded-full bg-fuchsia-600 hover:bg-fuchsia-700 transition duration-200 self-end sm:self-auto"
                    >
                        <IoSend className="text-xl text-white" />
                    </button>
                </form>
            </div>
        </div>


    );
};

export default Message;
