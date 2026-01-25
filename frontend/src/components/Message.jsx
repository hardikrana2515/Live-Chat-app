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
import { encryptMessage, encryptFile } from '../utils/EncryptionUtils';
import { MdPoll } from "react-icons/md";
import CreatePollModal from './CreatePollModal';
import CameraModal from './CameraModal';
import AttachmentMenu from './AttachmentMenu';

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

    // Refs for file inputs
    const documentInputRef = useRef(null);
    const galleryInputRef = useRef(null);
    const audioInputRef = useRef(null);
    // const typingTimeoutRef = useRef(null); // Not using ref for now to keep it simple with window timeout as implemented below

    useEffect(() => {
        if (!socket.current || !selectedchat?._id) return;

        socket.current.emit("join chat", selectedchat._id);

        socket.current.on("message received", (newMsg) => {
            if (newMsg.chat._id === selectedchat._id) {
                setAllmsg((prev) => [...prev, newMsg]);
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

        return () => {
            socket.current.off("message received");
            socket.current.off("reaction updated");
            socket.current.off("poll update");
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
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [audioChunks, setAudioChunks] = useState([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            setMediaRecorder(recorder);
            setAudioChunks([]);

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    setAudioChunks((prev) => [...prev, e.data]);
                }
            };

            recorder.onstop = async () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                // We could play it back or send it immediately. Let's send it immediately for simplicity like WhatsApp
                // Or let's create a file from it and set it as media

                // Wait, audioChunks state might not be updated in this closure if using state directly. 
                // Better to use a mutable ref for chunks or improved logic.
                // Let's rely on the final event to compose blob? 
                // Actually, standard pattern is to use a ref for chunks or setState functional update, but onstop closure captures old state.
                // Resetting that:
            };

            // Correction: let's do simple ondataavailable push.
            // But we encounter closure stale state issues in onstop if we just read 'audioChunks'.
            // Simple fix: Define onstop inside the effect or use a Ref for chunks.

            recorder.start();
            setRecording(true);
            toast.info("Recording started...");
        } catch (error) {
            toast.error("Could not access microphone");
            console.error(error);
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && mediaRecorder.state !== "inactive") {
            mediaRecorder.stop();
            setRecording(false);

            // Because onstop closure issue, let's hack: 
            // We can't easily access the chunks here cleanly without a Ref. 
            // So I will just use the chunks collected so far? 
            // Actually, let's rewrite startRecording to use a local variable for chunks within the closure or use a Ref.
        }
    };

    // Ref-based approach for audio chunks
    const audioChunksRef = useRef([]);
    const startRecordingSafe = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            setMediaRecorder(recorder);
            audioChunksRef.current = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    audioChunksRef.current.push(e.data); // Push to ref
                }
            };

            recorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const audioFile = new File([audioBlob], "voice_message.webm", { type: "audio/webm" });
                setMedia(audioFile); // Set as attachment
                // Optional: Auto-send or just let user send. 
                // User asked for "Voice message system". Usually that implies send.
                // Let's set it as media and let user send, showing preview.
                toast.success("Voice message recorded!");

                // Clean up stream tracks
                stream.getTracks().forEach(track => track.stop());
            };

            recorder.start();
            setRecording(true);
        } catch (error) {
            toast.error("Could not access microphone");
        }
    }


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
                <div className="flex items-center justify-between bg-gray-700 p-2 rounded-lg mt-2 mx-4">
                    <div className="flex items-center gap-2">
                        {media.type.startsWith('audio') ? <IoMic className="text-fuchsia-400" /> : <LuPaperclip />}
                        <p className="text-sm sm:text-base text-neutral-300 truncate">{media.name}</p>
                    </div>
                    <IoCloseSharp className="hover:text-red-500 cursor-pointer" onClick={() => setMedia(null)} />
                </div>
            )}


            {/* Input Area */}
            <div className="p-4 mb-3">
                {selectedchat && !selectedchat.isGroup && user.blockedUsers?.includes(selectedchat.members.find(m => m._id !== user._id)?._id) ? (
                    <div className="flex items-center justify-center p-4 bg-gray-800 rounded-full border border-red-500/50">
                        <p className="text-red-400 font-medium text-sm">You have blocked this user. Unblock to send messages.</p>
                    </div>
                ) : (
                    <form
                        className="flex flex-col sm:flex-row gap-3 sm:gap-2 items-stretch"
                        onSubmit={handleSend}
                    >
                        {/* Input + Icons */}
                        <div className="flex items-center gap-2 w-full px-4 py-2 rounded-full bg-gray-800 border border-gray-600 focus-within:ring-2 focus-within:ring-fuchsia-600 transition-all">
                            <input
                                type="text"
                                placeholder="Type a message..."
                                onChange={handleInputChange}
                                value={message}
                                className="flex-1 bg-transparent outline-none text-white placeholder:text-gray-400 text-sm sm:text-base"
                                disabled={recording}
                            />

                            {recording && <span className="text-red-500 animate-pulse text-sm font-semibold mr-2">Recording...</span>}

                            {/* Emoji Picker */}
                            <div className="relative">
                                <div onClick={() => setEmoji(!emoji)} className="cursor-pointer">
                                    <GrEmoji className="text-xl text-gray-400 hover:text-white" />
                                </div>
                                {emoji && (
                                    <div className="absolute bottom-12 right-0 z-50 transform -translate-x-1/2 sm:translate-x-0" >
                                        <EmojiPicker
                                            onEmojiClick={(e) => setMessage((prev) => prev + e.emoji)}
                                            disableSearchBar
                                            disableSkinTonePicker
                                            emojiStyle="native"
                                            width="280px"
                                            height="320px"
                                            theme="dark"
                                            className="shadow-2xl"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Attachment Menu & Toggle */}
                            <div className="relative">
                                <div
                                    onClick={() => setShowAttachments(!showAttachments)}
                                    className={`cursor-pointer transition-transform ${showAttachments ? 'rotate-45' : ''}`}
                                >
                                    <LuPaperclip className="text-xl text-gray-400 hover:text-gray-200" />
                                </div>

                                {showAttachments && (
                                    <>
                                        {/* Overlay to close menu when clicking outside */}
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setShowAttachments(false)}
                                        ></div>
                                        <AttachmentMenu onOptionClick={(id) => {
                                            setShowAttachments(false); // Close menu on selection

                                            // Handle Options
                                            if (id === 'poll') {
                                                if (selectedchat.isGroup) setShowPollModal(true);
                                                else toast.info("Polls are only available in group chats.");
                                            } else if (id === 'document') {
                                                documentInputRef.current.click();
                                            } else if (id === 'gallery') {
                                                galleryInputRef.current.click();
                                            } else if (id === 'camera') {
                                                setShowCameraModal(true);
                                            } else if (id === 'audio') {
                                                audioInputRef.current.click();
                                            } else {
                                                toast.info("This feature is coming soon!");
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
                                accept="*/*" // Document accepts all
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
                        <div className="flex gap-2 items-center">
                            {!message && !media ? (
                                <button
                                    type="button"
                                    onClick={recording ? stopRecording : startRecordingSafe}
                                    className={`p-3 rounded-full transition duration-200 ${recording ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'}`}
                                >
                                    {recording ? <IoStop className="text-xl text-white" /> : <IoMic className="text-xl text-white" />}
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    className="p-3 rounded-full bg-fuchsia-600 hover:bg-fuchsia-700 transition duration-200"
                                >
                                    <IoSend className="text-xl text-white" />
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
                    // setMedia(file); // Optional: if we want to show it briefly or relying on state update vs direct send
                    // toast.success("Photo captured!");
                    setShowCameraModal(false);
                    sendMessageRaw("", file); // Auto-send immediately
                }}
            />
        </div>
    );
};

export default Message;
