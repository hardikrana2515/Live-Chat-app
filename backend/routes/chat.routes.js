import express from "express"
import {Auth} from "../middleware/Auth.js"
import { rateLimit } from "../middleware/rateLimiter.js"
import {AccessChat,fetchChat,
        CreateGroup,RenameGroup,
        addtoGroup,RemovefromGroup,
        makeAdmin,LeaveGroup,UploadGroupIcon,
        DeleteGroup,RemoveAdmin,UpdateGroupKeys} from "../controller/Chat.controller.js"
import {body} from "express-validator"
import upload, { validateFileMagicBytes } from "../middleware/multer.js"

const groupCreateLimiter = rateLimit({ windowMs: 60 * 1000, max: 15, message: "Too many groups created. Please wait a minute." });

const ChatRoutes = express.Router()

ChatRoutes.post("/chat", Auth, AccessChat)
ChatRoutes.get("/allChat", Auth, fetchChat)
ChatRoutes.post("/makeGroup", Auth, groupCreateLimiter, upload.single("groupIcon"), validateFileMagicBytes, CreateGroup)
ChatRoutes.put("/renameGroup", Auth, RenameGroup)
ChatRoutes.put("/addtoGroup", Auth, addtoGroup)
ChatRoutes.put("/removefromGroup", Auth, RemovefromGroup)
ChatRoutes.put("/makeAdmin", Auth, makeAdmin)
ChatRoutes.put("/removeAdmin", Auth, RemoveAdmin)
ChatRoutes.put("/leaveGroup", Auth, LeaveGroup)
ChatRoutes.put("/deleteGroup", Auth, DeleteGroup)
ChatRoutes.put("/groupimage", Auth, upload.single('groupIcon'), validateFileMagicBytes, UploadGroupIcon)
ChatRoutes.put("/groupkey", Auth, UpdateGroupKeys)

export default ChatRoutes


