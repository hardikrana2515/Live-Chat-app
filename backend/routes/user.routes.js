import express from "express"
import { body } from "express-validator"
import upload from "../middleware/multer.js"
import { userRegister, userLogin, updatePassword, userLogout, getUser, uploadImage, Alluser, forgotPassword, resetPassword, sendRequest, getRequests, acceptRequest, getFriends, blockUser, unblockUser } from "../controller/user.controller.js"
import { Auth } from "../middleware/Auth.js"
const UserRoutes = express.Router()


UserRoutes.post("/register",
    [body("email").isEmail().withMessage("please enter valid e-mail"),
    body("password").isLength(8).withMessage("Password length should be minimum 6"),
    body("phonenumber").isMobilePhone().withMessage("enter valid mobile number"),
    body("name").notEmpty().withMessage("Name is required"),
    body("userName").notEmpty().withMessage("Username is required")
    ],
    userRegister
)
UserRoutes.post("/login", [
    // body("email").isEmail().withMessage("please valid e-mai"),
    //  body("phonenumber").isMobilePhone().withMessage("enter valid mobile number"),
    body("password").isLength(8).withMessage("Password length should be minimum 6"),
],
    userLogin
)
UserRoutes.post("/logout", userLogout)
UserRoutes.get("/getUser", Auth, getUser)
UserRoutes.put("/changePassword", Auth, updatePassword)
UserRoutes.put("/image", upload.single("avtar"), Auth, uploadImage);
UserRoutes.get("/Alluser", Auth, Alluser);

UserRoutes.post("/password/forgot", forgotPassword);
UserRoutes.put("/password/reset/:token", resetPassword);

UserRoutes.post("/request/send", Auth, sendRequest);
UserRoutes.get("/request/get", Auth, getRequests);
UserRoutes.post("/request/accept", Auth, acceptRequest);
UserRoutes.get("/friends", Auth, getFriends);
UserRoutes.put("/block", Auth, blockUser);
UserRoutes.put("/unblock", Auth, unblockUser);

export default UserRoutes