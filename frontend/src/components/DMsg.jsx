import { useContext, useState } from 'react';
import messageContext from '../contexts/MessageContext/messageContext';
import chatContext from '../contexts/ChatContext/chatcontext';
import { IoCloseSharp } from "react-icons/io5";
import { FiTrash2 } from "react-icons/fi";
import { toast } from 'react-toastify';
const DMsg = () => {
    const { AllMessages, Allmsg, msg, DeleteMsg, Del, setDel, setEditingMsg, delForEveryone, setDelForEveryone } = useContext(messageContext);
    const { user, selectedchat } = useContext(chatContext);

    const [forevryone, setForevryone] = useState(delForEveryone)

    const close = () => {
        setDel(false);
        setDelForEveryone(false);
    };

    const isSender = String(msg?.Sender?._id || msg?.Sender) === String(user?._id);
    const timeDiffMs = msg?.createdAt ? (Date.now() - new Date(msg.createdAt).getTime()) : Infinity;
    const withinOneHour = timeDiffMs < 60 * 60 * 1000;
    const minutesLeft = withinOneHour ? Math.max(1, Math.round((60 * 60 * 1000 - timeDiffMs) / 60000)) : 0;

    const hendleDelete = async () => {
        try {
            await DeleteMsg(msg._id, forevryone && isSender, selectedchat?._id)
            close()
        } catch (e) {
            toast.error(e.message);
        }
    }

    return (
        <div className="fixed inset-0 bg-[var(--c-overlay)] backdrop-blur-md z-[70] flex items-center justify-center px-4">
            <div className="bg-[var(--c-surface)]  text-[var(--c-text)]  w-full max-w-md rounded-xl p-6 shadow-2xl relative transition-all duration-300 ease-in-out">

                {/* Close Button */}
                <button
                    className="absolute top-3 right-3 text-[var(--c-text-3)] hover:text-[var(--c-danger)] text-xl transition-transform hover:scale-125"
                    onClick={close}
                >
                    <IoCloseSharp />
                </button>

                {/* Icon */}
                <div className="flex justify-center mb-4">
                    <span className="w-16 h-16 rounded-full bg-[var(--c-danger-10)] border border-[var(--c-danger-40)] flex items-center justify-center text-[var(--c-danger)]">
                        <FiTrash2 className="text-3xl" />
                    </span>
                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold text-center text-[var(--c-text)]  mb-4">
                    {forevryone ? "Delete for everyone?" : "Delete this message?"}
                </h1>

                {/* Checkbox Row & Hints */}
                {isSender && withinOneHour ? (
                    <div className="flex flex-col items-center justify-center gap-1.5 mb-6">
                        <label className="text-[var(--c-text-2)] text-sm flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                className="accent-[var(--c-primary)] size-4"
                                checked={forevryone}
                                onChange={() => setForevryone(!forevryone)}
                            />
                            Delete for everyone ({minutesLeft}m left to unsend)
                        </label>
                    </div>
                ) : isSender && !withinOneHour ? (
                    <p className="text-xs text-[var(--c-text-3)] text-center mb-5">
                        Messages older than 1 hour can only be deleted for yourself.
                    </p>
                ) : null}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
                    <button
                        onClick={hendleDelete}
                        className="w-full sm:w-auto bg-[var(--c-danger)] hover:brightness-110 text-white font-medium px-5 py-2 rounded-full shadow-md transition-all duration-200"
                    >
                        Delete
                    </button>
                    {isSender && withinOneHour && !msg?.isDeleted && msg?.message && !msg?.message?.includes("[CONTACT_CARD]:::") && (
                        <button
                            onClick={() => {
                                close();
                                if (setEditingMsg) setEditingMsg(msg);
                            }}
                            className="w-full sm:w-auto bg-[var(--c-primary)] hover:brightness-110 text-white font-medium px-5 py-2 rounded-full shadow-md transition-all duration-200"
                        >
                            Edit Instead
                        </button>
                    )}
                    <button
                        onClick={close}
                        className="w-full sm:w-auto bg-[var(--c-raised)] hover:bg-[var(--c-hover)]  text-[var(--c-text)]  font-medium px-5 py-2 rounded-full shadow-md transition-all duration-200"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>

    )
}

export default DMsg