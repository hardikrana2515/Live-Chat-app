import React, { useEffect, useRef, useState } from 'react';
import Peer from 'simple-peer';
import { IoMic, IoMicOff, IoVideocam, IoVideocamOff, IoCall } from "react-icons/io5";

const getAvatarUrl = (avatar) => {
    if (!avatar) return '/avtar.png';
    if (avatar.startsWith('data:') || avatar.startsWith('http')) return avatar;
    return `http://localhost:4000${avatar}`;
};

const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

const VideoCall = ({ socket, user, chat, EndCall, signalData, isIncoming, callType }) => {
    const [stream, setStream] = useState(null);
    const [callAccepted, setCallAccepted] = useState(false);
    const [muted, setMuted] = useState(false);
    const [videoEnabled, setVideoEnabled] = useState(callType === 'video');
    const [remoteVideoEnabled, setRemoteVideoEnabled] = useState(true);
    const [callDuration, setCallDuration] = useState(0);

    const myVideo = useRef();
    const userVideo = useRef();
    const remoteAudio = useRef(); // Audio sink for voice calls
    const connectionRef = useRef();
    const streamRef = useRef();
    const callStartTimeRef = useRef(null);

    // STUN servers so WebRTC can traverse symmetric NATs / firewalls (Issue E5)
    const ICE_CONFIG = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
        ],
    };

    const attachRemoteStream = (remoteStream) => {
        if (callType === 'video' && userVideo.current) {
            userVideo.current.srcObject = remoteStream;
        } else if (remoteAudio.current) {
            remoteAudio.current.srcObject = remoteStream;
        }
    };

    const myId = (user?._id || user)?.toString();
    const otherMember = chat?.members
        ? chat.members.find(m => ((m?._id || m)?.toString()) !== myId)
        : (signalData ? { name: signalData.name, _id: signalData.from, avtar: signalData.avtar } : null);

    const myAvatar = getAvatarUrl(user?.avtar);
    const otherAvatar = getAvatarUrl(otherMember?.avtar);

    // Call duration timer (starts as soon as call is accepted)
    useEffect(() => {
        if (!callAccepted) return;
        callStartTimeRef.current = Date.now();
        const interval = setInterval(() => {
            if (callStartTimeRef.current) {
                setCallDuration(Math.round((Date.now() - callStartTimeRef.current) / 1000));
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [callAccepted]);

    useEffect(() => {
        let isMounted = true;

        const getMedia = async () => {
            try {
                const videoConstraint = callType === 'video';
                const currentStream = await navigator.mediaDevices.getUserMedia({ video: videoConstraint, audio: true });

                if (!isMounted) {
                    currentStream.getTracks().forEach(track => track.stop());
                    return;
                }

                streamRef.current = currentStream;
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
                handleEndCall();
            }
        };

        getMedia();

        if (socket) {
            socket.on("cameraToggle", ({ enabled }) => {
                setRemoteVideoEnabled(enabled);
            });
        }

        return () => {
            isMounted = false;
            if (connectionRef.current) {
                try { connectionRef.current.destroy(); } catch { /* ignore */ }
                connectionRef.current = null;
            }
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
            if (socket) {
                socket.off("callAccepted");
                socket.off("cameraToggle");
            }
        };
    }, [callType]);

    const callUser = (currentStream) => {
        const otherUser = chat?.members
            ? chat.members.find(m => ((m?._id || m)?.toString()) !== myId)
            : null;
        const targetId = (otherUser?._id || otherUser)?.toString();

        if (!targetId || !socket) {
            console.error("Target user or socket missing for call:", targetId, socket);
            if (currentStream) {
                currentStream.getTracks().forEach(track => track.stop());
            }
            handleEndCall();
            return;
        }

        const peer = new Peer({ initiator: true, trickle: false, stream: currentStream, config: ICE_CONFIG });

        peer.on('signal', (data) => {
            console.log("[VideoCall] Sending call signal to:", targetId);
            socket.emit("callUser", {
                userToCall: targetId,
                signalData: data,
                from: myId,
                name: user?.name || "User",
                callType: callType
            });
        });

        peer.on('stream', attachRemoteStream);

        socket.on("callAccepted", (signal) => {
            setCallAccepted(true);
            peer.signal(signal);
        });

        connectionRef.current = peer;
    };

    const answerCall = (currentStream) => {
        if (!socket || !signalData) return;
        setCallAccepted(true);
        const peer = new Peer({ initiator: false, trickle: false, stream: currentStream, config: ICE_CONFIG });

        const callerId = String(signalData.from?._id || signalData.from);

        peer.on('signal', (data) => {
            console.log("[VideoCall] Sending answer signal to:", callerId);
            socket.emit("answerCall", { signal: data, to: callerId });
        });

        peer.on('stream', attachRemoteStream);

        if (signalData.signalData) {
            peer.signal(signalData.signalData);
        }

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

    // Toggle Video (Camera Off / On)
    const toggleVideo = () => {
        if (stream && callType === 'video') {
            const videoTrack = stream.getVideoTracks()[0];
            if (videoTrack) {
                const nextState = !videoTrack.enabled;
                videoTrack.enabled = nextState;
                setVideoEnabled(nextState);

                const targetId = (otherMember?._id || otherMember)?.toString();
                if (socket && targetId) {
                    socket.emit("cameraToggle", { enabled: nextState, to: targetId });
                }
            }
        }
    };

    const handleEndCall = () => {
        const duration = callStartTimeRef.current
            ? Math.max(1, Math.round((Date.now() - callStartTimeRef.current) / 1000))
            : 0;
        const status = callAccepted ? 'ended' : 'missed';
        if (EndCall) {
            EndCall({
                type: callType,
                status,
                duration
            });
        }
    };

    return (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[120] flex flex-col items-center justify-between p-4 sm:p-6 select-none animate-fadeIn">
            {/* Hidden audio sink: plays the remote voice stream during audio calls */}
            <audio ref={remoteAudio} autoPlay playsInline className="hidden" />

            {/* Call Header */}
            <div className="flex flex-col items-center pt-2">
                <span className="text-xs uppercase tracking-widest font-bold text-[var(--c-link)] mb-1">
                    {callType === 'video' ? 'Video Call' : 'Voice Call'}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--c-text)]">
                    {otherMember?.name || 'User'}
                </h2>
                <div className="mt-1 text-xs font-semibold px-3 py-1 rounded-full bg-[var(--c-surface)] text-[var(--c-text-2)] border border-[var(--c-line)]">
                    {callAccepted ? (
                        <span className="text-emerald-400 font-mono tracking-wider">
                            ● {formatDuration(callDuration)}
                        </span>
                    ) : (
                        <span className="animate-pulse text-[var(--c-warning)]">
                            Connecting...
                        </span>
                    )}
                </div>
            </div>

            {/* Call Stage */}
            <div className="flex-1 w-full max-w-4xl flex items-center justify-center p-2 sm:p-4 min-h-0">
                {callType === 'video' ? (
                    /* Video Grid */
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full h-full max-h-[520px]">
                        {/* Remote User Screen */}
                        <div className="relative w-full h-full min-h-[220px] rounded-2xl overflow-hidden bg-[var(--c-surface)] border border-[var(--c-line)] shadow-2xl flex items-center justify-center">
                            {callAccepted ? (
                                remoteVideoEnabled ? (
                                    <video playsInline ref={userVideo} autoPlay className="w-full h-full object-cover" />
                                ) : (
                                    /* Remote camera off: display their profile picture */
                                    <div className="flex flex-col items-center justify-center gap-3 p-4">
                                        <div className="relative">
                                            <img
                                                src={otherAvatar}
                                                alt={otherMember?.name}
                                                className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover avatar-ring shadow-xl border-2 border-emerald-500/50"
                                            />
                                            <span className="absolute bottom-1 right-1 p-1.5 rounded-full bg-[var(--c-danger)] text-white text-xs shadow-md">
                                                <IoVideocamOff />
                                            </span>
                                        </div>
                                        <p className="text-xs font-medium text-[var(--c-text-2)]">
                                            {otherMember?.name}&apos;s camera is off
                                        </p>
                                    </div>
                                )
                            ) : (
                                <div className="flex flex-col items-center gap-3 animate-pulse">
                                    <img
                                        src={otherAvatar}
                                        alt={otherMember?.name}
                                        className="w-24 h-24 rounded-full object-cover border-2 border-[var(--c-line)]"
                                    />
                                    <span className="text-xs text-[var(--c-text-3)] font-medium">Ringing...</span>
                                </div>
                            )}
                            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-semibold text-white">
                                {otherMember?.name || 'Remote User'}
                            </div>
                        </div>

                        {/* Local User Screen ("You") */}
                        <div className="relative w-full h-full min-h-[220px] rounded-2xl overflow-hidden bg-[var(--c-surface)] border border-[var(--c-line)] shadow-2xl flex items-center justify-center">
                            {videoEnabled ? (
                                <video playsInline muted ref={myVideo} autoPlay className="w-full h-full object-cover" />
                            ) : (
                                /* Local camera off: display user profile picture */
                                <div className="flex flex-col items-center justify-center gap-3 p-4">
                                    <div className="relative">
                                        <img
                                            src={myAvatar}
                                            alt={user?.name || "You"}
                                            className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover avatar-ring shadow-xl border-2 border-[var(--c-primary)]"
                                        />
                                        <span className="absolute bottom-1 right-1 p-1.5 rounded-full bg-[var(--c-danger)] text-white text-xs shadow-md">
                                            <IoVideocamOff />
                                        </span>
                                    </div>
                                    <p className="text-xs font-medium text-[var(--c-text-2)]">Your camera is off</p>
                                </div>
                            )}
                            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-semibold text-white flex items-center gap-1.5">
                                <span>You</span>
                                {muted && <span className="text-[var(--c-danger)] text-[10px]">(Muted)</span>}
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Voice Call Stage: Show user profile pictures with animated pulsing wave rings */
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16 w-full py-6">
                        {/* Remote User Avatar */}
                        <div className="flex flex-col items-center gap-3">
                            <div className="relative flex items-center justify-center">
                                {callAccepted && (
                                    <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping opacity-50 scale-125" />
                                )}
                                <div className="w-28 h-28 sm:w-40 sm:h-40 rounded-full p-1.5 bg-gradient-to-tr from-emerald-500 to-teal-400 shadow-2xl relative z-10 flex items-center justify-center">
                                    <img
                                        src={otherAvatar}
                                        alt={otherMember?.name}
                                        className="w-full h-full rounded-full object-cover border-2 border-black/40"
                                    />
                                </div>
                            </div>
                            <span className="text-sm sm:text-base font-bold text-[var(--c-text)]">
                                {otherMember?.name || 'User'}
                            </span>
                        </div>

                        {/* Connection Bridge Divider */}
                        <div className="hidden sm:flex flex-col items-center gap-1 text-[var(--c-text-3)]">
                            <div className="w-16 border-t border-dashed border-[var(--c-line)]" />
                            <span className="text-[10px] uppercase font-bold tracking-wider">voice</span>
                            <div className="w-16 border-t border-dashed border-[var(--c-line)]" />
                        </div>

                        {/* Local User ("You") Avatar */}
                        <div className="flex flex-col items-center gap-3">
                            <div className="relative flex items-center justify-center">
                                <div className="w-28 h-28 sm:w-40 sm:h-40 rounded-full p-1.5 bg-gradient-to-tr from-[var(--c-primary)] to-[var(--c-accent)] shadow-2xl relative z-10 flex items-center justify-center">
                                    <img
                                        src={myAvatar}
                                        alt={user?.name || "You"}
                                        className="w-full h-full rounded-full object-cover border-2 border-black/40"
                                    />
                                </div>
                            </div>
                            <span className="text-sm sm:text-base font-bold text-[var(--c-text)]">
                                You {muted ? '(Muted)' : ''}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Controls Dock */}
            <div className="flex items-center gap-4 pb-2">
                {/* Mute Toggle */}
                <button
                    onClick={toggleMute}
                    className={`p-3.5 sm:p-4 rounded-full transition-all transform hover:scale-105 shadow-xl ${
                        muted
                            ? 'bg-[var(--c-danger)] text-white'
                            : 'bg-[var(--c-surface)] text-[var(--c-text)] hover:bg-[var(--c-hover)] border border-[var(--c-line)]'
                    }`}
                    title={muted ? 'Unmute microphone' : 'Mute microphone'}
                >
                    {muted ? <IoMicOff size={22} /> : <IoMic size={22} />}
                </button>

                {/* Camera Toggle (Video Call Only) */}
                {callType === 'video' && (
                    <button
                        onClick={toggleVideo}
                        className={`p-3.5 sm:p-4 rounded-full transition-all transform hover:scale-105 shadow-xl ${
                            !videoEnabled
                                ? 'bg-[var(--c-danger)] text-white'
                                : 'bg-[var(--c-surface)] text-[var(--c-text)] hover:bg-[var(--c-hover)] border border-[var(--c-line)]'
                        }`}
                        title={videoEnabled ? 'Turn camera off' : 'Turn camera on'}
                    >
                        {!videoEnabled ? <IoVideocamOff size={22} /> : <IoVideocam size={22} />}
                    </button>
                )}

                {/* End Call Button */}
                <button
                    onClick={handleEndCall}
                    className="p-3.5 sm:p-4 rounded-full bg-[var(--c-danger)] hover:opacity-90 text-white transition-all transform hover:scale-105 shadow-xl"
                    title="End Call"
                >
                    <IoCall size={22} style={{ transform: 'rotate(135deg)' }} />
                </button>
            </div>
        </div>
    );
};

export default VideoCall;
