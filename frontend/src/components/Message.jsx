import { useContext, useState, useEffect, useRef } from 'react';
import { IoSend, IoCloseSharp, IoMic, IoStop, IoVideocam } from 'react-icons/io5';
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

const Message = ({ onStartCall }) => {

    const { Send, msg, setMsg, AllMessages, setAllmsg, Allmsg } = useContext(messageContext);
    const { user, selectedchat, setChat } = useContext(chatContext);
    const { socket, isConnected } = useContext(SocketContext);

    const [message, setMessage] = useState('');
    const [media, setMedia] = useState(null);
    const [mediaPreviewUrl, setMediaPreviewUrl] = useState(null);
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

    // Close emoji picker + attachment menu on ANY outside click (chat area,
    // header, sidebar...). A fixed backdrop can't be used here: the toolbar's
    // backdrop-filter turns it into a containing block, trapping fixed children.
    useEffect(() => {
        if (!emoji && !showAttachments) return;
        const onDown = (e) => {
            if (e.target.closest('[data-composer-pop]')) return;
            setEmoji(false);
            setShowAttachments(false);
        };
        document.addEventListener('mousedown', onDown);
        return () => document.removeEventListener('mousedown', onDown);
    }, [emoji, showAttachments]);

    useEffect(() => {
        if (!socket.current || !selectedchat?._id) return;

        // Normalize chat id from either a populated object or a plain id string
        const cidOf = (m) => {
            const c = m?.chatId ?? m?.chat;
            return (c?._id ?? c)?.toString();
        };

        const currentChatId = selectedchat._id.toString();
        socket.current.emit("join chat", currentChatId);

        const handleMessageReceived = (newMsg) => {
            const incomingChatId = (newMsg.chat?._id || newMsg.chat)?.toString();
            if (incomingChatId === currentChatId) {
                setAllmsg((prev) => {
                    if (prev.some(m => m._id === newMsg._id)) return prev;
                    return [...prev, newMsg];
                });
            }

            // Play notification tone
            playNotificationSound();

            // Trigger desktop notification if tab is backgrounded or looking at another chat
            if (document.hidden || incomingChatId !== currentChatId) {
                let preview = "New message";
                if (newMsg.message) {
                    const decrypted = decryptMessage(newMsg.message, incomingChatId);
                    if (decrypted.startsWith("[CALL_LOG]:::")) {
                        try {
                            const log = JSON.parse(decrypted.replace("[CALL_LOG]:::", ""));
                            preview = log.status === 'missed'
                                ? `Missed ${log.type === 'video' ? 'video' : 'voice'} call`
                                : `${log.type === 'video' ? 'Video' : 'Voice'} call ended`;
                        } catch {
                            preview = "Call event";
                        }
                    } else if (decrypted.startsWith("[CONTACT_CARD]:::")) {
                        try {
                            const parsed = JSON.parse(decrypted.replace("[CONTACT_CARD]:::", ""));
                            preview = `📇 Contact: ${parsed.name || "Shared Contact"}`;
                        } catch {
                            preview = "📇 Shared Contact";
                        }
                    } else {
                        preview = decrypted;
                    }
                } else if (newMsg.media) {
                    preview = "Shared an attachment";
                } else if (newMsg.poll) {
                    preview = "Sent a poll";
                }

                showDesktopNotification(newMsg.Sender?.name || "New Message", {
                    body: preview,
                    icon: newMsg.Sender?.avtar
                        ? (newMsg.Sender.avtar.startsWith('data:') ? newMsg.Sender.avtar : `http://localhost:4000${newMsg.Sender.avtar}`)
                        : "/chat.png"
                });
            }
        };

        const handleMessageEdited = (updatedMsg) => {
            if (cidOf(updatedMsg) === currentChatId) {
                setAllmsg(prev => prev.map(m => m._id === updatedMsg._id ? updatedMsg : m));
            }
        };

        const handleReactionUpdated = (updatedMsg) => {
            if (cidOf(updatedMsg) === currentChatId) {
                setAllmsg(prev => prev.map(m => m._id === updatedMsg._id ? updatedMsg : m));
            }
        };

        const handlePollUpdate = (updatedMsg) => {
            if (cidOf(updatedMsg) === currentChatId) {
                setAllmsg(prev => prev.map(m => m._id === updatedMsg._id ? updatedMsg : m));
            }
        };

        const handleMessageDeleted = ({ messageId, forEveryone }) => {
            if (forEveryone) {
                setAllmsg(prev => prev.map(m => m._id === messageId ? { ...m, isDeleted: true, message: "", media: "", poll: null } : m));
            } else {
                setAllmsg(prev => prev.filter(m => m._id !== messageId));
            }
        };

        const handleMessagesRead = ({ messageIds, readerId, chatId }) => {
            if (!chatId || cidOf({ chatId }) === currentChatId) {
                setAllmsg(prev => (prev || []).map(m => {
                    if (!messageIds || messageIds.includes(m._id)) {
                        const existing = m.readBy || [];
                        if (!existing.some(id => String(id?._id ?? id) === String(readerId))) {
                            return { ...m, readBy: [...existing, readerId] };
                        }
                    }
                    return m;
                }));
            }
        };

        socket.current.on("message received", handleMessageReceived);
        socket.current.on("message edited", handleMessageEdited);
        socket.current.on("reaction updated", handleReactionUpdated);
        socket.current.on("poll update", handlePollUpdate);
        socket.current.on("message deleted", handleMessageDeleted);
        socket.current.on("messages read", handleMessagesRead);

        return () => {
            if (socket.current) {
                socket.current.off("message received", handleMessageReceived);
                socket.current.off("message edited", handleMessageEdited);
                socket.current.off("reaction updated", handleReactionUpdated);
                socket.current.off("poll update", handlePollUpdate);
                socket.current.off("message deleted", handleMessageDeleted);
                socket.current.off("messages read", handleMessagesRead);
            }
        };
    }, [selectedchat, isConnected]);

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

// Build + revoke an object URL for image previews (WhatsApp/Telegram-style)
useEffect(() => {
    if (media && media.type && media.type.startsWith('image')) {
        const url = URL.createObjectURL(media);
        setMediaPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }
    setMediaPreviewUrl(null);
}, [media]);

const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
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
            // Encrypt file before uploading (per-conversation key, Issue 3.2)
            fileToSend = await encryptFile(file, selectedchat);
        } catch (error) {
            console.error("Encryption failed", error);
            return toast.error("Failed to encrypt media");
        }
    }

    // Encrypt text with the conversation key (async: derives the chat key
    // on first use) — falls back to legacy encryption when keys are absent
    const encryptedMessage = await encryptMessage(msgText, selectedchat);
    try {
        const sentMsg = await Send(encryptedMessage, fileToSend, selectedchat._id);
        if (socket.current) {
            socket.current.emit("new message", sentMsg);
            setMessage('');
            setMedia(null);
            playSendSound();
        }
        if (setChat) {
            setChat((prevChats) => {
                if (!prevChats) return prevChats;
                return prevChats.map((c) => {
                    if (c._id === selectedchat._id) {
                        return { ...c, lastMessage: sentMsg, updatedAt: new Date().toISOString() };
                    }
                    return c;
                }).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
            });
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
    <div className="flex flex-col h-full w-full text-[var(--c-text)]">

        {/* Chat Messages */}
        <div className="flex-1 min-h-0 overflow-hidden relative">
            <AllchatMsg onStartCall={onStartCall} />
        </div>

        {/* Media Preview */}
        {media && (
            <div className="flex items-center gap-3 bg-[var(--c-surface-80)] border border-[var(--c-line)] p-2.5 rounded-xl mx-4 mb-2 shadow-sm animate-fadeIn">
                {mediaPreviewUrl ? (
                    <img
                        src={mediaPreviewUrl}
                        alt={media.name}
                        className="w-14 h-14 rounded-lg object-cover border border-[var(--c-line)] shrink-0"
                    />
                ) : (
                    <div className="w-14 h-14 rounded-lg bg-[var(--c-panel)] border border-[var(--c-line)] flex items-center justify-center shrink-0">
                        {media.type.startsWith('audio') ? (
                            <IoMic className="text-[var(--c-link)] text-xl" />
                        ) : media.type.startsWith('video') ? (
                            <IoVideocam className="text-[var(--c-accent)] text-xl" />
                        ) : (
                            <LuPaperclip className="text-[var(--c-text-2)] text-xl" />
                        )}
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-[var(--c-text)] truncate font-medium">{media.name}</p>
                    <p className="text-[11px] text-[var(--c-text-3)] mt-0.5">
                        {mediaPreviewUrl ? 'Image' : `${media.type.split('/')[0] || 'File'}${media.size ? ' · ' + formatFileSize(media.size) : ''}`}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setMedia(null)}
                    className="text-[var(--c-text-2)] hover:text-[var(--c-danger)] p-1.5 rounded-lg hover:bg-[var(--c-hover)] transition shrink-0"
                    title="Remove attachment"
                >
                    <IoCloseSharp className="text-base" />
                </button>
            </div>
        )}

        {/* Input Dock Toolbar */}
        <div className="p-3 sm:p-4 bg-[var(--c-panel-95)] backdrop-blur-md border-t border-[var(--c-line)]">
            {selectedchat && !selectedchat.isGroup && user.blockedUsers?.includes(selectedchat.members.find(m => m._id !== user._id)?._id) ? (
                <div className="flex items-center justify-center p-3 bg-[var(--c-danger-10)] rounded-xl border border-[var(--c-danger-40)] text-center">
                    <p className="text-[var(--c-danger)] font-medium text-xs sm:text-sm">You have blocked this contact. Unblock to send messages.</p>
                </div>
            ) : (
                <form
                    className="flex items-center gap-2"
                    onSubmit={handleSend}
                >
                    {/* Input Container */}
                    <div className="flex items-center gap-2 flex-1 px-3.5 py-2 rounded-xl bg-[var(--c-canvas-80)] border border-[var(--c-line)] focus-within:border-[var(--c-primary)] focus-within:ring-1 focus-within:ring-[var(--ring-brand)] transition-all">
                        {/* Emoji Picker Trigger */}
                        <div className="relative z-50" data-composer-pop>
                            <button
                                type="button"
                                onClick={() => { setEmoji(!emoji); setShowAttachments(false); }}
                                className="relative z-50 text-[var(--c-text-2)] hover:text-[var(--c-text)] transition focus:outline-none flex items-center"
                                title="Choose Emoji"
                            >
                                <GrEmoji className="text-lg" />
                            </button>
                            {emoji && (
                                <div className="absolute bottom-10 left-0 z-50 rounded-2xl overflow-hidden border border-[var(--c-line)] shadow-2xl animate-fadeIn">
                                    <EmojiPicker
                                        onEmojiClick={(e) => setMessage((prev) => prev + e.emoji)}
                                        disableSearchBar
                                        disableSkinTonePicker
                                        emojiStyle="native"
                                        width={280}
                                        height={320}
                                        theme={document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark'}
                                    />
                                </div>
                            )}
                        </div>

                        <input
                            type="text"
                            placeholder={recording ? "Recording audio message..." : "Type a secure message..."}
                            onChange={handleInputChange}
                            value={message}
                            className="flex-1 bg-transparent outline-none text-[var(--c-text)]  text-xs sm:text-sm"
                            disabled={recording}
                        />

                        {recording && (
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--c-danger)] animate-pulse">
                                <span className="w-2 h-2 rounded-full bg-[var(--c-danger)]" />
                                REC
                            </span>
                        )}

                        {/* Attachment Menu & Toggle */}
                        <div className="relative flex items-center z-50" data-composer-pop>
                            <button
                                type="button"
                                onClick={() => { setShowAttachments(!showAttachments); setEmoji(false); }}
                                className={`relative z-50 text-[var(--c-text-2)] hover:text-[var(--c-text)] transition-transform ${showAttachments ? 'rotate-45 text-[var(--c-link)]' : ''}`}
                                title="Attach File or Media"
                            >
                                <LuPaperclip className="text-lg" />
                            </button>

                            {showAttachments && (
                                <>
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
                                className={`p-2.5 rounded-xl transition duration-200 ${recording
                                        ? 'bg-[var(--c-danger)] hover:brightness-110 text-[var(--c-text)] shadow-lg '
                                        : 'bg-[var(--c-surface)] hover:bg-[var(--c-raised)] text-[var(--c-text-2)] hover:text-[var(--c-text)] border border-[var(--c-line)]'
                                    }`}
                                title={recording ? "Stop Recording" : "Voice Message"}
                            >
                                {recording ? <IoStop className="text-lg" /> : <IoMic className="text-lg" />}
                            </button>
                        ) : (
                            <button
                                type="submit"
                                className="p-2.5 rounded-xl bg-[var(--c-primary)] hover:bg-[var(--c-primary-hover)] text-[var(--c-text)] shadow-md  transition duration-150 transform active:scale-95 flex items-center justify-center"
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
