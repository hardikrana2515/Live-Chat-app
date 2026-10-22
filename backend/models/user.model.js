import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";

const userschema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ["male", "female"],
    },
    userName: {
      type: String,
      required: true,
      unique: true,
    },
    phonenumber: {
      type: String,
      required: true,
      unique: true,
      match: [/\d{10}/, "is invalid"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/\S+@\S+\.\S+/, "is invalid"],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    avtar: {
      type: String,
      required: true,
      default: "",
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: Date,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    friendRequests: [
      {
        sender: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        status: {
          type: String,
          enum: ["pending", "accepted", "rejected"],
          default: "pending"
        }
      },
    ],
    blockedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    publicKey: {
      type: String,
      default: "",
    },
    identity: {
      identityId: {
        type: String,
        default: "",
      },
      version: {
        type: Number,
        default: 1,
      },
      publicKey: {
        type: String,
        default: "",
      },
      publicKeyFingerprint: {
        type: String,
        default: "",
      },
      vault: {
        formatVersion: {
          type: Number,
          default: 1,
        },
        cipher: {
          type: String,
          default: "AES-256-GCM",
        },
        kdf: {
          type: String,
          default: "PBKDF2-HMAC-SHA256",
        },
        kdfIterations: {
          type: Number,
          default: 100000,
        },
        salt: {
          type: String,
          default: "",
        },
        nonce: {
          type: String,
          default: "",
        },
        ciphertext: {
          type: String,
          default: "",
        },
        aad: {
          type: String,
          default: "",
        },
        updatedAt: {
          type: Date,
          default: null,
        },
      },
    },
  },
  {
    timestamps: true,
  }
);

userschema.methods.generateAuthToken = function () {
  const token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION,
  });
  return token;
};

userschema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

  return resetToken;
};


userschema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

userschema.statics.hashPassword = async (password) => {
  const hashPassword = await bcrypt.hash(password, 12);
  return hashPassword;
};

const User = mongoose.model("User", userschema);

export default User;
