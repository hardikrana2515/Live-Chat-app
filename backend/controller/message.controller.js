import Message from "../models/Message.model.js";
import ChatRoom from "../models/Chatroom.model.js";
import { AsyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/Apierror.js";
import { ApiResponse } from "../utils/Apiresponse.js";

const sendMessage = AsyncHandler(async (req, res) => {
  const { message, chatId } = req.body;
  const formData = req.file;

  if (!message && !formData) {
    // throw new ApiError(400, "Message or Media Required !!");
    return res
      .status(401)
      .json(new ApiResponse(401, null, "Message or Media Required !"));
  }

  const userId = req.user._id;
  const Chat = await ChatRoom.findById(chatId);

  if (!Chat) {
    // throw new ApiError(404, " Chat Not Found!!!");
    return res.status(404).json(new ApiResponse(404, null, "Chat not found"));
  }

 const mediaUrl = formData
  ? req.file.mimetype.startsWith("image/")
    ? `/Image/${req.file.filename}`
    : `/media/${req.file.filename}`
  : "";
  
  const newMessage = await Message.create({
    Sender: userId,
    chatId: chatId,
    message: message || "",
    media: mediaUrl,
  });

  Chat.lastMessage = newMessage._id;
  await Chat.save();

  let populatedMessage = await Message.findById(newMessage._id)
    .populate("Sender", "name avtar")
    .populate({
      path: "chatId",
      populate: {
        path: "members",
        select: "name avtar email _id",
      },
    });

  populatedMessage = populatedMessage.toObject();
  populatedMessage.chat = populatedMessage.chatId;
  delete populatedMessage.chatId;

  return res
    .status(200)
    .json(
      new ApiResponse(200, populatedMessage, "Message sent sucessfully ...")
    );
});

const allMessages = AsyncHandler(async (req, res) => {
  const { chatId } = req.body;

  if (!chatId) {
    // throw new ApiError(400, "chatId  is required.");
    return res
      .status(401)
      .json(new ApiResponse(401, null, "ChatId is required"));
  }

  const messages = await Message.find({ chatId })
    .populate("Sender", "name avtar email")
    .populate({
      path: "chatId",
      populate: {
        path: "members",
        select: "name avtar email",
      },
    });

  if (!messages || messages.length === 0) {
    return res.status(200).json(new ApiResponse(200, [], "No messages found."));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, messages, "All messages fetched!!"));
});

const deleteMessage = AsyncHandler(async (req, res) => {
  const { messageId, forEveryone } = req.body;
  const userId = req.user._id;

  if (!messageId) {
    // throw new ApiError(401, "messageId required!!!");
    return res
      .status(401)
      .json(new ApiResponse(401, null, "messageId is required"));
  }

  const message = await Message.findById(messageId);

  if (!message) {
    // throw new ApiError(404, "message not available.");
    return res
      .status(404)
      .json(new ApiResponse(404, null, "message  not available"));
  }

  const isSender = message.Sender.toString() === req.user._id.toString();
  const withinOneHour =
    new Date() - new Date(message.createdAt) < 60 * 60 * 1000;

  if (isSender && forEveryone) {
    if (!withinOneHour) {
      // throw new ApiError( 403, "You can only delete messages for everyone within 1 hour.");
      return res
        .status(403)
        .json(
          new ApiResponse(
            403,
            null,
            "You can only delete messages for everyone within 1 hour."
          )
        );
    }
    message.isDeleted = true;
    message.message = "";
    message.media = "";
    message.deletedAt = new Date();

    await message.save();

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Message deleted for everyone!!"));
  }

  if (!Array.isArray(message.deletedFor)) {
    message.deletedFor = [];
  }
  if (!message.deletedFor.includes(userId)) {
    message.deletedFor.push(userId);
    await message.save();
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Message delete from you only!!! "));
});

const markAsRead = AsyncHandler(async (req, res) => {
  const { messageId } = req.body;
  const userId = req.user._id;
  const message = await Message.findById(messageId);

  if (!message) {
    // throw new ApiError(404, "Message not found.");
    return res
      .status(404)
      .json(new ApiResponse(404, null, "Message not found"));
  }

  if (!message.readBy.includes(userId)) {
    message.readBy.push(userId);
    await message.save();
  }
  return res
    .status(200)
    .json(new ApiResponse(200, message, "Message marked as read."));
});

export { sendMessage, allMessages, deleteMessage, markAsRead };
