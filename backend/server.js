import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./database/db.js";
import path from 'path';
import { Server } from 'socket.io'
import http from 'http'


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

dotenv.config();

app.use(cookieParser());

app.use('/Image', express.static(path.join(path.resolve(), 'public', 'Image')));

app.use("/media", express.static(path.join(path.resolve(), 'public', 'media')));

app.get("/", (req, res) => {
  res.send("Hello Chatt!");
});

//Route
import userRouter from "../backend/routes/user.routes.js";
import messageRoutes from "./routes/message.routes.js";
import ChatRoutes from "./routes/chat.routes.js";
import { Socket } from "dgram";

app.use("/api/ChatApp/user", userRouter);
app.use("/api/ChatApp/message", messageRoutes);
app.use("/api/ChatApp/Chat", ChatRoutes);

import { errorHandler } from "./middleware/error.middleware.js";
app.use(errorHandler);

const port = process.env.PORT || 5000;

connectDB();

const onlineUsers = new Map();

import User from "./models/user.model.js";

// ... (existing imports)

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("setup", async (userData) => {
    socket.join(userData._id);
    onlineUsers.set(userData._id, socket.id);
    io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));

    // Update isOnline status
    await User.findByIdAndUpdate(userData._id, { isOnline: true });

    console.log(`${userData.name} joined personal room`);
  });

  socket.on("join chat", (roomId) => {
    socket.join(roomId);
    console.log(`User joined chat room: ${roomId}`);
  });

  socket.on("typing", (room) => socket.in(room).emit("typing", room));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing", room));

  socket.on("new reaction", (updatedMsg) => {
    // Broadcast to specific chat room
    const chat = updatedMsg.chatId || updatedMsg.chat;
    if (chat) {
      socket.in(chat._id ? chat._id : chat).emit("reaction updated", updatedMsg);
    }
  });

  socket.on("new message", (msg) => {
    const chat = msg.chat;
    if (!chat.members) return;

    chat.members.forEach((member) => {
      if (member._id !== msg.Sender._id) {
        socket.to(member._id).emit("message received", msg);
      }
    });
  });

  // Call Signaling Events
  socket.on("callUser", (data) => {
    // data: { userToCall, signalData, from, name, callType }
    socket.to(data.userToCall).emit("callUser", {
      signal: data.signalData,
      from: data.from,
      name: data.name,
      callType: data.callType
    });
  });

  socket.on("answerCall", (data) => {
    // data: { signal, to }
    socket.to(data.to).emit("callAccepted", data.signal);
  });

  socket.on("endCall", ({ to }) => {
    socket.to(to).emit("callEnded");
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






