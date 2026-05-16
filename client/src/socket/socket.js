import {io} from "socket.io-client"

let socket = null

export const connectSocket = (userId) => {
    if(socket?.connected) return socket

    socket = io("https://chat-flow-plxu.onrender.com", {
        query: {userId},
        withCredentials: true
    })

    return socket
}

export const disconnectSocket = () => {
    if(socket){
        socket.disconnect()
        socket = null
    }
}

export const getSocket = () => socket