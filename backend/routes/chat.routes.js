import express from "express"
import {Auth} from "../middleware/Auth.js"
import {AccessChat,fetchChat,
        CreateGroup,RenameGroup,
        addtoGroup,RemovefromGroup,
        makeAdmin,LeaveGroup,UploadGroupIcon,
        DeleteGroup,RemoveAdmin} from "../controller/Chat.controller.js"
import {body} from "express-validator"
import upload from "../middleware/multer.js"

const ChatRoutes = express.Router()

ChatRoutes.post("/chat", Auth, AccessChat)
ChatRoutes.get("/allChat", Auth, fetchChat)
ChatRoutes.post("/makeGroup", Auth, upload.single("groupIcon"), CreateGroup)
ChatRoutes.put("/renameGroup", Auth, RenameGroup)
ChatRoutes.put("/addtoGroup", Auth, addtoGroup)
ChatRoutes.put("/removefromGroup", Auth, RemovefromGroup)
ChatRoutes.put("/makeAdmin", Auth, makeAdmin)
ChatRoutes.put("/removeAdmin", Auth, RemoveAdmin)
ChatRoutes.put("/leaveGroup", Auth, LeaveGroup)
ChatRoutes.put("/deleteGroup", Auth, DeleteGroup)
ChatRoutes.put("/groupimage", Auth, upload.single('groupIcon'), UploadGroupIcon)

export default ChatRoutes


