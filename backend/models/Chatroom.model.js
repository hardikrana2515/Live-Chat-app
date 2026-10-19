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
    // E2EE group key distribution: { [userId]: { by, byKey, key } } where
    // `key` is the AES-wrapped copy of the group key, encrypted to that
    // member's ECDH pairwise key. The server never sees a plaintext key. (Issue 3.2)
    groupKeys: {
      type: mongoose.Schema.Types.Mixed,
      default: undefined,
    },
  },
  {
    timestamps: true,
  }
);

const ChatRoom = mongoose.model("ChatRoom", chatRoomSchema);

export default ChatRoom;
