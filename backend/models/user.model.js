import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";

const userschema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    gender: {
      type: String,
      required: true,
      enum: ["male", "female", "other"],
    },
    bio: {
      type: String,
      default: "",
      maxlength: 200,
      trim: true,
    },
    userName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 50,
      match: [/^[a-zA-Z0-9_]{3,50}$/, "Invalid username format"],
    },
    phonenumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 20,
      match: [/^\+?[0-9]{7,15}$/, "is invalid"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 150,
      match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "is invalid"],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      maxlength: 128,
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
    tokenVersion: {
      type: Number,
      default: 0,
    },
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
    twoFactor: {
      enabled: {
        type: Boolean,
        default: false,
      },
      secret: {
        type: String,
        default: "",
        select: false,
      },
      tempSecret: {
        type: String,
        default: "",
        select: false,
      },
      tempSecretExpires: {
        type: Date,
        default: null,
      },
      backupCodes: [
        {
          codeHash: {
            type: String,
            required: true,
          },
          used: {
            type: Boolean,
            default: false,
          },
          usedAt: {
            type: Date,
            default: null,
          },
        },
      ],
      lastUsedTimeStep: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

userschema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { _id: this._id, tokenVersion: this.tokenVersion || 0 },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRATION || "7d",
    }
  );
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
