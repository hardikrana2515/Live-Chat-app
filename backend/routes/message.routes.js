import express from "express";
import { Auth } from "../middleware/Auth.js";
import {
  sendMessage,
  allMessages,
  deleteMessage,
  markAsRead,

  reactToMessage,
  votePoll
} from "../controller/message.controller.js";
import upload from '../middleware/multer.js'
const messageRoutes = express.Router();

messageRoutes.post("/sendmessage", upload.single('media'), Auth, sendMessage);
messageRoutes.post("/allmessages", Auth, allMessages);
messageRoutes.post("/deteleMessage", Auth, deleteMessage);
messageRoutes.put("/markread", Auth, markAsRead);
messageRoutes.put("/react", Auth, reactToMessage);
messageRoutes.put("/vote", Auth, votePoll); // Added the vote route

export default messageRoutes;
