import { useContext, useState, useEffect } from 'react';
import messageContext from '../contexts/MessageContext/messageContext';
import chatContext from '../contexts/ChatContext/chatcontext';
import { IoCloseSharp } from "react-icons/io5";
import { GiEvilEyes } from "react-icons/gi";
import { toast } from 'react-toastify';
const DMsg = () => {
    const { AllMessages, Allmsg, setAllmsg, msg, DeleteMsg, Del, setDel } = useContext(messageContext);
    const { user, selectedchat } = useContext(chatContext);

    const [forevryone, setForevryone] = useState(false)

    const hendleDelete = async () => {
        try {
            await DeleteMsg(msg._id, forevryone)
            await AllMessages(selectedchat._id)
            setDel(false)
        } catch (e) {
            toast.error(e.message);
        }
    }

    return (
        <div className="fixed inset-0 bg-transparent bg-opacity-40 backdrop-blur-md z-50 flex items-center justify-center px-4">
            <div className="bg-white dark:bg-gray-900 text-black dark:text-white w-full max-w-md rounded-xl p-6 shadow-2xl relative transition-all duration-300 ease-in-out">

                {/* Close Button */}
                <button
                    className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-xl transition-transform hover:scale-125"
                    onClick={() => setDel(false)}
                >
                    <IoCloseSharp />
                </button>

                {/* Icon */}
                <div className="text-6xl p-3 flex justify-center items-center text-center mb-2 dark:text-green-400 text-fuchsia-600">
                    <GiEvilEyes />
                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold text-center text-fuchsia-700 dark:text-fuchsia-400 mb-4">
                    Are you sure you want to delete this message?
                </h1>

                {/* Checkbox Row */}
                <div className="flex items-center justify-center gap-3 mb-6">
                    <label className="text-gray-700 dark:text-gray-300 text-sm flex items-center gap-2">
                        <input
                            type="checkbox"
                            className="accent-fuchsia-600 size-4"
                            checked={forevryone}
                            onChange={() => setForevryone(!forevryone)}
                        />
                        Delete for everyone
                    </label>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center gap-4">
                    <button
                        onClick={hendleDelete}
                        className="bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-2 rounded-full shadow-md transition-all duration-200"
                    >
                        Yes
                    </button>
                    <button
                        onClick={() => setDel(false)}
                        className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-black dark:text-white font-medium px-6 py-2 rounded-full shadow-md transition-all duration-200"
                    >
                        No
                    </button>
                </div>
            </div>
        </div>

    )
}

export default DMsg