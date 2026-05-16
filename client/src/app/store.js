import {configureStore} from "@reduxjs/toolkit"
import authReducer from "../features/auth/authSlice.js"
import messageReducer from "../features/message/messageSlice.js"
import groupReducer from "../features/group/groupSlice.js"

export const store = configureStore({
    reducer: {
        auth: authReducer,
        message: messageReducer,
        group: groupReducer
    }
})