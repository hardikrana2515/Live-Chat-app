import React from 'react';
import { IoCall, IoClose, IoVideocam, IoMic } from "react-icons/io5";

const IncomingCallModal = ({ callerName, onAccept, onDecline, callType }) => {
    return (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-gray-800 border border-gray-700 w-full max-w-md p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-6 animate-in zoom-in-95 duration-300">

                {/* Caller Info */}
                <div className="flex flex-col items-center gap-3">
                    <div className="w-24 h-24 bg-gradient-to-tr from-fuchsia-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                        {callType === 'video' ? (
                            <IoVideocam className="text-4xl text-white" />
                        ) : (
                            <IoCall className="text-4xl text-white" />
                        )}
                    </div>
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-white mb-1">{callerName}</h2>
                        <p className="text-gray-400 text-lg">
                            Incoming {callType === 'video' ? 'Video' : 'Voice'} Call...
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-8 w-full justify-center mt-4">
                    <div className="flex flex-col items-center gap-2">
                        <button
                            onClick={onDecline}
                            className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-all transform hover:scale-110 shadow-lg"
                        >
                            <IoClose className="text-3xl" />
                        </button>
                        <span className="text-gray-400 text-sm">Decline</span>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                        <button
                            onClick={onAccept}
                            className="w-16 h-16 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center text-white transition-all transform hover:scale-110 shadow-lg animate-bounce-short"
                        >
                            <IoCall className="text-3xl" />
                        </button>
                        <span className="text-gray-400 text-sm">Accept</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IncomingCallModal;
