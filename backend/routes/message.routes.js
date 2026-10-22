import express from "express";
import { Auth } from "../middleware/Auth.js";
import { rateLimit } from "../middleware/rateLimiter.js";
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

const messageLimiter = rateLimit({ windowMs: 60 * 1000, max: 90, message: "Sending messages too fast. Please slow down." });

const messageRoutes = express.Router();

messageRoutes.post("/sendmessage", Auth, messageLimiter, upload.single('media'), sendMessage);
messageRoutes.post("/allmessages", Auth, allMessages);
messageRoutes.post("/deteleMessage", Auth, deleteMessage);
messageRoutes.post("/deleteMessage", Auth, deleteMessage);
messageRoutes.put("/markread", Auth, markAsRead);
messageRoutes.put("/react", Auth, reactToMessage);
messageRoutes.put("/vote", Auth, votePoll);
messageRoutes.put("/editMessage", Auth, editMessage);
messageRoutes.put("/edit", Auth, editMessage);

export default messageRoutes;
