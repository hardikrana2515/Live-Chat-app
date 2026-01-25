import React, { useEffect, useRef, useState } from 'react';
import Peer from 'simple-peer';
import { IoMic, IoMicOff, IoVideocam, IoVideocamOff, IoCall } from "react-icons/io5";

const VideoCall = ({ socket, user, chat, EndCall, signalData, isIncoming, callType }) => {
    const [stream, setStream] = useState(null);
    const [callAccepted, setCallAccepted] = useState(false);
    const [muted, setMuted] = useState(false);
    const [videoEnabled, setVideoEnabled] = useState(callType === 'video');

    const myVideo = useRef();
    const userVideo = useRef();
    const connectionRef = useRef();
    const otherMember = chat.members.find(m => m._id !== user._id);

    useEffect(() => {
        let isMounted = true;

        const getMedia = async () => {
            try {
                // Request video only if callType is video
                const videoConstraint = callType === 'video' ? true : false;
                const currentStream = await navigator.mediaDevices.getUserMedia({ video: videoConstraint, audio: true });

                if (!isMounted) {
                    // Component unmounted before we got stream
                    currentStream.getTracks().forEach(track => track.stop());
                    return;
                }

                setStream(currentStream);
                if (myVideo.current && callType === 'video') myVideo.current.srcObject = currentStream;

                if (isIncoming && signalData) {
                    answerCall(currentStream);
                } else if (!isIncoming) {
                    callUser(currentStream);
                }
            } catch (err) {
                console.error("Failed to get stream:", err);
                if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
                    alert("Camera/Mic is already in use by another app or tab. Please close other instances and try again.");
                } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                    alert("Please allow camera and microphone access.");
                } else {
                    alert(`Failed to access media devices: ${err.message}`);
                }
                EndCall();
            }
        };

        getMedia();

        return () => {
            isMounted = false;
            // Immediate cleanup not possible here for the *pending* stream, handled by isMounted check.
            // But if we have stream in state, stop it.
            // Note: 'stream' state variable usage in cleanup is tricky due to closure.
            // We'll trust setStream(null) logic or ref? 
            // Better: use a ref for stream to access in cleanup
        };
    }, [callType]); // Re-run if callType changes (rare for this component lifecycle but safe)

    // Effect for cleanup when component unmounts
    useEffect(() => {
        return () => {
            if (stream) {
                console.log("Stopping stream tracks...");
                stream.getTracks().forEach(track => track.stop());
            }
        }
    }, [stream]);

    const callUser = (currentStream) => {
        // We need to know WHO we are calling. 
        // In a group, simple-peer implies 1:1 or mesh.
        // Let's assume 1:1 for now as per "simple-peer" standard usage.
        const otherUser = chat.members.find(m => m._id !== user._id);
        if (!otherUser) return;

        const peer = new Peer({ initiator: true, trickle: false, stream: currentStream });

        peer.on('signal', (data) => {
            socket.emit("callUser", {
                userToCall: otherUser._id,
                signalData: data,
                from: user._id,
                name: user.name,
                callType: callType
            });
        });

        peer.on('stream', (currentStream) => {
            if (userVideo.current && callType === 'video') userVideo.current.srcObject = currentStream;
        });

        socket.on("callAccepted", (signal) => {
            setCallAccepted(true);
            peer.signal(signal);
        });

        connectionRef.current = peer;
    };

    const answerCall = (currentStream) => {
        setCallAccepted(true);
        const peer = new Peer({ initiator: false, trickle: false, stream: currentStream });

        peer.on('signal', (data) => {
            socket.emit("answerCall", { signal: data, to: signalData.from });
        });

        peer.on('stream', (currentStream) => {
            if (userVideo.current && callType === 'video') userVideo.current.srcObject = currentStream;
        });

        peer.signal(signalData.signalData);

        connectionRef.current = peer;
    };

    // Toggle Mute
    const toggleMute = () => {
        if (stream) {
            const audioTrack = stream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setMuted(!audioTrack.enabled);
            }
        }
    };

    // Toggle Video
    const toggleVideo = () => {
        if (stream && callType === 'video') {
            const videoTrack = stream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setVideoEnabled(videoTrack.enabled);
            }
        } else if (callType === 'audio') {
            // Maybe switch to video call? (Advanced, let's just ignore for now)
            alert("Switching to video is not supported in this version.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4">
            <h2 className="text-white text-xl mb-4">
                {isIncoming ? (callType === 'video' ? "Video Call with..." : "Voice Call with...") : (callType === 'video' ? "Calling (Video)..." : "Calling (Voice)...")}
            </h2>

            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-4xl justify-center items-center">
                {/* My Video/Avatar */}
                <div className="relative flex flex-col items-center">
                    {callType === 'video' ? (
                        <video playsInline muted ref={myVideo} autoPlay className="w-full sm:w-[400px] rounded-lg bg-gray-800 border border-gray-700" />
                    ) : (
                        <div className="w-32 h-32 sm:w-48 sm:h-48 rounded-full bg-gray-700 flex items-center justify-center border-4 border-fuchsia-600 animate-pulse">
                            <span className="text-white font-bold text-xl">You</span>
                        </div>
                    )}
                    <span className="mt-2 text-white text-xs bg-black/50 px-2 rounded">You {muted ? '(Muted)' : ''}</span>
                </div>

                {/* Other User Video/Avatar */}
                {callAccepted ? (
                    <div className="relative flex flex-col items-center">
                        {callType === 'video' ? (
                            <video playsInline ref={userVideo} autoPlay className="w-full sm:w-[400px] rounded-lg bg-gray-800 border border-gray-700" />
                        ) : (
                            <div className="w-32 h-32 sm:w-48 sm:h-48 rounded-full bg-gray-700 flex items-center justify-center border-4 border-green-500 shadow-lg shadow-green-500/50">
                                <img src={otherMember?.avtar} alt={otherMember?.name} className="w-full h-full rounded-full object-cover" />
                            </div>
                        )}
                        <span className="mt-2 text-white font-semibold">{otherMember?.name}</span>
                    </div>
                ) : (
                    <div className="text-gray-400 animate-pulse">
                        Connecting...
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="flex gap-4 mt-8">
                <button
                    onClick={toggleMute}
                    className={`p-4 rounded-full ${muted ? 'bg-red-500' : 'bg-gray-700'} text-white hover:opacity-80 transition`}
                >
                    {muted ? <IoMicOff size={24} /> : <IoMic size={24} />}
                </button>

                {callType === 'video' && (
                    <button
                        onClick={toggleVideo}
                        className={`p-4 rounded-full ${!videoEnabled ? 'bg-red-500' : 'bg-gray-700'} text-white hover:opacity-80 transition`}
                    >
                        {!videoEnabled ? <IoVideocamOff size={24} /> : <IoVideocam size={24} />}
                    </button>
                )}

                <button
                    onClick={EndCall}
                    className="p-4 rounded-full bg-red-600 text-white hover:bg-red-700 transition"
                >
                    <IoCall size={24} style={{ transform: 'rotate(135deg)' }} />
                </button>
            </div>
        </div>
    );
};

export default VideoCall;
