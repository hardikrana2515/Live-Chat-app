import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./database/db.js";
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io'
import http from 'http'

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const server = http.createServer(app);

const allowedOrigins = process.env.CLIENT_URL
  ? [process.env.CLIENT_URL, "http://localhost:5173", "http://127.0.0.1:5173"]
  : ["http://localhost:5173", "http://127.0.0.1:5173"];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true,
};

const io = new Server(server, {
  cors: corsOptions,
});

app.use(cors(corsOptions));


app.use(express.json({ limit: '250mb' }));
app.use(express.urlencoded({ extended: true, limit: '250mb' }));
import fs from 'fs';

const localEnv = path.join(__dirname, '.env');
const envPath = fs.existsSync(localEnv)
  ? localEnv
  : path.join(path.resolve(), '.env');
dotenv.config({ path: envPath });

app.use(cookieParser());

app.use('/Image', express.static(path.join(__dirname, 'public', 'Image')));

app.use("/media", express.static(path.join(__dirname, 'public', 'media')));

app.get("/", (req, res) => {
  res.send("Hello Chatt!");
});

import userRouter from "./routes/user.routes.js";
import messageRoutes from "./routes/message.routes.js";
import ChatRoutes from "./routes/chat.routes.js";

app.use("/api/ChatApp/user", userRouter);
app.use("/api/ChatApp/message", messageRoutes);
app.use("/api/ChatApp/Chat", ChatRoutes);

import { errorHandler } from "./middleware/error.middleware.js";
app.use(errorHandler);

const port = process.env.PORT || 4000;

connectDB();

const onlineUsers = new Map();
const activeGroupCalls = new Map()

import User from "./models/user.model.js";
import ChatRoom from "./models/Chatroom.model.js";

// Expose io to express controllers (group lifecycle events)
app.set('io', io);

const toId = (v) => String(v?._id ?? v ?? '');

const resolveMemberIds = async (chat) => {
  if (chat?.members?.length) return chat.members.map(toId);
  const chatId = toId(chat);
  if (!chatId) return [];
  const found = await ChatRoom.findById(chatId).select('members');
  return found?.members?.map(toId) || [];
};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("setup", async (userData) => {
    const uid = toId(userData?._id || userData);
    if (!uid) return;
    socket.join(uid);
    onlineUsers.set(uid, socket.id);
    io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));

    await User.findByIdAndUpdate(uid, { isOnline: true });

    console.log(`${userData?.name || uid} joined personal room: ${uid}`);
  });

  socket.on("join chat", (roomId) => {
    const rid = toId(roomId);
    if (rid) {
      socket.join(rid);
      console.log(`User joined chat room: ${rid}`);
    }
  });

  socket.on("typing", async (room) => {
    const uid = [...onlineUsers.entries()].find(([, sid]) => sid === socket.id)?.[0];
    if (uid) {
      try {
        const typer = await User.findById(uid).select('blockedUsers').lean();
        const chatDoc = await ChatRoom.findById(toId(room)).select('members isGroup').lean();
        if (chatDoc && !chatDoc.isGroup && chatDoc.members?.length === 2) {
          const otherId = chatDoc.members.find(m => String(m) !== uid);
          if (otherId && typer?.blockedUsers?.some(b => String(b) === String(otherId))) return;
        }
      } catch { /* allow through on lookup failure */ }
    }
    socket.in(toId(room)).emit("typing", room);
  });
  socket.on("stop typing", (room) => socket.in(toId(room)).emit("stop typing", room));

  socket.on("new reaction", async (updatedMsg) => {
    const chat = updatedMsg?.chatId || updatedMsg?.chat;
    const memberIds = await resolveMemberIds(chat);
    if (!memberIds.length && toId(chat)) return socket.in(toId(chat)).emit("reaction updated", updatedMsg);
    memberIds.forEach((id) => io.to(id).emit("reaction updated", updatedMsg));
  });

  socket.on("poll update", async (updatedMsg) => {
    const chat = updatedMsg?.chatId || updatedMsg?.chat;
    const memberIds = await resolveMemberIds(chat);
    if (!memberIds.length && toId(chat)) return socket.in(toId(chat)).emit("poll update", updatedMsg);
    memberIds.forEach((id) => io.to(id).emit("poll update", updatedMsg));
  });

  socket.on("delete message", async (data) => {
    if (!data?.chatId) return;
    if (!data.forEveryone) return;
    const memberIds = await resolveMemberIds(data.chatId);
    if (!memberIds.length) return socket.in(toId(data.chatId)).emit("message deleted", data);
    memberIds.forEach((id) => io.to(id).emit("message deleted", data));
  });

  socket.on("edit message", async (updatedMsg) => {
    const chat = updatedMsg?.chatId || updatedMsg?.chat;
    const memberIds = await resolveMemberIds(chat);
    if (!memberIds.length && toId(chat)) return socket.in(toId(chat)).emit("message edited", updatedMsg);
    memberIds.forEach((id) => io.to(id).emit("message edited", updatedMsg));
  });

  socket.on("messages read", async (data) => {
    const chat = data?.chatId;
    const memberIds = await resolveMemberIds(chat);
    if (!memberIds.length && toId(chat)) return socket.in(toId(chat)).emit("messages read", data);
    memberIds.forEach((id) => io.to(id).emit("messages read", data));
  });

  socket.on("request group key", async (data) => {
    const chatId = toId(data?.chatId);
    const requesterId = toId(data?.userId);
    if (!chatId || !requesterId) return;
    const memberIds = await resolveMemberIds(chatId);
    memberIds.forEach((id) => {
      if (id && id !== requesterId) {
        io.to(id).emit("group key requested", { chatId, userId: requesterId, publicKey: data?.publicKey });
      }
    });
  });

  socket.on("new message", async (msg) => {
    let chat = msg?.chat || msg?.chatId;
    let members = chat?.members;
    if (!members?.length && (chat?._id || chat)) {
      members = await resolveMemberIds(chat?._id || chat);
    }
    if (!members || !members.length) return;

    const senderId = toId(msg.Sender);
    members.forEach((member) => {
      const memberId = toId(member);
      if (memberId && memberId !== senderId) {
        io.to(memberId).emit("message received", msg);
      }
    });
  });

  socket.on("callUser", (data) => {
    const targetId = toId(data?.userToCall);
    const callerId = toId(data?.from);
    console.log(`[Socket] callUser from ${callerId} (${data?.name}) to ${targetId}`);

    io.to(targetId).emit("callUser", {
      signal: data?.signalData,
      from: callerId,
      name: data?.name,
      callType: data?.callType
    });
  });

  socket.on("answerCall", (data) => {
    const targetId = toId(data?.to);
    console.log(`[Socket] answerCall to ${targetId}`);
    io.to(targetId).emit("callAccepted", data?.signal);
    const uid = [...onlineUsers.entries()].find(([, sid]) => sid === socket.id)?.[0];
  });

  socket.on("endCall", ({ to }) => {
    const targetId = toId(to);
    console.log(`[Socket] endCall to ${targetId}`);
    io.to(targetId).emit("callEnded");
  });

  socket.on("cameraToggle", (data) => {
    const targetId = toId(data?.to);
    if (targetId) {
      io.to(targetId).emit("cameraToggle", { enabled: data?.enabled });
    }
  });

  const endGroupCallEntirely = (cId, reason = "ended") => {
    if (!cId || !activeGroupCalls.has(cId)) return;
    const roomData = activeGroupCalls.get(cId);
    const duration = Math.round((Date.now() - roomData.startedAt) / 1000);

    console.log(`[GroupCall] Ending group call for ${cId}. Reason: ${reason}, duration: ${duration}s`);

    io.to(`call_${cId}`).emit("groupCallEnded", {
      chatId: cId,
      duration,
      callType: roomData.callType,
      reason,
      initiatorId: roomData.initiatorId
    });

    io.to(cId).emit("groupCallEnded", {
      chatId: cId,
      duration,
      callType: roomData.callType,
      reason,
      initiatorId: roomData.initiatorId
    });

    activeGroupCalls.delete(cId);

    io.to(cId).emit("groupCallActiveStatus", {
      chatId: cId,
      isActive: false,
      participantCount: 0
    });
  };

  socket.on("startGroupCall", async ({ chatId, chatName, initiator, callType }) => {
    const cId = toId(chatId);
    if (!cId) return;

    const initId = toId(initiator?._id || initiator);
    if (!activeGroupCalls.has(cId)) {
      activeGroupCalls.set(cId, {
        chatId: cId,
        chatName: chatName || "Group",
        callType: callType || 'video',
        startedAt: Date.now(),
        initiatorId: initId,
        initiatorSocketId: socket.id,
        hadMultipleParticipants: false,
        participants: new Map()
      });
    } else {
      const existing = activeGroupCalls.get(cId);
      if (!existing.initiatorId && initId) {
        existing.initiatorId = initId;
        existing.initiatorSocketId = socket.id;
      }
    }

    const memberIds = await resolveMemberIds(cId);
    memberIds.forEach((mId) => {
      if (mId && mId !== initId) {
        io.to(mId).emit("incomingGroupCall", {
          chatId: cId,
          chatName,
          initiator,
          callType: callType || 'video'
        });
      }
    });

    io.to(cId).emit("groupCallActiveStatus", {
      chatId: cId,
      isActive: true,
      callType: callType || 'video',
      participantCount: activeGroupCalls.get(cId).participants.size
    });
  });

  socket.on("checkGroupCallStatus", (chatId) => {
    const cId = toId(chatId);
    const roomData = activeGroupCalls.get(cId);
    socket.emit("groupCallActiveStatus", {
      chatId: cId,
      isActive: Boolean(roomData && roomData.participants.size > 0),
      callType: roomData?.callType || 'video',
      participantCount: roomData?.participants?.size || 0
    });
  });

  socket.on("joinGroupCall", ({ chatId, user, callType }) => {
    const cId = toId(chatId);
    if (!cId) return;

    socket.join(`call_${cId}`);

    const uId = toId(user?._id || user);
    if (!activeGroupCalls.has(cId)) {
      activeGroupCalls.set(cId, {
        chatId: cId,
        callType: callType || 'video',
        startedAt: Date.now(),
        initiatorId: uId,
        initiatorSocketId: socket.id,
        hadMultipleParticipants: false,
        participants: new Map()
      });
    }

    const roomData = activeGroupCalls.get(cId);
    const existingParticipants = [];
    roomData.participants.forEach((pUser, pSocketId) => {
      existingParticipants.push({ socketId: pSocketId, user: pUser });
    });

    roomData.participants.set(socket.id, {
      ...user,
      socketId: socket.id
    });

    // Mark whether the call ever reached 2+ participants
    if (roomData.participants.size >= 2) {
      roomData.hadMultipleParticipants = true;
    }

    socket.emit("allGroupCallUsers", existingParticipants);

    socket.to(`call_${cId}`).emit("userJoinedGroupCall", {
      socketId: socket.id,
      user
    });

    io.to(cId).emit("groupCallActiveStatus", {
      chatId: cId,
      isActive: true,
      callType: roomData.callType,
      participantCount: roomData.participants.size
    });
  });

  socket.on("groupCallSignal", ({ userToSignal, callerId, signal, user }) => {
    if (userToSignal) {
      io.to(userToSignal).emit("userGroupCallSignal", {
        signal,
        callerId,
        user
      });
    }
  });

  socket.on("groupCameraToggle", ({ chatId, enabled }) => {
    const cId = toId(chatId);
    if (cId) {
      socket.to(`call_${cId}`).emit("groupCameraToggle", { socketId: socket.id, enabled });
    }
  });

  socket.on("groupMuteToggle", ({ chatId, isMuted }) => {
    const cId = toId(chatId);
    if (cId) {
      socket.to(`call_${cId}`).emit("groupMuteToggle", { socketId: socket.id, isMuted });
    }
  });

  const leaveGroupCallInternal = (socketId, chatId) => {
    const cId = toId(chatId);
    if (!cId || !activeGroupCalls.has(cId)) return;

    const roomData = activeGroupCalls.get(cId);
    const userLeaving = roomData.participants.get(socketId);
    const leavingUserId = toId(userLeaving?._id);

    const isInitiator =
      (roomData.initiatorSocketId && socketId === roomData.initiatorSocketId) ||
      (roomData.initiatorId && leavingUserId && leavingUserId === roomData.initiatorId);

    roomData.participants.delete(socketId);
    socket.leave(`call_${cId}`);

    io.to(`call_${cId}`).emit("userLeftGroupCall", { socketId });

    // 1. If the initiator ends or leaves the call -> terminate call for EVERYONE
    if (isInitiator) {
      console.log(`[GroupCall] Initiator left group call in ${cId}. Ending call for all.`);
      endGroupCallEntirely(cId, "initiator_left");
      return;
    }

    // 2. If 0 participants remain -> terminate call
    if (roomData.participants.size === 0) {
      endGroupCallEntirely(cId, "all_left");
      return;
    }

    // 3. If multiple participants were in the call and now only 1 remains:
    // A group call cannot continue with a single lonely user! Automatically terminate.
    if (roomData.hadMultipleParticipants && roomData.participants.size <= 1) {
      console.log(`[GroupCall] Only 1 participant remaining in ${cId} after others left. Ending call.`);
      endGroupCallEntirely(cId, "single_participant_left");
      return;
    }

    // 4. Otherwise, 2+ participants remain in the group call
    io.to(cId).emit("groupCallActiveStatus", {
      chatId: cId,
      isActive: true,
      callType: roomData.callType,
      participantCount: roomData.participants.size
    });
  };

  socket.on("leaveGroupCall", ({ chatId }) => {
    leaveGroupCallInternal(socket.id, chatId);
  });

  socket.on("endGroupCall", ({ chatId }) => {
    const cId = toId(chatId);
    if (!cId || !activeGroupCalls.has(cId)) return;
    const roomData = activeGroupCalls.get(cId);
    const myUid = [...onlineUsers.entries()].find(([, sid]) => sid === socket.id)?.[0];
    const isInitiator =
      (roomData.initiatorSocketId && socket.id === roomData.initiatorSocketId) ||
      (roomData.initiatorId && myUid && myUid === roomData.initiatorId);

    if (isInitiator || roomData.participants.size <= 1) {
      endGroupCallEntirely(cId, "initiator_left");
    } else {
      leaveGroupCallInternal(socket.id, cId);
    }
  });

  // Friend Request live signaling
  socket.on("friend request sent", (data) => {
    const targetId = toId(data?.targetUserId);
    if (targetId) {
      io.to(targetId).emit("friend request received", data);
    }
  });

  socket.on("friend request responded", (data) => {
    const targetId = toId(data?.targetUserId);
    if (targetId) {
      io.to(targetId).emit("friend request updated", data);
    }
  });

  socket.on("disconnect", async () => {
    console.log(" User disconnected", socket.id);

    // Leave any active group call the socket was participating in
    for (const [cId, roomData] of activeGroupCalls.entries()) {
      if (roomData.participants.has(socket.id)) {
        leaveGroupCallInternal(socket.id, cId);
      }
    }

    // Remove user from onlineUsers
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));

        // Update lastSeen and isOnline
        await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date() });

        break;
      }
    }
  });
});


server.listen(port, () => {
  console.log(`App listening on ${port}`);
});






