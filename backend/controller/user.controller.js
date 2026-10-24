import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import ChatRoom from "../models/Chatroom.model.js";
import { AsyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/Apierror.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import multiavatar from '@multiavatar/multiavatar/esm'
import {
  encryptSecret,
  decryptSecret,
  generateTwoFactorSecret,
  generateTwoFactorURI,
  generateQRCodeDataUrl,
  generateBackupCodes,
  verifyTwoFactorToken,
  verifyBackupCode
} from "../utils/twoFactor.utils.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";


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
    const createdUser = await User.findById(user._id).select("-password -resetPasswordToken -resetPasswordExpire");
    return res
      .status(200)
      .json(new ApiResponse(200, createdUser, "User successfully Registered."));
  } else {
    throw new ApiError(400, "Invalid Data");
  }
});

const userLogin = AsyncHandler(async (req, res) => {
  const { phonenumber, email, password } = req.body;

  if ((!email && !phonenumber) || !password) {
    return res.status(400)
      .json(new ApiResponse(400, null, "Please Fill All Fields."
      ));
  }

  let user;
  if (email && email.trim() !== "") {
    user = await User.findOne({ email });
  } else if (phonenumber && phonenumber.trim() !== "") {
    user = await User.findOne({ phonenumber });
  }

  if (!user) {
    return res.status(401)
      .json(new ApiResponse(401, null, "User not Found! Please Login."
      ));
  }

  const isCorrectPass = await user.comparePassword(password);

  if (!isCorrectPass) {
    return res.status(400)
      .json(new ApiResponse(400, null, "Incorrect password"
      ));
  }

  // Intercept if Two-Factor Authentication is enabled
  if (user.twoFactor?.enabled) {
    const twoFactorToken = jwt.sign(
      { _id: user._id, action: "2fa_verify" },
      process.env.JWT_SECRET,
      { expiresIn: "5m" }
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          requires2FA: true,
          twoFactorToken,
          email: user.email,
        },
        "Two-factor authentication required. Please enter code from your authenticator app."
      )
    );
  }

  const Authtoken = await user.generateAuthToken();

  const isProd = process.env.NODE_ENV === "production";
  res.cookie("token", Authtoken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  const loggedinUser = await User.findById(user._id).select("-password -resetPasswordToken -resetPasswordExpire");
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
  const user = await User.findById(req.user._id).select("-password -resetPasswordToken -resetPasswordExpire");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "User Fetched Succesfully"));
});

const userLogout = AsyncHandler(async (req, res) => {
  const auth_token = req.cookies?.token || req.header("authorization");
  if (auth_token) {
    try {
      const cleanToken = auth_token.startsWith("Bearer ") ? auth_token.slice(7).trim() : auth_token.trim();
      const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);
      if (decoded?._id) {
        // Invalidate current and prior tokens across all devices (Audit H1)
        await User.findByIdAndUpdate(decoded._id, { $inc: { tokenVersion: 1 }, isOnline: false });
      }
    } catch { /* token may already be expired */ }
  }

  const isProd = process.env.NODE_ENV === "production";
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
  });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "User Logged Out Successfully ..."));
});

const updatePassword = AsyncHandler(async (req, res) => {
  const { oldpassword, newpassword } = req.body;

  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isoldPassword = await user.comparePassword(oldpassword);
  if (!isoldPassword) {
    throw new ApiError(400, "Invalid Password!");
  }

  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
  if (!passwordRegex.test(newpassword)) {
    throw new ApiError(400, "Password must be at least 8 characters long and contain at least 1 number, 1 lowercase letter, and 1 uppercase letter.");
  }

  const hashedPassword = await User.hashPassword(newpassword);
  user.password = hashedPassword;
  user.tokenVersion = (user.tokenVersion || 0) + 1; // Revoke all active sessions on password change
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password Changed Successfully..."));
});

const uploadImage = AsyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(401, "Please first select file!");
  }

  const cloudinaryUrl = await uploadToCloudinary(req.file.path, 'talkyy/avatars', 'image');
  const imageUrl = cloudinaryUrl || `/Image/${req.file.filename}`;

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

const updateProfile = AsyncHandler(async (req, res) => {
  const { name, email, phonenumber, gender, bio } = req.body;
  const userId = req.user?._id;

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // 1. Update Name
  if (name !== undefined) {
    const trimmedName = String(name).trim();
    if (!trimmedName) {
      throw new ApiError(400, "Name cannot be empty");
    }
    if (trimmedName.length > 100) {
      throw new ApiError(400, "Name cannot exceed 100 characters");
    }
    user.name = trimmedName;
  }

  // 2. Update Email
  if (email !== undefined) {
    const trimmedEmail = String(email).trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmedEmail)) {
      throw new ApiError(400, "Please provide a valid email address");
    }
    if (trimmedEmail !== user.email) {
      const existingEmail = await User.findOne({ email: trimmedEmail, _id: { $ne: userId } });
      if (existingEmail) {
        throw new ApiError(409, "Email is already in use by another account");
      }
      user.email = trimmedEmail;
    }
  }

  // 3. Update Phone Number
  if (phonenumber !== undefined) {
    const trimmedPhone = String(phonenumber).trim();
    const phoneRegex = /^\+?[0-9]{7,15}$/;
    if (!phoneRegex.test(trimmedPhone)) {
      throw new ApiError(400, "Please enter a valid phone number (7 to 15 digits)");
    }
    if (trimmedPhone !== user.phonenumber) {
      const existingPhone = await User.findOne({ phonenumber: trimmedPhone, _id: { $ne: userId } });
      if (existingPhone) {
        throw new ApiError(409, "Phone number is already in use by another account");
      }
      user.phonenumber = trimmedPhone;
    }
  }

  // 4. Update Gender
  if (gender !== undefined) {
    const normalizedGender = String(gender).trim().toLowerCase();
    if (!["male", "female", "other"].includes(normalizedGender)) {
      throw new ApiError(400, "Gender must be male, female, or other");
    }
    user.gender = normalizedGender;
  }

  // 5. Update Bio
  if (bio !== undefined) {
    const trimmedBio = String(bio).trim();
    if (trimmedBio.length > 200) {
      throw new ApiError(400, "Bio cannot exceed 200 characters");
    }
    user.bio = trimmedBio;
  }

  // Username is intentionally immutable per requirements
  await user.save();

  const updatedUser = await User.findById(userId).select("-password -resetPasswordToken -resetPasswordExpire");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Profile updated successfully"));
});

const Alluser = AsyncHandler(async (req, res) => {
  // Sanitize search to escape special regex characters (Audit H5 ReDoS defense)
  const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const search = req.query.search ? escapeRegex(req.query.search.trim()) : "";

  const keywords = search
    ? {
      $or: [
        { name: { $regex: search, $options: "i" } },
        { userName: { $regex: search, $options: "i" } },
      ],
    }
    : {};

  // Limit search to 50 results (Audit H5) and select only public contact fields (Audit H2)
  const users = await User.find(keywords)
    .find({ _id: { $ne: req.user._id } })
    .select("_id name userName avtar isOnline lastSeen publicKey bio gender")
    .limit(50);

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
    // Prevent account enumeration (Audit H5): Do not reveal if account exists
    return res.status(200).json(
      new ApiResponse(200, {}, "If an account with that email exists, password reset instructions have been sent.")
    );
  }

  // Get ResetPassword Token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // Use configured CLIENT_URL instead of hardcoded localhost:5173 (Audit H4)
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const resetPasswordUrl = `${clientUrl}/password/reset/${resetToken}`;

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
      message,
      html,
    });

    res.status(200).json(new ApiResponse(200, {}, `Password reset instructions sent to ${user.email}`));
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
  user.tokenVersion = (user.tokenVersion || 0) + 1; // Revoke all prior sessions (Audit H1)

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

  if (!status || !["accepted", "rejected"].includes(status)) {
    throw new ApiError(400, "Status must be either 'accepted' or 'rejected'");
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

  if (String(userId) === String(req.user._id)) {
    return res.status(400).json(new ApiResponse(400, null, "You cannot block yourself"));
  }

  const targetUser = await User.findById(userId);
  if (!targetUser) {
    return res.status(404).json(new ApiResponse(404, null, "User to block not found"));
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

  if (String(userId) === String(req.user._id)) {
    return res.status(400).json(new ApiResponse(400, null, "You cannot unblock yourself"));
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

/**
 * GET 2FA Status
 */
const getTwoFactorStatus = AsyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("twoFactor.enabled twoFactor.backupCodes");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const enabled = Boolean(user.twoFactor?.enabled);
  const backupCodesRemaining = (user.twoFactor?.backupCodes || []).filter((b) => !b.used).length;

  return res.status(200).json(
    new ApiResponse(200, {
      enabled,
      backupCodesRemaining,
    }, "2FA status retrieved")
  );
});

/**
 * Step 1: Initiate 2FA Setup
 * Generates temporary TOTP secret & QR code. Does NOT activate 2FA until verified!
 */
const setupTwoFactor = AsyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const secret = generateTwoFactorSecret();
  const uri = generateTwoFactorURI(user.email, secret);
  const qrCodeDataUrl = await generateQRCodeDataUrl(uri);

  // Encrypt secret with AES-256-GCM before storing in database
  const encryptedSecret = encryptSecret(secret);

  user.twoFactor.tempSecret = encryptedSecret;
  user.twoFactor.tempSecretExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
  await user.save();

  return res.status(200).json(
    new ApiResponse(200, {
      qrCode: qrCodeDataUrl,
      manualKey: secret,
      issuer: "Talkyy",
      account: user.email,
    }, "2FA setup initiated. Please scan QR code in Google Authenticator or your authenticator app.")
  );
});

/**
 * Step 2: Confirm & Activate 2FA
 * User submits live 6-digit code. Validates and generates one-time emergency backup codes.
 */
const confirmTwoFactor = AsyncHandler(async (req, res) => {
  const { code } = req.body;
  if (!code || !/^\d{6}$/.test(code.toString().trim())) {
    return res.status(400).json(new ApiResponse(400, null, "Please enter a valid 6-digit verification code"));
  }

  const user = await User.findById(req.user._id).select("+twoFactor.tempSecret");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (!user.twoFactor?.tempSecret) {
    return res.status(400).json(new ApiResponse(400, null, "No 2FA setup in progress. Please start setup again."));
  }

  if (user.twoFactor.tempSecretExpires && user.twoFactor.tempSecretExpires < new Date()) {
    user.twoFactor.tempSecret = "";
    user.twoFactor.tempSecretExpires = null;
    await user.save();
    return res.status(400).json(new ApiResponse(400, null, "2FA setup session expired. Please start again."));
  }

  const plainSecret = decryptSecret(user.twoFactor.tempSecret);
  if (!plainSecret) {
    throw new ApiError(500, "Failed to decrypt 2FA setup key");
  }

  const result = verifyTwoFactorToken(code, plainSecret);
  if (!result.valid) {
    return res.status(400).json(new ApiResponse(400, null, "Invalid verification code. Please check your authenticator app time and try again."));
  }

  // Generate 8 emergency one-time backup codes
  const { rawCodes, hashedCodes } = generateBackupCodes(8);

  user.twoFactor.enabled = true;
  user.twoFactor.secret = user.twoFactor.tempSecret;
  user.twoFactor.tempSecret = "";
  user.twoFactor.tempSecretExpires = null;
  user.twoFactor.backupCodes = hashedCodes;
  user.twoFactor.lastUsedTimeStep = result.timeStep || 0;
  await user.save();

  return res.status(200).json(
    new ApiResponse(200, {
      enabled: true,
      backupCodes: rawCodes, // User must save these now!
    }, "Two-factor authentication successfully enabled! Make sure to save your backup codes safely.")
  );
});

/**
 * Disable 2FA
 * Requires confirmation with user's current password or valid 2FA code.
 */
const disableTwoFactor = AsyncHandler(async (req, res) => {
  const { password, code } = req.body;
  if (!password && !code) {
    return res.status(400).json(new ApiResponse(400, null, "Please provide your current password to disable 2FA."));
  }

  const user = await User.findById(req.user._id).select("+password +twoFactor.secret");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (!user.twoFactor?.enabled) {
    return res.status(400).json(new ApiResponse(400, null, "Two-factor authentication is already disabled."));
  }

  let authorized = false;
  if (password) {
    authorized = await user.comparePassword(password);
  } else if (code) {
    const plainSecret = decryptSecret(user.twoFactor.secret);
    if (plainSecret) {
      const check = verifyTwoFactorToken(code, plainSecret);
      authorized = check.valid;
    }
  }

  if (!authorized) {
    return res.status(401).json(new ApiResponse(401, null, "Invalid password or verification code. Could not disable 2FA."));
  }

  user.twoFactor.enabled = false;
  user.twoFactor.secret = "";
  user.twoFactor.tempSecret = "";
  user.twoFactor.tempSecretExpires = null;
  user.twoFactor.backupCodes = [];
  user.twoFactor.lastUsedTimeStep = 0;
  await user.save();

  return res.status(200).json(
    new ApiResponse(200, { enabled: false }, "Two-factor authentication disabled successfully.")
  );
});

/**
 * Regenerate Emergency Backup Codes
 * Requires current password.
 */
const regenerateBackupCodes = AsyncHandler(async (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json(new ApiResponse(400, null, "Password is required to regenerate backup codes."));
  }

  const user = await User.findById(req.user._id).select("+password");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (!user.twoFactor?.enabled) {
    return res.status(400).json(new ApiResponse(400, null, "Two-factor authentication is not enabled."));
  }

  const isCorrect = await user.comparePassword(password);
  if (!isCorrect) {
    return res.status(401).json(new ApiResponse(401, null, "Incorrect password."));
  }

  const { rawCodes, hashedCodes } = generateBackupCodes(8);
  user.twoFactor.backupCodes = hashedCodes;
  await user.save();

  return res.status(200).json(
    new ApiResponse(200, {
      backupCodes: rawCodes,
    }, "New backup codes generated. Previous backup codes are now invalidated.")
  );
});

/**
 * Step 2 of 2-Step Login:
 * Verifies short-lived twoFactorToken + TOTP code or Backup code.
 */
const verifyTwoFactorLogin = AsyncHandler(async (req, res) => {
  const { twoFactorToken, code, isBackupCode } = req.body;

  if (!twoFactorToken || !code) {
    return res.status(400).json(new ApiResponse(400, null, "2FA token and verification code are required."));
  }

  let decoded;
  try {
    decoded = jwt.verify(twoFactorToken, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json(new ApiResponse(401, null, "2FA verification session expired or invalid. Please login again."));
  }

  if (decoded.action !== "2fa_verify" || !decoded._id) {
    return res.status(401).json(new ApiResponse(401, null, "Invalid verification token."));
  }

  const user = await User.findById(decoded._id).select("+twoFactor.secret");
  if (!user || !user.twoFactor?.enabled) {
    return res.status(401).json(new ApiResponse(401, null, "User not found or 2FA not enabled."));
  }

  if (isBackupCode) {
    // Emergency Backup Code check
    const match = verifyBackupCode(code, user.twoFactor.backupCodes);
    if (!match.matched) {
      return res.status(400).json(new ApiResponse(400, null, "Invalid or already used backup code."));
    }

    // Mark this single-use code as used
    user.twoFactor.backupCodes[match.index].used = true;
    user.twoFactor.backupCodes[match.index].usedAt = new Date();
  } else {
    // Live TOTP Authenticator code check
    const cleanCode = code.toString().trim();
    if (!/^\d{6}$/.test(cleanCode)) {
      return res.status(400).json(new ApiResponse(400, null, "Authenticator code must be exactly 6 digits."));
    }

    const plainSecret = decryptSecret(user.twoFactor.secret);
    if (!plainSecret) {
      throw new ApiError(500, "Security error: Unable to verify 2FA secret.");
    }

    const check = verifyTwoFactorToken(cleanCode, plainSecret);
    if (!check.valid) {
      return res.status(400).json(new ApiResponse(400, null, "Invalid 6-digit code. Please check your authenticator app time and try again."));
    }

    // Replay attack prevention: Ensure the exact same time step is not reused
    if (check.timeStep && user.twoFactor.lastUsedTimeStep === check.timeStep) {
      return res.status(400).json(new ApiResponse(400, null, "This code was already used. Please wait 30 seconds for the next code."));
    }

    user.twoFactor.lastUsedTimeStep = check.timeStep || 0;
  }

  await user.save();

  // 2FA passed! Issue full auth credentials
  const Authtoken = await user.generateAuthToken();
  const isProd = process.env.NODE_ENV === "production";
  res.cookie("token", Authtoken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  const loggedinUser = await User.findById(user._id).select("-password -resetPasswordToken -resetPasswordExpire");

  return res.status(200).json(
    new ApiResponse(
      200,
      { loggedinUser, Authtoken },
      "2FA verification successful. Logged in!"
    )
  );
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
  resetIdentity,
  updateProfile,
  getTwoFactorStatus,
  setupTwoFactor,
  confirmTwoFactor,
  disableTwoFactor,
  regenerateBackupCodes,
  verifyTwoFactorLogin
};
