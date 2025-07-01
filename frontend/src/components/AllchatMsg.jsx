import { useContext, useState, useEffect ,useRef } from 'react';
import { TiTick, TiTickOutline } from "react-icons/ti";
import messageContext from '../contexts/MessageContext/messageContext';
import chatContext from '../contexts/ChatContext/chatcontext';


const AllchatMsg = () => {
    const { AllMessages, Allmsg, msg, setMsg, DeleteMsg, Del, setDel, ReadBy } = useContext(messageContext);
    const { user, selectedchat } = useContext(chatContext);

    const Endmsg = useRef(null);

    const scrollToBottom = () => {
             (Endmsg.current?.scrollIntoView({behavior: 'smooth'}))
            
            }
    
    useEffect(() => {
        scrollToBottom();
    },[Allmsg,selectedchat])

    useEffect(() => {
        AllMessages(selectedchat._id)

    }, [selectedchat])

    useEffect(() => {
        Allmsg.forEach((M) => {
            if (!M.readBy?.includes(user._id)) {
                ReadBy(M._id)
            }
        });
    }, [user, Allmsg])


    return (
        <div className="flex-1 p-3 sm:p-4 h-full overflow-y-auto custom-scrollbar">
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
                                className={`chat ${isSender ? 'chat-start' : 'chat-end'} px-2 sm:px-3`}
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
                                {m.message.trim() === '' && m.media.trim() === '' ? (
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
                                            const fileExt = m.media.split('.').pop().toLowerCase();

                                            if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt)) {
                                                return (
                                                    <img
                                                        src={fileUrl}
                                                        alt="Image"
                                                        className="rounded-md max-w-full max-h-64 object-contain"
                                                    />
                                                );
                                            } else if (['mp4', 'webm', 'ogg'].includes(fileExt)) {
                                                return (
                                                    <video controls className="rounded-md max-w-full max-h-64">
                                                        <source src={fileUrl} type={`video/${fileExt}`} />
                                                        Your browser does not support the video tag.
                                                    </video>
                                                );
                                            } else if (['mp3', 'wav'].includes(fileExt)) {
                                                return (
                                                    <audio controls className="w-full mt-2">
                                                        <source src={fileUrl} type={`audio/${fileExt}`} />
                                                        Your browser does not support the audio tag.
                                                    </audio>
                                                );
                                            } else if (fileExt === 'pdf') {
                                                return (
                                                    <a
                                                        href={fileUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="underline text-blue-300"
                                                    >
                                                        📄 View PDF
                                                    </a>
                                                );
                                            } else {
                                                return (
                                                    <a
                                                        href={fileUrl}
                                                        download
                                                        className="underline text-blue-300"
                                                    >
                                                        📁 Download File
                                                    </a>
                                                );
                                            }
                                        })()}

                                        {/* Optional message under media */}
                                        {m.message && <p className="mt-2">{m.message}</p>}
                                    </div>
                                ) : (
                                    <div
                                        className={`chat-bubble rounded-2xl ${isSender ? `bg-fuchsia-500` : 'bg-gray-800'
                                            } text-white p-2 max-w-xs sm:max-w-sm`}
                                    >
                                        {m.message}
                                    </div>
                                )}

                                {/* Timestamp & Read */}
                                <div className="text-xs text-gray-400 mt-1 flex items-center gap-1 pl-1">
                                    {isSender &&
                                        (m.readBy?.includes(user._id) ? (
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