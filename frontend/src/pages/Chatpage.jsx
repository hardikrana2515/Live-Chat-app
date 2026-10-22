import React from 'react'
import { useContext, useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import Chatpart from '../components/Chatpart'
import userContext from '../contexts/UserContext/userContext'
import Account from '../components/Account'
import UpdatePassword from '../components/UpdatePassword'
import chatContext from '../contexts/ChatContext/chatcontext'
import messageContext from '../contexts/MessageContext/messageContext'
import SocketContext from '../contexts/Socket.io.Context/socket.Context.js'
import Group from '../components/Group'
import Groupinfo from '../components/Groupinfo'
import GroupSetting from '../components/GroupSetting'
import Yesmodal from '../components/Yesmodal'
import DMsg from '../components/DMsg'
import VideoCall from '../components/VideoCall'
import GroupCall from '../components/GroupCall'
import IncomingCallModal from '../components/IncomingCallModal'
import LogoutModal from '../components/LogoutModal'
import KeySetupModal from '../components/KeySetupModal'
import KeyRecoveryModal from '../components/KeyRecoveryModal'
import ResetIdentityModal from '../components/ResetIdentityModal'
import { encryptMessage } from '../utils/EncryptionUtils'

const Chatpage = () => {

  const { card, pass, logoutModal } = useContext(userContext)
  const { groupchat, chatmodal, settingmodal, yesmodal, selectedchat, user, chat, setChat } = useContext(chatContext)
  const { Del, Send } = useContext(messageContext);
  const { socket, isConnected } = useContext(SocketContext);

  // ---- Call state lives here (always mounted) so incoming calls are received
  // even when the user is on the welcome screen without an open chat. ----
  const [callData, setCallData] = useState(null); // { isIncoming, from, name, signalData, callType, isGroup, chatId, chatName }
  const [inCall, setInCall] = useState(false);
  const [inGroupCall, setInGroupCall] = useState(false);
  const [groupCallTarget, setGroupCallTarget] = useState(null);
  const [callType, setCallType] = useState('video'); // 'video' | 'audio'
  const [isInitiator, setIsInitiator] = useState(false);

  useEffect(() => {
    if (!socket?.current) return;

    const handleCallUser = ({ from, name, signal, callType }) => {
      console.log("[Chatpage] Incoming call from:", from, name, callType);
      setCallData({ isIncoming: true, from, name, signalData: signal, callType: callType || 'video' });
    };

    const handleCallEnded = () => {
      console.log("[Chatpage] Call ended");
      setInCall(false);
      setCallData(null);
    };

    const handleIncomingGroupCall = ({ chatId, chatName, initiator, callType }) => {
      console.log("[Chatpage] Incoming group call:", chatName, initiator?.name);
      setCallData({
        isIncoming: true,
        isGroup: true,
        chatId,
        chatName,
        initiator,
        name: initiator?.name || "Group Member",
        callType: callType || 'video'
      });
    };

    const handleCallHandled = () => {
      console.log("[Chatpage] Call handled in another tab/device");
      setCallData(null);
    };

    const handleGroupCallEnded = ({ chatId: endedChatId, duration, callType: cType, reason }) => {
      console.log("[Chatpage] Group call ended live:", endedChatId, reason);
      const endedStr = endedChatId?.toString();
      setCallData(prev => {
        if (prev?.isGroup && prev?.chatId?.toString() === endedStr) {
          return null;
        }
        return prev;
      });
      setInGroupCall(prevInCall => {
        if (prevInCall) {
          return false;
        }
        return prevInCall;
      });
      setGroupCallTarget(null);
      setIsInitiator(false);
    };

    socket.current.on("callUser", handleCallUser);
    socket.current.on("callEnded", handleCallEnded);
    socket.current.on("callHandled", handleCallHandled);
    socket.current.on("incomingGroupCall", handleIncomingGroupCall);
    socket.current.on("groupCallEnded", handleGroupCallEnded);

    return () => {
      if (socket.current) {
        socket.current.off("callUser", handleCallUser);
        socket.current.off("callEnded", handleCallEnded);
        socket.current.off("callHandled", handleCallHandled);
        socket.current.off("incomingGroupCall", handleIncomingGroupCall);
        socket.current.off("groupCallEnded", handleGroupCallEnded);
      }
    };
  }, [socket, isConnected]);

  const getOtherUser = (loggedInUser, members) => {
    if (!members || !Array.isArray(members)) return null;
    const myId = loggedInUser?._id?.toString();
    return members.find((m) => ((m?._id || m)?.toString()) !== myId) || null;
  };

  const startCall = (type = 'video', forceInitiator = true) => {
    if (selectedchat?.isGroup) {
      setInGroupCall(true);
      setCallType(type);
      setGroupCallTarget(selectedchat);
      setIsInitiator(forceInitiator);
      if (socket?.current && forceInitiator) {
        socket.current.emit("startGroupCall", {
          chatId: selectedchat._id,
          chatName: selectedchat.chatname,
          initiator: user,
          callType: type
        });
      }
    } else {
      setInCall(true);
      setCallType(type);
      setCallData({ isIncoming: false, callType: type });
    }
  };

  const acceptCall = () => {
    if (callData?.isGroup) {
      const targetGroup = (chat || []).find(c => c._id === callData.chatId) || selectedchat || {
        _id: callData.chatId,
        chatname: callData.chatName,
        isGroup: true
      };
      setGroupCallTarget(targetGroup);
      setInGroupCall(true);
      setCallType(callData.callType);
      setIsInitiator(false);
      setCallData(null);
    } else {
      setInCall(true);
      setCallType(callData.callType);
    }
  };

  const declineCall = async () => {
    if (callData?.isGroup) {
      setCallData(null);
      return;
    }

    if (callData?.from && socket?.current) {
      socket.current.emit("endCall", { to: String(callData.from) });
    }

    // Post missed call log message into chat timeline (Instagram style)
    try {
      const otherUserId = callData?.from;
      const targetChat = selectedchat || (chat || []).find(c => !c.isGroup && c.members?.some(m => ((m._id || m)?.toString()) === otherUserId?.toString()));
      if (targetChat?._id && Send) {
        const payload = `[CALL_LOG]:::${JSON.stringify({
          type: callData?.callType || 'video',
          status: 'missed',
          duration: 0
        })}`;
        const encrypted = await encryptMessage(payload, targetChat);
        const sentMsg = await Send(encrypted, null, targetChat._id);
        if (socket?.current) socket.current.emit("new message", sentMsg);
        if (setChat) {
          setChat(prevChats => (prevChats || []).map(c => c._id === targetChat._id ? { ...c, lastMessage: sentMsg, updatedAt: new Date().toISOString() } : c));
        }
      }
    } catch (err) {
      console.error("Failed to log declined call:", err);
    }

    setCallData(null);
  };

  const endCall = async (stats) => {
    const otherUserObj = selectedchat?.members ? getOtherUser(user, selectedchat.members) : null;
    const otherUserId = callData?.isIncoming ? callData?.from : (otherUserObj?._id || otherUserObj);

    if (socket?.current && otherUserId) {
      socket.current.emit("endCall", { to: String(otherUserId) });
    }

    // Post call ended message into chat timeline (Instagram style)
    try {
      const targetChat = selectedchat || (chat || []).find(c => !c.isGroup && c.members?.some(m => ((m._id || m)?.toString()) === otherUserId?.toString()));
      if (targetChat?._id && Send && stats) {
        const payload = `[CALL_LOG]:::${JSON.stringify({
          type: stats.type || callType || 'video',
          status: stats.status || 'ended',
          duration: stats.duration || 0
        })}`;
        const encrypted = await encryptMessage(payload, targetChat);
        const sentMsg = await Send(encrypted, null, targetChat._id);
        if (socket?.current) socket.current.emit("new message", sentMsg);
        if (setChat) {
          setChat(prevChats => (prevChats || []).map(c => c._id === targetChat._id ? { ...c, lastMessage: sentMsg, updatedAt: new Date().toISOString() } : c));
        }
      }
    } catch (err) {
      console.error("Failed to log ended call:", err);
    }

    setInCall(false);
    setCallData(null);
  };

  const endGroupCall = async (stats) => {
    setInGroupCall(false);
    const targetChat = groupCallTarget || selectedchat;

    // Only the initiator (or caller flagged with shouldLogCall) logs to the chat timeline to prevent duplicates
    if (stats?.shouldLogCall && targetChat?._id && Send) {
      try {
        const payload = `[CALL_LOG]:::${JSON.stringify({
          type: stats.type || callType || 'video',
          status: 'ended',
          duration: stats.duration || 0,
          isGroup: true
        })}`;
        const encrypted = await encryptMessage(payload, targetChat);
        const sentMsg = await Send(encrypted, null, targetChat._id);
        if (socket?.current) socket.current.emit("new message", sentMsg);
        if (setChat) {
          setChat(prevChats => (prevChats || []).map(c => c._id === targetChat._id ? { ...c, lastMessage: sentMsg, updatedAt: new Date().toISOString() } : c));
        }
      } catch (err) {
        console.error("Failed to log group call end:", err);
      }
    }
    setGroupCallTarget(null);
    setIsInitiator(false);
  };

  return (
    <div className="relative flex h-[100dvh] w-full overflow-hidden bg-[var(--c-canvas)] text-[var(--c-text)]">
      {/* Modals */}
      {groupchat && <Group />}
      {yesmodal && <Yesmodal />}
      {Del && <DMsg />}
      {settingmodal && <GroupSetting />}
      {chatmodal && <Groupinfo />}
      {card && <Account />}
      {pass && <UpdatePassword />}
      {logoutModal && <LogoutModal />}
      <KeySetupModal />
      <KeyRecoveryModal />
      <ResetIdentityModal />

      {/* Call Modals (global: work even with no chat open) */}
      {callData?.isIncoming && !inCall && !inGroupCall && (
        <IncomingCallModal
          callerName={callData.name}
          onAccept={acceptCall}
          onDecline={declineCall}
          callType={callData.callType}
          isGroup={callData.isGroup}
          chatName={callData.chatName}
        />
      )}

      {inCall && (
        <VideoCall
          socket={socket.current}
          user={user}
          chat={selectedchat}
          isIncoming={callData?.isIncoming}
          signalData={callData}
          EndCall={endCall}
          callType={callType}
        />
      )}

      {inGroupCall && groupCallTarget && (
        <GroupCall
          socket={socket.current}
          user={user}
          chat={groupCallTarget}
          callType={callType}
          onEndCall={endGroupCall}
          isInitiator={isInitiator}
        />
      )}

      {/* Sidebar (Chat List) — fixed-width column, full height */}
      <div className={`w-full sm:w-[35%] md:w-[32%] lg:w-[28%] sm:max-w-sm shrink-0 h-full border-r border-[var(--c-line-50)] ${selectedchat ? 'hidden sm:flex' : 'flex'}`}>
        <Sidebar />
      </div>

      {/* Chat Part — flexible column, full height */}
      <div className={`flex-1 min-w-0 h-full ${selectedchat ? 'flex' : 'hidden sm:flex'}`}>
        <Chatpart onStartCall={startCall} />
      </div>
    </div>
  );
};

export default Chatpage;
