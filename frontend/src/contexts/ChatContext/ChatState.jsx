import { useContext, useState, useEffect } from "react"
import chatContext from "./chatcontext.js"
import userContext from "../UserContext/userContext.js"
import { toast } from 'react-toastify'
import API from "../Api.js"
import {
  registerChat, registerChats, getRegisteredChat, ensureChatKey,
  dropChat, createGroupKeyWraps, rekeyGroupKeyFor, setCachedChatKey
} from "../../utils/cryptoKeys.js"

const ChatState = ({ children }) => {
  // Single source of truth: the user lives in UserState (Issue 3.1).
  // Previously this context kept its own copy from localStorage, which went
  // stale whenever the profile changed (avatar, blocked users, logout...).
  const { user, setUser } = useContext(userContext)
  const [chat, setChat] = useState([])
  const [selectedchat, setSelectedchat] = useState()
  const [chatLoading, setChatLoading] = useState(false)
  const [groupchat, setGroupchat] = useState(false)
  const [group, setGroup] = useState({})
  const [GsearchUser, setGSearchUser] = useState([])
  const [GLoading, setGLoading] = useState(false)
  const [chatmodal, setChatmodal] = useState(false)
  const [settingmodal, setSettingmodal] = useState(false)
  const [addmodal, setAddmodal] = useState(false)
  const [yesmodal, setYesmodal] = useState(false)
  const [isAuthReady, setIsAuthReady] = useState(false) // New state for auth check

  useEffect(() => {
    setIsAuthReady(true) // Auth check complete (user is initialized lazily in UserState)
  }, [])

  // Clear chat state whenever the logged-in user changes (logout / account
  // switch) so nothing from the previous account flashes on screen (Issue 5.3)
  const userId = user?._id
  useEffect(() => {
    setSelectedchat(null)
    setChat([])
  }, [userId])

  const MakeChat = async (UserId) => {

    try {
      setChatLoading(true)
      const res = await API.post("Chat/chat", { UserId }, {
        headers: {
          "Content-Type": "application/json",
          Authorization: user.token
        },
        withCredentials: true
      })
      const newChat = res.data.data;
      // Register + derive the conversation key so messages decrypt immediately
      registerChat(newChat);
      await ensureChatKey(newChat._id, user?._id);
      if (!chat.find((c) => c._id === newChat._id)) {
        setChat([newChat, ...chat])
      }
      // console.log(res.data)
      setChatLoading(false)
    } catch (e) {
      const errorMessage = e?.response?.data?.message || "Failed to Create Chat"
      throw new Error(errorMessage)
    } finally {
      setChatLoading(false)
    }
  }

  const Allchat = async () => {
    try {
      let token = user.token
      if (!token) {
        token = localStorage.getItem("token")
      }
      if (!token) {
        console.error("ChatState: No token found in user state or localStorage");
        return;
      }

      const res = await API.get("Chat/allChat", {
        headers: {
          "Content-Type": "application/json",
          Authorization: token
        },
        withCredentials: true
      })
      const chats = res.data.data || [];
      // Resolve per-conversation E2EE keys BEFORE the list renders so sidebar
      // previews and messages decrypt on first paint (Issue 3.2)
      registerChats(chats);
      await Promise.all(chats.map((c) => ensureChatKey(c._id)));
      setChat(chats)
      // Non-blocking: publish group keys for any legacy groups (one-time)
      migrateLegacyGroups(chats).catch(() => { /* already logged */ });
    } catch (e) {
      if (e?.response?.status === 404) {
        setChat([])
      } else {
        const errorMessage = e?.response?.data?.message || "Cannot show the chat "
        console.error("Allchat error:", errorMessage);
      }
    }

  }

  // Distribute group-key wraps to the server (opaque ciphertext only). (Issue 3.2)
  const putGroupKeys = async (chatId, groupKeys, merge = false) => {
    const res = await API.put("chat/groupkey", { chatId, groupKeys, merge }, {
      headers: {
        "Content-Type": "application/json",
        Authorization: user.token
      },
      withCredentials: true
    });
    const updated = res.data?.data;
    if (updated) registerChat(updated);
    return updated;
  };

  // One-time E2EE migration: groups created before key distribution have no
  // groupKeys — their creator/admin publishes a group key the first time the
  // app loads with this code. Guard is per-chat (groupKeys[me]) so this never
  // re-runs once migrated; concurrent builders converge (last complete map
  // wins and every member unwraps whichever one lands). (Issue 3.2)
  const migrateLegacyGroups = async (chats) => {
    const myId = String(user?._id || "");
    if (!myId) return;
    for (const c of chats) {
      if (!c || !c.isGroup) continue;
      if (c.groupKeys && c.groupKeys[myId]) continue;
      const creatorId = String(c.creator?._id ?? c.creator ?? "");
      const isAdmin = (c.admins || []).some((a) => String(a?._id ?? a) === myId);
      if (creatorId !== myId && !isAdmin) continue;
      try {
        const { groupKeys, chatKey } = await createGroupKeyWraps(c, c.members, user?._id);
        const updated = await putGroupKeys(c._id, groupKeys, false);
        setCachedChatKey(c._id, chatKey);
        if (updated) registerChat(updated);
      } catch (e) {
        console.warn("Legacy group key migration failed:", e?.message);
      }
    }
  };

  const GroupUsersearch = async (search, silent = false) => {
    setGLoading(true)
    try {
      const res = await API.get("user/Alluser",
        {
          params: { search },
          headers: {
            "Content-Type": "application/json"
          },
          withCredentials: true
        })
      if (res.data.data.length === 0) {
        if (!silent) toast.info("No matches found!")
        setGSearchUser([])
      } else {
        setGSearchUser(res.data.data)

      }
      // console.log(res.data.data)
    } catch (e) {
      const errorMessage = e?.response?.data?.message || "Search failed"
      throw new Error(errorMessage)
    } finally {
      setGLoading(false)
    }
  }

  const CreateGroup = async (chatname, members, groupIcon) => {
    try {
      setChatLoading(true)

      const formData = new FormData()
      formData.append("chatname", chatname)
      formData.append("members", JSON.stringify(members))
      if (groupIcon) formData.append("groupIcon", groupIcon)

      const res = await API.post("Chat/makeGroup", formData, {
        headers: {
          Authorization: user.token,
        },
        withCredentials: true,
      })

      if (!res.data?.data) {
        throw new Error("Backend did not return expected group data.")
      }
      // console.log(res.data.data)

      // E2EE: generate the group key on the client and distribute per-member
      // wrapped copies. The server only stores ciphertext (Issue 3.2).
      let created = res.data.data;
      try {
        const { groupKeys, chatKey } = await createGroupKeyWraps(created, created.members, user?._id);
        const updated = await putGroupKeys(created._id, groupKeys, false);
        created = updated || { ...created, groupKeys };
        setCachedChatKey(created._id, chatKey);
      } catch (e) {
        console.warn("Group key distribution failed (chat falls back to legacy encryption):", e?.message);
      }
      registerChat(created);

      toast.success("Group created successfully!")
      setGroup(created)
      setGroupchat(false)
      return created
    } catch (e) {
      const errorMessage = e?.response?.data?.message || e.message || "Cannot create group"
      toast.error(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setChatLoading(false)
    }
  }

  const UpdateIcon = async (chatId, file) => {
    try {
      const formData = new FormData()
      formData.append("chatId", chatId)
      formData.append("groupIcon", file)

      const res = await API.put("chat/groupimage", formData, {
        withCredentials: true
      })

      if (!res.data?.data) {
        throw new Error("Backend did not return expected group data.")
      }

      // console.log(res.data.data)
      toast.success("Group icon updated successfully!")
      return res.data.data
    } catch (e) {
      const errorMessage = e?.response?.data?.message || e.message
      toast.error(errorMessage)
      throw new Error(errorMessage)
    }

  }

  const Renamegroup = async (chatId, chatname) => {

    try {
      const res = await API.put("chat/renameGroup", { chatId, chatname }, {
        headers: {
          "Content-Type": "application/json",
          Authorization: user.token
        },
        withCredentials: true
      })

      // console.log(res.data.data)
      return res.data.data
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error.message
      toast.error(errorMessage)
      throw new Error(errorMessage)
    }

  }

  const Addadmin = async (UserId, chatId) => {

    try {
      const res = await API.put("chat/makeAdmin", { UserId, chatId }, {
        headers: {
          "Content-Type": "application/json",
          Authorization: user.token
        },
        withCredentials: true
      })
      // console.log(res.data.data)
      toast.success("Promoted to Admin successfully!")
      return res.data.data

    } catch (e) {
      const errorMessage = e?.response?.data?.message || e.message
      toast.error(errorMessage)
      throw new Error(errorMessage)
    }

  }

  const RemoveFromGroup = async (UserId, chatId) => {

    try {
      const res = await API.put("chat/removefromGroup", { UserId, chatId }, {
        headers: {
          "Content-Type": "application/json",
          Authorization: user.token
        },
        withCredentials: true
      })
      const updatedChat = res.data?.data;

      // E2EE: rotate the group key right after the removal so the removed
      // member (whose wrap was just dropped) cannot decrypt future messages.
      if (updatedChat) {
        registerChat(updatedChat);
        try {
          const { groupKeys, chatKey } = await createGroupKeyWraps(updatedChat, updatedChat.members, user?._id);
          const withKeys = await putGroupKeys(chatId, groupKeys, false);
          setCachedChatKey(chatId, chatKey);
          registerChat(withKeys || updatedChat);
        } catch (e) {
          console.warn("Group key rotation failed:", e?.message);
        }
      }

      toast.success("Member removed from group!")
      return getRegisteredChat(chatId) || updatedChat

    } catch (e) {
      const errorMessage = e?.response?.data?.message || e.message
      toast.error(errorMessage)
      throw new Error(errorMessage)
    }

  }

  const AddinGroup = async (memberList, chatId) => {
    // Accept either member ids or { _id, publicKey } objects (search results)
    const members = (Array.isArray(memberList) ? memberList : [])
      .map((m) => (typeof m === "string" ? { _id: m } : m))
      .filter(Boolean);

    const chat = getRegisteredChat(chatId) || selectedchat;

    // E2EE: hand the group key to the newcomers BEFORE adding them, so they
    // can decrypt from their very first message (Issue 3.2).
    if (chat && chat._id) {
      try {
        try {
          // Re-wrap the CURRENT group key for the newcomers only — existing
          // members' wraps reference the same key and must stay untouched.
          const { groupKeys, chatKey } = await rekeyGroupKeyFor(chat, members, user?._id);
          await putGroupKeys(chatId, groupKeys, true);
          setCachedChatKey(chatId, chatKey);
        } catch {
          // Legacy group without a group key yet: create one for everybody.
          const { groupKeys, chatKey } = await createGroupKeyWraps(
            chat, [...(chat.members || []), ...members], user?._id
          );
          await putGroupKeys(chatId, groupKeys, false);
          setCachedChatKey(chatId, chatKey);
        }
      } catch (e) {
        console.warn("Group key distribution failed:", e?.message);
      }
    }

    try {
      const res = await API.put("chat/addtoGroup", { UserIdlist: members.map((m) => m._id), chatId }, {
        headers: {
          "Content-Type": "application/json",
          Authorization: user.token
        },
        withCredentials: true
      })
      // console.log(res.data.data)
      registerChat(res.data?.data);
      toast.success("User Added in Group!!")
      return res.data.data

    } catch (e) {
      const errorMessage = e?.response?.data?.message || e.message
      toast.error(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const LeaveGroup = async (chatId) => {
    // E2EE: rotate the group key BEFORE leaving (excluding my own access is
    // unnecessary — createGroupKeyWraps keeps a wrap for me too, so a failed
    // leave below doesn't lock me out of a group I'm still in). (Issue 3.2)
    const chat = getRegisteredChat(chatId) || selectedchat;
    if (chat && chat._id) {
      try {
        const myId = String(user?._id);
        const remaining = (chat.members || []).filter((m) => String(m?._id ?? m) !== myId);
        const { groupKeys, chatKey } = await createGroupKeyWraps(chat, remaining, user?._id);
        await putGroupKeys(chatId, groupKeys, false);
        setCachedChatKey(chatId, chatKey);
      } catch (e) {
        console.warn("Group key rotation before leave failed:", e?.message);
      }
    }

    try {
      const res = await API.put("chat/leaveGroup", { chatId }, {
        headers: {
          "Content-Type": "application/json",
          Authorization: user.token
        },
        withCredentials: true
      })
      // console.log(res.data.data)
      dropChat(chatId); // we no longer belong: forget registry + cached key
      toast.success("User Leave  Group!!")
      return res.data.data

    } catch (e) {
      const errorMessage = e?.response?.data?.message || e.message
      toast.error(errorMessage)
      throw new Error(errorMessage)
    }


  }

  const DeleteGroup = async (chatId) => {
    try {
      const res = await API.put("chat/deleteGroup", { chatId }, {
        headers: {
          "Content-Type": "application/json",
          Authorization: user.token
        },
        withCredentials: true
      })
      // console.log(res.data.data)
      dropChat(chatId); // chat is gone — forget registry + cached key
      toast.success("Delete Group Successfully!!")
      return res.data.data

    } catch (e) {
      const errorMessage = e?.response?.data?.message || e.message
      toast.error(errorMessage)
      throw new Error(errorMessage)
    }


  }

  const RemoveAdmin = async (UserId, chatId) => {

    try {
      const res = await API.put("chat/removeAdmin", { UserId, chatId }, {
        headers: {
          "Content-Type": "application/json",
          Authorization: user.token
        },
        withCredentials: true
      })
      // console.log(res.data.data)
      toast.success("Admin privileges removed!")
      return res.data.data

    } catch (e) {
      const errorMessage = e?.response?.data?.message || e.message
      toast.error(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const [modalType, setModalType] = useState(null); // 'block', 'delete', 'leave'

  const handleBlock = async (userId) => {
    try {
      const res = await API.put("user/block", { userId }, {
        headers: { Authorization: user.token },
        withCredentials: true
      });
      const updatedBlocked = res.data.data;
      const updatedUser = { ...user, blockedUsers: updatedBlocked };
      setUser(updatedUser);
      localStorage.setItem("userInfo", JSON.stringify(updatedUser));
      toast.success("User blocked");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to block user");
    }
  };

  const handleUnblock = async (userId) => {
    try {
      const res = await API.put("user/unblock", { userId }, {
        headers: { Authorization: user.token },
        withCredentials: true
      });
      const updatedBlocked = res.data.data;
      const updatedUser = { ...user, blockedUsers: updatedBlocked };
      setUser(updatedUser);
      localStorage.setItem("userInfo", JSON.stringify(updatedUser));
      toast.success("User unblocked");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to unblock user");
    }
  };

  return (
    <chatContext.Provider value={{
      user, setUser, MakeChat, setChat, chat, Allchat,
      selectedchat, setSelectedchat, CreateGroup,
      groupchat, setGroupchat, group, setGroup, GroupUsersearch,
      setGLoading, GLoading, setGSearchUser, GsearchUser, chatmodal, setChatmodal,
      settingmodal, setSettingmodal, UpdateIcon, Renamegroup, Addadmin,
      RemoveFromGroup, AddinGroup, addmodal, setAddmodal, LeaveGroup, DeleteGroup,
      yesmodal, setYesmodal, RemoveAdmin, handleBlock, handleUnblock, modalType, setModalType,
      isAuthReady
    }}>
      {children}
    </chatContext.Provider>
  )
}

export default ChatState