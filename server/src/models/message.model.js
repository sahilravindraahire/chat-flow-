import mongoose from "mongoose"

const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false,
        default: null
    },
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group"
    },
    text: {
        type: String,
        default: ""
    },
    messageType: {
        type: String,
        enum: ["text", "image", "video", "file"],
        required: true
    },
    mediaUrl: {
        type: String,
        default: ""
    },
    publicId: {
        type: String,
        default: ""
    },
    fileName: {
        type: String,
        default: ""
    },
    fileSize: {
        type: Number,
        default: 0
    },
    mimeType: {
        type: String,
        default: ""
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, 
{timestamps: true})

export const Message = mongoose.model("Message", messageSchema)