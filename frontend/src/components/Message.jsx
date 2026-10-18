import { useContext, useState, useEffect, useRef } from 'react';
import { IoSend, IoCloseSharp, IoMic, IoStop } from 'react-icons/io5';
import { LuPaperclip } from "react-icons/lu";
import { GrEmoji } from "react-icons/gr";
import messageContext from '../contexts/MessageContext/messageContext';
import chatContext from '../contexts/ChatContext/chatcontext';
import AllchatMsg from './AllchatMsg'
import { toast } from 'react-toastify';
import SocketContext from '../contexts/Socket.io.Context/socket.Context.js'
import EmojiPicker from 'emoji-picker-react'
import { encryptMessage, encryptFile, decryptMessage } from '../utils/EncryptionUtils';
import { playNotificationSound, playSendSound, showDesktopNotification } from '../utils/SoundUtils';
import { MdPoll } from "react-icons/md";
import CreatePollModal from './CreatePollModal';
import CameraModal from './CameraModal';
import AttachmentMenu from './AttachmentMenu';
import ShareContactModal from './ShareContactModal';

const Message = () => {

    const { Send, msg, setMsg, AllMessages, setAllmsg, Allmsg } = useContext(messageContext);
    const { user, selectedchat } = useContext(chatContext);
    const { socket } = useContext(SocketContext);

    const [message, setMessage] = useState('');
    const [media, setMedia] = useState(null);
    const [emoji, setEmoji] = useState(false);
    const [typing, setTyping] = useState(false);
    const [showPollModal, setShowPollModal] = useState(false);
    const [showAttachments, setShowAttachments] = useState(false);
    const [showCameraModal, setShowCameraModal] = useState(false);
    const [showContactModal, setShowContactModal] = useState(false);

    // Refs for file inputs
    const documentInputRef = useRef(null);
    const galleryInputRef = useRef(null);
    const audioInputRef = useRef(null);
    // const typingTimeoutRef = useRef(null); // Not using ref for now to keep it simple with window timeout as implemented below

    useEffect(() => {
        if (!socket.current || !selectedchat?._id) return;

        socket.current.emit("join chat", selectedchat._id);

        socket.current.on("message received", (newMsg) => {
            const incomingChatId = newMsg.chat?._id || newMsg.chat;
            if (incomingChatId === selectedchat._id) {
                setAllmsg((prev) => [...prev, newMsg]);
            }

            // Play notification tone
            playNotificationSound();

            // Trigger desktop notification if tab is backgrounded or looking at another chat
            if (document.hidden || incomingChatId !== selectedchat._id) {
                const preview = newMsg.message
                    ? (newMsg.message.includes("[CONTACT_CARD]:::") ? "Shared a contact card" : decryptMessage(newMsg.message))
                    : (newMsg.media ? "Shared an attachment" : (newMsg.poll ? "Sent a poll" : "New message"));

                showDesktopNotification(newMsg.Sender?.name || "New Message", {
                    body: preview,
                    icon: newMsg.Sender?.avtar
                        ? (newMsg.Sender.avtar.startsWith('data:') ? newMsg.Sender.avtar : `http://localhost:4000${newMsg.Sender.avtar}`)
                        : "/chat.png"
                });
            }
        });

        socket.current.on("message edited", (updatedMsg) => {
            const chatId = updatedMsg.chatId?._id || updatedMsg.chatId || updatedMsg.chat?._id || updatedMsg.chat;
            if (chatId === selectedchat._id) {
                setAllmsg(prev => prev.map(m => m._id === updatedMsg._id ? updatedMsg : m));
            }
        });

        socket.current.on("reaction updated", (updatedMsg) => {
            if (updatedMsg.chatId === selectedchat._id || updatedMsg.chat === selectedchat._id) {
                setAllmsg(prev => prev.map(m => m._id === updatedMsg._id ? updatedMsg : m));
            }
        });

        socket.current.on("poll update", (updatedMsg) => {
            if (updatedMsg.chatId === selectedchat._id || updatedMsg.chat === selectedchat._id) {
                setAllmsg(prev => prev.map(m => m._id === updatedMsg._id ? updatedMsg : m));
            }
        });

        socket.current.on("message deleted", ({ messageId, forEveryone }) => {
            if (forEveryone) {
                setAllmsg(prev => prev.map(m => m._id === messageId ? { ...m, isDeleted: true, message: "", media: "", poll: null } : m));
            } else {
                setAllmsg(prev => prev.filter(m => m._id !== messageId));
            }
        });

        return () => {
            socket.current.off("message received");
            socket.current.off("message edited");
            socket.current.off("reaction updated");
            socket.current.off("poll update");
            socket.current.off("message deleted");
        };
    }, [selectedchat]);

    const handleInputChange = (e) => {
        setMessage(e.target.value);

        if (!socket.current) return;

        if (!typing) {
            setTyping(true);
            socket.current.emit("typing", selectedchat._id);
        }

        let lastTypingTime = new Date().getTime();
        var timerLength = 3000;

        // Simple debounce without ref for now to avoid ref import issues if I mess it up, 
        // but actually standard way is just setting a timeout. 
        // The issue with the previous logic I thought of (setTimeout inside) is that it captures 'typing' state from closure?
        // Let's use written logic from similar apps.

        // Actually, let's use a simpler timeout logic:
        if (window.typingTimeout) clearTimeout(window.typingTimeout);
        window.typingTimeout = setTimeout(() => {
            if (socket.current) socket.current.emit("stop typing", selectedchat._id);
            setTyping(false);
        }, 3000);
    };




    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setMedia(file);
            toast.success("Media attached!");
        }
    };

    const [recording, setRecording] = useState(false);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const audioStreamRef = useRef(null);

    useEffect(() => {
        return () => {
            if (audioStreamRef.current) {
                audioStreamRef.current.getTracks().forEach(track => track.stop());
                audioStreamRef.current = null;
            }
        };
    }, []);

    const startRecordingSafe = async () => {
        let stream = null;
        try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioStreamRef.current = stream;
            const recorder = new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;
            audioChunksRef.current = [];

            recorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) {
                    audioChunksRef.current.push(e.data);
                }
            };

            recorder.onstop = () => {
                setRecording(false);
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const audioFile = new File([audioBlob], `voice_${Date.now()}.webm`, { type: "audio/webm" });
                setMedia(audioFile);
                toast.success("Voice message recorded! Click send to share.");
                stream.getTracks().forEach(track => track.stop());
                audioStreamRef.current = null;
            };

            recorder.start();
            setRecording(true);
            toast.info("Recording voice message...");
        } catch (error) {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                audioStreamRef.current = null;
            }
            setRecording(false);
            toast.error("Could not access microphone");
            console.error(error);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop();
        }
    };


    const sendMessageRaw = async (msgText, file) => {
        if (!msgText && !file) {
            return toast.warn("Message cannot be empty");
        }
        if (socket.current) socket.current.emit("stop typing", selectedchat._id);

        let fileToSend = file;
        if (file) {
            try {
                // Encrypt file before uploading
                fileToSend = await encryptFile(file);
            } catch (error) {
                console.error("Encryption failed", error);
                return toast.error("Failed to encrypt media");
            }
        }

        const encryptedMessage = encryptMessage(msgText); // Encrypt even if empty string if needed, or handle empty check
        try {
            const sentMsg = await Send(encryptedMessage, fileToSend, selectedchat._id);
            if (socket.current) {
                socket.current.emit("new message", sentMsg);
                setMessage('');
                setMedia(null);
                playSendSound();
            }
        } catch (e) {
            toast.error(e.message);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        await sendMessageRaw(message, media);
    };

    return (
        <div className="flex flex-col h-full w-full text-white">

            {/* Chat Messages */}
            <div className="flex-1 overflow-hidden relative">
                <AllchatMsg />
            </div>

            {/* Media Preview */}
            {media && (
                <div className="flex items-center justify-between bg-slate-800/90 border border-slate-700/80 p-2.5 rounded-xl mx-4 mb-2 shadow-sm">
                    <div className="flex items-center gap-2 overflow-hidden">
                        {media.type.startsWith('audio') ? <IoMic className="text-indigo-400 shrink-0" /> : <LuPaperclip className="text-slate-400 shrink-0" />}
                        <p className="text-xs sm:text-sm text-slate-200 truncate">{media.name}</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setMedia(null)}
                        className="text-slate-400 hover:text-rose-400 p-1 transition"
                    >
                        <IoCloseSharp className="text-base" />
                    </button>
                </div>
            )}

            {/* Input Dock Toolbar */}
            <div className="p-3 sm:p-4 bg-slate-900/95 backdrop-blur-md border-t border-slate-800">
                {selectedchat && !selectedchat.isGroup && user.blockedUsers?.includes(selectedchat.members.find(m => m._id !== user._id)?._id) ? (
                    <div className="flex items-center justify-center p-3 bg-rose-950/30 rounded-xl border border-rose-500/30 text-center">
                        <p className="text-rose-400 font-medium text-xs sm:text-sm">You have blocked this contact. Unblock to send messages.</p>
                    </div>
                ) : (
                    <form
                        className="flex items-center gap-2"
                        onSubmit={handleSend}
                    >
                        {/* Input Container */}
                        <div className="flex items-center gap-2 flex-1 px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-700/80 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all">
                            {/* Emoji Picker Trigger */}
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setEmoji(!emoji)}
                                    className="text-slate-400 hover:text-slate-200 transition focus:outline-none flex items-center"
                                    title="Choose Emoji"
                                >
                                    <GrEmoji className="text-lg" />
                                </button>
                                {emoji && (
                                    <div className="absolute bottom-10 left-0 z-50">
                                        <EmojiPicker
                                            onEmojiClick={(e) => setMessage((prev) => prev + e.emoji)}
                                            disableSearchBar
                                            disableSkinTonePicker
                                            emojiStyle="native"
                                            width="280px"
                                            height="320px"
                                            theme="dark"
                                            className="shadow-2xl border border-slate-700"
                                        />
                                    </div>
                                )}
                            </div>

                            <input
                                type="text"
                                placeholder={recording ? "Recording audio message..." : "Type a secure message..."}
                                onChange={handleInputChange}
                                value={message}
                                className="flex-1 bg-transparent outline-none text-white placeholder:text-slate-500 text-xs sm:text-sm"
                                disabled={recording}
                            />

                            {recording && (
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-400 animate-pulse">
                                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                                    REC
                                </span>
                            )}

                            {/* Attachment Menu & Toggle */}
                            <div className="relative flex items-center">
                                <button
                                    type="button"
                                    onClick={() => setShowAttachments(!showAttachments)}
                                    className={`text-slate-400 hover:text-slate-200 transition-transform ${showAttachments ? 'rotate-45 text-indigo-400' : ''}`}
                                    title="Attach File or Media"
                                >
                                    <LuPaperclip className="text-lg" />
                                </button>

                                {showAttachments && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setShowAttachments(false)}
                                        />
                                        <AttachmentMenu onOptionClick={(id) => {
                                            setShowAttachments(false);

                                            if (id === 'poll') {
                                                if (selectedchat.isGroup) setShowPollModal(true);
                                                else toast.info("Polls are available in group conversations.");
                                            } else if (id === 'contact') {
                                                setShowContactModal(true);
                                            } else if (id === 'document') {
                                                documentInputRef.current.click();
                                            } else if (id === 'gallery') {
                                                galleryInputRef.current.click();
                                            } else if (id === 'camera') {
                                                setShowCameraModal(true);
                                            } else if (id === 'audio') {
                                                audioInputRef.current.click();
                                            } else {
                                                toast.info("Coming soon!");
                                            }
                                        }} />
                                    </>
                                )}
                            </div>

                            {/* Hidden Inputs */}
                            <input
                                type="file"
                                ref={documentInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept="*/*"
                            />
                            <input
                                type="file"
                                ref={galleryInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept="image/*,video/*"
                            />
                            <input
                                type="file"
                                ref={audioInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept="audio/*"
                            />
                        </div>

                        {/* Mic / Send Button */}
                        <div className="flex items-center">
                            {!message && !media ? (
                                <button
                                    type="button"
                                    onClick={recording ? stopRecording : startRecordingSafe}
                                    className={`p-2.5 rounded-xl transition duration-200 ${
                                        recording
                                            ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/30'
                                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80'
                                    }`}
                                    title={recording ? "Stop Recording" : "Voice Message"}
                                >
                                    {recording ? <IoStop className="text-lg" /> : <IoMic className="text-lg" />}
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition duration-150 transform active:scale-95 flex items-center justify-center"
                                    title="Send Message"
                                >
                                    <IoSend className="text-lg" />
                                </button>
                            )}
                        </div>
                    </form>
                )}
            </div>
            {showPollModal && <CreatePollModal onClose={() => setShowPollModal(false)} />}
            <CameraModal
                isOpen={showCameraModal}
                onClose={() => setShowCameraModal(false)}
                onCapture={(file) => {
                    setShowCameraModal(false);
                    sendMessageRaw("", file); // Auto-send immediately
                }}
            />
            {showContactModal && (
                <ShareContactModal
                    onClose={() => setShowContactModal(false)}
                    onShare={(contact) => {
                        setShowContactModal(false);
                        const contactPayload = `[CONTACT_CARD]:::${JSON.stringify({
                            name: contact.name,
                            userName: contact.userName,
                            email: contact.email,
                            phonenumber: contact.phonenumber,
                            avtar: contact.avtar,
                            _id: contact._id
                        })}`;
                        sendMessageRaw(contactPayload);
                        toast.success(`Shared ${contact.name}'s contact!`);
                    }}
                />
            )}
        </div>
    );
};

export default Message;
