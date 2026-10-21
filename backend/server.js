import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./database/db.js";
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io'
import http from 'http'

// Anchor paths to this file's directory (backend/), so the server works no
// matter which directory Node was started from. (Issue E4)
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


app.use(express.json());
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

//Route
import userRouter from "../backend/routes/user.routes.js";
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
const activeGroupCalls = new Map(); // chatId -> { chatId, chatName, callType, startedAt, participants: Map(socketId -> user) }

import User from "./models/user.model.js";
import ChatRoom from "./models/Chatroom.model.js";

// Expose io to express controllers (group lifecycle events)
app.set('io', io);

const toId = (v) => String(v?._id ?? v ?? '');

// Resolve a chat's member ids (payload may carry a populated chat or just an id)
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

    // Update isOnline status
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
    // Don't relay typing to blocked users (Issue §6.1)
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

  // Message mutations must reach EVERY member, not only those who currently
  // have the chat room open (clients join chat rooms only while viewing them).
  // Personal rooms (joined at "setup") guarantee delivery everywhere. (Issue 2.2)

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
    // "Delete for me" is a private action — never relay it to other members
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
    let chat = msg?.chat;
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

  // Call Signaling Events (normalized room delivery)
  socket.on("callUser", (data) => {
    // data: { userToCall, signalData, from, name, callType }
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
    // data: { signal, to }
    const targetId = toId(data?.to);
    console.log(`[Socket] answerCall to ${targetId}`);
    io.to(targetId).emit("callAccepted", data?.signal);

    // Notify other tabs belonging to this user so call modal closes (Issue §3.4)
    const uid = [...onlineUsers.entries()].find(([, sid]) => sid === socket.id)?.[0];
    if (uid) socket.to(uid).emit("callHandled");
  });

  socket.on("endCall", ({ to }) => {
    const targetId = toId(to);
    console.log(`[Socket] endCall to ${targetId}`);
    io.to(targetId).emit("callEnded");

    // Notify other tabs belonging to this user so incoming modal closes (Issue §3.4)
    const uid = [...onlineUsers.entries()].find(([, sid]) => sid === socket.id)?.[0];
    if (uid) socket.to(uid).emit("callEnded");
  });

  socket.on("cameraToggle", (data) => {
    const targetId = toId(data?.to);
    if (targetId) {
      io.to(targetId).emit("cameraToggle", { enabled: data?.enabled });
    }
  });

  // Group Call Signaling Events
  socket.on("startGroupCall", async ({ chatId, chatName, initiator, callType }) => {
    const cId = toId(chatId);
    if (!cId) return;

    if (!activeGroupCalls.has(cId)) {
      activeGroupCalls.set(cId, {
        chatId: cId,
        chatName: chatName || "Group",
        callType: callType || 'video',
        startedAt: Date.now(),
        participants: new Map()
      });
    }

    const memberIds = await resolveMemberIds(cId);
    const initId = toId(initiator?._id || initiator);
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

    if (!activeGroupCalls.has(cId)) {
      activeGroupCalls.set(cId, {
        chatId: cId,
        callType: callType || 'video',
        startedAt: Date.now(),
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

    // 1. Send all existing participants to the joining user
    socket.emit("allGroupCallUsers", existingParticipants);

    // 2. Broadcast to existing participants that a new peer joined
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
    roomData.participants.delete(socketId);
    socket.leave(`call_${cId}`);

    io.to(`call_${cId}`).emit("userLeftGroupCall", { socketId });

    if (roomData.participants.size === 0) {
      const duration = Math.round((Date.now() - roomData.startedAt) / 1000);
      io.to(cId).emit("groupCallEnded", {
        chatId: cId,
        duration,
        callType: roomData.callType
      });
      activeGroupCalls.delete(cId);
      io.to(cId).emit("groupCallActiveStatus", {
        chatId: cId,
        isActive: false,
        participantCount: 0
      });
    } else {
      io.to(cId).emit("groupCallActiveStatus", {
        chatId: cId,
        isActive: true,
        callType: roomData.callType,
        participantCount: roomData.participants.size
      });
    }
  };

  socket.on("leaveGroupCall", ({ chatId }) => {
    leaveGroupCallInternal(socket.id, chatId);
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






