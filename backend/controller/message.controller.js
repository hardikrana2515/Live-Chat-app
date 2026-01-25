
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
  if (!message && !formData && !req.body.poll) {
    // throw new ApiError(400, "Message or Media Required !!");
    return res
      .status(401)
      .json(new ApiResponse(401, null, "Message, Media, or Poll Required !"));
  }

  const userId = req.user._id;
  const Chat = await ChatRoom.findById(chatId);

  if (!Chat) {
    // throw new ApiError(404, " Chat Not Found!!!");
    return res.status(404).json(new ApiResponse(404, null, "Chat not found"));
  }

  // Blocking Check
  if (!Chat.isGroup) {
    const recipientId = Chat.members.find((member) => member.toString() !== userId.toString());
    if (recipientId) {
      const recipient = await User.findById(recipientId);
      const sender = await User.findById(userId); // Ensure we have latest blockedUsers

      if (recipient && sender) {
        if (recipient.blockedUsers.includes(userId)) {
          return res.status(403).json(new ApiResponse(403, null, "You have been blocked by this user."));
        }
        if (sender.blockedUsers.includes(recipientId)) {
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

const reactToMessage = AsyncHandler(async (req, res) => {
  const { messageId, emoji } = req.body;
  const userId = req.user._id;

  const message = await Message.findById(messageId);
  if (!message) {
    return res.status(404).json(new ApiResponse(404, null, "Message not found"));
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

  // Remove user vote from all options (Single choice poll for now, or toggle)
  // Let's implement toggle: If already voted for this option, remove. If passed different option, switch.

  // 1. Remove existing vote from any option
  message.poll.options.forEach(opt => {
    const index = opt.votes.indexOf(userId);
    if (index > -1) {
      opt.votes.splice(index, 1);
    }
  });

  // 2. Add new vote if valid index sent (if index is null/undefined = just remove vote, but logic assumes index sent)
  // Actually, typical UI: Click option -> Toggle.
  // Let's assume input is "I want to vote for Option X". 
  // If I already voted for Option X, remove it. If I voted for Y, remove Y and add X.

  // Since we cleared all above (which is safer for single-choice), we just add to the new one.
  // Wait, if I simply want to "unvote" by clicking again, the UI might send a specific flag or we check before clearing.
  // For simplicity: Always switch to the selected option.

  if (optionIndex >= 0 && optionIndex < message.poll.options.length) {
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

export { sendMessage, allMessages, deleteMessage, markAsRead, reactToMessage, votePoll };
