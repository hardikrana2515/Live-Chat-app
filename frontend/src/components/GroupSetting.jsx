import React, { useContext, useEffect, useState } from 'react'
import { IoCall, IoCloseSharp } from "react-icons/io5"
import { IoMdAdd } from "react-icons/io";
import { GiOverkill } from "react-icons/gi";
import { VscEdit } from "react-icons/vsc"
import { FaOldRepublic } from "react-icons/fa";
import { MdRemoveModerator } from "react-icons/md";
import chatContext from '../contexts/ChatContext/chatcontext'
import { toast } from 'react-toastify'
import Addmember from './Addmember';
const GroupSetting = () => {

    const { settingmodal, setSettingmodal, selectedchat, setSelectedchat,
        user, Allchat, UpdateIcon, Renamegroup, Addadmin, RemoveFromGroup,
        addmodal, setAddmodal, RemoveAdmin } = useContext(chatContext)

    const [Img, setImg] = useState(null)
    const [newName, setNewname] = useState("")

    const getOtherUser = (loggedInUser, members) => {
        return members.find((m) => m._id !== loggedInUser._id)
    }

    const handleImage = async (e) => {
        e.preventDefault()
        if (!Img) {
            toast.call("No image selected!")
            return
        }
        try {
            const res = await UpdateIcon(selectedchat._id, Img)

            setSelectedchat(prev => ({
                ...prev,
                groupIcon: res.imageUrl
            }))
            await Allchat()
        } catch (e) { toast.error(e.message) }
        document.querySelector("input[type='file']").value = ""
        setImg(null)
    }

    const handleName = async (e) => {
        e.preventDefault()
        try {
            const res = await Renamegroup(selectedchat._id, newName)
            setSelectedchat(prev => ({
                ...prev, chatname: res.chatname
            }))
            await Allchat()
        } catch (e) {
            toast.error(e.message)
        }
        e.target.reset()
        setNewname("")
    }

    const handleAdmin = async (memberId) => {
        try {
            const res = await Addadmin(memberId, selectedchat._id)

            setSelectedchat(prev => ({
                ...prev, admins: res.admins
            }))
            await Allchat()
        } catch (e) {
            toast.error(e.message)
        }
    }

    const handleRemovmember = async (memberId) => {
        try {
            const res = await RemoveFromGroup(memberId, selectedchat._id)

            setSelectedchat(prev => ({
                ...prev, members: res.members
            }))
            await Allchat()
        } catch (e) {
            toast.error(e.message)
        }
    }

    const hanleAdmin = async (memberId) => {
        try {
            const res = await RemoveAdmin(memberId, selectedchat._id)

            setSelectedchat(prev => ({
                ...prev, admins: res.admins
            }))
            await Allchat()
        } catch (e) {
            toast.error(e.message)
        }
    }


    const otherUser = !selectedchat.isGroup ? getOtherUser(user, selectedchat.members) : null

    return (
        <div className="fixed inset-0 bg-transparent bg-opacity-40 backdrop-blur-sm z-50 flex items-center justify-center px-4">
            <div className="bg-white dark:bg-gray-900 text-black dark:text-white w-full max-w-2xl rounded-2xl p-6 relative shadow-2xl transition-all duration-300 ease-in-out max-h-[95vh] overflow-y-auto custom-scrollbar">

                {/* Close Button */}
                <button
                    className="absolute top-3 right-3 text-2xl text-gray-500 hover:text-red-500 transition"
                    onClick={() => setSettingmodal(false)}
                >
                    <IoCloseSharp />
                </button>

                {/* Title */}
                <h2 className="text-xl font-semibold text-center mb-6 text-fuchsia-600 dark:text-fuchsia-400">
                    {selectedchat.isGroup ? "Group Setting" : "User Setting"}
                </h2>

                {/* Avatar + Form */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                    <img
                        src={
                            selectedchat.isGroup
                                ? (selectedchat.groupIcon ? `http://localhost:4000${selectedchat.groupIcon}` : "/group.png")
                                : (otherUser?.avtar?.startsWith('data:image')
                                    ? otherUser.avtar
                                    : `http://localhost:4000${otherUser?.avtar}`)
                        }
                        alt={selectedchat.isGroup ? selectedchat.chatname : otherUser?.userName}
                        className="w-20 h-20 rounded-full object-cover border-4 border-amber-300"
                    />

                    <div className="flex flex-col flex-1 overflow-hidden">
                        <h3 className="text-xl font-semibold truncate">
                            {selectedchat.isGroup ? selectedchat.chatname : otherUser?.name}
                        </h3>
                        {!selectedchat.isGroup && (
                            <span className="text-sm text-gray-500 truncate">@{otherUser?.userName}</span>
                        )}

                        {selectedchat.isGroup && (
                            <form onSubmit={handleImage} className="mt-4 flex flex-col sm:flex-row gap-3">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setImg(e.target.files[0])}
                                    className="file-input file-input-bordered file-input-sm dark:bg-gray-800 dark:text-white"
                                />
                                <button
                                    type="submit"
                                    className="rounded-full bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-semibold px-4 py-2 shadow-md transition-all duration-200"
                                >
                                    Update Icon
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                {/* Contact Info (if not group) */}
                {!selectedchat.isGroup && otherUser?.phonenumber && (
                    <div className="flex items-center gap-2 mt-6 text-gray-600 dark:text-gray-300">
                        <IoCall className="text-xl" />
                        <span className="text-md">{otherUser.phonenumber}</span>
                    </div>
                )}

                {/* Group Name Change + Add Member */}
                {selectedchat.isGroup && (
                    <>
                        <form onSubmit={handleName} className="flex flex-col sm:flex-row gap-3 items-center mt-6">
                            <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewname(e.target.value)}
                                placeholder={selectedchat.chatname}
                                className="w-full px-4 py-2 rounded-md bg-gray-900 text-white border border-gray-600 focus:ring-fuchsia-500"
                            />
                            <button
                                type="submit"
                                className={`px-4 py-2 text-white rounded-md ${newName.length < 2
                                        ? "bg-cyan-500 opacity-30 cursor-not-allowed"
                                        : "bg-fuchsia-600 hover:bg-fuchsia-700"
                                    } transition`}
                                disabled={newName.length < 2}
                            >
                                <VscEdit />
                            </button>
                        </form>

                        <button
                            className="flex items-center gap-2 mt-4 bg-fuchsia-600 text-white px-4 py-2 rounded-md hover:bg-fuchsia-700 transition"
                            onClick={() => setAddmodal(true)}
                        >
                            <IoMdAdd className="text-xl" />
                            Add New Member
                        </button>
                    </>
                )}

                {/* Add Modal if opened */}
                {addmodal && <Addmember />}

                {/* Members List */}
                {selectedchat.isGroup && (
                    <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-2 text-white">Group Members:</h3>
                        <div className="flex flex-col gap-2 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
                            {selectedchat.members.map((member) => (
                                <div
                                    key={member._id}
                                    className="flex items-center justify-between gap-4 p-2 rounded-md hover:bg-gray-800 cursor-pointer transition-all duration-200"
                                >
                                    <div className="flex items-center gap-3 w-full overflow-hidden">
                                        <img
                                            src={
                                                member?.avtar?.startsWith("data:image")
                                                    ? member.avtar
                                                    : `http://localhost:4000${member.avtar}`
                                            }
                                            alt={member.name}
                                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                                        />
                                        <div className="flex flex-col justify-center overflow-hidden">
                                            <h3 className="text-white font-medium truncate flex items-center gap-1">
                                                {member.name}
                                                {selectedchat.admins.some(admin =>
                                                    (admin._id ? admin._id.toString() : admin.toString()) === member._id.toString()
                                                ) && (
                                                        <span className="text-yellow-400 text-sm">👑</span>
                                                    )}
                                            </h3>
                                            <p className="text-gray-400 text-sm truncate">@{member.userName}</p>
                                        </div>
                                    </div>

                                    {/* Action Icons */}
                                    {selectedchat.admins.some(admin =>
                                        (admin._id ? admin._id.toString() : admin.toString()) === user._id.toString()
                                    ) && (
                                            <div className="flex gap-2">
                                                <div
                                                    className="p-2 text-xl rounded-full hover:text-green-400 hover:bg-green-950 tooltip"
                                                    data-tip="Make Admin"
                                                    onClick={() => handleAdmin(member._id)}
                                                >
                                                    <FaOldRepublic />
                                                </div>
                                                <div
                                                    className="p-2 text-xl rounded-full hover:text-red-600 hover:bg-red-950 tooltip"
                                                    data-tip="Remove"
                                                    onClick={() => handleRemovmember(member._id)}
                                                >
                                                    <GiOverkill />
                                                </div>
                                            </div>
                                        )}
                                    {selectedchat.admins.some(admin =>
                                        (admin._id ? admin._id.toString() : admin.toString()) === member._id.toString()
                                    ) && (
                                            <div
                                                className="p-2 text-xl rounded-full hover:text-rose-500 hover:bg-rose-950 tooltip"
                                                data-tip="Remove as Admin"
                                                onClick={() => hanleAdmin(member._id)}
                                            >
                                                <MdRemoveModerator />
                                            </div>
                                        )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>

    )
}

export default GroupSetting