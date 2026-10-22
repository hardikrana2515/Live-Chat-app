import mongoose from "mongoose";
import Message from "../models/Message.model.js";
import ChatRoom from "../models/Chatroom.model.js";
import User from "../models/user.model.js";
import { AsyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/Apierror.js";
import { ApiResponse } from "../utils/Apiresponse.js";

const sendMessage = AsyncHandler(async (req, res) => {
  const { message, chatId } = req.body;
  const formData = req.file;

  if (!chatId || !mongoose.isValidObjectId(chatId)) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "A valid chatId is required"));
  }

  // Poll Handling
  let pollData = null;
  if (req.body.poll) {
    try {
      pollData = typeof req.body.poll === "string" ? JSON.parse(req.body.poll) : req.body.poll;
    } catch {
      pollData = null;
    }
  }

  const hasValidPoll = Boolean(
    pollData &&
    typeof pollData === "object" &&
    typeof pollData.question === "string" &&
    pollData.question.trim().length > 0 &&
    Array.isArray(pollData.options) &&
    pollData.options.length >= 2
  );

  // Check if it's a Poll, Text, or Media message
  const hasText = typeof message === "string" && message.trim().length > 0;
  if (!hasText && !formData && !hasValidPoll) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Message, Media, or a valid Poll is required!"));
  }

  const userId = req.user._id;
  const Chat = await ChatRoom.findById(chatId);

  if (!Chat) {
    return res.status(404).json(new ApiResponse(404, null, "Chat not found"));
  }

  // Only current chat members may post
  const isMember = (Chat.members || []).some(
    (m) => (m?._id || m).toString() === userId.toString()
  );
  if (!isMember) {
    return res.status(403).json(new ApiResponse(403, null, "You are not a member of this chat"));
  }

  // Blocking Check for 1-on-1 chats
  if (!Chat.isGroup) {
    const recipientId = (Chat.members || []).find(
      (member) => (member?._id || member).toString() !== userId.toString()
    );
    if (recipientId) {
      const recipient = await User.findById(recipientId);
      const sender = await User.findById(userId);

      if (recipient && sender) {
        const recipientBlocked = recipient.blockedUsers || [];
        const senderBlocked = sender.blockedUsers || [];
        const isBlockedByRecipient = recipientBlocked.some((id) => String(id) === String(userId));
        const hasBlockedRecipient = senderBlocked.some((id) => String(id) === String(recipientId));
        if (isBlockedByRecipient) {
          return res.status(403).json(new ApiResponse(403, null, "You have been blocked by this user."));
        }
        if (hasBlockedRecipient) {
          return res.status(403).json(new ApiResponse(403, null, "You have blocked this user. Unblock to send messages."));
        }
      }
    }
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
    poll: hasValidPoll ? pollData : undefined,
  });

  Chat.lastMessage = newMessage._id;
  await Chat.save();

  let populatedMessage = await Message.findById(newMessage._id)
    .populate("Sender", "-password")
    .populate({
      path: "chatId",
      populate: {
        path: "members",
        select: "-password",
      },
    });

  populatedMessage = populatedMessage.toObject();
  populatedMessage.chat = populatedMessage.chatId;

  return res
    .status(200)
    .json(
      new ApiResponse(200, populatedMessage, "Message sent successfully")
    );
});

const allMessages = AsyncHandler(async (req, res) => {
  const { chatId, limit, before } = req.body;

  if (!chatId || !mongoose.isValidObjectId(chatId)) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Valid chatId is required"));
  }

  const chat = await ChatRoom.findById(chatId).select("members");
  if (!chat) {
    return res.status(404).json(new ApiResponse(404, null, "Chat not found"));
  }
  const isMember = (chat.members || []).some(
    (m) => (m?._id || m).toString() === req.user._id.toString()
  );
  if (!isMember) {
    return res.status(403).json(new ApiResponse(403, null, "You are not a member of this chat"));
  }

  const pageSize = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100);
  const query = {
    chatId,
    deletedFor: { $ne: req.user._id },
  };

  if (before && mongoose.isValidObjectId(before)) {
    query._id = { $lt: before };
  }

  const rows = await Message.find(query)
    .sort({ _id: -1 })
    .limit(pageSize + 1)
    .populate("Sender", "-password")
    .populate("reactions.user", "name avtar")
    .populate({
      path: "chatId",
      populate: {
        path: "members",
        select: "-password",
      },
    });

  const hasMore = rows.length > pageSize;
  const page = hasMore ? rows.slice(0, pageSize) : rows;
  page.reverse();

  const normalizedPage = page.map((m) => {
    const obj = m.toObject();
    obj.chat = obj.chatId;
    return obj;
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { messages: normalizedPage, hasMore }, "Messages fetched successfully"));
});

const deleteMessage = AsyncHandler(async (req, res) => {
  const { messageId, forEveryone } = req.body;
  const userId = req.user._id;

  if (!messageId || !mongoose.isValidObjectId(messageId)) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Valid messageId is required"));
  }

  const message = await Message.findById(messageId);

  if (!message) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "Message not available"));
  }

  const chat = await ChatRoom.findById(message.chatId);
  if (!chat || !(chat.members || []).some((m) => (m?._id || m).toString() === userId.toString())) {
    return res.status(403).json(new ApiResponse(403, null, "You are not a member of this chat"));
  }

  const isSender = message.Sender.toString() === userId.toString();
  const DELETE_GRACE_MS = 5 * 60 * 1000;
  const withinOneHour =
    new Date() - new Date(message.createdAt) < 60 * 60 * 1000 + DELETE_GRACE_MS;

  if (forEveryone) {
    if (!isSender) {
      return res
        .status(403)
        .json(
          new ApiResponse(403, null, "You can only delete your own messages for everyone.")
        );
    }

    if (!withinOneHour) {
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
    message.poll = undefined;
    message.deletedAt = new Date();

    await message.save();

    return res
      .status(200)
      .json(new ApiResponse(200, { messageId, isDeleted: true }, "Message deleted for everyone successfully"));
  }

  if (!Array.isArray(message.deletedFor)) {
    message.deletedFor = [];
  }
  if (!message.deletedFor.some((id) => String(id) === String(userId))) {
    message.deletedFor.push(userId);
    await message.save();
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { messageId }, "Message deleted for you only"));
});

const markAsRead = AsyncHandler(async (req, res) => {
  const { messageId, messageIds } = req.body;
  const userId = req.user._id;

  if (Array.isArray(messageIds) && messageIds.length > 0) {
    const validIds = messageIds.filter((id) => mongoose.isValidObjectId(id));
    if (validIds.length === 0) {
      return res.status(400).json(new ApiResponse(400, null, "No valid message IDs provided"));
    }

    await Message.updateMany(
      { _id: { $in: validIds }, readBy: { $ne: userId } },
      { $addToSet: { readBy: userId }, $set: { status: "read" } }
    );
    return res
      .status(200)
      .json(new ApiResponse(200, { messageIds: validIds, readerId: userId }, "Messages marked as read"));
  }

  if (!messageId || !mongoose.isValidObjectId(messageId)) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Valid messageId or messageIds is required"));
  }

  const message = await Message.findById(messageId);

  if (!message) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "Message not found"));
  }

  if (!Array.isArray(message.readBy)) {
    message.readBy = [];
  }
  if (!message.readBy.some((id) => String(id) === String(userId))) {
    message.readBy.push(userId);
    message.status = "read";
    await message.save();
  }

  let populatedMessage = await Message.findById(messageId)
    .populate("Sender", "name avtar email")
    .populate({
      path: "chatId",
      populate: {
        path: "members",
        select: "name avtar email",
      },
    });

  populatedMessage = populatedMessage.toObject();
  populatedMessage.chat = populatedMessage.chatId;

  return res
    .status(200)
    .json(new ApiResponse(200, populatedMessage, "Message marked as read"));
});

const reactToMessage = AsyncHandler(async (req, res) => {
  const { messageId, emoji } = req.body;
  const userId = req.user._id;

  if (!messageId || !mongoose.isValidObjectId(messageId)) {
    return res.status(400).json(new ApiResponse(400, null, "Valid messageId is required"));
  }

  if (!emoji || typeof emoji !== "string" || emoji.trim().length === 0) {
    return res.status(400).json(new ApiResponse(400, null, "Valid emoji is required"));
  }

  const message = await Message.findById(messageId);
  if (!message) {
    return res.status(404).json(new ApiResponse(404, null, "Message not found"));
  }

  if (message.isDeleted) {
    return res.status(400).json(new ApiResponse(400, null, "Cannot react to a deleted message"));
  }

  const chatDoc = await ChatRoom.findById(message.chatId);
  if (!chatDoc || !(chatDoc.members || []).some((m) => (m?._id || m).toString() === userId.toString())) {
    return res.status(403).json(new ApiResponse(403, null, "You are not a member of this chat"));
  }

  if (!Array.isArray(message.reactions)) {
    message.reactions = [];
  }

  const existingReactionIndex = message.reactions.findIndex(
    (r) => r.user && r.user.toString() === userId.toString()
  );

  if (existingReactionIndex > -1) {
    if (message.reactions[existingReactionIndex].emoji === emoji) {
      // Remove reaction if same
      message.reactions.splice(existingReactionIndex, 1);
    } else {
      // Update reaction
      message.reactions[existingReactionIndex].emoji = emoji;
    }
  } else {
    // Add new reaction
    message.reactions.push({ user: userId, emoji });
  }

  await message.save();

  let populatedMessage = await Message.findById(messageId)
    .populate("Sender", "name avtar email")
    .populate("reactions.user", "name avtar")
    .populate({
      path: "chatId",
      populate: {
        path: "members",
        select: "name avtar email",
      },
    });

  populatedMessage = populatedMessage.toObject();
  populatedMessage.chat = populatedMessage.chatId;

  return res.status(200).json(new ApiResponse(200, populatedMessage, "Reaction updated"));
});

const votePoll = AsyncHandler(async (req, res) => {
  const { messageId, optionIndex } = req.body;
  const userId = req.user._id;

  if (!messageId || !mongoose.isValidObjectId(messageId)) {
    return res.status(400).json(new ApiResponse(400, null, "Valid messageId is required"));
  }

  const message = await Message.findById(messageId);
  if (!message || !message.poll || !Array.isArray(message.poll.options)) {
    return res.status(404).json(new ApiResponse(404, null, "Poll not found"));
  }

  if (message.isDeleted) {
    return res.status(400).json(new ApiResponse(400, null, "Cannot vote on a deleted poll"));
  }

  if (typeof optionIndex !== "number" || optionIndex < 0 || optionIndex >= message.poll.options.length) {
    return res.status(400).json(new ApiResponse(400, null, "Invalid poll option"));
  }

  const chatDoc = await ChatRoom.findById(message.chatId);
  if (!chatDoc || !(chatDoc.members || []).some((m) => (m?._id || m).toString() === userId.toString())) {
    return res.status(403).json(new ApiResponse(403, null, "You are not a member of this chat"));
  }

  const hasVotedInOption = (opt) =>
    (opt.votes || []).some((v) => String(v?._id ?? v) === String(userId));

  const alreadyVotedHere = hasVotedInOption(message.poll.options[optionIndex] || {});

  message.poll.options.forEach((opt) => {
    if (!Array.isArray(opt.votes)) opt.votes = [];
    const index = opt.votes.findIndex((v) => String(v?._id ?? v) === String(userId));
    if (index > -1) {
      opt.votes.splice(index, 1);
    }
  });

  if (!alreadyVotedHere) {
    message.poll.options[optionIndex].votes.push(userId);
  }

  await message.save();

  let populatedMessage = await Message.findById(messageId)
    .populate("Sender", "name avtar email")
    .populate("reactions.user", "name avtar")
    .populate("poll.options.votes", "name avtar")
    .populate({
      path: "chatId",
      populate: {
        path: "members",
        select: "name avtar email",
      },
    });

  populatedMessage = populatedMessage.toObject();
  populatedMessage.chat = populatedMessage.chatId;

  return res.status(200).json(new ApiResponse(200, populatedMessage, "Vote registered"));
});

const editMessage = AsyncHandler(async (req, res) => {
  const { messageId, message: newText } = req.body;
  const userId = req.user._id;

  if (!messageId || !mongoose.isValidObjectId(messageId)) {
    return res.status(400).json(new ApiResponse(400, null, "Valid messageId is required"));
  }

  if (typeof newText !== "string" || newText.trim().length === 0) {
    return res.status(400).json(new ApiResponse(400, null, "Valid new message text is required"));
  }

  const existingMessage = await Message.findById(messageId);
  if (!existingMessage) {
    return res.status(404).json(new ApiResponse(404, null, "Message not found"));
  }

  // Only the original sender can edit their message
  if (existingMessage.Sender.toString() !== userId.toString()) {
    return res.status(403).json(new ApiResponse(403, null, "You can only edit your own messages"));
  }

  // Cannot edit deleted messages
  if (existingMessage.isDeleted) {
    return res.status(400).json(new ApiResponse(400, null, "Cannot edit a deleted message"));
  }

  const EDIT_GRACE_MS = 5 * 60 * 1000;
  const withinOneHour =
    new Date() - new Date(existingMessage.createdAt) < 60 * 60 * 1000 + EDIT_GRACE_MS;
  if (!withinOneHour) {
    return res.status(403).json(new ApiResponse(403, null, "Messages can only be edited within 1 hour."));
  }

  existingMessage.message = newText;
  existingMessage.isEdited = true;
  existingMessage.editedAt = new Date();
  await existingMessage.save();

  let populatedMessage = await Message.findById(messageId)
    .populate("Sender", "name avtar email")
    .populate("reactions.user", "name avtar")
    .populate({
      path: "chatId",
      populate: {
        path: "members",
        select: "name avtar email _id",
      },
    });

  populatedMessage = populatedMessage.toObject();
  populatedMessage.chat = populatedMessage.chatId;

  return res.status(200).json(new ApiResponse(200, populatedMessage, "Message edited successfully"));
});

export { sendMessage, allMessages, deleteMessage, markAsRead, reactToMessage, votePoll, editMessage };
