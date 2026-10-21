
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

  // Check if it's a Poll, Text, or Media message
  const hasText = typeof message === "string" && message.trim().length > 0;
  if (!hasText && !formData && !req.body.poll) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Message, Media, or Poll Required !"));
  }

  const userId = req.user._id;
  const Chat = await ChatRoom.findById(chatId);

  if (!Chat) {
    // throw new ApiError(404, " Chat Not Found!!!");
    return res.status(404).json(new ApiResponse(404, null, "Chat not found"));
  }

  // Only current chat members may post (a removed member must not be able
  // to keep writing — or reading — ciphertext for a chat they left)
  const isMember = (Chat.members || []).some((m) => m.toString() === userId.toString());
  if (!isMember) {
    return res.status(403).json(new ApiResponse(403, null, "You are not a member of this chat"));
  }

  // Blocking Check
  if (!Chat.isGroup) {
    const recipientId = Chat.members.find((member) => member.toString() !== userId.toString());
    if (recipientId) {
      const recipient = await User.findById(recipientId);
      const sender = await User.findById(userId); // Ensure we have latest blockedUsers

      if (recipient && sender) {
        // ObjectId arrays must be compared by string, not with .includes()
        // (a distinct ObjectId instance never === another one). (Issue E3)
        const isBlockedByRecipient = recipient.blockedUsers.some((id) => String(id) === String(userId));
        const hasBlockedRecipient = sender.blockedUsers.some((id) => String(id) === String(recipientId));
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

  // Poll Handling
  let pollData = null;
  if (req.body.poll) {
    // Expecting poll to be a JSON string if sent with formData, or object if JSON
    try {
      pollData = typeof req.body.poll === 'string' ? JSON.parse(req.body.poll) : req.body.poll;
    } catch (e) {
      // console.error("Poll parse error", e);
    }
  }

  const newMessage = await Message.create({
    Sender: userId,
    chatId: chatId,
    message: message || "",
    media: mediaUrl,
    poll: pollData,
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
  const { chatId, limit, before } = req.body;

  if (!chatId) {
    // throw new ApiError(400, "chatId  is required.");
    return res
      .status(401)
      .json(new ApiResponse(401, null, "ChatId is required"));
  }

  // Membership gate: removed/left members must not be able to pull ciphertext
  // for chats they no longer belong to (pairs with E2EE, Issue 3.2).
  const chat = await ChatRoom.findById(chatId).select("members");
  if (!chat) {
    return res.status(404).json(new ApiResponse(404, null, "Chat not found"));
  }
  const isMember = (chat.members || []).some((m) => m.toString() === req.user._id.toString());
  if (!isMember) {
    return res.status(403).json(new ApiResponse(403, null, "You are not a member of this chat"));
  }

  // Cursor pagination: return the newest `limit` messages (default 50).
  // Passing `before` (a message id) returns the page older than that message. (Issue 3.4)
  const pageSize = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100);
  const query = { chatId };
  if (before && mongoose.isValidObjectId(before)) {
    query._id = { $lt: before };
  }

  // Fetch one extra row to know whether an older page exists
  const rows = await Message.find(query)
    .sort({ _id: -1 })
    .limit(pageSize + 1)
    .populate("Sender", "name avtar email")
    .populate({
      path: "chatId",
      populate: {
        path: "members",
        select: "name avtar email",
      },
    });

  const hasMore = rows.length > pageSize;
  const page = hasMore ? rows.slice(0, pageSize) : rows;
  page.reverse(); // chronological order for the client

  return res
    .status(200)
    .json(new ApiResponse(200, { messages: page, hasMore }, "Messages fetched!!"));
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
  // Server clock is authoritative. A 5-minute grace window absorbs small
  // client/server clock drift so borderline deletes aren't rejected. (Issue E1)
  const DELETE_GRACE_MS = 5 * 60 * 1000;
  const withinOneHour =
    new Date() - new Date(message.createdAt) < 60 * 60 * 1000 + DELETE_GRACE_MS;

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
    message.poll = undefined;
    message.deletedAt = new Date();

    await message.save();

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Message deleted for everyone!!"));
  }

  if (!Array.isArray(message.deletedFor)) {
    message.deletedFor = [];
  }
  // Compare by string: ObjectId .includes(userId) never matches a distinct instance
  if (!message.deletedFor.some((id) => String(id) === String(userId))) {
    message.deletedFor.push(userId);
    await message.save();
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Message delete from you only!!! "));
});

const markAsRead = AsyncHandler(async (req, res) => {
  const { messageId, messageIds } = req.body;
  const userId = req.user._id;

  if (Array.isArray(messageIds) && messageIds.length > 0) {
    await Message.updateMany(
      { _id: { $in: messageIds }, readBy: { $ne: userId } },
      { $addToSet: { readBy: userId } }
    );
    return res
      .status(200)
      .json(new ApiResponse(200, { messageIds, readerId: userId }, "Messages marked as read."));
  }

  if (!messageId) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "messageId or messageIds is required"));
  }

  const message = await Message.findById(messageId);

  if (!message) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "Message not found"));
  }

  // Compare by string: ObjectId .includes(userId) never matches a distinct instance
  if (!message.readBy.some((id) => String(id) === String(userId))) {
    message.readBy.push(userId);
    await message.save();
  }
  return res
    .status(200)
    .json(new ApiResponse(200, message, "Message marked as read."));
});

const reactToMessage = AsyncHandler(async (req, res) => {
  const { messageId, emoji } = req.body;
  const userId = req.user._id;

  const message = await Message.findById(messageId);
  if (!message) {
    return res.status(404).json(new ApiResponse(404, null, "Message not found"));
  }

  if (message.isDeleted) {
    return res.status(400).json(new ApiResponse(400, null, "Cannot react to a deleted message"));
  }

  const chatDoc = await ChatRoom.findById(message.chatId);
  if (!chatDoc || !chatDoc.members.some((m) => String(m) === String(userId))) {
    return res.status(403).json(new ApiResponse(403, null, "You are not a member of this chat"));
  }

  const existingReactionIndex = message.reactions.findIndex(
    (r) => r.user.toString() === userId.toString()
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

  // Populate reactions user for real-time updates if needed, though simpler just to return message
  const populatedMessage = await Message.findById(messageId)
    .populate("Sender", "name avtar email")
    .populate("reactions.user", "name avtar")
    .populate({
      path: "chatId",
      populate: {
        path: "members",
        select: "name avtar email",
      },
    });

  return res.status(200).json(new ApiResponse(200, populatedMessage, "Reaction updated"));
});

const votePoll = AsyncHandler(async (req, res) => {
  const { messageId, optionIndex } = req.body;
  const userId = req.user._id;

  const message = await Message.findById(messageId);
  if (!message || !message.poll) {
    return res.status(404).json(new ApiResponse(404, null, "Poll not found"));
  }

  if (message.isDeleted) {
    return res.status(400).json(new ApiResponse(400, null, "Cannot vote on a deleted poll"));
  }

  if (typeof optionIndex !== "number" || optionIndex < 0 || optionIndex >= message.poll.options.length) {
    return res.status(400).json(new ApiResponse(400, null, "Invalid poll option"));
  }

  const chatDoc = await ChatRoom.findById(message.chatId);
  if (!chatDoc || !chatDoc.members.some((m) => String(m) === String(userId))) {
    return res.status(403).json(new ApiResponse(403, null, "You are not a member of this chat"));
  }

  // Remove user vote from all options (Single choice poll for now, or toggle)
  // Let's implement toggle: If already voted for this option, remove. If passed different option, switch.

  // Remove the user's existing vote from ALL options first.
  // NOTE: votes hold Mongoose ObjectId instances, so indexOf (===) never
  // matches a distinct ObjectId — compare by string instead. (Issue 1.3)
  const hasVotedInOption = (opt) =>
    (opt.votes || []).some((v) => String(v?._id ?? v) === String(userId));

  const alreadyVotedHere = hasVotedInOption(message.poll.options[optionIndex] || {});

  message.poll.options.forEach((opt) => {
    const index = (opt.votes || []).findIndex((v) => String(v?._id ?? v) === String(userId));
    if (index > -1) {
      opt.votes.splice(index, 1);
    }
  });

  // Toggle: clicking the option you already voted for removes your vote;
  // clicking a different option switches your vote to it.
  if (!alreadyVotedHere && optionIndex >= 0 && optionIndex < message.poll.options.length) {
    message.poll.options[optionIndex].votes.push(userId);
  }

  await message.save();

  const populatedMessage = await Message.findById(messageId)
    .populate("Sender", "name avtar email")
    .populate("poll.options.votes", "name avtar") // Populate voters? Maybe for list.
    .populate({
      path: "chatId",
      populate: {
        path: "members",
        select: "name avtar email",
      },
    });

  return res.status(200).json(new ApiResponse(200, populatedMessage, "Vote registered"));
});

const editMessage = AsyncHandler(async (req, res) => {
  const { messageId, message: newText } = req.body;
  const userId = req.user._id;

  if (!messageId || typeof newText !== "string") {
    return res.status(400).json(new ApiResponse(400, null, "messageId and new message text are required"));
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

