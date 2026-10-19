import { useState, useContext } from 'react';
import { IoCloseSharp, IoAdd, IoRemove } from 'react-icons/io5';
import messageContext from '../contexts/MessageContext/messageContext';
import chatContext from '../contexts/ChatContext/chatcontext';
import SocketContext from '../contexts/Socket.io.Context/socket.Context';
import { encryptMessage } from '../utils/EncryptionUtils';
import { toast } from 'react-toastify';

const CreatePollModal = ({ onClose }) => {
    const { Send } = useContext(messageContext);
    const { selectedchat } = useContext(chatContext);
    const { socket } = useContext(SocketContext);

    const [question, setQuestion] = useState("");
    const [options, setOptions] = useState(["", ""]);

    const handleOptionChange = (index, value) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const addOption = () => {
        if (options.length < 5) {
            setOptions([...options, ""]);
        }
    };

    const removeOption = (index) => {
        if (options.length > 2) {
            const newOptions = options.filter((_, i) => i !== index);
            setOptions(newOptions);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!question.trim()) {
            return toast.warn("Question is required");
        }
        const validOptions = options.filter(o => o.trim());
        if (validOptions.length < 2) {
            return toast.warn("At least 2 options are required");
        }

        try {
            // Poll question/options are content too — encrypt them with the
            // conversation key like any message text (Issue 3.2)
            const pollData = {
                question: await encryptMessage(question.trim(), selectedchat),
                options: await Promise.all(
                    validOptions.map(async (opt) => ({
                        text: await encryptMessage(opt.trim(), selectedchat),
                        votes: []
                    }))
                )
            };

            const newPollMsg = await Send("", null, selectedchat._id, pollData);
            if (socket.current && newPollMsg) {
                socket.current.emit("new message", newPollMsg);
            }
            onClose();
            toast.success("Poll created successfully!");
        } catch (e) {
            console.error(e);
            toast.error("Failed to create poll");
        }
    };

    return (
        <div className="fixed inset-0 bg-[var(--c-overlay)] backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-[var(--c-panel)] text-[var(--c-text)] w-full max-w-md rounded-xl p-6 shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-[var(--c-text-2)] hover:text-[var(--c-text)]"
                >
                    <IoCloseSharp className="text-2xl" />
                </button>

                <h2 className="text-xl font-bold mb-4 text-center text-[var(--c-link)]">Create Poll</h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="text-sm text-[var(--c-text-2)] mb-1 block">Question</label>
                        <input
                            type="text"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            className="w-full bg-[var(--c-surface)] rounded-lg p-3 outline-none focus:ring-2 focus:ring-[var(--c-primary)]"
                            placeholder="Ask a question..."
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm text-[var(--c-text-2)] mb-1 block">Options</label>
                        {options.map((opt, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={opt}
                                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                                    className="flex-1 bg-[var(--c-surface)] rounded-lg p-2 outline-none focus:ring-2 focus:ring-[var(--c-primary)]"
                                    placeholder={`Option ${idx + 1}`}
                                />
                                {options.length > 2 && (
                                    <button
                                        type="button"
                                        onClick={() => removeOption(idx)}
                                        className="text-[var(--c-danger)] hover:text-[var(--c-danger)]"
                                    >
                                        <IoRemove className="text-xl" />
                                    </button>
                                )}
                            </div>
                        ))}
                        {options.length < 5 && (
                            <button
                                type="button"
                                onClick={addOption}
                                className="self-start flex items-center gap-1 text-sm text-[var(--c-link)] hover:text-[var(--c-link)] mt-1"
                            >
                                <IoAdd /> Add Option
                            </button>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="mt-2 btn-primaryhover:opacity-90 py-3 rounded-lg font-semibold transition-all"
                    >
                        Create Poll
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreatePollModal;
