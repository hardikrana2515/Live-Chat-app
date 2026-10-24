import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./database/db.js";
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';
import http from 'http';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables before configuring CORS and other modules (Audit M6)
const localEnv = path.join(__dirname, '.env');
const envPath = fs.existsSync(localEnv)
  ? localEnv
  : path.join(path.resolve(), '.env');
dotenv.config({ path: envPath });

const app = express();
const server = http.createServer(app);

// Operational Hardening: HTTP Security Headers (Audit M6)
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-XSS-Protection", "0");
  next();
});

const allowedOrigins = process.env.CLIENT_URL
  ? [process.env.CLIENT_URL, "http://localhost:5173", "http://127.0.0.1:5173"]
  : ["http://localhost:5173", "http://127.0.0.1:5173"];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true,
};

const io = new Server(server, {
  cors: corsOptions,
});

app.use(cors(corsOptions));
app.use(express.json({ limit: '250mb' }));
app.use(express.urlencoded({ extended: true, limit: '250mb' }));
app.use(cookieParser());

// ============================================================================
// Secure Public Image Serving (Avatars & Group Icons) - Audit C2 Stored XSS Defense
// ============================================================================
const safeImageExts = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
app.use('/Image', (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Security-Policy', "default-src 'none'; sandbox");
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

  if (req.path === '/' || req.path === '') {
    return res.status(403).send('Directory listing forbidden');
  }

  const ext = path.extname(req.path).toLowerCase();
  if (!safeImageExts.has(ext)) {
    return res.status(403).send('Forbidden: Non-image file types cannot be served from /Image');
  }
  next();
}, express.static(path.join(__dirname, 'public', 'Image'), {
  dotfiles: 'ignore',
  index: false,
  fallthrough: false
}));

// ============================================================================
// Authenticated & Authorized Media Serving (Private Chat Attachments) - Audit C2
// Enforces that only verified chatroom members can download/view attachments.
// ============================================================================
app.get('/media/:filename', async (req, res) => {
  const rawFilename = req.params.filename;
  const filename = path.basename(rawFilename);
  if (!filename || filename.includes('..') || filename.includes('\0')) {
    return res.status(400).json({ success: false, message: 'Invalid filename' });
  }

  let filePath = path.join(__dirname, 'public', 'media', filename);
  if (!fs.existsSync(filePath)) {
    // Fallback check for legacy images stored in public/Image
    const legacyPath = path.join(__dirname, 'public', 'Image', filename);
    if (fs.existsSync(legacyPath)) {
      filePath = legacyPath;
    } else {
      return res.status(404).json({ success: false, message: 'Media not found' });
    }
  }

  // 1. Authenticate user from cookie, Authorization header, or query token
  let token = req.cookies?.token;
  if (!token && req.headers?.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith('Bearer ')) token = authHeader.slice(7).trim();
    else token = authHeader.trim();
  }
  if (!token && req.query?.token) {
    token = String(req.query.token).trim();
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required to access attachment' });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }

  const user = await User.findById(decoded.id).select('tokenVersion');
  if (!user || (user.tokenVersion || 0) !== (decoded.tokenVersion || 0)) {
    return res.status(401).json({ success: false, message: 'Session has been revoked' });
  }

  // 2. Authorize chatroom membership
  const escapedName = filename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const message = await Message.findOne({ media: { $regex: escapedName } }).select('chatId Sender isDeleted');
  if (message) {
    if (message.isDeleted) {
      return res.status(410).json({ success: false, message: 'Message attachment has been deleted' });
    }

    const userIdStr = user._id.toString();
    const isSender = message.Sender && message.Sender.toString() === userIdStr;

    if (!isSender) {
      const isMember = await ChatRoom.exists({ _id: message.chatId, members: user._id });
      if (!isMember) {
        return res.status(403).json({ success: false, message: 'Forbidden: You are not a member of this chat' });
      }
    }
  }

  // 3. Send file with strict anti-XSS and anti-sniff headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Security-Policy', "default-src 'none'; sandbox");
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  res.setHeader('Content-Disposition', `inline; filename="${safeFilename}"`);

  return res.sendFile(filePath);
});

app.get("/", (req, res) => {
  res.send("Hello Chatt!");
});

import userRouter from "./routes/user.routes.js";
import messageRoutes from "./routes/message.routes.js";
import ChatRoutes from "./routes/chat.routes.js";

app.use("/api/ChatApp/user", userRouter);
app.use("/api/ChatApp/message", messageRoutes);
app.use("/api/ChatApp/Chat", ChatRoutes);

import { errorHandler } from "./middleware/error.middleware.js";
app.use(errorHandler);

const port = process.env.PORT || 4000;
connectDB();

import User from "./models/user.model.js";
import ChatRoom from "./models/Chatroom.model.js";
import Message from "./models/Message.model.js";

// Expose io to express controllers
app.set('io', io);

// Multi-device/multi-tab tracking: userId -> Set of socket IDs (Audit M5)
const onlineUsers = new Map();
const activeGroupCalls = new Map();

const toId = (v) => String(v?._id ?? v ?? '');

// Helper to safely parse cookie string from handshake headers
const parseCookieHeader = (cookieStr) => {
  if (!cookieStr || typeof cookieStr !== "string") return {};
  const cookies = {};
  cookieStr.split(";").forEach((pair) => {
    const idx = pair.indexOf("=");
    if (idx > 0) {
      const key = pair.substring(0, idx).trim();
      const val = pair.substring(idx + 1).trim();
      try {
        cookies[key] = decodeURIComponent(val);
      } catch {
        cookies[key] = val;
      }
    }
  });
  return cookies;
};

// Safely resolve chat members strictly from database - NEVER trust client-supplied members arrays (Audit C1)
const resolveMemberIds = async (chatOrId) => {
  const chatId = toId(chatOrId?._id ?? chatOrId);
  if (!chatId || !mongoose.isValidObjectId(chatId)) return [];
  try {
    const found = await ChatRoom.findById(chatId).select('members').lean();
    return found?.members?.map(toId) || [];
  } catch {
    return [];
  }
};

// ============================================================================
// Socket.IO Handshake Authentication Middleware (Audit C1 Resolution)
// Enforces that every WebSocket connection is backed by a valid, verified JWT.
// Attaches authenticated user and userId to the socket instance.
// ============================================================================
io.use(async (socket, next) => {
  try {
    let token = socket.handshake.auth?.token;

    // Fallback: Check handshake authorization header
    if (!token && socket.handshake.headers?.authorization) {
      token = socket.handshake.headers.authorization;
    }

    // Fallback: Check handshake cookies
    if (!token && socket.handshake.headers?.cookie) {
      const cookies = parseCookieHeader(socket.handshake.headers.cookie);
      token = cookies.token;
    }

    if (!token) {
      console.warn(`[Socket Auth] Rejected connection (socket ${socket.id}): No authentication token provided.`);
      return next(new Error("Authentication error: Unauthorized (no token)"));
    }

    const cleanToken = token.startsWith("Bearer ") ? token.slice(7).trim() : token.trim();
    if (!cleanToken || cleanToken === "null" || cleanToken === "undefined") {
      console.warn(`[Socket Auth] Rejected connection (socket ${socket.id}): Invalid or empty token.`);
      return next(new Error("Authentication error: Unauthorized (invalid token string)"));
    }

    const jwtSecret = process.env.JWT_SECRET || "jwt_secret_key";
    let decoded;
    try {
      decoded = jwt.verify(cleanToken, jwtSecret);
    } catch (jwtErr) {
      console.warn(`[Socket Auth] JWT verification failed (socket ${socket.id}):`, jwtErr.message);
      return next(new Error(`Authentication error: ${jwtErr.message}`));
    }

    if (!decoded?._id) {
      return next(new Error("Authentication error: Malformed token payload"));
    }

    const user = await User.findById(decoded._id).select("_id name email userName avtar isOnline blockedUsers tokenVersion");
    if (!user) {
      console.warn(`[Socket Auth] Rejected connection (socket ${socket.id}): User ${decoded._id} not found.`);
      return next(new Error("Authentication error: User not found"));
    }

    if (
      decoded.tokenVersion !== undefined &&
      user.tokenVersion !== undefined &&
      decoded.tokenVersion !== user.tokenVersion
    ) {
      console.warn(`[Socket Auth] Rejected: Session revoked (tokenVersion mismatch) for user ${decoded._id}`);
      return next(new Error("Authentication error: Session revoked"));
    }

    // Bind authenticated identity securely to this socket
    socket.user = user;
    socket.userId = String(user._id);
    next();
  } catch (err) {
    console.error(`[Socket Auth] Unexpected handshake error (socket ${socket.id}):`, err);
    return next(new Error("Authentication error: Server error during verification"));
  }
});

// ============================================================================
// Socket.IO Real-Time Event Handlers with Per-Event Authorization (Audit C1)
// ============================================================================
io.on("connection", (socket) => {
  const uid = socket.userId;
  console.log(`[Socket] Verified user connected: ${socket.id} (User: ${socket.user.name || uid}, ID: ${uid})`);

  // Bind to personal room strictly using authenticated uid
  socket.join(uid);

  // Per-socket event rate limiter & abuse control 
  const eventTimestamps = [];
  const MAX_EVENTS_PER_SEC = 40;
  socket.use(([event], next) => {
    const now = Date.now();
    while (eventTimestamps.length > 0 && eventTimestamps[0] <= now - 1000) {
      eventTimestamps.shift();
    }
    if (eventTimestamps.length >= MAX_EVENTS_PER_SEC) {
      console.warn(`[Socket RateLimit] Exceeded ${MAX_EVENTS_PER_SEC} events/sec by user ${uid} (${socket.id}) on: ${event}`);
      return next(new Error("Socket rate limit exceeded. Please slow down."));
    }
    eventTimestamps.push(now);
    next();
  });

  // Track multi-socket connections per user
  if (!onlineUsers.has(uid)) {
    onlineUsers.set(uid, new Set());
  }
  onlineUsers.get(uid).add(socket.id);

  // Broadcast online user IDs
  io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));
  User.findByIdAndUpdate(uid, { isOnline: true }).catch(() => { });

  // setup event: Enforces authenticated uid, rejects any client-supplied spoofed identity
  socket.on("setup", async () => {
    socket.join(uid);
    if (!onlineUsers.has(uid)) {
      onlineUsers.set(uid, new Set());
    }
    onlineUsers.get(uid).add(socket.id);
    io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));
    await User.findByIdAndUpdate(uid, { isOnline: true }).catch(() => { });
    console.log(`[Socket] Authenticated setup confirmed for: ${socket.user.name || uid} (${uid})`);
  });

  // join chat: Authorization check — only chat members can join chat rooms
  socket.on("join chat", async (roomId) => {
    const rid = toId(roomId);
    if (!rid || !mongoose.isValidObjectId(rid)) return;
    try {
      const isMember = await ChatRoom.exists({ _id: rid, members: uid });
      if (!isMember) {
        console.warn(`[Socket Auth] Unauthorized join chat rejected: user ${uid} is not a member of ${rid}`);
        return;
      }
      socket.join(rid);
      console.log(`[Socket] User ${uid} joined verified chat room: ${rid}`);
    } catch (err) {
      console.error("[Socket] join chat error:", err);
    }
  });

  // typing: Authorization check — only chat members can broadcast typing
  socket.on("typing", async (room) => {
    const rid = toId(room);
    if (!rid || !mongoose.isValidObjectId(rid)) return;
    try {
      const chatDoc = await ChatRoom.findById(rid).select('members isGroup').lean();
      if (!chatDoc || !chatDoc.members.some(m => String(m) === uid)) return;

      if (!chatDoc.isGroup && chatDoc.members?.length === 2) {
        const typer = await User.findById(uid).select('blockedUsers').lean();
        const otherId = chatDoc.members.find(m => String(m) !== uid);
        if (otherId && typer?.blockedUsers?.some(b => String(b) === String(otherId))) return;
      }
      socket.to(rid).emit("typing", room);
    } catch { /* ignore lookup failure */ }
  });

  // stop typing: Authorization check
  socket.on("stop typing", async (room) => {
    const rid = toId(room);
    if (!rid || !mongoose.isValidObjectId(rid)) return;
    try {
      const isMember = await ChatRoom.exists({ _id: rid, members: uid });
      if (isMember) {
        socket.to(rid).emit("stop typing", room);
      }
    } catch { /* ignore */ }
  });

  // new reaction: Authorization check — only chat members can broadcast reactions
  socket.on("new reaction", async (updatedMsg) => {
    const chatId = toId(updatedMsg?.chatId || updatedMsg?.chat);
    if (!chatId || !mongoose.isValidObjectId(chatId)) return;
    const memberIds = await resolveMemberIds(chatId);
    if (!memberIds.includes(uid)) {
      console.warn(`[Socket Auth] Unauthorized reaction rejected from user ${uid} in chat ${chatId}`);
      return;
    }
    memberIds.forEach((id) => io.to(id).emit("reaction updated", updatedMsg));
  });

  // poll update: Authorization check — only chat members can broadcast poll updates
  socket.on("poll update", async (updatedMsg) => {
    const chatId = toId(updatedMsg?.chatId || updatedMsg?.chat);
    if (!chatId || !mongoose.isValidObjectId(chatId)) return;
    const memberIds = await resolveMemberIds(chatId);
    if (!memberIds.includes(uid)) {
      console.warn(`[Socket Auth] Unauthorized poll update rejected from user ${uid} in chat ${chatId}`);
      return;
    }
    memberIds.forEach((id) => io.to(id).emit("poll update", updatedMsg));
  });

  // delete message: Authorization check — only chat members can broadcast message deletion
  socket.on("delete message", async (data) => {
    const chatId = toId(data?.chatId);
    if (!chatId || !data?.forEveryone || !mongoose.isValidObjectId(chatId)) return;
    const memberIds = await resolveMemberIds(chatId);
    if (!memberIds.includes(uid)) {
      console.warn(`[Socket Auth] Unauthorized message delete broadcast from user ${uid} in chat ${chatId}`);
      return;
    }
    memberIds.forEach((id) => io.to(id).emit("message deleted", data));
  });

  // edit message: Authorization check — sender identity must match authenticated user
  socket.on("edit message", async (updatedMsg) => {
    const chatId = toId(updatedMsg?.chatId || updatedMsg?.chat);
    if (!chatId || !mongoose.isValidObjectId(chatId)) return;
    const senderId = toId(updatedMsg?.Sender?._id || updatedMsg?.Sender);
    if (senderId && senderId !== uid) {
      console.warn(`[Socket Auth] Edit message spoofing rejected: claimed ${senderId}, authenticated ${uid}`);
      return;
    }
    const memberIds = await resolveMemberIds(chatId);
    if (!memberIds.includes(uid)) return;
    memberIds.forEach((id) => io.to(id).emit("message edited", updatedMsg));
  });

  // messages read: Authorization check
  socket.on("messages read", async (data) => {
    const chatId = toId(data?.chatId);
    if (!chatId || !mongoose.isValidObjectId(chatId)) return;
    const memberIds = await resolveMemberIds(chatId);
    if (!memberIds.includes(uid)) return;
    memberIds.forEach((id) => io.to(id).emit("messages read", { ...data, readerId: uid }));
  });

  // request group key: Authorization check
  socket.on("request group key", async (data) => {
    const chatId = toId(data?.chatId);
    if (!chatId || !mongoose.isValidObjectId(chatId)) return;
    const memberIds = await resolveMemberIds(chatId);
    if (!memberIds.includes(uid)) return;
    memberIds.forEach((id) => {
      if (id && id !== uid) {
        io.to(id).emit("group key requested", { chatId, userId: uid, publicKey: data?.publicKey });
      }
    });
  });

  // new message: Strict sender binding and chat membership enforcement
  socket.on("new message", async (msg) => {
    if (!msg) return;
    const chatId = toId(msg?.chat || msg?.chatId);
    if (!chatId || !mongoose.isValidObjectId(chatId)) return;

    // Sender MUST match authenticated user
    const senderId = toId(msg.Sender?._id || msg.Sender);
    if (senderId && senderId !== uid) {
      console.warn(`[Socket Auth] Message sender spoofing rejected: claimed ${senderId}, authenticated ${uid}`);
      return;
    }

    const memberIds = await resolveMemberIds(chatId);
    if (!memberIds.includes(uid)) {
      console.warn(`[Socket Auth] Unauthorized message rejected: user ${uid} not a member of chat ${chatId}`);
      return;
    }

    memberIds.forEach((memberId) => {
      if (memberId && memberId !== uid) {
        io.to(memberId).emit("message received", msg);
      }
    });
  });

  // callUser: Authorized 1-to-1 WebRTC call initiation
  socket.on("callUser", async (data) => {
    const targetId = toId(data?.userToCall);
    if (!targetId || targetId === uid || !mongoose.isValidObjectId(targetId)) return;

    try {
      const caller = await User.findById(uid).select('name avtar blockedUsers').lean();
      const target = await User.findById(targetId).select('blockedUsers').lean();
      if (caller?.blockedUsers?.some(b => String(b) === targetId)) return;
      if (target?.blockedUsers?.some(b => String(b) === uid)) return;

      console.log(`[Socket] Authorized callUser from ${uid} (${caller?.name}) to ${targetId}`);
      io.to(targetId).emit("callUser", {
        signal: data?.signalData,
        from: uid, // Strictly bind caller to authenticated socket user
        name: caller?.name || data?.name,
        callType: data?.callType
      });
    } catch (err) {
      console.error("[Socket] callUser error:", err);
    }
  });

  // answerCall: Forward answer signal
  socket.on("answerCall", (data) => {
    const targetId = toId(data?.to);
    if (!targetId) return;
    console.log(`[Socket] answerCall from ${uid} to ${targetId}`);
    io.to(targetId).emit("callAccepted", data?.signal);
  });

  // endCall: Terminate 1-to-1 call
  socket.on("endCall", ({ to }) => {
    const targetId = toId(to);
    if (targetId) {
      console.log(`[Socket] endCall from ${uid} to ${targetId}`);
      io.to(targetId).emit("callEnded");
    }
  });

  // cameraToggle: Forward camera state
  socket.on("cameraToggle", (data) => {
    const targetId = toId(data?.to);
    if (targetId) {
      io.to(targetId).emit("cameraToggle", { enabled: data?.enabled, from: uid });
    }
  });

  // --- Group Call Handling & Signaling ---
  const endGroupCallEntirely = (cId, reason = "ended") => {
    if (!cId || !activeGroupCalls.has(cId)) return;
    const roomData = activeGroupCalls.get(cId);
    const duration = Math.round((Date.now() - roomData.startedAt) / 1000);

    console.log(`[GroupCall] Ending group call for ${cId}. Reason: ${reason}, duration: ${duration}s`);

    const endPayload = {
      chatId: cId,
      duration,
      callType: roomData.callType,
      reason,
      initiatorId: roomData.initiatorId
    };

    io.to(`call_${cId}`).emit("groupCallEnded", endPayload);
    io.to(cId).emit("groupCallEnded", endPayload);

    activeGroupCalls.delete(cId);

    io.to(cId).emit("groupCallActiveStatus", {
      chatId: cId,
      isActive: false,
      participantCount: 0
    });
  };

  // startGroupCall: Authorization check — only chat members can initiate group calls
  socket.on("startGroupCall", async ({ chatId, chatName, callType }) => {
    const cId = toId(chatId);
    if (!cId || !mongoose.isValidObjectId(cId)) return;

    const memberIds = await resolveMemberIds(cId);
    if (!memberIds.includes(uid)) {
      console.warn(`[Socket Auth] Non-member ${uid} attempted startGroupCall in chat ${cId}`);
      return;
    }

    const initId = uid;
    if (!activeGroupCalls.has(cId)) {
      activeGroupCalls.set(cId, {
        chatId: cId,
        chatName: chatName || "Group",
        callType: callType || 'video',
        startedAt: Date.now(),
        initiatorId: initId,
        initiatorSocketId: socket.id,
        hadMultipleParticipants: false,
        participants: new Map()
      });
    } else {
      const existing = activeGroupCalls.get(cId);
      if (!existing.initiatorId) {
        existing.initiatorId = initId;
        existing.initiatorSocketId = socket.id;
      }
    }

    const senderUser = await User.findById(uid).select('name email avtar').lean();

    memberIds.forEach((mId) => {
      if (mId && mId !== initId) {
        io.to(mId).emit("incomingGroupCall", {
          chatId: cId,
          chatName,
          initiator: senderUser || { _id: initId },
          callType: callType || 'video'
        });
      }
    });

    io.to(cId).emit("groupCallActiveStatus", {
      chatId: cId,
      isActive: true,
      callType: callType || 'video',
      participantCount: activeGroupCalls.get(cId).participants.size
    });
  });

  // checkGroupCallStatus: Authorized status check
  socket.on("checkGroupCallStatus", async (chatId) => {
    const cId = toId(chatId);
    if (!cId || !mongoose.isValidObjectId(cId)) return;
    const memberIds = await resolveMemberIds(cId);
    if (!memberIds.includes(uid)) return;

    const roomData = activeGroupCalls.get(cId);
    socket.emit("groupCallActiveStatus", {
      chatId: cId,
      isActive: Boolean(roomData && roomData.participants.size > 0),
      callType: roomData?.callType || 'video',
      participantCount: roomData?.participants?.size || 0
    });
  });

  // joinGroupCall: Authorization check — only chat members can join group call rooms
  socket.on("joinGroupCall", async ({ chatId, user, callType }) => {
    const cId = toId(chatId);
    if (!cId || !mongoose.isValidObjectId(cId)) return;

    const memberIds = await resolveMemberIds(cId);
    if (!memberIds.includes(uid)) {
      console.warn(`[Socket Auth] Non-member ${uid} attempted to join group call in chat ${cId}`);
      return;
    }

    socket.join(`call_${cId}`);

    const userInfo = await User.findById(uid).select('name email avtar isOnline').lean();
    const verifiedUser = { ...(userInfo || {}), ...(user || {}), _id: uid, socketId: socket.id };

    if (!activeGroupCalls.has(cId)) {
      activeGroupCalls.set(cId, {
        chatId: cId,
        callType: callType || 'video',
        startedAt: Date.now(),
        initiatorId: uid,
        initiatorSocketId: socket.id,
        hadMultipleParticipants: false,
        participants: new Map()
      });
    }

    const roomData = activeGroupCalls.get(cId);
    const existingParticipants = [];
    roomData.participants.forEach((pUser, pSocketId) => {
      existingParticipants.push({ socketId: pSocketId, user: pUser });
    });

    roomData.participants.set(socket.id, verifiedUser);

    if (roomData.participants.size >= 2) {
      roomData.hadMultipleParticipants = true;
    }

    socket.emit("allGroupCallUsers", existingParticipants);

    socket.to(`call_${cId}`).emit("userJoinedGroupCall", {
      socketId: socket.id,
      user: verifiedUser
    });

    io.to(cId).emit("groupCallActiveStatus", {
      chatId: cId,
      isActive: true,
      callType: roomData.callType,
      participantCount: roomData.participants.size
    });
  });

  // groupCallSignal: Forward peer signaling
  socket.on("groupCallSignal", ({ userToSignal, signal, user }) => {
    if (userToSignal) {
      io.to(userToSignal).emit("userGroupCallSignal", {
        signal,
        callerId: socket.id,
        user: { ...(user || {}), _id: uid, socketId: socket.id }
      });
    }
  });

  // groupCameraToggle: Only participants can toggle camera
  socket.on("groupCameraToggle", ({ chatId, enabled }) => {
    const cId = toId(chatId);
    if (cId) {
      socket.to(`call_${cId}`).emit("groupCameraToggle", { socketId: socket.id, enabled });
    }
  });

  // groupMuteToggle: Only participants can toggle mute
  socket.on("groupMuteToggle", ({ chatId, isMuted }) => {
    const cId = toId(chatId);
    if (cId) {
      socket.to(`call_${cId}`).emit("groupMuteToggle", { socketId: socket.id, isMuted });
    }
  });

  const leaveGroupCallInternal = (socketId, chatId) => {
    const cId = toId(chatId);
    if (!cId || !activeGroupCalls.has(cId)) return;

    const roomData = activeGroupCalls.get(cId);
    const userLeaving = roomData.participants.get(socketId);
    const leavingUserId = toId(userLeaving?._id);

    const isInitiator =
      (roomData.initiatorSocketId && socketId === roomData.initiatorSocketId) ||
      (roomData.initiatorId && leavingUserId && leavingUserId === roomData.initiatorId);

    roomData.participants.delete(socketId);
    socket.leave(`call_${cId}`);

    io.to(`call_${cId}`).emit("userLeftGroupCall", { socketId });

    if (isInitiator) {
      console.log(`[GroupCall] Initiator left group call in ${cId}. Ending call for all.`);
      endGroupCallEntirely(cId, "initiator_left");
      return;
    }

    if (roomData.participants.size === 0) {
      endGroupCallEntirely(cId, "all_left");
      return;
    }

    if (roomData.hadMultipleParticipants && roomData.participants.size <= 1) {
      console.log(`[GroupCall] Only 1 participant remaining in ${cId} after others left. Ending call.`);
      endGroupCallEntirely(cId, "single_participant_left");
      return;
    }

    io.to(cId).emit("groupCallActiveStatus", {
      chatId: cId,
      isActive: true,
      callType: roomData.callType,
      participantCount: roomData.participants.size
    });
  };

  socket.on("leaveGroupCall", ({ chatId }) => {
    leaveGroupCallInternal(socket.id, chatId);
  });

  socket.on("endGroupCall", ({ chatId }) => {
    const cId = toId(chatId);
    if (!cId || !activeGroupCalls.has(cId)) return;
    const roomData = activeGroupCalls.get(cId);
    const isInitiator =
      (roomData.initiatorSocketId && socket.id === roomData.initiatorSocketId) ||
      (roomData.initiatorId && uid === roomData.initiatorId);

    if (isInitiator || roomData.participants.size <= 1) {
      endGroupCallEntirely(cId, "initiator_ended");
    } else {
      leaveGroupCallInternal(socket.id, cId);
    }
  });

  // Friend Request live signaling with verified sender and responder IDs
  socket.on("friend request sent", (data) => {
    const targetId = toId(data?.targetUserId);
    if (targetId && targetId !== uid && mongoose.isValidObjectId(targetId)) {
      io.to(targetId).emit("friend request received", {
        ...data,
        senderId: uid
      });
    }
  });

  socket.on("friend request responded", (data) => {
    const targetId = toId(data?.targetUserId);
    if (targetId && targetId !== uid && mongoose.isValidObjectId(targetId)) {
      io.to(targetId).emit("friend request updated", {
        ...data,
        responderId: uid
      });
    }
  });

  // Disconnection handler
  socket.on("disconnect", async () => {
    console.log(`[Socket] User disconnected: ${socket.id} (User ID: ${uid})`);

    // Clean up active group calls
    for (const [cId, roomData] of activeGroupCalls.entries()) {
      if (roomData.participants.has(socket.id)) {
        leaveGroupCallInternal(socket.id, cId);
      }
    }

    // Clean up online socket tracking
    if (onlineUsers.has(uid)) {
      const userSockets = onlineUsers.get(uid);
      userSockets.delete(socket.id);
      if (userSockets.size === 0) {
        onlineUsers.delete(uid);
        await User.findByIdAndUpdate(uid, { isOnline: false, lastSeen: new Date() }).catch(() => { });
      }
    }

    io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));
  });
});

server.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
