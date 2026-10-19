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

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));


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

  socket.on("typing", (room) => socket.in(toId(room)).emit("typing", room));
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






