import React from 'react'
import { useContext } from 'react'
import ChatState from '../contexts/ChatContext/ChatState'
import Sidebar from '../components/Sidebar'
import Chatpart from '../components/Chatpart'
import userContext from '../contexts/UserContext/userContext'
import Account from '../components/Account'
import UpdatePassword from '../components/UpdatePassword'
import chatContext from '../contexts/ChatContext/chatcontext'
import messageContext from '../contexts/MessageContext/messageContext'
import Group from '../components/Group'
import Groupinfo from '../components/Groupinfo'
import GroupSetting from '../components/GroupSetting'
import Yesmodal from '../components/Yesmodal'
import DMsg from '../components/DMsg'
const Chatpage = () => {

  const { card, pass } = useContext(userContext)
  const { groupchat, chatmodal, settingmodal, yesmodal,selectedchat } = useContext(chatContext)
  const { Del, setDel } = useContext(messageContext);

  return (
   <div className="relative">
  {/* Modals */}
  {groupchat && <Group />}
  {yesmodal && <Yesmodal />}
  {Del && <DMsg />}
  {settingmodal && <GroupSetting />}
  {chatmodal && <Groupinfo />}
  {card && <Account />}
  {pass && <UpdatePassword />}

  {/* Main Layout */}
  <div className="flex h-screen w-full overflow-hidden">
    
    {/* Sidebar (Chat List) */}
    <div className={`w-full sm:w-[30%] ${selectedchat ? 'hidden sm:block' : 'block'}`}>
      <Sidebar />
    </div>

    {/* Chat Part */}
    <div className={`w-full sm:w-[70%] ${selectedchat ? 'block' : 'hidden sm:block'}`}>
      <Chatpart />
    </div>
    
  </div>
</div>


  )
}

export default Chatpage