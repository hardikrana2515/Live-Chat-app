import mongoose from "mongoose";

const chatRoomSchema = mongoose.Schema(
  {
    chatname: {
      type: String,
      default: "",
    },
    isGroup: {
      type: Boolean,
      default: false,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    creator: {
      type : mongoose.Schema.Types.ObjectId,
      ref : "User"
    },
    groupIcon: {
      type: String,
      default: "",
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
  },
  {
    timestamps: true,
  }
);

const ChatRoom = mongoose.model("ChatRoom", chatRoomSchema);

export default ChatRoom;
