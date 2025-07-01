import User from "../models/user.model.js";
import { AsyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/Apierror.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import multiavatar from '@multiavatar/multiavatar/esm'



const userRegister = AsyncHandler(async (req, res) => {
  const { name, gender, userName, phonenumber, email, password } =
    req.body;

  if (!name || !gender || !userName || !phonenumber || !email || !password) {
    // throw new ApiError(400, "Please Fill All Fields.");
    return res.status(400)
              .json(new ApiResponse(409,null,"Please Fill All Fields."
              ))
  }
  const existedUser = await User.findOne({
    $or: [{ email }, { phonenumber }, { userName }],
  });

  if (existedUser) {
    // throw new ApiError(409, "User Already Registered please Login");
    return res.status(409)
              .json(new ApiResponse(409,null,"User Already Registered please Login"
              ))
  }

  const svgCode = multiavatar(userName)
   const base64Avatar = Buffer.from(svgCode).toString('base64');

  const hashPassword = await User.hashPassword(password);

  const user = await User.create({
    name,
    gender,
    userName,
    phonenumber,
    email,
    password: hashPassword,
    avtar:  `data:image/svg+xml;base64,${base64Avatar}`, 
  });

  if (user) {
    return res
      .status(200)
      .json(new ApiResponse(200, user, "User successfully Registered."));
  } else {
    throw new ApiError(400, "Invalid Data");
  }
});

const userLogin = AsyncHandler(async (req, res) => {
  const { phonenumber, email, password } = req.body;

  if ((!email && !phonenumber) || !password) {
    // throw new ApiError(400, "Please provide email or phone and password.");
     return res.status(400)
              .json(new ApiResponse(400,null,"Please Fill All Fields."
              ))
  }

  let user;
  if (email) {
    user = await User.findOne({ email });
  } else {
    user = await User.findOne({ phonenumber });
  }

  if (!user) {
    // throw new ApiError(401, "User Not Found!!");
     return res.status(401)
              .json(new ApiResponse(401,null,"User not Found! Please Login."
              ))
  }

  const isCorrectPass = await user.comparePassword(password);

  if (!isCorrectPass) {
    // throw new ApiError(400, "Incorrect password");
     return res.status(400)
              .json(new ApiResponse(400,null,"Incorrect password"
              ))
  }
  
  const Authtoken = await user.generateAuthToken();

  res.cookie("token", Authtoken, { httpOnly: true });

  const loggedinUser = await User.findById(user._id).select("-password");
  if (Authtoken) {
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { loggedinUser, Authtoken },
          "User Successfully logged in"
        )
      );
  } else {
    throw new ApiError(504, "failed to generate token");
  }
});

const getUser = AsyncHandler(async (req, res) => {
  const user = req.user;
  return res
    .status(200)
    .json(new ApiResponse(200, user, "User Fetched Succesfully"));
});

const userLogout = AsyncHandler(async (req, res) => {
  const token = req.cookies?.token;
  if (!token) {
    throw new ApiError(400, "User Not Logged in !!!");
  }

  res.cookie("token", null, {
    httpOnly: true,
    expires: new Date(0),
    sameSite: "lax",
    path: "/",
  });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "User Logged Out Successfully ..."));
});

const updatePassword = AsyncHandler(async (req, res) => {
  const { oldpassword, newpassword } = req.body;

  const user = await User.findById(req.user?._id);
  const isoldPassword = await user.comparePassword(oldpassword);

  if (!isoldPassword) {
    throw new ApiError(400, "Invalid Password!");
  }
  const hashedPassword = await User.hashPassword(newpassword);
  user.password = hashedPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password Changed Successfully..."));
});

const uploadImage = AsyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(401, "Please first select file!");
  }

  const imageUrl = `/Image/${req.file.filename}`;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { avtar: imageUrl },
    { new: true }
  );
  if (!user) {
    // throw new ApiError(404, "User not found");
    return res.status(404)
              .json(new ApiResponse(404,null,"user not found!!"
              ))
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, { imageUrl, user }, "Image uploaded successfully")
    );
});

const Alluser = AsyncHandler(async (req, res) => {
  const keywords = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { phonenumber: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const users = await User.find(keywords)
    .find({ _id: { $ne: req.user._id } })
    .select("-password");

  res
    .status(200)
    .json(new ApiResponse(200, users, "All contact fetched sucessdfully..."));
});
export {
  userRegister,
  userLogin,
  updatePassword,
  getUser,
  userLogout,
  uploadImage,
  Alluser,
};
