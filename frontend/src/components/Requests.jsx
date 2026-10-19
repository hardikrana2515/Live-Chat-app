import React, { useContext, useEffect } from 'react';
import userContext from '../contexts/UserContext/userContext';
import { TiTick, TiTimes } from "react-icons/ti";

const Requests = () => {
    const { getFriendRequests, friendRequests, acceptRequest, refreshUser } = useContext(userContext);

    useEffect(() => {
        getFriendRequests();
    }, []);

    const handleAction = async (requestId, status) => {
        const success = await acceptRequest(requestId, status);
        if (success) {
            getFriendRequests(); // Refresh list
            refreshUser(); // Refresh friends list
        }
    };

    if (!friendRequests?.length) return null;

    // Defensive: skip requests whose sender payload is missing (deleted users)
    const visibleRequests = friendRequests.filter((r) => r?.sender);
    if (visibleRequests.length === 0) return null;

    return (
        <div className="absolute bottom-16 left-4 w-64 bg-[var(--c-panel)] rounded-lg shadow-xl border border-[var(--c-line)] p-2 z-50">
            <h3 className="text-[var(--c-text)] text-sm font-semibold mb-2 px-2">Connection Requests</h3>
            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                {visibleRequests.map((req) => (
                    <div key={req._id} className="flex items-center justify-between bg-[var(--c-raised)] p-2 rounded-md">
                        <div className="flex items-center gap-2">
                            <img
                                src={
                                    req.sender.avtar?.startsWith('data:image')
                                        ? req.sender.avtar
                                        : `http://localhost:4000${req.sender.avtar}`
                                }
                                alt={req.sender.userName}
                                className="w-8 h-8 rounded-full object-cover"
                            />
                            <span className="text-[var(--c-text)] text-xs truncate max-w-[80px]">{req.sender.name}</span>
                        </div>
                        <div className="flex gap-1">
                            <button
                                onClick={() => handleAction(req.sender._id, 'accepted')}
                                className="p-1 bg-green-600 rounded-full hover:bg-green-700 text-[var(--c-text)]"
                            >
                                <TiTick />
                            </button>
                            <button
                                onClick={() => handleAction(req.sender._id, 'rejected')}
                                className="p-1 bg-[var(--c-danger)] rounded-full hover:bg-[var(--c-danger)] text-[var(--c-text)]"
                            >
                                <TiTimes />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Requests;
