import express from "express";
import { Auth } from "../middleware/Auth.js";
import {
  sendMessage,
  allMessages,
  deleteMessage,
  markAsRead,

  reactToMessage,
  votePoll,
  editMessage
} from "../controller/message.controller.js";
import upload from '../middleware/multer.js'
const messageRoutes = express.Router();

messageRoutes.post("/sendmessage", Auth, upload.single('media'), sendMessage);
messageRoutes.post("/allmessages", Auth, allMessages);
messageRoutes.post("/deteleMessage", Auth, deleteMessage);
messageRoutes.post("/deleteMessage", Auth, deleteMessage);
messageRoutes.put("/markread", Auth, markAsRead);
messageRoutes.put("/react", Auth, reactToMessage);
messageRoutes.put("/vote", Auth, votePoll); // Added the vote route
messageRoutes.put("/editMessage", Auth, editMessage);
messageRoutes.put("/edit", Auth, editMessage);

export default messageRoutes;
