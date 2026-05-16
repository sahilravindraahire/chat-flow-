import { app, server } from "../src/socket/socket.js";
import { dbConnection } from "../src/db/dataBase.js";
import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";

app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({extended: true}))
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
}))

import userRouter from "./routes/user.route.js";
import messageRouter from "./routes/message.route.js";
import groupRouter from "./routes/group.route.js";

app.use("/api/v1/user", userRouter)
app.use("/api/v1/message", messageRouter)
app.use("/api/v1/group", groupRouter)

const port = process.env.PORT || 5000;

dbConnection()
.then(() => {
  try {
    server.listen(port, () => {
      console.log(`server is at http://localhost:${port}`);
    });
  } catch (error) {
    console.log(`error while connecting server`, error)
  }
});
