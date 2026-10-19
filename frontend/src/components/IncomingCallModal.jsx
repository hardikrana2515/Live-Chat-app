import React from 'react';
import { IoCall, IoClose, IoVideocam, IoMic } from "react-icons/io5";

const IncomingCallModal = ({ callerName, onAccept, onDecline, callType }) => {
    return (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[var(--c-surface)] border border-[var(--c-line)] w-full max-w-md p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-6">

                {/* Caller Info */}
                <div className="flex flex-col items-center gap-3">
                    <div className="w-24 h-24 bg-gradient-to-tr from-[var(--c-primary)] to-[var(--c-accent)] rounded-full flex items-center justify-center shadow-lg animate-pulse">
                        {callType === 'video' ? (
                            <IoVideocam className="text-4xl text-[var(--c-text)]" />
                        ) : (
                            <IoCall className="text-4xl text-[var(--c-text)]" />
                        )}
                    </div>
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-[var(--c-text)] mb-1">{callerName}</h2>
                        <p className="text-[var(--c-text-2)] text-lg">
                            Incoming {callType === 'video' ? 'Video' : 'Voice'} Call...
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-8 w-full justify-center mt-4">
                    <div className="flex flex-col items-center gap-2">
                        <button
                            onClick={onDecline}
                            className="w-16 h-16 bg-[var(--c-danger)] hover:bg-[var(--c-danger)] rounded-full flex items-center justify-center text-[var(--c-text)] transition-all transform hover:scale-110 shadow-lg"
                        >
                            <IoClose className="text-3xl" />
                        </button>
                        <span className="text-[var(--c-text-2)] text-sm">Decline</span>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                        <button
                            onClick={onAccept}
                            className="w-16 h-16 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center text-[var(--c-text)] transition-all transform hover:scale-110 shadow-lg animate-bounce-short"
                        >
                            <IoCall className="text-3xl" />
                        </button>
                        <span className="text-[var(--c-text-2)] text-sm">Accept</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IncomingCallModal;
