import express from "express"

import {sendMessage, getMessage, deleteMessage, getConversation, markMessageAsRead, sendGroupMessage, getGroupMessage, deleteGroupMessage} from "../controllers/message.controller.js"
import {verifyJwt} from "../middlewares/auth.middleware.js"
import {upload} from "../middlewares/multer.middleware.js"

const messageRouter = express.Router()

messageRouter.use(verifyJwt)

messageRouter.get("/conversation", getConversation)
messageRouter.get("/group/:groupId", getGroupMessage)
messageRouter.post("/group/send/:groupId", upload.single("media"), sendGroupMessage)
messageRouter.delete("/group/:groupId/:messageId", deleteGroupMessage)

messageRouter.get("/:receiverId", getMessage)
messageRouter.post("/send/:receiverId", upload.single("media"), sendMessage)
messageRouter.patch("/read/:senderId", markMessageAsRead)
messageRouter.delete("/:messageId", deleteMessage)

export default messageRouter