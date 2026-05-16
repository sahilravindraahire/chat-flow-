import express from "express"
import {verifyJwt} from "../middlewares/auth.middleware.js"
import {upload} from "../middlewares/multer.middleware.js"
import {createGroup, getMyGroups, getGroupById, updateGroup, addMembers, removeMember, leaveGroup, transferAdmin, deleteGroup} from "../controllers/group.controller.js"


const groupRouter = express.Router()

groupRouter.use(verifyJwt)

groupRouter.post("/create", upload.single("groupImage"), createGroup)
groupRouter.get("/my-groups", getMyGroups)
groupRouter.patch("/update/:groupId", upload.single("groupImage"), updateGroup)
groupRouter.post("/add-members/:groupId", addMembers)
groupRouter.post("/leave/:groupId", leaveGroup)
groupRouter.patch("/transfer-admin/:groupId", transferAdmin)
groupRouter.delete("/remove-member/:groupId/:memberId", removeMember)
groupRouter.delete("/delete/:groupId", deleteGroup)

groupRouter.get("/:groupId", getGroupById)

export default groupRouter
