import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./database/db.js";
import path from 'path';
import {Server}   from 'socket.io'
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

const port = process.env.PORT || 5000;

connectDB();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    console.log(`${userData.name} joined personal room`);
  });

  socket.on("join chat", (roomId) => {
    socket.join(roomId);
    console.log(`User joined chat room: ${roomId}`);
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

  socket.on("disconnect", () => {
    console.log(" User disconnected", socket.id);
  });
});


server.listen(port, () => {
  console.log(`App listening on ${port}`);
});






