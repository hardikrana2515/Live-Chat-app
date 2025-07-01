import { useContext, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import chatContext from "./chatcontext.js"
import { toast } from 'react-toastify'
import API from "../Api.js"

const ChatState = ({ children }) => {
  const [user, setUser] = useState({})
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

  const navigate = useNavigate()

  useEffect(() => {
    const userinfo = JSON.parse(localStorage.getItem("userInfo"))
    setUser(userinfo)
    if (!userinfo) {
      navigate("/login")
    }
  }
    , [])

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
      if (!chat.find((c) => c._id === res.data.data._id)) {
        setChat([res.data.data, ...chat])
      }
      // console.log(res.data)
      setChatLoading(true)
    } catch (e) {
      const errorMessage = e?.response?.data?.message || "Failed to Create Chat"
      throw new Error(errorMessage)
    } finally {
      setChatLoading(true)
    }
  }

  const Allchat = async () => {
    try {
      const res = await API.get("Chat/allChat", {
        headers: {
          "Content-Type": "application/json",
          Authorization: user.token
        },
        withCredentials: true
      })
      setChat(res.data.data)
      // console.log(res.data.data)
    } catch (e) {
      const errorMessage = e?.response?.data?.message || "Cannot show the chat "
      throw new Error(errorMessage)
    }

  }

  const GroupUsersearch = async (search) => {
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
        toast.info("No matches found!")
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
      toast.success("Group created successfully!")
      setGroup(res.data.data)
    } catch (e) {
      const errorMessage = e?.response?.data?.message || e.message || "Cannot show the chat"
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
      const errorMessage = e?.response?.data?.message || e.message
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
      toast.success("new Admin.")
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
      // console.log(res.data.data)
      toast.success("Remove From Group!!")
      return res.data.data

    } catch (e) {
          const errorMessage = e?.response?.data?.message || e.message 
      toast.error(errorMessage)
      throw new Error(errorMessage)
    }

  }

  const AddinGroup = async (UserIdlist,chatId)=>{
      try {
      const res = await API.put("chat/addtoGroup", { UserIdlist, chatId }, {
        headers: {
          "Content-Type": "application/json",
          Authorization: user.token
        },
        withCredentials: true
      })
      // console.log(res.data.data)
      toast.success("User Added in Group!!")
      return res.data.data

    } catch (e) {
          const errorMessage = e?.response?.data?.message || e.message 
      toast.error(errorMessage)
      throw new Error(errorMessage)
    }
 }

 const LeaveGroup = async(chatId)=>{
  try {
        const res = await API.put("chat/leaveGroup", { chatId }, {
          headers: {
            "Content-Type": "application/json",
            Authorization: user.token
          },
          withCredentials: true
        })
        // console.log(res.data.data)
        toast.success("User Leave  Group!!")
        return res.data.data

      } catch (e) {
            const errorMessage = e?.response?.data?.message || e.message 
        toast.error(errorMessage)
        throw new Error(errorMessage)
      }


 }

 const DeleteGroup = async(chatId)=>{
  try {
        const res = await API.put("chat/deleteGroup", { chatId }, {
          headers: {
            "Content-Type": "application/json",
            Authorization: user.token
          },
          withCredentials: true
        })
        // console.log(res.data.data)
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
      toast.success("Remove From Admin!!")
      return res.data.data

    } catch (e) {
          const errorMessage = e?.response?.data?.message || e.message 
      toast.error(errorMessage)
      throw new Error(errorMessage)
    }
  }

  return (
    <chatContext.Provider value={{
      user, MakeChat, setChat, chat, Allchat,
      selectedchat, setSelectedchat, CreateGroup,
      groupchat, setGroupchat, group, setGroup, GroupUsersearch,
      setGLoading, setGSearchUser, GsearchUser, chatmodal, setChatmodal,
      settingmodal, setSettingmodal, UpdateIcon, Renamegroup, Addadmin,
      RemoveFromGroup ,AddinGroup ,addmodal, setAddmodal ,LeaveGroup ,DeleteGroup ,
      yesmodal, setYesmodal ,RemoveAdmin
    }}>
      {children}
    </chatContext.Provider>
  )
}

export default ChatState