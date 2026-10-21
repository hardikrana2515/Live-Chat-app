import Message from "../models/Message.model.js";
import { ApiError } from "../utils/Apierror.js";
import { AsyncHandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import ChatRoom from "../models/Chatroom.model.js";
import User from "../models/user.model.js";

const toId = (v) => String(v?._id ?? v ?? '');

// Notify every affected member (plus optional extras like removed users) about
// a group lifecycle change so clients can refresh without a manual page reload. (Issue 2.3)
const emitGroupUpdate = (req, chat, action, { extraUserIds = [], payload = {} } = {}) => {
  const io = req.app.get('io');
  if (!io || !chat) return;
  const recipients = new Set((chat.members || []).map(toId));
  extraUserIds.forEach((id) => recipients.add(toId(id)));
  const event = {
    chatId: toId(chat._id),
    action,
    actorId: toId(req.user._id),
    chat, // populated chat document (may be partially populated for some actions)
    ...payload,
  };
  recipients.forEach((id) => {
    if (id && id !== 'null' && id !== 'undefined') io.to(id).emit('group updated', event);
  });
};

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
    .populate("members", "-password")
    .populate("admins", "-password")
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

  return res.status(200).json(new ApiResponse(200, chat || [], "Chat Booom!!!"));
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

  emitGroupUpdate(req, fullGroup, 'created');

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

  if (!chat) {
    return res.status(404)
              .json(new ApiResponse(404, null, "Chat not found!"))
  }

  const isUserAdmin = chat.admins.some((id) => (id?._id || id).toString() === req.user._id.toString()) ||
    (chat.creator && (chat.creator?._id || chat.creator).toString() === req.user._id.toString());

  if (!isUserAdmin) {
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
    emitGroupUpdate(req, AvailChat, 'renamed');
    return res
      .status(200)
      .json(new ApiResponse(200, AvailChat, "Chat renamed Successfully "));
  }
});

const RemovefromGroup = AsyncHandler(async (req, res) => {
  const { chatId, UserId } = req.body;

  if (!chatId || !UserId) {
    return res.status(400)
              .json(new ApiResponse(400, null, "chatId and userId are required."));
  }

  const Chat = await ChatRoom.findById(chatId);

  if (!Chat) {
    return res.status(404)
              .json(new ApiResponse(404, null, "Chat not found"));
  }

  if (!Chat.admins.some((id) => id.toString() === req.user._id.toString())) {
    return res.status(403)
              .json(new ApiResponse(403, null, "Only admins can remove members."));
  }

  if (req.user._id.toString() === UserId.toString()) {
    return res.status(403)
              .json(new ApiResponse(403, null, "Use leaveGroup to exit the group."));
  }

  if (Chat.creator && Chat.creator.toString() === UserId.toString()) {
    return res.status(405)
              .json(new ApiResponse(405, null, "Group Creator can't be removed."));
  }

  const alreadyMember = Chat.members.some(
    (id) => id.toString() === UserId.toString()
  );

  if (!alreadyMember) {
    return res.status(409)
              .json(new ApiResponse(409, null, "User is not in this Group"));
  }

  Chat.members = Chat.members.filter(
    (id) => id.toString() !== UserId.toString()
  );
  Chat.admins = Chat.admins.filter((id) => id.toString() !== UserId.toString());
  await Chat.save();

  const updatedChat = await ChatRoom.findById(chatId)
    .populate("members", "-password")
    .populate("admins", "-password")
    .populate("creator", "-password");

  emitGroupUpdate(req, updatedChat, 'member removed', {
    extraUserIds: [UserId],
    payload: { removedUserId: toId(UserId) },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, updatedChat, "Member removed successfully"));
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

  const isUserAdmin = Chat.admins.some((id) => (id?._id || id).toString() === req.user._id.toString()) ||
    (Chat.creator && (Chat.creator?._id || Chat.creator).toString() === req.user._id.toString());

  if (!isUserAdmin) {
     return res.status(403)
              .json(new ApiResponse(403,null,"Only Admins can Add members.!!!"
              ))
  }

  const memberList = Array.isArray(UserIdlist)
    ? UserIdlist
    : (typeof UserIdlist === "string" ? [UserIdlist] : []);

  if (memberList.length === 0) {
    return res.status(400).json(new ApiResponse(400, null, "UserIdlist must be a non-empty list of user IDs"));
  }

  const existingMemberStrs = (Chat.members || []).map((m) => (m?._id || m).toString());
  const uniqueCandidates = [...new Set(memberList.map((u) => (u?._id || u).toString()))];
  const newMembers = uniqueCandidates.filter((uid) => !existingMemberStrs.includes(uid));

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

  emitGroupUpdate(req, updatedChat, 'members added', {
    payload: { addedUserIds: newMembers.map(toId) },
  });

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

  const isUserAdmin = Chat.admins.some((id) => (id?._id || id).toString() === req.user._id.toString()) ||
    (Chat.creator && (Chat.creator?._id || Chat.creator).toString() === req.user._id.toString());

  if (!isUserAdmin) {
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

  emitGroupUpdate(req, updatedChat, 'roles changed', {
    payload: { changedUserId: toId(UserId), role: 'admin' },
  });

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

  const isUserAdmin = Chat.admins.some((id) => (id?._id || id).toString() === req.user._id.toString()) ||
    (Chat.creator && (Chat.creator?._id || Chat.creator).toString() === req.user._id.toString());

  if (!isUserAdmin) {
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

  if (Chat.creator && Chat.creator.toString() === UserId.toString()) {
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

  emitGroupUpdate(req, updatedChat, 'roles changed', {
    payload: { changedUserId: toId(UserId), role: 'member' },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, updatedChat, "memeber removed Succesfully"));
});

const LeaveGroup = AsyncHandler(async (req, res) => {
  const { chatId } = req.body;

  if (!chatId) {
    return res.status(400)
              .json(new ApiResponse(400, null, "chatId is required."));
  }

  const Chat = await ChatRoom.findById(chatId);

  if (!Chat) {
    return res.status(404)
              .json(new ApiResponse(404, null, "Chat not found."));
  }
  if (Chat.creator && Chat.creator.toString() === req.user._id.toString()) {
    return res.status(405)
              .json(new ApiResponse(405, null, "Creator cannot leave the group. Delete it instead."));
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

  emitGroupUpdate(req, updatedChat, 'member left', {
    extraUserIds: [req.user._id],
    payload: { leftUserId: toId(req.user._id) },
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedChat, "You left the group successfully.")
    );
});

const DeleteGroup = AsyncHandler(async (req, res) => {
  const { chatId } = req.body;

  if (!chatId) {
    return res.status(401)
              .json(new ApiResponse(401, null, "chatId is required."));
  }

  const Chat = await ChatRoom.findById(chatId);

  if (!Chat) {
    return res.status(404)
              .json(new ApiResponse(404, null, "Chat not found."));
  }
  const isMember = Chat.members && Chat.members.some(
    (memberId) => memberId.toString() === req.user._id.toString()
  );
  if (!isMember) {
    return res.status(403)
              .json(new ApiResponse(403, null, "You are not a member of this chat"));
  }
  const myIdStr = req.user._id.toString();
  const isCreator = Chat.creator && (Chat.creator?._id || Chat.creator).toString() === myIdStr;
  const isAdmin = Chat.admins && Chat.admins.some((id) => (id?._id || id).toString() === myIdStr);
  const creatorStillMember = Chat.creator && Chat.members.some((m) => (m?._id || m).toString() === (Chat.creator?._id || Chat.creator).toString());

  if (!isCreator) {
    if (creatorStillMember || !isAdmin) {
      return res.status(405).json(new ApiResponse(405, null, "Only group creator can delete the group"));
    }
  }

  // Notify members before the chat is removed (members list is needed for routing)
  emitGroupUpdate(req, Chat, 'deleted', {
    payload: { groupName: Chat.chatname },
  });

  await ChatRoom.findByIdAndDelete(chatId);

  await Message.deleteMany({ chatId: chatId });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Group deleted successfully"));
});

const UploadGroupIcon = AsyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(401, "Please first select file!");
  }

  const { chatId } = req.body;
  const chat = await ChatRoom.findById(chatId);

  if (!chat) {
    return res.status(404)
              .json(new ApiResponse(404, null, "Chat not found!"));
  }

  if (!chat.admins.some((id) => id.toString() === req.user._id.toString())) {
    return res.status(403)
              .json(new ApiResponse(403, null, "Only admins can change groupIcon!"));
  }

  const imageUrl = `/Image/${req.file.filename}`;
  chat.groupIcon = imageUrl;
  await chat.save();

  const updatedChat = await ChatRoom.findById(chatId)
    .populate("members", "-password")
    .populate("admins", "-password")
    .populate("creator", "-password");

  emitGroupUpdate(req, updatedChat, 'icon changed');

  return res
    .status(200)
    .json(
      new ApiResponse(200, { imageUrl, chat: updatedChat }, "Image uploaded successfully")
    );
});

// Store E2EE group key wraps for members. Only current members may update
// the map; the server stores opaque ciphertext only (Issue 3.2).
// `merge: true` adds/overwrites entries (used when adding members);
// otherwise the whole map is replaced (used to rotate keys on remove/leave).
const UpdateGroupKeys = AsyncHandler(async (req, res) => {
  const { chatId, groupKeys, merge } = req.body;

  if (!chatId) {
    return res.status(400).json(new ApiResponse(400, null, "chatId is required"));
  }

  const chat = await ChatRoom.findById(chatId);
  if (!chat) {
    return res.status(404).json(new ApiResponse(404, null, "Chat not found"));
  }

  const isMember = (chat.members || []).some((m) => m.toString() === req.user._id.toString());
  if (!isMember) {
    return res.status(403).json(new ApiResponse(403, null, "Only group members can update keys"));
  }

  if (groupKeys === null || groupKeys === undefined) {
    return res.status(400).json(new ApiResponse(400, null, "groupKeys is required"));
  }
  if (typeof groupKeys !== "object" || Array.isArray(groupKeys)) {
    return res.status(400).json(new ApiResponse(400, null, "groupKeys must be an object"));
  }

  // Validate shape: { userId: { by, byKey, key, targetKey } } — all strings, bounded size
  const clean = {};
  for (const [uid, wrap] of Object.entries(groupKeys)) {
    if (!wrap || typeof wrap !== "object") continue;
    const { by, byKey, key, targetKey } = wrap;
    if (typeof by !== "string" || typeof byKey !== "string" || typeof key !== "string") continue;
    if (byKey.length > 500 || key.length > 4000) continue;
    clean[uid] = {
      by,
      byKey,
      key,
      ...(typeof targetKey === "string" && targetKey.length < 500 ? { targetKey } : {})
    };
  }

  if (merge && chat.groupKeys && typeof chat.groupKeys === "object") {
    chat.groupKeys = { ...chat.groupKeys, ...clean };
  } else {
    chat.groupKeys = clean;
  }
  // Mixed path: whole-object assignment is tracked by Mongoose automatically
  await chat.save();

  const updatedChat = await ChatRoom.findById(chatId)
    .populate("members", "-password")
    .populate("admins", "-password")
    .populate("creator", "-password");

  emitGroupUpdate(req, updatedChat, 'keys changed');

  return res
    .status(200)
    .json(new ApiResponse(200, updatedChat, "Group keys updated"));
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
  UploadGroupIcon,
  UpdateGroupKeys
};
