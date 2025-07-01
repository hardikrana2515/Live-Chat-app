import express from "express"
import {body} from "express-validator"
import upload from "../middleware/multer.js"
import {userRegister,userLogin,updatePassword,userLogout,getUser,uploadImage,Alluser} from "../controller/user.controller.js"
import {Auth} from "../middleware/Auth.js"
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
UserRoutes.post("/login",
    [body("email").isEmail().withMessage("please valid e-mai"),
     body("phonenumber").isMobilePhone().withMessage("enter valid mobile number"),
     body("password").isLength(8).withMessage("Password length should be minimum 6"),
    ],
    userLogin
)
UserRoutes.post("/logout",userLogout)
UserRoutes.get("/getUser",Auth,getUser)
UserRoutes.put("/changePassword",Auth,updatePassword)
UserRoutes.put("/image",upload.single('profilePic'),Auth,uploadImage)
UserRoutes.get("/Alluser",Auth,Alluser)

export default  UserRoutes