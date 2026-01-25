import { useContext, useState, useEffect, useRef } from 'react';
import { TiTick, TiTickOutline } from "react-icons/ti";
import { MdAddReaction } from "react-icons/md";
import messageContext from '../contexts/MessageContext/messageContext';
import chatContext from '../contexts/ChatContext/chatcontext';
import AudioMessage from './AudioMessage';
import { decryptMessage } from '../utils/EncryptionUtils';
import PollMessage from './PollMessage';
import EncryptedAttachment from './EncryptedAttachment';


const AllchatMsg = () => {
    const { AllMessages, Allmsg, msg, setMsg, DeleteMsg, Del, setDel, ReadBy, ReactToMsg } = useContext(messageContext);
    const { user, selectedchat, isAuthReady } = useContext(chatContext); // Use isAuthReady

    const [reactionPopup, setReactionPopup] = useState(null); // stores messageId of open popup

    const Endmsg = useRef(null);

    const scrollToBottom = () => {
        (Endmsg.current?.scrollIntoView({ behavior: 'smooth' }))

    }

    useEffect(() => {
        scrollToBottom();
    }, [Allmsg, selectedchat])

    useEffect(() => {
        if (isAuthReady && selectedchat) {
            AllMessages(selectedchat._id)
        }

    }, [selectedchat, isAuthReady])

    useEffect(() => {
        Allmsg.forEach((M) => {
            if (!M.readBy?.includes(user._id)) {
                ReadBy(M._id)
            }
        });
    }, [user, Allmsg])


    return (
        <div className="flex-1 w-full p-3 sm:p-4 h-full overflow-y-auto overflow-x-hidden custom-scrollbar">
            {!msg ? (
                <p className="text-gray-400 text-center mt-10">No messages yet...</p>
            ) : (
                <div className="flex flex-col gap-4 text-sm text-gray-300">
                    {Allmsg.map((m) => {
                        const isSender = m.Sender._id === user._id;
                        if (m.deletedFor?.includes(user._id)) return null;

                        return (
                            <div
                                key={m._id}
                                className={`chat ${isSender ? 'chat-start' : 'chat-end'} px-2 sm:px-3 group relative`}
                                onContextMenu={(e) => {
                                    e.preventDefault();
                                    setDel(true);
                                    setMsg(m);
                                }}
                            >
                                {/* Avatar */}
                                <div className="chat-image avatar">
                                    <div className="w-10 sm:w-12 rounded-full">
                                        <img
                                            alt={m.Sender.name}
                                            src={
                                                m.Sender.avtar?.startsWith("data:image")
                                                    ? m.Sender.avtar
                                                    : `http://localhost:4000${m.Sender.avtar}`
                                            }
                                            className="object-cover"
                                        />
                                    </div>
                                </div>

                                {/* Bubble */}
                                {(m.poll && m.poll.question) ? (
                                    <PollMessage message={m} />
                                ) : (m.message.trim() === '' && m.media.trim() === '') ? (
                                    <div
                                        className={`chat-bubble rounded-2xl ${isSender ? `bg-blue-300` : 'bg-gray-600'
                                            } text-gray-100 opacity-50 max-w-xs sm:max-w-sm`}
                                    >
                                        "This message was deleted."
                                    </div>
                                ) : m.media ? (
                                    <div
                                        className={`chat-bubble rounded-2xl ${isSender ? `bg-fuchsia-500` : 'bg-gray-800'
                                            } text-white p-2 max-w-xs sm:max-w-sm`}
                                    >
                                        {(() => {
                                            const fileUrl = `http://localhost:4000${m.media}`;
                                            // Hack: We rely on the stored filename extension or some metadata. 
                                            // Ideally we should store mimeType in DB. 
                                            // For now we trust the extension in the URL string, but since we append .enc mostly...
                                            // Wait, encryptFile appended .enc to filename? "file.name + .enc". 
                                            // Server saves it as is. So url ends in .enc?
                                            // The extension logic below splits by '.' and takes last. 
                                            // If it is .enc, we might need to look at the one before it?
                                            // Or, we passed {type: file.type} to the File constructor.
                                            // Multer saves with extension?
                                            // Let's assume standard extension logic for now. 
                                            // If file was "image.png.enc", ext is "enc". That breaks the logic.
                                            // Let's strip .enc if present to find real type.

                                            let fileExt = m.media.split('.').pop().toLowerCase();
                                            if (fileExt === 'enc') {
                                                const parts = m.media.split('.');
                                                if (parts.length > 1) fileExt = parts[parts.length - 2].toLowerCase();
                                            }

                                            return <EncryptedAttachment url={fileUrl} type={fileExt} alt="Shared Media" />;
                                        })()}

                                        {/* Optional message under media */}
                                        {m.message && (
                                            <p className="mt-2">
                                                {decryptMessage(m.message)}
                                                {m.isEdited && <span className="text-[10px] text-gray-300 italic ml-1">(edited)</span>}
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <div
                                        className={`chat-bubble rounded-2xl ${isSender ? `bg-fuchsia-500` : 'bg-gray-800'
                                            } text-white p-2 max-w-xs sm:max-w-sm`}
                                    >
                                        {decryptMessage(m.message)}
                                        {m.isEdited && <span className="text-[10px] text-gray-300 italic ml-1">(edited)</span>}
                                    </div>
                                )}

                                {/* Timestamp & Read */}
                                <div className="text-xs text-gray-400 mt-1 flex items-center gap-1 pl-1">
                                    {isSender &&
                                        (m.readBy?.filter(id => id !== user._id).length > 0 ? (
                                            <TiTick className="text-fuchsia-500 text-base" />
                                        ) : (
                                            <TiTickOutline className="text-fuchsia-300 text-base" />
                                        ))}
                                    <span>
                                        {new Date(m.createdAt).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </span>
                                </div>

                                {/* Reactions Display */}
                                {m.reactions?.length > 0 && (
                                    <div className={`flex gap-1 mt-1 ${isSender ? 'justify-end' : 'justify-start'}`}>
                                        {Object.entries(
                                            m.reactions.reduce((acc, curr) => {
                                                acc[curr.emoji] = (acc[curr.emoji] || 0) + 1;
                                                return acc;
                                            }, {})
                                        ).map(([emoji, count]) => (
                                            <span key={emoji} className="text-xs bg-gray-700 px-1 rounded-md border border-gray-600">
                                                {emoji} {count > 1 && count}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Reaction Button (Hover) */}
                                <div className={`absolute top-0 ${isSender ? '-left-8' : '-right-8'} opacity-0 group-hover:opacity-100 transition-opacity`}>
                                    <button
                                        className="p-1 hover:bg-gray-700 rounded-full"
                                        onClick={(e) => {
                                            e.stopPropagation(); // prevent context menu
                                            setReactionPopup(reactionPopup === m._id ? null : m._id);
                                        }}
                                    >
                                        <MdAddReaction className="text-gray-400 text-lg hover:text-yellow-400" />
                                    </button>

                                    {/* Quick Reaction Popup */}
                                    {reactionPopup === m._id && (
                                        <div className={`absolute -top-8 ${isSender ? 'right-0' : 'left-0'} bg-gray-800 border border-gray-600 rounded-full flex gap-1 p-1 shadow-lg z-10`}>
                                            {['👍', '❤️', '😂', '😮', '😢'].map(emoji => (
                                                <button
                                                    key={emoji}
                                                    className="hover:scale-125 transition-transform px-1"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        ReactToMsg(m._id, emoji);
                                                        setReactionPopup(null);
                                                    }}
                                                >
                                                    {emoji}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            <div ref={Endmsg} />
        </div>

    )
}

export default AllchatMsg