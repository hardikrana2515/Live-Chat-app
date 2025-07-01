import Message from "../models/Message.model.js";
import { ApiError } from "../utils/Apierror.js";
import { AsyncHandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import ChatRoom from "../models/Chatroom.model.js";
import User from "../models/user.model.js";

const AccessChat = AsyncHandler(async (req, res) => {
  const { UserId } = req.body;

  if (!UserId) {
    // throw new ApiError(403, "UserId don't sent by User!!");
     return res.status(403)
              .json(new ApiResponse(403,null,"UserId don't sent by User!!"
              ))
  }

  let isChat = await ChatRoom.find({
    isGroup: false,
    members: { $all: [req.user._id, UserId] },
  })
    .populate("members")
    .populate("admins")
    .populate({
      path: "lastMessage",
      populate: {
        path: "Sender",
        select: "name avtar email",
      },
    });

  if (isChat.length > 0) {
    res.status(200).json(new ApiResponse(200, isChat[0], "Get the Chat ....."));
  } else {
    let chat = {
      isGroup: false,
      members: [req.user._id, UserId],
    };

    const Createdchat = await ChatRoom.create(chat);
    const FullChat = await ChatRoom.findOne({ _id: Createdchat._id })
      .populate("members","-password")
      .populate("creator", "-password");

    res
      .status(200)
      .json(new ApiResponse(200, FullChat, "chat created !!!hureee .."));
  }
});

const fetchChat = AsyncHandler(async (req, res) => {
  
  const chat = await ChatRoom.find({ members: req.user._id })
    .populate("members", "-password")
    .populate("lastMessage")
    .populate("admins", "-password")
    .populate("creator", "-password")
    .sort({ updatedAt: -1 });

  if (chat.length == 0) {
    throw new ApiError(404, "Not chat Found");
  }
  return res.status(200).json(new ApiResponse(200, chat, "Chat Booom!!!"));
});

const CreateGroup = AsyncHandler(async (req, res) => {
  let { members, chatname, groupIcon } = req.body;
   
  groupIcon = ""
  if (req.file) {
  groupIcon = `/Image/${req.file.filename}`;
}

  if (typeof members === "string") {
    members = JSON.parse(members);
  }

  if (!Array.isArray(members) || members.length < 2 || !chatname) {
    // throw new ApiError(401, "Group name and at least 2 member required.");
    return res.status(401)
              .json(new ApiResponse(401,null,"Group name and at least 2 member required."
              ))
  }
  
  members.push(req.user._id);

  const Group = await ChatRoom.create({
    chatname,
    isGroup: true,
    members,
    admins: [req.user._id],
    creator: req.user._id,
    groupIcon
  });

  const fullGroup = await ChatRoom.findById(Group._id)
    .populate("members", "-password")
    .populate("admins", "-password")
    .populate("creator", "-password");

  return res
    .status(200)
    .json(new ApiResponse(200, fullGroup, "Group created successfully "));
});

const RenameGroup = AsyncHandler(async (req, res) => {
  const { chatId, chatname } = req.body;

  if (!chatId || !chatname || chatname.trim().length === 0) {
    // throw new ApiError(400, "Chat ID and new group name are required.");
    return res.status(400)
              .json(new ApiResponse(400,null,"Chat ID and new group name are required."
              ))
  }

  const chat = await ChatRoom.findById(chatId);

  if (!chat.admins.includes(req.user._id.toString())) {
    // throw new ApiError(403, "Only group admins can rename the group.");
    return res.status(403)
              .json(new ApiResponse(403,null,"Only group admins can rename the group."
              ))
  }
  if (!chat.isGroup) {
    throw new ApiError(400, "Only group chats can be renamed.");
  }

  const AvailChat = await ChatRoom.findByIdAndUpdate(
    chatId,
    {
      chatname,
    },
    {
      new: true,
    }
  )
    .populate("members", "-password")
    .populate("admins", "-password")
    .populate("creator", "-password");

  if (!AvailChat) {
    //  throw new ApiError(404, " Chat not found");
    return res.status(404)
              .json(new ApiResponse(404,null," Chat not found!"
              ))
  } else {
    return res
      .status(200)
      .json(new ApiResponse(200, AvailChat, "Chat renamed Successfully "));
  }
});

const RemovefromGroup = AsyncHandler(async (req, res) => {
  const { chatId, UserId } = req.body;

  if (!chatId || !UserId) {
    // throw new ApiError(400, "chatId and userId are required.");
    return res.status(400)
              .json(new ApiResponse(400,null,"chatId and userId are required."
              ))
  }

  const Chat = await ChatRoom.findById(chatId);

  if (!Chat) {
    // throw new ApiError(404, "Chat not found.");
     return res.status(404)
              .json(new ApiResponse(403,null,"chat not found"
              ))
  }

  if (!Chat.admins.includes(req.user._id.toString())) {
    // throw new ApiError(403, "Only admins can remove members.");
     return res.status(403)
              .json(new ApiResponse(403,null ,"Only admins can remove members."
              ))
  }

  const alreadyMember = Chat.members.some(
    (id) => id.toString() === UserId.toString()
  );

  if (!alreadyMember) {
    // throw new ApiError(409, "User is not in this Group");
     return res.status(409)
              .json(new ApiResponse(409,null,"User is not in this Group"
              ))
  }

  Chat.members = Chat.members.filter(
    (id) => id.toString() !== UserId.toString()
  );

  if (req.user._id.toString() === UserId.toString()) {
    // throw new ApiError(403, "Use leaveGroup to exit the group.");
     return res.status(403)
              .json(new ApiResponse(403,null,"Use leaveGroup to exit the group."
              ))
  }

  if (Chat.creator.toString() === UserId.toString()) {
    // throw new ApiError(405, "Group Creator can't be removed.");
     return res.status(405)
              .json(new ApiResponse(405,null,"Group Creator can't be removed."
              ))
  }
  Chat.admins = Chat.admins.filter((id) => id.toString() !== UserId.toString());
  await Chat.save();

  const updatedChat = await ChatRoom.findById(chatId)
    .populate("members", "-password")
    .populate("admins", "-password")
    .populate("creator", "-password");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedChat, "memeber removed Succesfully"));
});

const addtoGroup = AsyncHandler(async (req, res) => {
  const { chatId, UserIdlist } = req.body;

  if (!chatId || !UserIdlist) {
    // throw new ApiError(400, "chatId and userId are required.");
     return res.status(400)
              .json(new ApiResponse(400,null,"chatId and userId are required."
              ))
  }

  const Chat = await ChatRoom.findById(chatId);

  if (!Chat) {
    // throw new ApiError(404, "Chat not found.");
     return res.status(404)
              .json(new ApiResponse(404,null,"Chat not Found"
              ))
  }

  if (!Chat.admins.includes(req.user._id.toString())) {
    // throw new ApiError(403, "Only admins can add members.");
     return res.status(403)
              .json(new ApiResponse(403,null,"Only Admins can Add members.!!!"
              ))
  }

  const newMembers = UserIdlist.filter(
    (userId) => !Chat.members.map(String).includes(userId.toString())
  );

  if (newMembers.length === 0) {
    // throw new ApiError(409, "All users are already group members.");
     return res.status(400)
              .json(new ApiResponse(400,null,"All users are already groupmembers !!!!"
              ))
  }

  Chat.members.push(...newMembers);
  await Chat.save();

  const updatedChat = await ChatRoom.findById(chatId)
    .populate("members", "-password")
    .populate("admins", "-password")
    .populate("creator", "-password");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedChat, "memeber Added Succesfully"));
});

const makeAdmin = AsyncHandler(async (req, res) => {
  const { chatId, UserId } = req.body;

  if (!chatId || !UserId) {
    // throw new ApiError(400, "chatId and userId are required.");
     return res.status(400)
              .json(new ApiResponse(403,null,"chatId and userId are required."
              ))
  }

  const Chat = await ChatRoom.findById(chatId);

  if (!Chat) {
    // throw new ApiError(404, "Chat not found.");
     return res.status(404)
              .json(new ApiResponse(404,null,"Chat not found"
              ))
  }

  if (!Chat.admins.includes(req.user._id.toString())) {
    // throw new ApiError(403, "Only admins can make admin.");
      return res.status(403)
              .json(new ApiResponse(403,null,"Only admins can make admin."
              ))
  }

  const isMember = Chat.members.some(
    (id) => id.toString() == UserId.toString()
  );

  if (!isMember) {
    // throw new ApiError(409, "User not in this group.");
      return res.status(409)
              .json(new ApiResponse(409,null,"User not in this group."
              ))
  }
  const isAlreadyAdmin = Chat.admins.some(
    (id) => id.toString() === UserId.toString()
  );

  if (isAlreadyAdmin) {
    // throw new ApiError(409, "User is already an admin.");
      return res.status(409)
              .json(new ApiResponse(404,null,"User is already an admin."
              ))
  }
  Chat.admins.push(UserId);
  await Chat.save();

  const updatedChat = await ChatRoom.findById(chatId)
    .populate("members", "-password")
    .populate("admins", "-password")
    .populate("creator", "-password");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedChat, "member as Admin Succesfully"));
});

const RemoveAdmin = AsyncHandler(async (req, res) => {
  const { chatId, UserId } = req.body;

  if (!chatId || !UserId) {
    // throw new ApiError(400, "chatId and userId are required.");
     return res.status(403)
              .json(new ApiResponse(403,null,"chatId and userId are required."
              ))
  }

  const Chat = await ChatRoom.findById(chatId);

  if (!Chat) {
    // throw new ApiError(404, "Chat not found.");
     return res.status(404)
              .json(new ApiResponse(404,null,"Chat not Found"
              ))
  }

  if (!Chat.admins.includes(req.user._id.toString())) {
    // throw new ApiError(403, "Only admins can remove Admin.");
     return res.status(403)
              .json(new ApiResponse(403,null,"Only admins can remove Admin."
              ))
  }

  const alreadyAdmin = Chat.admins.some(
    (id) => id.toString() === UserId.toString()
  );

  if (!alreadyAdmin) {
    // throw new ApiError(409, "User is not as a Admin in this Group");
     return res.status(409)
              .json(new ApiResponse(409,null,"User is not as a Admin in this Group."
              ))
  }

  if (Chat.creator.toString() === UserId.toString()) {
    // throw new ApiError(405, "Group Creator can't be removed.");
     return res.status(405)
              .json(new ApiResponse(405,null, "Group Creator can't be removed."
              ))
  }

  if (req.user._id.toString() === UserId.toString()) {
    // throw new ApiError(403, "Use leaveGroup to exit the group.");
     return res.status(403)
              .json(new ApiResponse(403,null,"Use leaveGroup to exit the group."
              ))
  }

  if (
    Chat.admins.length === 1 &&
    Chat.admins[0].toString() === UserId.toString()
  ) {
    // throw new ApiError(403, "Cannot remove the last admin from the group.");
     return res.status(403)
              .json(new ApiResponse(403,null,"Cannot remove the last admin from the group."
              ))
  }

  Chat.admins = Chat.admins.filter((id) => id.toString() !== UserId.toString());
  await Chat.save();

  const updatedChat = await ChatRoom.findById(chatId)
    .populate("members", "-password")
    .populate("admins", "-password")
    .populate("creator", "-password");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedChat, "memeber removed Succesfully"));
});

const LeaveGroup = AsyncHandler(async (req, res) => {
  const { chatId } = req.body;

  if (!chatId) {
    // throw new ApiError(400, "chatId is required.");
     return res.status(400)
              .json(new ApiResponse(400,null,"chatId is required."
              ))
  }

  const Chat = await ChatRoom.findById(chatId);

  if (!Chat) {
    // throw new ApiError(404, "Chat not found.");
     return res.status(404)
              .json(new ApiResponse(404,null,"Chat not Found."
              ))
  }
  if (Chat.creator.toString() === req.user._id.toString()) {
    // throw new ApiError(
    //   405,
    //   "Creator cannot leave the group. Delete it instead."
    // );
     return res.status(405)
              .json(new ApiResponse(405,null,"Creator cannot leave the group. Delete it instead."
              ))
  }

  Chat.members = Chat.members.filter(
    (id) => id.toString() !== req.user._id.toString()
  );

  Chat.admins = Chat.admins.filter(
    (id) => id.toString() !== req.user._id.toString()
  );

  await Chat.save();

  const updatedChat = await ChatRoom.findById(chatId)
    .populate("members", "-password")
    .populate("admins", "-password")
    .populate("creator", "-password");

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedChat, "You left the group successfully.")
    );
});

const DeleteGroup = AsyncHandler(async (req, res) => {
  const { chatId } = req.body;

  if (!chatId) {
    // throw new ApiError(401, "chatId is required.");
      return res.status(401)
              .json(new ApiResponse(401,null,"chatId is required."
              ))
  }

  const Chat = await ChatRoom.findById(chatId);

  if (!Chat) {
    // throw new ApiError(404, "Chat not found.");
      return res.status(404)
              .json(new ApiResponse(404,null,"Chat not Found."
              ))
  }
  if (Chat.creator.toString() !== req.user._id.toString()) {
    // throw new ApiError(405, "Only Group Creator Delete the Grroup");
      return res.status(405)
              .json(new ApiResponse(405,null,"Only Group Creator Delete the Grroup"
              ))
  }
  await ChatRoom.findByIdAndDelete(chatId);

  await Message.deleteMany({ chatRoomId: chatId });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Group deleted successfully"));
});

const UploadGroupIcon =  AsyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(401, "Please first select file!");
  }

  const imageUrl = `/Image/${req.file.filename}`;
  const {chatId} = req.body
  const chat = await ChatRoom.findByIdAndUpdate(
    chatId,
    { groupIcon: imageUrl },
    { new: true }
  );

  if (!chat) {
    // throw new ApiError(404, "User not found");
    return res.status(404)
              .json(new ApiResponse(404,null,"chat not found!!"
              ))
  }
    if (!chat.admins.includes(req.user._id.toString())) {
    // throw new ApiError(403, "Only admins can make admin.");
    return res.status(403)
              .json(new ApiResponse(403,null,"Only admins can change groupIcon!!"
              ))
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, { imageUrl, chat }, "Image uploaded successfully")
    );
});


export {
  AccessChat,
  fetchChat,
  CreateGroup,
  RenameGroup,
  RemovefromGroup,
  addtoGroup,
  makeAdmin,
  LeaveGroup,
  DeleteGroup,
  RemoveAdmin,
  UploadGroupIcon
};
