import mongoose from "mongoose";
import User from "../models/user.model.js";
import ChatRoom from "../models/Chatroom.model.js";
import { AsyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/Apierror.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import multiavatar from '@multiavatar/multiavatar/esm'


const userRegister = AsyncHandler(async (req, res) => {
  const { name, gender, userName, phonenumber, email, password } =
    req.body;

  if (!name || !gender || !userName || !phonenumber || !email || !password) {
    // throw new ApiError(400, "Please Fill All Fields.");
    return res.status(400)
      .json(new ApiResponse(400, null, "Please Fill All Fields."
      ))
  }
  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    return res.status(409).json(new ApiResponse(409, null, "Email already exists. Please Login."));
  }

  const existingPhone = await User.findOne({ phonenumber });
  if (existingPhone) {
    return res.status(409).json(new ApiResponse(409, null, "Phone number already registered. Please Login."));
  }

  const existingUsername = await User.findOne({ userName });
  if (existingUsername) {
    return res.status(409).json(new ApiResponse(409, null, "Username is already taken. Choose another one."));
  }

  const svgCode = multiavatar(userName)
  const base64Avatar = Buffer.from(svgCode).toString('base64');

  const hashPassword = await User.hashPassword(password);

  const user = await User.create({
    name,
    gender,
    userName,
    phonenumber,
    email,
    password: hashPassword,
    avtar: `data:image/svg+xml;base64,${base64Avatar}`,
  });

  if (user) {
    return res
      .status(200)
      .json(new ApiResponse(200, user, "User successfully Registered."));
  } else {
    throw new ApiError(400, "Invalid Data");
  }
});

const userLogin = AsyncHandler(async (req, res) => {
  const { phonenumber, email, password } = req.body;

  if ((!email && !phonenumber) || !password) {
    // throw new ApiError(400, "Please provide email or phone and password.");
    return res.status(400)
      .json(new ApiResponse(400, null, "Please Fill All Fields."
      ))
  }

  let user;
  if (email && email.trim() !== "") {
    user = await User.findOne({ email });
  } else if (phonenumber && phonenumber.trim() !== "") {
    user = await User.findOne({ phonenumber });
  }

  if (!user) {
    // throw new ApiError(401, "User Not Found!!");
    return res.status(401)
      .json(new ApiResponse(401, null, "User not Found! Please Login."
      ))
  }

  const isCorrectPass = await user.comparePassword(password);

  if (!isCorrectPass) {
    // throw new ApiError(400, "Incorrect password");
    return res.status(400)
      .json(new ApiResponse(400, null, "Incorrect password"
      ))
  }

  const Authtoken = await user.generateAuthToken();

  res.cookie("token", Authtoken, { httpOnly: true, sameSite: "lax" });

  const loggedinUser = await User.findById(user._id).select("-password");
  if (Authtoken) {
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { loggedinUser, Authtoken },
          "User Successfully logged in"
        )
      );
  } else {
    throw new ApiError(504, "failed to generate token");
  }
});

const getUser = AsyncHandler(async (req, res) => {
  const user = req.user;
  return res
    .status(200)
    .json(new ApiResponse(200, user, "User Fetched Succesfully"));
});

const userLogout = AsyncHandler(async (req, res) => {
  const token = req.cookies?.token;
  if (!token) {
    throw new ApiError(400, "User Not Logged in !!!");
  }

  res.cookie("token", null, {
    httpOnly: true,
    expires: new Date(0),
    sameSite: "lax",
    path: "/",
  });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "User Logged Out Successfully ..."));
});

const updatePassword = AsyncHandler(async (req, res) => {
  const { oldpassword, newpassword } = req.body;

  const user = await User.findById(req.user?._id);
  const isoldPassword = await user.comparePassword(oldpassword);

  if (!isoldPassword) {
    throw new ApiError(400, "Invalid Password!");
  }
  const hashedPassword = await User.hashPassword(newpassword);
  user.password = hashedPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password Changed Successfully..."));
});

const uploadImage = AsyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(401, "Please first select file!");
  }

  const imageUrl = `/Image/${req.file.filename}`;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { avtar: imageUrl },
    { new: true }
  );
  if (!user) {
    // throw new ApiError(404, "User not found");
    return res.status(404)
      .json(new ApiResponse(404, null, "user not found!!"
      ))
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, { imageUrl, user }, "Image uploaded successfully")
    );
});

const Alluser = AsyncHandler(async (req, res) => {
  const keywords = req.query.search
    ? {
      $or: [
        { name: { $regex: req.query.search, $options: "i" } },
        { phonenumber: { $regex: req.query.search, $options: "i" } },
        { userName: { $regex: req.query.search, $options: "i" } },
      ],
    }
    : {};

  const users = await User.find(keywords)
    .find({ _id: { $ne: req.user._id } })
    .select("-password");

  // Query existing 1-on-1 chats for the logged in user
  const existingChats = await ChatRoom.find({
    isGroup: false,
    members: req.user._id,
  }).select("members");

  const connectedUserIds = new Set();
  existingChats.forEach((c) => {
    c.members.forEach((m) => {
      if (m && m.toString() !== req.user._id.toString()) {
        connectedUserIds.add(m.toString());
      }
    });
  });

  if (req.user.friends && Array.isArray(req.user.friends)) {
    req.user.friends.forEach((f) => {
      if (f) connectedUserIds.add((f._id || f).toString());
    });
  }

  const myIdStr = req.user._id.toString();

  const usersWithStatus = users.map((u) => {
    const uIdStr = u._id.toString();
    const isAlreadyFriend =
      connectedUserIds.has(uIdStr) ||
      (u.friends && u.friends.some((f) => (f._id || f).toString() === myIdStr));

    let status = "none";
    if (isAlreadyFriend) {
      status = "friend";
    } else if (
      u.friendRequests &&
      u.friendRequests.some((r) => r.sender && r.sender.toString() === myIdStr)
    ) {
      status = "pending";
    } else if (
      req.user.friendRequests &&
      req.user.friendRequests.some((r) => r.sender && r.sender.toString() === uIdStr)
    ) {
      status = "received";
    }
    return { ...u.toObject(), connectionStatus: status };
  });

  res
    .status(200)
    .json(new ApiResponse(200, usersWithStatus, "All contact fetched sucessdfully..."));
});

import sendEmail from "../utils/sendEmail.js";
import crypto from 'crypto';

const forgotPassword = AsyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    // throw new ApiError(404, "User not found");
    return res.status(404).json(new ApiResponse(404, null, "User not found"));
  }

  // Get ResetPassword Token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `http://localhost:5173/password/reset/${resetToken}`;

  const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\nIf you have not requested this email then, please ignore it.`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #111827; margin: 0; padding: 0; color: #e5e7eb; }
    .container { max-width: 600px; margin: 40px auto; background-color: #1f2937; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5); border: 1px solid #374151; }
    .header { background: linear-gradient(90deg, #c026d3, #9333ea); padding: 30px; text-align: center; }
    .header h1 { margin: 0; color: white; font-size: 28px; font-weight: bold; }
    .content { padding: 40px; text-align: center; }
    .content p { font-size: 16px; line-height: 1.6; color: #d1d5db; margin-bottom: 30px; }
    .btn { display: inline-block; padding: 14px 32px; font-size: 16px; font-weight: bold; color: white !important; background: linear-gradient(90deg, #c026d3, #9333ea); text-decoration: none; border-radius: 8px; transition: transform 0.2s; }
    .btn:hover { transform: scale(1.05); }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #374151; background-color: #111827; }
    .link { color: #c026d3; word-break: break-all; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <!-- You can add a logo img string here if you have a public URL -->
      <h1>Live Chat App</h1>
    </div>
    <div class="content">
      <p>Hello,</p>
      <p>You requested a password reset. Click the button below to set a new password:</p>
      <a href="${resetPasswordUrl}" class="btn">Reset Password</a>
      <p style="margin-top: 30px; font-size: 14px; color: #9ca3af;">
        Or copy this link: <br>
        <a href="${resetPasswordUrl}" class="link">${resetPasswordUrl}</a>
      </p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Live Chat App. All rights reserved.
    </div>
  </div>
</body>
</html>
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: `Chat App Password Recovery`,
      message, // Fallback for clients involving no-html
      html,    // HTML content
    });

    res.status(200).json(new ApiResponse(200, {}, `Email sent to ${user.email} successfully`));
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return res.status(500).json(new ApiResponse(500, null, error.message));
  }
});

const resetPassword = AsyncHandler(async (req, res, next) => {
  // creating token hash
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json(new ApiResponse(400, null, "Reset Password Token is invalid or has been expired"));
  }

  if (req.body.password !== req.body.confirmPassword) {
    return res.status(400).json(new ApiResponse(400, null, "Password does not match"));
  }

  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
  if (!passwordRegex.test(req.body.password)) {
    return res.status(400).json(new ApiResponse(400, null, "Password must be at least 8 characters long and contain at least 1 number, 1 lowercase letter, and 1 uppercase letter."));
  }

  const hashedPassword = await User.hashPassword(req.body.password);
  user.password = hashedPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  // Log user in automatically? Or just return success.
  // Returning success.
  res.status(200).json(new ApiResponse(200, {}, "Password Updated Successfully"));
});

const sendRequest = AsyncHandler(async (req, res) => {
  const { userId } = req.body; // Target user ID

  if (!userId || !mongoose.isValidObjectId(userId)) {
    throw new ApiError(400, "Valid User ID is required");
  }

  if (req.user._id.toString() === userId.toString()) {
    throw new ApiError(400, "You cannot send a request to yourself");
  }

  const targetUser = await User.findById(userId);
  if (!targetUser) {
    throw new ApiError(404, "User not found");
  }

  const myIdStr = req.user._id.toString();

  // Check if already friends
  const alreadyFriends =
    (targetUser.friends && targetUser.friends.some((f) => (f._id || f).toString() === myIdStr)) ||
    (req.user.friends && req.user.friends.some((f) => (f._id || f).toString() === targetUser._id.toString()));

  if (alreadyFriends) {
    throw new ApiError(400, "You are already friends");
  }

  // Check if request already sent
  const existingRequest =
    targetUser.friendRequests &&
    targetUser.friendRequests.find(
      (item) => item.sender && item.sender.toString() === myIdStr
    );

  if (existingRequest) {
    throw new ApiError(400, "Request already sent");
  }

  // Check if the other user already sent ME a request (Issue §3.3)
  const reverseRequest =
    req.user.friendRequests &&
    req.user.friendRequests.find(
      (item) => item.sender && item.sender.toString() === targetUser._id.toString()
    );
  if (reverseRequest) {
    throw new ApiError(400, "This user already sent you a request. Check your pending requests.");
  }

  targetUser.friendRequests.push({ sender: req.user._id, status: "pending" });
  await targetUser.save();

  const io = req.app.get("io");
  if (io) {
    io.to(targetUser._id.toString()).emit("friend request received", {
      senderId: req.user._id.toString(),
      senderName: req.user.name,
    });
  }

  res.status(200).json(new ApiResponse(200, {}, "Friend Request Sent Successfully"));
});

const getRequests = AsyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("friendRequests.sender", "name userName avtar");
  // Drop requests whose sender account no longer exists (populate yields null)
  // so clients never dereference a missing sender. (Issue E2)
  const requests = (user.friendRequests || []).filter((r) => r && r.sender);
  res.status(200).json(new ApiResponse(200, requests, "Requests fetched successfully"));
});

const acceptRequest = AsyncHandler(async (req, res) => {
  const { requestId, status } = req.body; // status: 'accepted' or 'rejected'

  if (!requestId) {
    throw new ApiError(400, "Request ID is required");
  }

  const user = await User.findById(req.user._id);
  const reqIndex = user.friendRequests.findIndex(
    (item) =>
      item &&
      ((item.sender && item.sender.toString() === requestId.toString()) ||
        (item._id && item._id.toString() === requestId.toString()))
  );

  if (reqIndex === -1) {
    throw new ApiError(404, "Request not found");
  }

  const senderId = user.friendRequests[reqIndex].sender;

  let chatDoc = null;
  if (status === 'accepted') {
    // Look up the sender first — if their account was deleted, don't create
    // a dangling friendship entry.
    const senderUser = await User.findById(senderId);

    if (!senderUser) {
      // Sender no longer exists: just drop the request
      user.friendRequests.splice(reqIndex, 1);
      await user.save();
      return res.status(200).json(new ApiResponse(200, {}, "Request rejected (sender no longer exists)"));
    }

    if (!Array.isArray(user.friends)) user.friends = [];
    if (!Array.isArray(senderUser.friends)) senderUser.friends = [];

    if (!user.friends.some((f) => (f._id || f).toString() === senderUser._id.toString())) {
      user.friends.push(senderUser._id);
    }

    // Add me to sender's friend list too
    if (!senderUser.friends.some((f) => (f._id || f).toString() === user._id.toString())) {
      senderUser.friends.push(user._id);
    }
    await senderUser.save();

    // Automatically ensure a 1-on-1 ChatRoom exists between the new friends
    let existingChat = await ChatRoom.findOne({
      isGroup: false,
      members: { $all: [user._id, senderUser._id] },
    });

    if (!existingChat) {
      const createdChat = await ChatRoom.create({
        isGroup: false,
        members: [user._id, senderUser._id],
        creator: user._id,
      });
      chatDoc = await ChatRoom.findById(createdChat._id)
        .populate("members", "-password")
        .populate("admins", "-password")
        .populate("creator", "-password");
    } else {
      chatDoc = await ChatRoom.findById(existingChat._id)
        .populate("members", "-password")
        .populate("admins", "-password")
        .populate("creator", "-password")
        .populate("lastMessage");
    }
  }

  // Remove request regardless of accepted/rejected
  user.friendRequests.splice(reqIndex, 1);
  await user.save();

  const io = req.app.get("io");
  if (io) {
    const senderIdStr = senderId ? senderId.toString() : "";
    const myIdStr = req.user._id.toString();
    if (senderIdStr) {
      io.to(senderIdStr).emit("friend request updated", {
        fromUser: myIdStr,
        status,
        chat: chatDoc
      });
      if (chatDoc) {
        io.to(senderIdStr).emit("conversation created", chatDoc);
      }
    }
    io.to(myIdStr).emit("friend request updated", {
      fromUser: senderIdStr,
      status,
      chat: chatDoc
    });
    if (chatDoc) {
      io.to(myIdStr).emit("conversation created", chatDoc);
    }
  }

  res.status(200).json(new ApiResponse(200, { chat: chatDoc }, `Request ${status}`));
});

const blockUser = AsyncHandler(async (req, res) => {
  const { userId } = req.body; // User to block

  if (!userId || !mongoose.isValidObjectId(userId)) {
    return res.status(400).json(new ApiResponse(400, null, "Valid userId is required"));
  }

  const user = await User.findById(req.user._id);
  if (!Array.isArray(user.blockedUsers)) {
    user.blockedUsers = [];
  }
  if (!user.blockedUsers.some((id) => String(id) === String(userId))) {
    user.blockedUsers.push(userId);
    await user.save();
  }

  res.status(200).json(new ApiResponse(200, user.blockedUsers, "User blocked successfully"));
});

const unblockUser = AsyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId || !mongoose.isValidObjectId(userId)) {
    return res.status(400).json(new ApiResponse(400, null, "Valid userId is required"));
  }

  const user = await User.findById(req.user._id);
  user.blockedUsers = (user.blockedUsers || []).filter(id => String(id) !== String(userId));
  await user.save();

  res.status(200).json(new ApiResponse(200, user.blockedUsers, "User unblocked successfully"));
});

const getFriends = AsyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("friends", "name userName avtar isOnline");
  res.status(200).json(new ApiResponse(200, user.friends, "Friends fetched successfully"));
});

// Identity Vault endpoints for End-to-End Encryption key recovery
const getIdentityVault = AsyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("identity publicKey");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const hasIdentity = Boolean(user.identity?.publicKey || user.publicKey);
  const hasVault = Boolean(user.identity?.vault?.ciphertext);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        hasIdentity,
        hasVault,
        identityId: user.identity?.identityId || "",
        version: user.identity?.version || 1,
        publicKey: user.identity?.publicKey || user.publicKey || "",
        publicKeyFingerprint: user.identity?.publicKeyFingerprint || "",
        vault: hasVault ? user.identity.vault : null,
      },
      "Identity vault status retrieved"
    )
  );
});

const registerIdentityVault = AsyncHandler(async (req, res) => {
  const { identityId, version, publicKey, publicKeyFingerprint, vault } = req.body;

  if (!publicKey || typeof publicKey !== "string" || publicKey.length > 500) {
    return res.status(400).json(new ApiResponse(400, null, "A valid public key is required"));
  }

  if (!vault || typeof vault !== "object") {
    return res.status(400).json(new ApiResponse(400, null, "Vault envelope is required"));
  }

  const { ciphertext, nonce, salt, aad, kdf, cipher, kdfIterations, formatVersion } = vault;

  // Strict validation of cryptographic envelope bounds
  if (!ciphertext || typeof ciphertext !== "string" || ciphertext.length > 8192) {
    return res.status(400).json(new ApiResponse(400, null, "Invalid ciphertext envelope"));
  }
  if (!nonce || typeof nonce !== "string" || nonce.length > 100) {
    return res.status(400).json(new ApiResponse(400, null, "Invalid nonce"));
  }
  if (!salt || typeof salt !== "string" || salt.length > 200) {
    return res.status(400).json(new ApiResponse(400, null, "Invalid salt"));
  }
  if (kdf && kdf !== "PBKDF2-HMAC-SHA256") {
    return res.status(400).json(new ApiResponse(400, null, "Unsupported KDF"));
  }
  if (cipher && cipher !== "AES-256-GCM") {
    return res.status(400).json(new ApiResponse(400, null, "Unsupported cipher"));
  }
  if (kdfIterations && (typeof kdfIterations !== "number" || kdfIterations < 10000 || kdfIterations > 500000)) {
    return res.status(400).json(new ApiResponse(400, null, "KDF iterations out of allowed bounds (10,000 - 500,000)"));
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Prevent silent identity replacement: if an identity with vault is already registered, reject
  if (user.identity?.publicKey && user.identity?.vault?.ciphertext) {
    return res.status(409).json(
      new ApiResponse(
        409,
        {
          existingIdentityId: user.identity.identityId,
          version: user.identity.version,
          publicKey: user.identity.publicKey,
        },
        "An identity vault is already registered for this account. Silent overwrites are forbidden. Use recovery or explicit reset."
      )
    );
  }

  user.publicKey = publicKey;
  user.identity = {
    identityId: identityId || `id_${user._id}_${Date.now()}`,
    version: typeof version === "number" ? version : 1,
    publicKey,
    publicKeyFingerprint: publicKeyFingerprint || "",
    vault: {
      formatVersion: formatVersion || 1,
      cipher: cipher || "AES-256-GCM",
      kdf: kdf || "PBKDF2-HMAC-SHA256",
      kdfIterations: kdfIterations || 100000,
      salt,
      nonce,
      ciphertext,
      aad: aad || "",
      updatedAt: new Date(),
    },
  };

  await user.save();

  const io = req.app.get("io");
  if (io) {
    io.emit("peer key updated", {
      userId: user._id.toString(),
      publicKey: user.identity.publicKey,
    });
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        identityId: user.identity.identityId,
        version: user.identity.version,
        publicKey: user.identity.publicKey,
      },
      "Identity vault successfully registered"
    )
  );
});

const updateIdentityVault = AsyncHandler(async (req, res) => {
  const { expectedVersion, vault } = req.body;

  if (!vault || typeof vault !== "object" || !vault.ciphertext || !vault.nonce || !vault.salt) {
    return res.status(400).json(new ApiResponse(400, null, "Valid vault envelope is required"));
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (typeof expectedVersion === "number" && user.identity?.version !== expectedVersion) {
    return res.status(409).json(
      new ApiResponse(
        409,
        { currentVersion: user.identity?.version },
        "Vault version conflict. The vault was updated concurrently by another session."
      )
    );
  }

  user.identity.vault = {
    formatVersion: vault.formatVersion || 1,
    cipher: vault.cipher || "AES-256-GCM",
    kdf: vault.kdf || "PBKDF2-HMAC-SHA256",
    kdfIterations: vault.kdfIterations || 100000,
    salt: vault.salt,
    nonce: vault.nonce,
    ciphertext: vault.ciphertext,
    aad: vault.aad || "",
    updatedAt: new Date(),
  };
  user.identity.version = (user.identity?.version || 1) + 1;

  await user.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        identityId: user.identity.identityId,
        version: user.identity.version,
      },
      "Vault envelope updated successfully"
    )
  );
});

const resetIdentity = AsyncHandler(async (req, res) => {
  const { password, confirmReset } = req.body;

  if (!confirmReset) {
    return res.status(400).json(
      new ApiResponse(
        400,
        null,
        "Explicit confirmation is required. Historical messages encrypted with your old key will become permanently unreadable."
      )
    );
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isCorrect = await user.comparePassword(password);
  if (!isCorrect) {
    return res.status(400).json(new ApiResponse(400, null, "Invalid account password. Identity reset aborted."));
  }

  user.identity = {
    identityId: "",
    version: (user.identity?.version || 1) + 1,
    publicKey: "",
    publicKeyFingerprint: "",
    vault: {
      formatVersion: 1,
      cipher: "AES-256-GCM",
      kdf: "PBKDF2-HMAC-SHA256",
      kdfIterations: 100000,
      salt: "",
      nonce: "",
      ciphertext: "",
      aad: "",
      updatedAt: null,
    },
  };
  user.publicKey = "";
  await user.save();

  const ioReset = req.app.get("io");
  if (ioReset) {
    ioReset.emit("peer key updated", {
      userId: user._id.toString(),
      publicKey: "",
    });
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      { version: user.identity.version },
      "Identity reset successfully. You may now create a new encryption keypair and vault."
    )
  );
});

// Guarded setPublicKey: prevents silent replacement of existing registered public key
const setPublicKey = AsyncHandler(async (req, res) => {
  const { publicKey, publicKeyFingerprint } = req.body;

  if (!publicKey || typeof publicKey !== "string" || publicKey.length > 500) {
    return res.status(400).json(new ApiResponse(400, null, "A valid public key is required"));
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const existingKey = user.identity?.publicKey || user.publicKey;
  if (existingKey && existingKey !== publicKey) {
    return res.status(409).json(
      new ApiResponse(
        409,
        { existingPublicKey: existingKey },
        "Cannot overwrite existing registered public key. An identity is already bound to this account. Use recovery or explicit reset."
      )
    );
  }

  user.publicKey = publicKey;
  if (!user.identity) user.identity = {};
  user.identity.publicKey = publicKey;
  if (publicKeyFingerprint) user.identity.publicKeyFingerprint = publicKeyFingerprint;
  await user.save();

  const ioPub = req.app.get("io");
  if (ioPub) {
    ioPub.emit("peer key updated", {
      userId: user._id.toString(),
      publicKey: user.publicKey,
    });
  }

  res.status(200).json(new ApiResponse(200, { publicKey: user.publicKey }, "Public key saved"));
});

export {
  userRegister,
  userLogin,
  updatePassword,
  forgotPassword,
  resetPassword,
  getUser,
  userLogout,
  uploadImage,
  Alluser,
  sendRequest,
  getRequests,
  acceptRequest,
  getFriends,
  blockUser,
  unblockUser,
  setPublicKey,
  getIdentityVault,
  registerIdentityVault,
  updateIdentityVault,
  resetIdentity
};
