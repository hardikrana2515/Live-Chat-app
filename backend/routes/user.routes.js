import express from "express"
import { body } from "express-validator"
import upload, { validateFileMagicBytes } from "../middleware/multer.js"
import { validate } from "../middleware/validate.middleware.js"
import {
  userRegister,
  userLogin,
  updatePassword,
  userLogout,
  getUser,
  uploadImage,
  Alluser,
  forgotPassword,
  resetPassword,
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
} from "../controller/user.controller.js"
import { Auth } from "../middleware/Auth.js"
import { rateLimit } from "../middleware/rateLimiter.js"

const authLimiter = rateLimit({ windowMs: 60 * 1000, max: 20, message: "Too many auth attempts. Please wait a minute." });
const friendReqLimiter = rateLimit({ windowMs: 60 * 1000, max: 30, message: "Too many friend requests sent. Please wait a minute." });
const vaultLimiter = rateLimit({ windowMs: 60 * 1000, max: 20, message: "Too many vault operations. Please wait a minute." });
const twoFactorLimiter = rateLimit({ windowMs: 5 * 60 * 1000, max: 10, message: "Too many 2FA verification attempts. Please wait 5 minutes." });

const UserRoutes = express.Router()

UserRoutes.post("/register",
    authLimiter,
    [body("email").isEmail().withMessage("please enter valid e-mail"),
    body("password").isLength({ min: 8 }).withMessage("Password length should be minimum 8"),
    body("phonenumber").isMobilePhone().withMessage("enter valid mobile number"),
    body("name").notEmpty().withMessage("Name is required"),
    body("userName").notEmpty().withMessage("Username is required")
    ],
    validate,
    userRegister
)
UserRoutes.post("/login",
    authLimiter,
    [
    body("password").notEmpty().withMessage("Password is required"),
],
    validate,
    userLogin
)
UserRoutes.post("/logout", userLogout)
UserRoutes.get("/getUser", Auth, getUser)
UserRoutes.put("/updateProfile", Auth, updateProfile)
UserRoutes.put("/changePassword", Auth, updatePassword)
UserRoutes.put("/image", Auth, upload.single("avtar"), validateFileMagicBytes, uploadImage);
UserRoutes.get("/Alluser", Auth, Alluser);

UserRoutes.post("/password/forgot", authLimiter, forgotPassword);
UserRoutes.put("/password/reset/:token", authLimiter, resetPassword);

UserRoutes.post("/request/send", Auth, friendReqLimiter, sendRequest);
UserRoutes.get("/request/get", Auth, getRequests);
UserRoutes.post("/request/accept", Auth, acceptRequest);
UserRoutes.get("/friends", Auth, getFriends);
UserRoutes.put("/block", Auth, blockUser);
UserRoutes.put("/unblock", Auth, unblockUser);
UserRoutes.put("/publickey", Auth, setPublicKey);

UserRoutes.get("/vault", Auth, getIdentityVault);
UserRoutes.post("/vault", Auth, vaultLimiter, registerIdentityVault);
UserRoutes.put("/vault", Auth, vaultLimiter, updateIdentityVault);
UserRoutes.post("/identity/reset", Auth, vaultLimiter, resetIdentity);

// Two-Factor Authentication (2FA) routes
UserRoutes.get("/2fa/status", Auth, getTwoFactorStatus);
UserRoutes.post("/2fa/setup", Auth, twoFactorLimiter, setupTwoFactor);
UserRoutes.post("/2fa/confirm", Auth, twoFactorLimiter, confirmTwoFactor);
UserRoutes.post("/2fa/disable", Auth, twoFactorLimiter, disableTwoFactor);
UserRoutes.post("/2fa/regenerate-backup-codes", Auth, twoFactorLimiter, regenerateBackupCodes);
UserRoutes.post("/2fa/verify-login", twoFactorLimiter, verifyTwoFactorLogin);

export default UserRoutes