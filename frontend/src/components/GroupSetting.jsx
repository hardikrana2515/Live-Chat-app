import React, { useContext, useState, useRef } from 'react'
import { IoCall, IoCloseSharp, IoSearchOutline } from "react-icons/io5"
import { IoMdAdd } from "react-icons/io"
import { FiUserMinus, FiShield, FiCamera, FiCheck } from "react-icons/fi"
import { LuCrown } from "react-icons/lu"
import { BiLoaderAlt } from "react-icons/bi"
import chatContext from '../contexts/ChatContext/chatcontext'
import { toast } from 'react-toastify'
import Addmember from './Addmember'
import { getSafeMediaUrl } from '../contexts/Api.js'

const GroupSetting = () => {
    const {
        setSettingmodal,
        selectedchat,
        setSelectedchat,
        user,
        Allchat,
        UpdateIcon,
        Renamegroup,
        Addadmin,
        RemoveFromGroup,
        addmodal,
        setAddmodal,
        RemoveAdmin
    } = useContext(chatContext)

    const fileInputRef = useRef(null)
    const [Img, setImg] = useState(null)
    const [imgPreview, setImgPreview] = useState(null)
    const [iconUpdating, setIconUpdating] = useState(false)

    const [newName, setNewname] = useState("")
    const [nameUpdating, setNameUpdating] = useState(false)

    const [searchTerm, setSearchTerm] = useState("")
    const [actionLoading, setActionLoading] = useState(null) // memberId currently being processed
    const [confirmModal, setConfirmModal] = useState(null) // { type: 'dismiss_admin' | 'remove_member', member }

    const getOtherUser = (loggedInUser, members = []) => {
        const loggedInId = (loggedInUser?._id || loggedInUser?.id)?.toString()
        return members.find((m) => (m?._id || m)?.toString() !== loggedInId)
    }

    const currentUserId = (user?._id || user?.id)?.toString()
    const creatorId = (selectedchat?.creator?._id || selectedchat?.creator)?.toString()

    const isMemberAdmin = (m) => {
        const mId = (m?._id || m)?.toString()
        return Boolean(
            (selectedchat?.admins || []).some(admin =>
                (admin?._id ? admin._id.toString() : admin?.toString()) === mId
            ) || (creatorId && creatorId === mId)
        )
    }

    const isViewerAdmin = Boolean(
        (selectedchat?.admins || []).some(admin =>
            (admin?._id ? admin._id.toString() : admin?.toString()) === currentUserId
        ) || (creatorId && creatorId === currentUserId)
    )

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0]
        if (file) {
            setImg(file)
            setImgPreview(URL.createObjectURL(file))
        }
    }

    const handleCancelImage = () => {
        setImg(null)
        if (imgPreview) {
            URL.revokeObjectURL(imgPreview)
            setImgPreview(null)
        }
        if (fileInputRef.current) fileInputRef.current.value = ""
    }

    const handleImage = async (e) => {
        if (e) e.preventDefault()
        if (!Img) {
            toast.warning("No image selected!")
            return
        }
        try {
            setIconUpdating(true)
            const res = await UpdateIcon(selectedchat._id, Img)
            setSelectedchat(prev => ({
                ...prev,
                groupIcon: res.imageUrl || (res.chat && res.chat.groupIcon) || prev.groupIcon
            }))
            await Allchat()
            handleCancelImage()
        } catch (e) {
            console.error(e)
        } finally {
            setIconUpdating(false)
        }
    }

    const handleName = async (e) => {
        if (e) e.preventDefault()
        const trimmed = newName.trim()
        if (!trimmed || trimmed.length < 2) return
        if (trimmed === selectedchat?.chatname) {
            setNewname("")
            return
        }
        try {
            setNameUpdating(true)
            const res = await Renamegroup(selectedchat._id, trimmed)
            setSelectedchat(prev => ({
                ...prev,
                chatname: res.chatname
            }))
            await Allchat()
            setNewname("")
        } catch (e) {
            console.error(e)
        } finally {
            setNameUpdating(false)
        }
    }

    // Make Admin (crown action)
    const handleMakeAdmin = async (memberId) => {
        try {
            setActionLoading(memberId)
            const res = await Addadmin(memberId, selectedchat._id)
            if (res) {
                setSelectedchat(prev => ({
                    ...prev,
                    admins: res.admins || prev.admins,
                    members: res.members || prev.members
                }))
            }
            await Allchat()
        } catch (e) {
            console.error(e)
        } finally {
            setActionLoading(null)
        }
    }

    // Confirm modal action executor (replaces window.confirm)
    const handleConfirmAction = async () => {
        if (!confirmModal) return
        const { type, member } = confirmModal
        const memberId = (member?._id || member)?.toString()
        if (!memberId) return

        try {
            setActionLoading(memberId)
            if (type === 'dismiss_admin') {
                const res = await RemoveAdmin(memberId, selectedchat._id)
                if (res) {
                    setSelectedchat(prev => ({
                        ...prev,
                        admins: res.admins || prev.admins,
                        members: res.members || prev.members
                    }))
                }
            } else if (type === 'remove_member') {
                const res = await RemoveFromGroup(memberId, selectedchat._id)
                if (res) {
                    setSelectedchat(prev => ({
                        ...prev,
                        members: res.members || prev.members,
                        admins: res.admins || prev.admins
                    }))
                }
            }
            await Allchat()
            setConfirmModal(null)
        } catch (e) {
            console.error(e)
        } finally {
            setActionLoading(null)
        }
    }

    const otherUser = !selectedchat?.isGroup
        ? getOtherUser(user, selectedchat?.members)
        : null

    const membersList = selectedchat?.members || []
    const filteredMembers = membersList.filter(member => {
        if (!searchTerm.trim()) return true
        const query = searchTerm.toLowerCase()
        return (
            member.name?.toLowerCase().includes(query) ||
            member.userName?.toLowerCase().includes(query)
        )
    })

    const avatarSrc = imgPreview
        ? imgPreview
        : selectedchat?.isGroup
            ? getSafeMediaUrl(selectedchat?.groupIcon, "/group.png")
            : getSafeMediaUrl(otherUser?.avtar, "/user.png");

    const hasNameChanged = Boolean(newName.trim() && newName.trim() !== selectedchat?.chatname && newName.trim().length >= 2)

    return (
        <div className="fixed inset-0 bg-[var(--c-overlay)] z-50 flex items-center justify-center px-4">
            <div className="bg-[var(--c-surface)] text-[var(--c-text)] w-full max-w-lg rounded-xl p-5 relative shadow-xl border border-[var(--c-line)] transition-all max-h-[92vh] flex flex-col">

                {/* Close Button */}
                <button
                    className="absolute top-4 right-4 p-1.5 rounded-lg text-[var(--c-text-3)] hover:text-[var(--c-text)] hover:bg-[var(--c-panel)] transition"
                    onClick={() => setSettingmodal(false)}
                    aria-label="Close modal"
                >
                    <IoCloseSharp className="text-xl" />
                </button>

                {/* Modal Title */}
                <div className="mb-4">
                    <h2 className="text-base font-semibold text-[var(--c-text)]">
                        {selectedchat?.isGroup ? "Group Settings" : "User Details"}
                    </h2>
                </div>

                {/* Role/Permission Status Banner */}
                {selectedchat?.isGroup && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--c-panel)] border border-[var(--c-line)] text-xs mb-4">
                        {isViewerAdmin ? (
                            <>
                                <LuCrown className="text-sm text-[var(--c-warning)] shrink-0" />
                                <span className="text-[var(--c-text-2)]">
                                    <strong className="text-[var(--c-text)]">Admin View:</strong> You can edit group details, manage roles, and remove members.
                                </span>
                            </>
                        ) : (
                            <>
                                <FiShield className="text-sm text-[var(--c-text-3)] shrink-0" />
                                <span className="text-[var(--c-text-3)]">
                                    Member View: Only group admins can edit group details or manage member roles.
                                </span>
                            </>
                        )}
                    </div>
                )}

                <div className="overflow-y-auto pr-1 flex-1 custom-scrollbar space-y-4">
                    {/* Unified Group Profile Card (Avatar + Group Name / Rename) */}
                    <div className="p-4 rounded-lg bg-[var(--c-panel)] border border-[var(--c-line)] flex flex-col sm:flex-row items-center sm:items-start gap-4">
                        {/* Avatar Column */}
                        <div className="flex flex-col items-center shrink-0">
                            <div className="relative">
                                <img
                                    src={avatarSrc}
                                    alt={selectedchat?.isGroup ? selectedchat.chatname : otherUser?.userName}
                                    className="w-18 h-18 rounded-full object-cover border border-[var(--c-line)]"
                                />

                                {/* Camera edit button for admins */}
                                {selectedchat?.isGroup && isViewerAdmin && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            title="Change group photo"
                                            className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-[var(--c-surface)] hover:bg-[var(--c-hover)] text-[var(--c-text-2)] hover:text-[var(--c-text)] border border-[var(--c-line)] shadow transition"
                                        >
                                            <FiCamera className="text-xs" />
                                        </button>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            accept="image/*"
                                            onChange={handleFileSelect}
                                            className="hidden"
                                        />
                                    </>
                                )}
                            </div>

                            {/* Image Save / Cancel mini strip (active only after picking a file) */}
                            {imgPreview && (
                                <div className="flex items-center gap-1.5 mt-2">
                                    <button
                                        type="button"
                                        onClick={handleImage}
                                        disabled={iconUpdating}
                                        className="px-2.5 py-1 rounded-md bg-[var(--c-primary)] hover:bg-[var(--c-primary-hover)] text-white text-xs font-medium flex items-center gap-1 transition"
                                    >
                                        {iconUpdating ? <BiLoaderAlt className="animate-spin text-xs" /> : <FiCheck className="text-xs" />}
                                        <span>Save</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCancelImage}
                                        disabled={iconUpdating}
                                        className="px-2 py-1 rounded-md bg-[var(--c-surface)] hover:bg-[var(--c-hover)] text-[var(--c-text-2)] text-xs border border-[var(--c-line)] transition"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Group Name & Info Column */}
                        <div className="flex flex-col flex-1 min-w-0 w-full">
                            {selectedchat?.isGroup ? (
                                <>
                                    <label className="text-[11px] font-semibold text-[var(--c-text-3)] uppercase tracking-wider mb-1">
                                        Group Name
                                    </label>
                                    {isViewerAdmin ? (
                                        <form onSubmit={handleName} className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={newName !== "" ? newName : selectedchat.chatname}
                                                onChange={(e) => setNewname(e.target.value)}
                                                placeholder={selectedchat.chatname}
                                                className="flex-1 px-3 py-1.5 text-sm rounded-lg bg-[var(--c-canvas)] text-[var(--c-text)] border border-[var(--c-line)] focus:outline-none focus:border-[var(--c-primary)] transition"
                                            />
                                            {hasNameChanged && (
                                                <button
                                                    type="submit"
                                                    disabled={nameUpdating}
                                                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--c-primary)] hover:bg-[var(--c-primary-hover)] text-white transition flex items-center gap-1 shrink-0"
                                                >
                                                    {nameUpdating ? <BiLoaderAlt className="animate-spin text-xs" /> : <FiCheck className="text-xs" />}
                                                    <span>Save</span>
                                                </button>
                                            )}
                                        </form>
                                    ) : (
                                        <h3 className="text-base font-semibold text-[var(--c-text)] truncate mt-0.5">
                                            {selectedchat.chatname}
                                        </h3>
                                    )}
                                    <span className="text-xs text-[var(--c-text-3)] mt-2">
                                        {membersList.length} {membersList.length === 1 ? "member" : "members"}
                                    </span>
                                </>
                            ) : (
                                <>
                                    <h3 className="text-base font-semibold text-[var(--c-text)] truncate">
                                        {otherUser?.name}
                                    </h3>
                                    <span className="text-xs text-[var(--c-text-3)]">@{otherUser?.userName}</span>
                                    {otherUser?.phonenumber && (
                                        <div className="flex items-center gap-2 mt-2 text-xs text-[var(--c-text-2)]">
                                            <IoCall className="text-sm text-[var(--c-primary)]" />
                                            <span>{otherUser.phonenumber}</span>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Add New Member Button (Admins only) */}
                    {selectedchat?.isGroup && isViewerAdmin && (
                        <button
                            type="button"
                            onClick={() => setAddmodal(true)}
                            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-[var(--c-panel)] hover:bg-[var(--c-hover)] text-[var(--c-text)] border border-[var(--c-line)] text-xs font-medium transition"
                        >
                            <IoMdAdd className="text-base text-[var(--c-primary)]" />
                            <span>Add New Member</span>
                        </button>
                    )}

                    {/* Group Members Section */}
                    {selectedchat?.isGroup && (
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-[11px] font-semibold text-[var(--c-text-3)] uppercase tracking-wider">
                                    Members ({membersList.length})
                                </h3>

                                {/* Search Filter */}
                                {membersList.length > 3 && (
                                    <div className="relative w-36">
                                        <IoSearchOutline className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-[var(--c-text-3)]" />
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Search..."
                                            className="w-full pl-6 pr-2 py-1 rounded-md bg-[var(--c-panel)] border border-[var(--c-line)] text-xs text-[var(--c-text)] outline-none focus:outline-none focus:border-[var(--c-primary)] focus:ring-0 focus-visible:outline-none shadow-none"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Members List */}
                            <div className="flex flex-col gap-1 max-h-[260px] overflow-y-auto pr-1 custom-scrollbar">
                                {filteredMembers.length === 0 ? (
                                    <div className="text-center py-4 text-xs text-[var(--c-text-3)]">
                                        No members found
                                    </div>
                                ) : (
                                    filteredMembers.map((member) => {
                                        const memberId = (member?._id || member)?.toString()
                                        const memberIsAdmin = isMemberAdmin(member)
                                        const isSelf = Boolean(currentUserId && currentUserId === memberId)
                                        const isCreator = Boolean(creatorId && creatorId === memberId)
                                        const isBusy = actionLoading === memberId

                                        return (
                                            <div
                                                key={memberId}
                                                className={`flex items-center justify-between gap-3 p-2 rounded-lg transition border ${
                                                    isSelf
                                                        ? "bg-[var(--c-panel)] border-[var(--c-line)]"
                                                        : "bg-[var(--c-surface)] hover:bg-[var(--c-panel)] border-transparent hover:border-[var(--c-line)]"
                                                }`}
                                            >
                                                {/* Left: Avatar + Names + Badges */}
                                                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                                    <img
                                                        src={getSafeMediaUrl(member?.avtar, "/user.png")}
                                                        alt={member.name || "Member"}
                                                        className="w-9 h-9 rounded-full object-cover shrink-0 border border-[var(--c-line)]"
                                                    />

                                                    <div className="flex flex-col min-w-0 flex-1">
                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                            <span className="text-[var(--c-text)] font-medium text-xs truncate max-w-[150px] sm:max-w-[200px]">
                                                                {member.name}
                                                            </span>

                                                            {/* (You) badge - Visible only on your own row */}
                                                            {isSelf && (
                                                                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-[var(--c-primary)]/20 text-[var(--c-link)] shrink-0">
                                                                    (You)
                                                                </span>
                                                            )}

                                                            {/* Creator Badge */}
                                                            {isCreator && (
                                                                <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-[var(--c-panel)] text-[var(--c-warning)] border border-[var(--c-line)] flex items-center gap-1 shrink-0">
                                                                    <LuCrown className="text-[10px]" />
                                                                    <span>Creator</span>
                                                                </span>
                                                            )}

                                                            {/* Admin Badge (if admin and not creator) */}
                                                            {!isCreator && memberIsAdmin && (
                                                                <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-[var(--c-panel)] text-[var(--c-text-2)] border border-[var(--c-line)] flex items-center gap-1 shrink-0">
                                                                    <FiShield className="text-[10px]" />
                                                                    <span>Admin</span>
                                                                </span>
                                                            )}
                                                        </div>

                                                        <span className="text-[var(--c-text-3)] text-[11px] truncate">
                                                            @{member.userName || "user"}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Right: Actions */}
                                                <div className="flex items-center gap-1 shrink-0">
                                                    {isBusy ? (
                                                        <div className="p-1.5 text-[var(--c-primary)] animate-spin">
                                                            <BiLoaderAlt className="text-base" />
                                                        </div>
                                                    ) : (
                                                        <>
                                                            {/* Make Admin (crown) - Visible only when: You are admin and member is not admin */}
                                                            {isViewerAdmin && !memberIsAdmin && !isSelf && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleMakeAdmin(memberId)}
                                                                    title="Make Admin"
                                                                    aria-label="Make Admin"
                                                                    className="p-1.5 rounded-md text-[var(--c-text-3)] hover:text-[var(--c-warning)] hover:bg-[var(--c-hover)] transition"
                                                                >
                                                                    <LuCrown className="text-base" />
                                                                </button>
                                                            )}

                                                            {/* Remove as Admin (shield) - Visible only when: You are admin and member is admin, not creator, not you */}
                                                            {isViewerAdmin && memberIsAdmin && !isCreator && !isSelf && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setConfirmModal({ type: 'dismiss_admin', member })}
                                                                    title="Remove as Admin"
                                                                    aria-label="Remove as Admin"
                                                                    className="p-1.5 rounded-md text-[var(--c-text-3)] hover:text-[var(--c-info)] hover:bg-[var(--c-hover)] transition"
                                                                >
                                                                    <FiShield className="text-base" />
                                                                </button>
                                                            )}

                                                            {/* Remove from group - Visible only when: You are admin and member is not creator, not you */}
                                                            {isViewerAdmin && !isCreator && !isSelf && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setConfirmModal({ type: 'remove_member', member })}
                                                                    title="Remove from group"
                                                                    aria-label="Remove from group"
                                                                    className="p-1.5 rounded-md text-[var(--c-text-3)] hover:text-[var(--c-danger)] hover:bg-[var(--c-hover)] transition"
                                                                >
                                                                    <FiUserMinus className="text-base" />
                                                                </button>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Custom Confirmation Modal (replaces browser confirm alert) */}
                {confirmModal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[var(--c-overlay)] backdrop-blur-sm animate-fadeIn">
                        <div className="bg-[var(--c-surface)] border border-[var(--c-line)] rounded-2xl p-5 w-full max-w-sm shadow-2xl relative text-center">
                            <div className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center text-xl ${
                                confirmModal.type === 'dismiss_admin'
                                    ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                                    : 'bg-[var(--c-danger)]/15 text-[var(--c-danger)] border border-[var(--c-danger)]/30'
                            }`}>
                                {confirmModal.type === 'dismiss_admin' ? <FiShield /> : <FiUserMinus />}
                            </div>

                            <h3 className="text-base font-semibold text-[var(--c-text)]">
                                {confirmModal.type === 'dismiss_admin' ? "Dismiss as Admin" : "Remove from Group"}
                            </h3>

                            <p className="text-xs text-[var(--c-text-2)] mt-1.5 leading-relaxed">
                                {confirmModal.type === 'dismiss_admin' ? (
                                    <>Are you sure you want to dismiss <strong className="text-[var(--c-text)]">{confirmModal.member?.name || "this user"}</strong> as admin?</>
                                ) : (
                                    <>Are you sure you want to remove <strong className="text-[var(--c-text)]">{confirmModal.member?.name || "this user"}</strong> from the group? They will no longer have access to this conversation.</>
                                )}
                            </p>

                            <div className="flex items-center gap-2.5 mt-5">
                                <button
                                    type="button"
                                    onClick={() => setConfirmModal(null)}
                                    disabled={Boolean(actionLoading)}
                                    className="flex-1 py-2 px-3 rounded-xl border border-[var(--c-line)] text-xs font-medium text-[var(--c-text-2)] hover:bg-[var(--c-panel)] hover:text-[var(--c-text)] transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmAction}
                                    disabled={Boolean(actionLoading)}
                                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold text-white transition flex items-center justify-center gap-1.5 ${
                                        confirmModal.type === 'dismiss_admin'
                                            ? 'bg-cyan-600 hover:bg-cyan-500'
                                            : 'bg-[var(--c-danger)] hover:bg-[var(--c-danger)]/90'
                                    }`}
                                >
                                    {actionLoading ? (
                                        <BiLoaderAlt className="animate-spin text-sm" />
                                    ) : (
                                        confirmModal.type === 'dismiss_admin' ? "Dismiss" : "Remove"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Add Member Modal if opened */}
                {addmodal && <Addmember />}
            </div>
        </div>
    )
}

export default GroupSetting