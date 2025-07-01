import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

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

userschema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

userschema.statics.hashPassword = async (password) => {
  const hashPassword = await bcrypt.hash(password, 12);
  return hashPassword;
};

const User = mongoose.model("User", userschema);

export default User;
