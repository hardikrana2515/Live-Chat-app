import  { useContext } from 'react'
import Chatbox from './Chatbox'
import chatContext from '../contexts/ChatContext/chatcontext'

const Chatpart = () => {
  const { selectedchat } = useContext(chatContext)
  return (
    <div className="flex-1 h-full bg-[url('/chatbg.png')] bg-cover bg-center relative overflow-hidden">

      {selectedchat ? (
        <Chatbox />
      ) : (
        <div className="flex flex-col items-center justify-center h-full px-4 text-center text-gray-400 text-xl sm:text-2xl backdrop-blur-md bg-black/40 rounded-xl">
          <p>Select a chat to start messaging...</p>
        </div>
      )}

    </div>
  )
}

export default Chatpart