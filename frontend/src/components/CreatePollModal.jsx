import { useState, useContext } from 'react';
import { IoCloseSharp, IoAdd, IoRemove } from 'react-icons/io5';
import messageContext from '../contexts/MessageContext/messageContext';
import chatContext from '../contexts/ChatContext/chatcontext';
import SocketContext from '../contexts/Socket.io.Context/socket.Context';
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

        const pollData = {
            question,
            options: validOptions.map(opt => ({ text: opt, votes: [] }))
        };

        try {
            // We need to send this to the 'Send' function or a modified version
            // Since Send handles formData, we can append it as JSON
            // But Send in MessageContext might be tailored for simple text/media.
            // Let's modify MessageContext.js Send function or handle it manually here.
            // Actually, best to use the Send context function if updated, or just call API directly here?
            // Reusing Send function is better for consistency (and it calls message/send).

            // We need to ensure Send can handle 'poll'.
            // For now, let's assume we pass it as a separate arg or special handling.
            // Let's modify Send in MessageContext to accept additionalData? 
            // OR: Just call API directly since it's specific. 
            // But let's check MessageContext first. Assuming we can pass it as a JSON string in formData 'poll' field.

            await Send("", null, selectedchat._id, pollData); // Need to update Send signature

            // For socket, we need to restructure how Send emits, or emit ourselves?
            // The Send function usually returns the message. 
            // Let's Assume Send returns the new message object.

            onClose();
        } catch (e) {
            console.error(e);
            toast.error("Failed to create poll");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 text-white w-full max-w-md rounded-xl p-6 shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white"
                >
                    <IoCloseSharp className="text-2xl" />
                </button>

                <h2 className="text-xl font-bold mb-4 text-center text-fuchsia-400">Create Poll</h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="text-sm text-gray-400 mb-1 block">Question</label>
                        <input
                            type="text"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            className="w-full bg-gray-800 rounded-lg p-3 outline-none focus:ring-2 focus:ring-fuchsia-600"
                            placeholder="Ask a question..."
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm text-gray-400 mb-1 block">Options</label>
                        {options.map((opt, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={opt}
                                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                                    className="flex-1 bg-gray-800 rounded-lg p-2 outline-none focus:ring-2 focus:ring-fuchsia-600"
                                    placeholder={`Option ${idx + 1}`}
                                />
                                {options.length > 2 && (
                                    <button
                                        type="button"
                                        onClick={() => removeOption(idx)}
                                        className="text-red-400 hover:text-red-300"
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
                                className="self-start flex items-center gap-1 text-sm text-fuchsia-400 hover:text-fuchsia-300 mt-1"
                            >
                                <IoAdd /> Add Option
                            </button>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="mt-2 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:opacity-90 py-3 rounded-lg font-semibold transition-all"
                    >
                        Create Poll
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreatePollModal;
