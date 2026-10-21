
import { useContext } from "react";
import chatContext from "../contexts/ChatContext/chatcontext";
import { IoCloseSharp } from "react-icons/io5";
import { FiAlertTriangle } from "react-icons/fi";
import { toast } from "react-toastify";


const Yesmodal = () => {
    const { user, selectedchat, setSelectedchat, LeaveGroup, DeleteGroup, setYesmodal, Allchat, handleBlock, modalType, setModalType } = useContext(chatContext)

    const handleLeave = async () => {
        try {
            const res = await LeaveGroup(selectedchat._id)

            setSelectedchat(prev => ({
                ...prev, members: res.members

            }))
            setSelectedchat(null)
            await Allchat()

        } catch (e) {
            toast.error(e.message)
        }
    }

    const handleDelete = async () => {
        try {
            await DeleteGroup(selectedchat._id)

            await Allchat()
            setSelectedchat(null)
        } catch (e) {
            toast.error(e.message)
        }
    }

    const handleBlockAction = async () => {
        // Find other user
        const otherUser = selectedchat.members.find(m => m._id !== user._id);
        if (otherUser) {
            await handleBlock(otherUser._id);
        }
    }


    const isCreator = selectedchat?.creator?._id?.toString() === user?._id?.toString();

    // Determine config based on modalType or fallback to old logic (group)
    let title = "Are you sure?";
    let message = "";
    let action = async () => { };

    if (modalType === 'block') {
        title = "Block User?";
        message = "You won't receive messages from them.";
        action = handleBlockAction;
    } else {
        // Fallback or Group logic
        message = isCreator
            ? "Hey, are you sure you want to delete this group?"
            : "Hey, are you sure you want to leave this group?";
        action = isCreator ? handleDelete : handleLeave;
    }

    if (!selectedchat || !user) return null;

    return (
        <div className="fixed inset-0 bg-[var(--c-overlay)] backdrop-blur-md z-[70] flex items-center justify-center px-4">
            <div className="bg-[var(--c-surface)]  text-[var(--c-text)]  w-full max-w-md rounded-xl p-6 shadow-2xl relative transition-all duration-300 ease-in-out">

                {/* Close Button */}
                <button
                    className="absolute top-3 right-3 text-[var(--c-text-3)] hover:text-[var(--c-danger)] text-xl transition-transform hover:scale-125"
                    onClick={() => {
                        setYesmodal(false);
                        setModalType(null);
                    }}
                >
                    <IoCloseSharp />
                </button>

                {/* Icon */}
                <div className="flex justify-center mb-4">
                    <span className="w-16 h-16 rounded-full bg-[var(--c-danger-10)] border border-[var(--c-danger-40)] flex items-center justify-center text-[var(--c-danger)]">
                        <FiAlertTriangle className="text-3xl" />
                    </span>
                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold text-center text-[var(--c-text)]  mb-2">
                    {title}
                </h1>

                {/* Message */}
                <p className="text-center text-[var(--c-text-3)]  mb-6 px-2">
                    {message}
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <button
                        onClick={async () => {
                            await action();
                            setYesmodal(false);
                            setModalType(null);
                        }}
                        className="bg-[var(--c-danger)] hover:bg-[var(--c-danger)] text-[var(--c-text)] font-medium px-6 py-2 rounded-full shadow-md transition-all duration-200 w-full sm:w-auto text-center"
                    >
                        Yes
                    </button>

                    <button
                        onClick={() => {
                            setYesmodal(false);
                            setModalType(null);
                        }}
                        className="bg-[var(--c-raised)] hover:bg-[var(--c-primary)] text-[var(--c-text)]  font-medium px-6 py-2 rounded-full shadow-md transition-all duration-200 w-full sm:w-auto text-center"
                    >
                        No
                    </button>
                </div>
            </div>
        </div>

    )
}

export default Yesmodal