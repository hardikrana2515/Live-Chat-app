import mongoose from "mongoose";

const messageSchma = mongoose.Schema(
  {
    Sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: false,
      maxlength: 20000,
    },
    media: {
      type: String,
      default: "",
      maxlength: 500,
    },
    idempotencyKey: {
      type: String,
      sparse: true,
      index: true,
      maxlength: 128,
    },
    status: {
      type: String,
      enum: ["delivered", "read"],
      default: "delivered",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    deletedFor: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
      default: null,
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    reactions: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        emoji: {
          type: String,
          required: true,
          maxlength: 20,
        },
      },
    ],
    poll: {
      question: { type: String, maxlength: 300, trim: true },
      options: {
        type: [
          {
            text: { type: String, required: true, maxlength: 150, trim: true },
            votes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
          },
        ],
        validate: [
          (v) => !v || v.length <= 10,
          "Poll cannot exceed 10 options",
        ],
      },
    },
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "ChatRoom",
    },
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model("Message", messageSchma);

export default Message;
