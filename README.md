<div align="center">

# 💬 Talkyy — A Calmer Space for Real Conversations

**Modern, privacy-first real-time messaging, group collaboration, and peer-to-peer WebRTC voice & video calling.**

Built with the **MERN Stack**, **Socket.IO**, **WebRTC**, **Cloudinary**, and **Tailwind CSS**.

[![Frontend Deployment](https://img.shields.io/badge/Vercel-Deployed-black?style=for-the-badge&logo=vercel)](https://live-chat-app-alpha.vercel.app/)
[![Live App](https://img.shields.io/badge/Live%20App-live--chat--app--alpha.vercel.app-0070F3?style=for-the-badge&logo=vercel)](https://live-chat-app-alpha.vercel.app/)
[![Backend Deployment](https://img.shields.io/badge/Render-Online-46E3B7?style=for-the-badge&logo=render)](https://talkyy-backend.onrender.com)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com)
[![Cloudinary](https://img.shields.io/badge/Storage-Cloudinary-3448C5?style=for-the-badge&logo=cloudinary)](https://cloudinary.com)
[![WebRTC](https://img.shields.io/badge/Calling-WebRTC%20P2P-333333?style=for-the-badge&logo=webrtc)](https://webrtc.org)

<p align="center">
  <br />
  <a href="https://live-chat-app-alpha.vercel.app/">
    <img src="https://img.shields.io/badge/🚀%20OPEN%20LIVE%20APP-https%3A%2F%2Flive--chat--app--alpha.vercel.app%2F-blue?style=for-the-badge&logo=vercel&logoColor=white" alt="Open Live App" height="40" />
  </a>
  <br /><br />
  <a href="#-key-features">Key Features</a> •
  <a href="#-visual-tour">Visual Tour</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-local-development">Local Setup</a> •
  <a href="#-deployment">Deployment Guide</a>
</p>

</div>

---

<p align="center">
  <img src="./Readme%20images/Screenshot%202026-10-23%20200243.png" alt="Talkyy Brand Showcase" width="100%" style="border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.12);" />
</p>

---

## 🚀 Overview

> 🌐 **Live Application URL:** **[https://live-chat-app-alpha.vercel.app/](https://live-chat-app-alpha.vercel.app/)**

**Talkyy** is an end-to-end communication platform engineered from the ground up to bring the privacy, elegance, and responsiveness of modern consumer messaging apps to the browser without requiring any software installations.

From **direct encrypted conversations** and **lively group chats** to **real-time polls**, **voice memos**, and **crystal-clear WebRTC video calls**, Talkyy delivers a seamless, zero-latency social space powered by an asynchronous Socket.IO engine and decentralized peer-to-peer media streams.

---

## 📸 Visual Tour

### 🌐 1. Interactive 3D Globe & Landing Experience
An interactive WebGL 3D globe rendered natively in the browser with country and latency hub exploration, setting the stage for global, borderless connectivity.

<p align="center">
  <img src="./Readme%20images/Screenshot%202026-10-23%20200121.png" alt="Talkyy 3D Interactive Globe Hero" width="100%" style="border-radius: 10px;" />
</p>

---

### 💬 2. Direct Messaging & Client-Side Encryption
Fast, distraction-free one-to-one messaging featuring real-time typing indicators, read receipts, audio note waveform previews, and client-side encryption.

<p align="center">
  <img src="./Readme%20images/Screenshot%202026-10-23%20200143.png" alt="Private Direct Messaging with E2EE" width="100%" style="border-radius: 10px;" />
</p>

---

### 👥 3. Rich Group Chats, Roles & Interactive Polls
Collaborate with teams and communities. Includes creator and admin hierarchies, member rosters, custom group avatars, message reactions, and real-time interactive polls.

<p align="center">
  <img src="./Readme%20images/Screenshot%202026-10-23%20200203.png" alt="Group Chats and Interactive Polls" width="100%" style="border-radius: 10px;" />
</p>

---

### 📹 4. WebRTC Peer-to-Peer Voice & Video Calling
Direct audio and video streaming between browsers using native WebRTC with Socket.IO signaling. No third-party meeting links or heavy media servers needed.

<p align="center">
  <img src="./Readme%20images/Screenshot%202026-10-23%20200218.png" alt="WebRTC Peer-to-Peer Calling" width="100%" style="border-radius: 10px;" />
</p>

---

### 🛡️ 5. Zero-Trust Privacy & Security Architecture
A privacy-first philosophy where conversations, credentials, and attachments stay strictly between sender and recipient.

<p align="center">
  <img src="./Readme%20images/Screenshot%202026-10-22%20140557.png" alt="Talkyy Privacy and Security Showcase" width="100%" style="border-radius: 10px;" />
</p>

---

## ✨ Key Features

### ⚡ Real-Time Messaging & Presence
* **Bi-directional WebSockets**: Instant message dispatch and receipt powered by Socket.IO with automatic HTTP long-polling fallback.
* **Presence & Activity**: Live online/offline status, multi-tab session synchronization, and subtle typing indicators.
* **Read Receipts**: Verified message read states with double-check visual delivery status.
* **Message Management**: In-line message editing, reactions, and delete-for-everyone / delete-for-me capabilities.

### 🔒 Privacy & Cryptographic Security
* **Client-Side E2EE Engine**: Messages and files are encrypted and decrypted in browser Web Workers using AES-GCM and ECDH conversation keys.
* **Session Versioning (`tokenVersion`)**: Instant session revocation across all connected devices upon password reset or remote logout.
* **Two-Factor Authentication (2FA)**: Time-based One-Time Password (TOTP) compatible with Google Authenticator and Authy, featuring QR setup and emergency backup recovery codes.
* **Cross-Site Cookie Security**: Hardened HTTP-only, `SameSite=None`, and `Secure` cookie handling optimized for decoupled cloud hosting (Vercel + Render).

### 📞 Low-Latency Voice & Video Calling
* **Native WebRTC Mesh**: Audio and video streams bypass the application server and connect directly peer-to-peer.
* **STUN Traversal**: Integrated with Google's public STUN servers for seamless traversal across symmetric NATs and firewalls.
* **In-Call Controls**: Picture-in-picture local preview, camera flip/toggle, microphone mute, and call duration counters.

### ☁️ Cloudinary Media Pipeline
* **Permanent Cloud Storage**: Image attachments, audio recordings, profile avatars, and group icons are hosted on Cloudinary CDN.
* **Automatic Storage Cleanup**: Uploaded files on temporary server storage are wiped immediately after cloud delivery.
* **Intelligent MIME Sniffing**: Automatically identifies and renders image previews, audio player controls, and downloadable documents directly inside chat bubbles.

### 🎨 Design & Experience
* **Tailored Themes**: Vibrant Dark Mode and clean Light Mode with curated HSL color palettes and glassmorphic surfaces.
* **3D Globe Prototype**: Three.js / WebGL-powered interactive earth model on the landing page with rotation controls and location markers.
* **Responsive Layout**: Desktop multi-pane interface and mobile drawer navigation powered by Tailwind CSS.

---

## 🧱 Tech Stack

### Frontend
| Component | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | React 19 + Vite | High-performance SPA with instant HMR |
| **Styling** | Tailwind CSS + DaisyUI | Custom design system, tokens, and dark mode |
| **Real-time Client** | Socket.IO Client | Real-time event subscription & presence |
| **Media & WebRTC** | Native `RTCPeerConnection` | Direct peer-to-peer media streaming |
| **Cryptography** | Web Crypto API + CryptoJS | In-worker client encryption & key derivation |
| **Icons & UI** | React Icons + Toastify | Polished iconography and alert toasts |

### Backend
| Component | Technology | Description |
| :--- | :--- | :--- |
| **Server** | Node.js + Express 5 | Modular REST API and WebSocket host |
| **Real-time Server** | Socket.IO Server | Channel management, auth middleware, and signaling |
| **Database** | MongoDB Atlas + Mongoose | Cloud NoSQL database with schema validation |
| **File Storage** | Cloudinary SDK + Multer | Cloud media storage with ephemeral disk buffer |
| **Authentication** | JWT + `otplib` + `qrcode` | Stateless authentication & TOTP 2FA |
| **Security** | Express Rate Limit + Crypto | Anti-abuse rate limiting and secure headers |

---

## 🗂️ Project Structure

```text
Live-Chat-app/
├── backend/
│   ├── controller/          # Route handlers (auth, chat, message, user)
│   ├── database/            # MongoDB connection logic
│   ├── middleware/          # Auth verification, Multer upload, Rate limiting
│   ├── models/              # Mongoose schemas (User, ChatRoom, Message)
│   ├── public/              # Local media buffers (media, avatars)
│   ├── routes/              # Express API endpoints
│   ├── utils/               # Cloudinary upload, 2FA, crypto, error handlers
│   └── server.js            # Express app & Socket.IO server entrypoint
│
├── frontend/
│   ├── public/              # Static assets, logos, and audio alerts
│   ├── src/
│   │   ├── assets/          # SVG vectors and imagery
│   │   ├── components/      # Chatbox, VideoCall, GroupCall, Message, Polls, Sidebar
│   │   │   └── landing/     # 3D Globe, Hero, Feature showcase components
│   │   ├── contexts/        # UserContext, ChatContext, MessageContext, SocketContext
│   │   ├── pages/           # Chatpage, Login, ForgotPassword, Privacy, Terms
│   │   ├── utils/           # E2EE Crypto Workers, key derivation, avatar helpers
│   │   └── App.jsx          # Route declarations and root context providers
│   └── vercel.json          # SPA routing rules for Vercel
│
├── Readme images/           # High-resolution screenshots and preview assets
└── README.md                # Comprehensive project documentation
```

---

## 🛠️ Local Development

### Prerequisites
* [Node.js](https://nodejs.org/) (v18 or higher recommended)
* [MongoDB](https://www.mongodb.com/) (Local instance or free MongoDB Atlas cluster)
* [Cloudinary Account](https://cloudinary.com/) (Free tier for media uploads)

### 1. Clone the Repository
```bash
git clone https://github.com/hardikrana2515/Live-Chat-app.git
cd Live-Chat-app
```

### 2. Configure Backend
Navigate to the `backend` directory, install dependencies, and create a `.env` file:
```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:
```env
PORT=4000
NODE_ENV=development
DATABASE_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/ChattApp?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRATION=7d

# Email delivery for password reset (optional)
SMPT_SERVICE=gmail
SMPT_MAIL=your_email@gmail.com
SMPT_PASSWORD=your_gmail_app_password

# Cloudinary Media Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Allowed CORS client
CLIENT_URL=http://localhost:5173
```

Start the backend development server:
```bash
npm run dev
```

### 3. Configure Frontend
Open a new terminal, navigate to the `frontend` directory, and install dependencies:
```bash
cd frontend
npm install
```

Create a `.env` file inside `frontend/`:
```env
VITE_API_URL=http://localhost:4000/api/ChatApp
VITE_SOCKET_URL=http://localhost:4000
```

Start the Vite development server:
```bash
npm run dev
```

Visit **`http://localhost:5173`** in your browser to experience Talkyy locally.

---

## ☁️ Production Deployment

Talkyy is pre-configured for free zero-cost deployment on **Vercel** (Frontend) and **Render** (Backend):

### 1. Backend on Render
1. Create a **New Web Service** connected to your GitHub repository.
2. Settings:
   * **Root Directory**: `backend`
   * **Build Command**: `npm install`
   * **Start Command**: `node server.js`
   * **Instance Type**: `Free`
3. Add Environment Variables:
   * `NODE_ENV`: `production`
   * `DATABASE_URI`: Your MongoDB Atlas connection string (ensure `0.0.0.0/0` IP whitelist is enabled in Atlas).
   * `JWT_SECRET`: A secure random secret string.
   * `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: From your Cloudinary dashboard.
   * `CLIENT_URL`: `https://your-app.vercel.app` (your Vercel production domain).

### 2. Frontend on Vercel
1. Import the repository in **Vercel**.
2. Settings:
   * **Framework Preset**: `Vite`
   * **Root Directory**: `frontend`
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
3. Add Environment Variables:
   * `VITE_API_URL`: `https://your-backend.onrender.com/api/ChatApp`
   * `VITE_SOCKET_URL`: `https://your-backend.onrender.com`
4. Click **Deploy**.

> 💡 **Tip to eliminate Render's 50s sleep delay:** Set up a free 12-minute ping monitor on [cron-job.org](https://cron-job.org) targeting `https://your-backend.onrender.com/` to keep your instance warm.

---

## 🔒 Security Highlights

* **Audit C1 / C2 Defense**: Strict server-side chatroom membership validation for all Socket.IO and media retrieval endpoints.
* **Anti-Spoofing Protocol**: Message sender IDs are bound directly to the authenticated socket token; client-supplied spoofed IDs are rejected.
* **XSS Defense**: Sanitized MIME/magic-byte file verification and sandboxed `Content-Security-Policy` headers on all served media.
* **Reverse Proxy Hardening**: Configured Express `trust proxy` and cross-origin `SameSite=None; Secure` cookie options for multi-cloud deployments.

---

## 👨‍💻 Author

**Hardik Rana**
* GitHub: [@hardikrana2515](https://github.com/hardikrana2515)
* Project: [Live-Chat-app (Talkyy)](https://github.com/hardikrana2515/Live-Chat-app)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
