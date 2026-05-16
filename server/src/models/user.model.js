import bcrypt from "bcryptjs"
import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    username: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    profilePic: {
        type: String
    },
    gender: {
        type: String,
        enum: ["male", "female", "other"],
        default: "male",
        required: true
    },
    lastSeen: {
        type: Date,
        default: Date.now
    },
    isOnline: {
        type: Boolean,
        default: false
    }
}, 
{timestamps: true})

userSchema.pre("save", async function(){
    if(!this.isModified("password")) return

    this.password = await bcrypt.hash(this.password, 10)
})

export const User = mongoose.model("User", userSchema)