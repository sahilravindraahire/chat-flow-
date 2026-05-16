import express, { Router } from "express"
import {register, login, logout, getMe, updateProfile, changePassword, getAllUsers, getUserById} from "../controllers/user.controller.js"
import { verifyJwt } from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.middleware.js"

const userRouter = express.Router()

userRouter.post("/register", register)
userRouter.post("/login", login)
userRouter.post("/logout", verifyJwt, logout)
userRouter.get("/me", verifyJwt, getMe)
userRouter.get("/", verifyJwt, getAllUsers)
userRouter.get("/:userId", verifyJwt, getUserById)
userRouter.patch(
    "/update-profile",
    verifyJwt,
    upload.fields([{name: "profilePic", maxCount: 1}]),
    updateProfile
)
userRouter.patch("/change-password", verifyJwt, changePassword)

export default userRouter
