import React, { useEffect, useRef, useState } from 'react';
import Peer from 'simple-peer';
import { toast } from 'react-toastify';
import { IoMic, IoMicOff, IoVideocam, IoVideocamOff, IoCall, IoPeople } from "react-icons/io5";

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

const ICE_CONFIG = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
    ],
};

// Video Tile for a Remote Peer
const RemotePeerVideoTile = ({ peerObj, callType }) => {
    const videoRef = useRef(null);
    const audioRef = useRef(null);

    useEffect(() => {
        if (peerObj.stream) {
            if (videoRef.current) {
                videoRef.current.srcObject = peerObj.stream;
            }
            if (audioRef.current) {
                audioRef.current.srcObject = peerObj.stream;
            }
        }
    }, [peerObj.stream]);

    const isVideo = callType === 'video';
    const isCameraOff = Boolean(peerObj.isCameraOff);
    const avatarUrl = getAvatarUrl(peerObj.user?.avtar);

    if (!isVideo) {
        // Voice Call Tile
        return (
            <div className="relative flex flex-col items-center justify-center p-6 rounded-2xl bg-[var(--c-surface)] border border-[var(--c-line)] shadow-lg aspect-square min-w-[200px] max-w-[280px] mx-auto animate-fadeIn">
                <audio ref={audioRef} autoPlay playsInline />
                <div className="relative mb-3">
                    <div className="absolute -inset-2.5 rounded-full bg-[var(--c-primary)]/20 animate-pulse" />
                    <img
                        src={avatarUrl}
                        alt={peerObj.user?.name}
                        className="relative w-20 h-20 rounded-full object-cover border-2 border-[var(--c-primary)] shadow-md"
                    />
                    {peerObj.isMuted && (
                        <div className="absolute bottom-0 right-0 p-1.5 bg-red-500 rounded-full text-white text-xs shadow">
                            <IoMicOff />
                        </div>
                    )}
                </div>
                <h4 className="text-sm font-semibold text-[var(--c-text)] truncate max-w-[150px]">
                    {peerObj.user?.name || "Participant"}
                </h4>
                <p className="text-[11px] text-[var(--c-text-3)] truncate">
                    @{peerObj.user?.userName || "user"}
                </p>
            </div>
        );
    }

    // Video Call Tile
    return (
        <div className="relative rounded-2xl overflow-hidden bg-[var(--c-surface)] border border-[var(--c-line)] shadow-lg aspect-video flex items-center justify-center group animate-fadeIn">
            {/* Hidden audio element ensures audio keeps playing even if video is off */}
            <audio ref={audioRef} autoPlay playsInline />

            {!isCameraOff ? (
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                />
            ) : (
                <div className="flex flex-col items-center justify-center p-4">
                    <div className="relative mb-2">
                        <img
                            src={avatarUrl}
                            alt={peerObj.user?.name}
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-[var(--c-line)] shadow-md"
                        />
                    </div>
                    <span className="text-[11px] text-[var(--c-text-2)] bg-[var(--c-panel)]/80 px-2.5 py-0.5 rounded-full border border-[var(--c-line)]">
                        Camera off
                    </span>
                </div>
            )}

            {/* Peer info badge */}
            <div className="absolute bottom-2.5 left-2.5 flex items-center gap-2 bg-[var(--c-overlay)] backdrop-blur-md px-2.5 py-1 rounded-lg border border-[var(--c-line)] z-10">
                <span className="text-xs font-medium text-[var(--c-text)] truncate max-w-[120px]">
                    {peerObj.user?.name || "Participant"}
                </span>
                {peerObj.isMuted && (
                    <span className="text-red-400 text-xs" title="Muted">
                        <IoMicOff />
                    </span>
                )}
            </div>
        </div>
    );
};

const GroupCall = ({ socket, user, chat, callType = 'video', onEndCall, isInitiator = false }) => {
    const [, setLocalStream] = useState(null);
    const [muted, setMuted] = useState(false);
    const [videoEnabled, setVideoEnabled] = useState(callType === 'video');
    const [peers, setPeers] = useState([]); // array of { peerID, peer, user, stream, isMuted, isCameraOff }
    const [duration, setDuration] = useState(0);

    const localVideoRef = useRef(null);
    const peersRef = useRef([]); // holds { peerID, peer, user, stream }
    const streamRef = useRef(null);
    const startTimeRef = useRef(null);
    const hadPeersRef = useRef(false);
    const isEndingRef = useRef(false);

    const chatId = chat?._id?.toString();
    const myId = (user?._id || user)?.toString();
    const myAvatar = getAvatarUrl(user?.avtar);

    // Call duration timer
    useEffect(() => {
        startTimeRef.current = Date.now();
        const interval = setInterval(() => {
            if (startTimeRef.current) {
                setDuration(Math.round((Date.now() - startTimeRef.current) / 1000));
            }
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Local Media Acquisition & Socket Handshake
    useEffect(() => {
        let isMounted = true;

        const initMedia = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: callType === 'video',
                    audio: true
                });

                if (!isMounted) {
                    stream.getTracks().forEach(t => t.stop());
                    return;
                }

                streamRef.current = stream;
                setLocalStream(stream);

                if (localVideoRef.current && callType === 'video') {
                    localVideoRef.current.srcObject = stream;
                }

                // Join the group call room
                if (socket) {
                    socket.emit("joinGroupCall", {
                        chatId,
                        user: {
                            _id: myId,
                            name: user?.name || "User",
                            userName: user?.userName || "user",
                            avtar: user?.avtar || ""
                        },
                        callType
                    });
                }
            } catch (err) {
                console.error("[GroupCall] Failed to acquire media:", err);
                alert(`Cannot access media devices: ${err.message}. Please check permissions.`);
                handleLeave();
            }
        };

        initMedia();

        return () => {
            isMounted = false;
        };
    }, [chatId, callType]);

    // WebRTC Signaling Listeners
    useEffect(() => {
        if (!socket) return;

        // 1. All existing participants received upon joining
        const handleAllUsers = (existingParticipants) => {
            console.log("[GroupCall] Received existing participants:", existingParticipants.length);
            // As the newcomer, existing members will initiate peer connections to us.
        };

        // 2. An existing participant receives notification that a new user joined -> Initiate connection
        const handleUserJoined = ({ socketId, user: newUser }) => {
            console.log("[GroupCall] New user joined group call:", socketId, newUser?.name);
            if (!streamRef.current) return;

            // Create an initiating peer towards the newcomer
            const peer = new Peer({
                initiator: true,
                trickle: false,
                stream: streamRef.current,
                config: ICE_CONFIG
            });

            peer.on("signal", (signal) => {
                socket.emit("groupCallSignal", {
                    userToSignal: socketId,
                    callerId: socket.id,
                    signal,
                    user: {
                        _id: myId,
                        name: user?.name,
                        userName: user?.userName,
                        avtar: user?.avtar
                    }
                });
            });

            peer.on("stream", (remoteStream) => {
                setPeers(prev => {
                    const existing = prev.find(p => p.peerID === socketId);
                    if (existing) {
                        return prev.map(p => p.peerID === socketId ? { ...p, stream: remoteStream } : p);
                    }
                    return [...prev, { peerID: socketId, peer, user: newUser, stream: remoteStream, isMuted: false, isCameraOff: false }];
                });
            });

                peersRef.current.push({ peerID: socketId, peer, user: newUser });
                hadPeersRef.current = true;
            };

            // 3. User receives signal (Offer or Answer)
            const handleReceiveSignal = ({ signal, callerId, user: callerUser }) => {
                console.log("[GroupCall] Received signal from:", callerId);

                const existingPeerObj = peersRef.current.find(p => p.peerID === callerId);

                if (existingPeerObj) {
                    // Signal is an answer returning to initiator
                    existingPeerObj.peer.signal(signal);
                } else {
                    // New incoming connection from an existing member -> Create non-initiator peer
                    if (!streamRef.current) return;

                    const peer = new Peer({
                        initiator: false,
                        trickle: false,
                        stream: streamRef.current,
                        config: ICE_CONFIG
                    });

                    peer.on("signal", (retSignal) => {
                        socket.emit("groupCallSignal", {
                            userToSignal: callerId,
                            callerId: socket.id,
                            signal: retSignal,
                            user: {
                                _id: myId,
                                name: user?.name,
                                userName: user?.userName,
                                avtar: user?.avtar
                            }
                        });
                    });

                    peer.on("stream", (remoteStream) => {
                        hadPeersRef.current = true;
                        setPeers(prev => {
                            const existing = prev.find(p => p.peerID === callerId);
                            if (existing) {
                                return prev.map(p => p.peerID === callerId ? { ...p, stream: remoteStream } : p);
                            }
                            return [...prev, { peerID: callerId, peer, user: callerUser, stream: remoteStream, isMuted: false, isCameraOff: false }];
                        });
                    });

                    peer.signal(signal);
                    peersRef.current.push({ peerID: callerId, peer, user: callerUser });
                    hadPeersRef.current = true;
                }
            };

            // 4. Remote peer leaves
            const handleUserLeft = ({ socketId }) => {
                console.log("[GroupCall] User left group call:", socketId);
                const peerObj = peersRef.current.find(p => p.peerID === socketId);
                if (peerObj) {
                    try { peerObj.peer.destroy(); } catch { /* ignore */ }
                }
                peersRef.current = peersRef.current.filter(p => p.peerID !== socketId);
                setPeers(prev => {
                    const nextPeers = prev.filter(p => p.peerID !== socketId);
                    // If we previously had connected peers and now have 0, auto-end if server hasn't already
                    if (hadPeersRef.current && nextPeers.length === 0) {
                        setTimeout(() => {
                            if (peersRef.current.length === 0 && !isEndingRef.current) {
                                toast.info("All participants left. Call ended.");
                                teardown(true);
                            }
                        }, 800);
                    }
                    return nextPeers;
                });
            };

            // 5. Remote peer camera toggle
            const handleRemoteCameraToggle = ({ socketId, enabled }) => {
                setPeers(prev => prev.map(p => p.peerID === socketId ? { ...p, isCameraOff: !enabled } : p));
            };

            // 6. Remote peer mute toggle
            const handleRemoteMuteToggle = ({ socketId, isMuted }) => {
                setPeers(prev => prev.map(p => p.peerID === socketId ? { ...p, isMuted } : p));
            };

            // 7. Group call ended globally by server (initiator left or participants dropped to <= 1)
            const handleServerGroupCallEnded = ({ chatId: endedChatId, reason }) => {
                console.log("[GroupCall] Received groupCallEnded:", endedChatId, reason);
                if (endedChatId?.toString() === chatId?.toString()) {
                    if (reason === "initiator_left") {
                        toast.info("Group call ended by the host");
                    } else if (reason === "single_participant_left") {
                        toast.info("Call ended (all other participants left)");
                    }
                    teardown(false);
                }
            };

            socket.on("allGroupCallUsers", handleAllUsers);
            socket.on("userJoinedGroupCall", handleUserJoined);
            socket.on("userGroupCallSignal", handleReceiveSignal);
            socket.on("userLeftGroupCall", handleUserLeft);
            socket.on("groupCameraToggle", handleRemoteCameraToggle);
            socket.on("groupMuteToggle", handleRemoteMuteToggle);
            socket.on("groupCallEnded", handleServerGroupCallEnded);

            return () => {
                socket.off("allGroupCallUsers", handleAllUsers);
                socket.off("userJoinedGroupCall", handleUserJoined);
                socket.off("userGroupCallSignal", handleReceiveSignal);
                socket.off("userLeftGroupCall", handleUserLeft);
                socket.off("groupCameraToggle", handleRemoteCameraToggle);
                socket.off("groupMuteToggle", handleRemoteMuteToggle);
                socket.off("groupCallEnded", handleServerGroupCallEnded);
            };
        }, [socket, myId, user, chatId]);

        // Teardown helper
        const teardown = (notifySocket = true) => {
            if (isEndingRef.current) return;
            isEndingRef.current = true;

            // Destroy all peer connections
            peersRef.current.forEach(({ peer }) => {
                try { peer.destroy(); } catch { /* ignore */ }
            });
            peersRef.current = [];

            // Stop local hardware tracks
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(t => t.stop());
                streamRef.current = null;
            }

            // Notify socket server
            if (notifySocket && socket && chatId) {
                if (isInitiator) {
                    socket.emit("endGroupCall", { chatId });
                } else {
                    socket.emit("leaveGroupCall", { chatId });
                }
            }

            if (onEndCall) {
                onEndCall({
                    type: callType,
                    duration,
                    isGroup: true,
                    shouldLogCall: isInitiator // Only initiator posts the call log
                });
            }
        };

        const handleLeave = () => {
            teardown(true);
        };

    // Toggle Microphone
    const toggleMute = () => {
        if (streamRef.current) {
            const audioTrack = streamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                const newMuted = !audioTrack.enabled;
                setMuted(newMuted);
                if (socket && chatId) {
                    socket.emit("groupMuteToggle", { chatId, isMuted: newMuted });
                }
            }
        }
    };

    // Toggle Camera
    const toggleVideo = () => {
        if (streamRef.current && callType === 'video') {
            const videoTrack = streamRef.current.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                const newEnabled = videoTrack.enabled;
                setVideoEnabled(newEnabled);
                if (socket && chatId) {
                    socket.emit("groupCameraToggle", { chatId, enabled: newEnabled });
                }
            }
        }
    };

    const isVideo = callType === 'video';
    const totalParticipants = peers.length + 1; // peers + self

    return (
        <div className="fixed inset-0 z-[100] bg-[var(--c-canvas)] text-[var(--c-text)] flex flex-col justify-between overflow-hidden animate-fadeIn">
            {/* Top Bar Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-[var(--c-panel-95)] backdrop-blur-md border-b border-[var(--c-line)] z-20">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--c-primary)]/20 border border-[var(--c-primary)] flex items-center justify-center text-[var(--c-primary)] text-lg">
                        <IoPeople />
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-[var(--c-text)] truncate max-w-[200px] sm:max-w-xs">
                            {chat?.chatname || "Group Call"}
                        </h2>
                        <div className="flex items-center gap-2 text-xs text-[var(--c-text-2)]">
                            <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                                <span>{totalParticipants} in call</span>
                            </span>
                            <span>•</span>
                            <span className="font-mono text-emerald-400 font-semibold">{formatDuration(duration)}</span>
                        </div>
                    </div>
                </div>

                <div className="text-xs px-3 py-1 rounded-full bg-[var(--c-surface)] border border-[var(--c-line)] text-[var(--c-text-2)]">
                    {isVideo ? "Group Video" : "Group Voice"}
                </div>
            </div>

            {/* Main Stage Grid */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto flex items-center justify-center">
                {isVideo ? (
                    // Video Call Grid Layout
                    <div className={`grid gap-4 w-full max-w-6xl mx-auto h-full max-h-[75vh] ${
                        totalParticipants <= 2
                            ? 'grid-cols-1 md:grid-cols-2'
                            : totalParticipants <= 4
                                ? 'grid-cols-2'
                                : 'grid-cols-2 md:grid-cols-3'
                    }`}>
                        {/* Local User Tile */}
                        <div className="relative rounded-2xl overflow-hidden bg-[var(--c-surface)] border border-[var(--c-line)] shadow-lg aspect-video flex items-center justify-center">
                            {videoEnabled ? (
                                <video
                                    ref={localVideoRef}
                                    autoPlay
                                    muted
                                    playsInline
                                    className="w-full h-full object-cover transform -scale-x-100"
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center p-4">
                                    <img
                                        src={myAvatar}
                                        alt={user?.name}
                                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-[var(--c-line)] shadow-md mb-2"
                                    />
                                    <span className="text-[11px] text-[var(--c-text-2)] bg-[var(--c-panel)]/80 px-2.5 py-0.5 rounded-full border border-[var(--c-line)]">
                                        Camera off
                                    </span>
                                </div>
                            )}
                            <div className="absolute bottom-2.5 left-2.5 flex items-center gap-2 bg-[var(--c-overlay)] backdrop-blur-md px-2.5 py-1 rounded-lg border border-[var(--c-line)] z-10">
                                <span className="text-xs font-medium text-[var(--c-text)]">You</span>
                                {muted && <span className="text-red-400 text-xs"><IoMicOff /></span>}
                            </div>
                        </div>

                        {/* Remote Peer Video Tiles */}
                        {peers.map((peerObj) => (
                            <RemotePeerVideoTile
                                key={peerObj.peerID}
                                peerObj={peerObj}
                                callType="video"
                            />
                        ))}
                    </div>
                ) : (
                    // Voice Call Cluster Layout
                    <div className="flex flex-wrap items-center justify-center gap-6 max-w-4xl mx-auto py-8">
                        {/* Local User Voice Tile */}
                        <div className="relative flex flex-col items-center justify-center p-6 rounded-2xl bg-[var(--c-surface)] border border-[var(--c-line)] shadow-lg aspect-square min-w-[200px] max-w-[280px] animate-fadeIn">
                            <div className="relative mb-3">
                                <div className="absolute -inset-2.5 rounded-full bg-[var(--c-primary)]/20 animate-pulse" />
                                <img
                                    src={myAvatar}
                                    alt={user?.name}
                                    className="relative w-20 h-20 rounded-full object-cover border-2 border-[var(--c-primary)] shadow-md"
                                />
                                {muted && (
                                    <div className="absolute bottom-0 right-0 p-1.5 bg-red-500 rounded-full text-white text-xs shadow">
                                        <IoMicOff />
                                    </div>
                                )}
                            </div>
                            <h4 className="text-sm font-semibold text-[var(--c-text)] truncate max-w-[150px]">
                                {user?.name || "You"} (You)
                            </h4>
                            <p className="text-[11px] text-[var(--c-text-3)] truncate">
                                @{user?.userName || "you"}
                            </p>
                        </div>

                        {/* Remote Peer Voice Tiles */}
                        {peers.map((peerObj) => (
                            <RemotePeerVideoTile
                                key={peerObj.peerID}
                                peerObj={peerObj}
                                callType="audio"
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Bottom Control Dock */}
            <div className="p-6 bg-[var(--c-panel-95)] backdrop-blur-md border-t border-[var(--c-line)] flex items-center justify-center gap-6 z-20">
                {/* Mute Button */}
                <button
                    onClick={toggleMute}
                    className={`w-14 h-14 rounded-full flex items-center justify-center text-xl transition-all shadow-lg ${
                        muted
                            ? 'bg-red-500/20 text-red-500 border-2 border-red-500/40 hover:bg-red-500/30'
                            : 'bg-[var(--c-surface)] text-[var(--c-text)] border border-[var(--c-line)] hover:bg-[var(--c-hover)]'
                    }`}
                    title={muted ? "Unmute Microphone" : "Mute Microphone"}
                >
                    {muted ? <IoMicOff /> : <IoMic />}
                </button>

                {/* Camera Toggle Button (if video mode) */}
                {isVideo && (
                    <button
                        onClick={toggleVideo}
                        className={`w-14 h-14 rounded-full flex items-center justify-center text-xl transition-all shadow-lg ${
                            !videoEnabled
                                ? 'bg-red-500/20 text-red-500 border-2 border-red-500/40 hover:bg-red-500/30'
                                : 'bg-[var(--c-surface)] text-[var(--c-text)] border border-[var(--c-line)] hover:bg-[var(--c-hover)]'
                        }`}
                        title={videoEnabled ? "Turn Off Camera" : "Turn On Camera"}
                    >
                        {!videoEnabled ? <IoVideocamOff /> : <IoVideocam />}
                    </button>
                )}

                {/* Leave / End Call Button */}
                <button
                    onClick={handleLeave}
                    className="px-6 h-14 rounded-full bg-[var(--c-danger)] hover:bg-[var(--c-danger)]/90 text-white flex items-center justify-center gap-2 text-sm font-semibold transition-all shadow-lg transform hover:scale-105"
                    title={isInitiator ? "End Call for Everyone" : "Leave Call"}
                >
                    <IoCall className="rotate-[135deg] text-xl" />
                    <span>{isInitiator ? "End Call" : "Leave"}</span>
                </button>
            </div>
        </div>
    );
};

export default GroupCall;
