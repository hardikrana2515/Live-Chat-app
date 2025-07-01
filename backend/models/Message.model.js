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
    },
    media: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: [ "delivered", "read"],
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
