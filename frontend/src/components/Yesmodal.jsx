
import { useContext } from "react";
import chatContext from "../contexts/ChatContext/chatcontext";
import { IoCloseSharp } from "react-icons/io5";
import { GiEvilEyes } from "react-icons/gi";


const Yesmodal = () => {
    const { user, selectedchat, setSelectedchat, LeaveGroup, DeleteGroup, setYesmodal, Allchat } = useContext(chatContext)

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

    const isCreator = selectedchat?.creator?._id?.toString() === user?._id?.toString();

    if (!selectedchat || !user) return null;

    return (
        <div className="fixed inset-0 bg-transparent bg-opacity-30 backdrop-blur-md z-50 flex items-center justify-center px-4">
            <div className="bg-white dark:bg-gray-900 text-black dark:text-white w-full max-w-md rounded-xl p-6 shadow-2xl relative transition-all duration-300 ease-in-out">

                {/* Close Button */}
                <button
                    className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-xl transition-transform hover:scale-125"
                    onClick={() => setYesmodal(false)}
                >
                    <IoCloseSharp />
                </button>

                {/* Icon */}
                <div className="text-6xl flex justify-center items-center text-center mb-4 dark:text-green-400">
                    <GiEvilEyes />
                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold text-center text-fuchsia-700 dark:text-fuchsia-400 mb-2">
                    Are you sure?
                </h1>

                {/* Message */}
                <p className="text-center text-gray-600 dark:text-gray-300 mb-6 px-2">
                    {isCreator
                        ? "Hey, are you sure you want to delete this group?"
                        : "Hey, are you sure you want to leave this group?"}
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <button
                        onClick={async () => {
                            if (isCreator) {
                                await handleDelete();
                            } else {
                                await handleLeave();
                            }
                            setYesmodal(false);
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-2 rounded-full shadow-md transition-all duration-200 w-full sm:w-auto text-center"
                    >
                        Yes
                    </button>

                    <button
                        onClick={() => setYesmodal(false)}
                        className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-black dark:text-white font-medium px-6 py-2 rounded-full shadow-md transition-all duration-200 w-full sm:w-auto text-center"
                    >
                        No
                    </button>
                </div>
            </div>
        </div>

    )
}

export default Yesmodal