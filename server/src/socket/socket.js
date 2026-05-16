import dotenv from "dotenv"
dotenv.config()

import express from "express"
import {Server} from "socket.io"
import http from "http"
import cors from "cors"

const app = express()
const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        credentials: true
    }
})

let userSocketMap = {}

io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId
    if(!userId) return socket.disconnect()

        userSocketMap[userId] = socket.id

        socket.join(userId)

        io.emit("onlineUsers", Object.keys(userSocketMap))

        socket.on("disconnect", () => {
            delete userSocketMap[userId]
            io.emit("onlineUsers", Object.keys(userSocketMap))
        })
})

export const getOnlineUsers = (userId) => {
    return userSocketMap[userId]
}

export {app, server, io}