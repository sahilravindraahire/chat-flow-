import { Message } from "../models/message.model.js";
import { User } from "../models/user.model.js";
import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import { getOnlineUsers, io } from "../socket/socket.js";
import { Group } from "../models/group.model.js";


const detectMessageType = (mimeType = "") => {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  return "file";
};

export const sendMessage = asyncHandler(async (req, res) => {
  const { receiverId } = req.params;
  const { text } = req.body;
  const senderId = req.user._id;

  if (senderId.toString() === receiverId) {
    throw new apiError(400, "You cannot send a message to yourself");
  }

  const receiver = await User.findById(receiverId);

  if (!receiver) {
    throw new apiError(404, "Receiver not found");
  }

  if (!text?.trim() && !req.file) {
    throw new apiError(400, "can't send empty message field");
  }

  let mediaUrl = "";
  let publicId = "";
  let fileName = "";
  let fileSize = "";
  let mimeType = "";
  let messageType = "text";

  if (req.file) {
    const uploaded = await uploadOnCloudinary(req.file?.path);

    if (!uploaded) {
      throw new apiError(500, "failed to upload media to cloudinary");
    }

    mediaUrl = uploaded.secure_url;
    publicId = uploaded.public_id;
    fileName = req.file?.originalname;
    fileSize = req.file?.size;
    mimeType = req.file?.mimetype;
    messageType = detectMessageType(req.file?.mimetype);
  }

  const message = await Message.create({
    senderId,
    receiverId,
    text: text?.trim() || "",
    messageType,
    mediaUrl,
    publicId,
    fileName,
    fileSize,
    mimeType,
  });

  const populateMessage = await Message.findById(message._id)
    .populate("senderId", "fullName username profilePic")
    .populate("receiverId", "fullName username profilePic");

  const receiverSocketId = getOnlineUsers(receiverId);

  if (receiverSocketId) {
    io.to(receiverSocketId).emit("newMessage", populateMessage);
  }

  return res
    .status(201)
    .json(new apiResponse(201, populateMessage, "message sent successfully"));
});

export const getMessage = asyncHandler(async (req, res) => {
  // GET /api/message/:receiverId

  const { receiverId } = req.params;
  const senderId = req.user._id;

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 30;
  const skip = (page - 1) * limit;

  const receiver = await User.findById(receiverId);

  if (!receiver) {
    throw new apiError(404, "user not found");
  }

  const message = await Message.find({
    $or: [
      { senderId, receiverId },
      { senderId: receiverId, receiverId: senderId },
    ],
  })
    .sort({ createdAt: 1 })
    .skip(skip)
    .limit(limit)
    .populate("senderId", "fullName username profilePic")
    .populate("receiverId", "fullName username profilePic");

  const total = await Message.countDocuments({
    $or: [
      { senderId, receiverId },
      { senderId: receiverId, receiverId: senderId },
    ],
  });

  const receiverSocketId = getOnlineUsers(receiverId);
  if (receiverSocketId) {
    io.to(receiverSocketId).emit("chatOpened", {
      by: senderId,
      with: receiverId,
    });
  }

  return res.status(200).json(
    new apiResponse(
      200,
      {
        message,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      "Message fetched successfully",
    ),
  );
});

export const deleteMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const userId = req.user._id;

  const message = await Message.findById(messageId);

  if (!message) {
    throw new apiError(404, "message not found");
  }

  if (message.senderId.toString() !== userId.toString()) {
    throw new apiError(403, "not authorized to delete this message");
  }

  if (message.publicId) {
    const deleted = await deleteFromCloudinary(message.publicId);

    if (!deleted || deleted.result !== "ok") {
      console.log(`Cloudinary delete failed for publicId: ${message.publicId}`);
    }
  }

  const receiverId = message.receiverId.toString();

  await Message.findByIdAndDelete(messageId);

  const receiverSocketId = getOnlineUsers(receiverId);
  if (receiverSocketId) {
    io.to(receiverSocketId).emit("messageDeleted", {
      messageId,
      deletedBy: userId,
    });
  }

  const senderSocketId = getOnlineUsers(userId.toString());

  if (senderSocketId) {
    io.to(senderSocketId).emit("messageDeleted", {
      messageId,
      deletedBy: userId,
    });
  }

  return res
    .status(200)
    .json(new apiResponse(200, { messageId }, "message deleted successfully"));
});

export const getConversation = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const conversation = await Message.aggregate([
    {
      $match: {
        $or: [{ senderId: userId }, { receiverId: userId }],
      },
    },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: {
          $cond: [{ $eq: ["$senderId", userId] }, "$receiverId", "$senderId"],
        },
        lastMessage: { $first: "$$ROOT" },
        unreadCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ["$receiverId", userId] },
                  { $eq: ["$isRead", false] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $project: {
        _id: 1,
        lastMessage: 1,
        unreadCount: 1,
        user: {
          _id: 1,
          fullName: 1,
          username: 1,
          profilePic: 1,
          isOnline: 1,
          lastSeen: 1,
        },
      },
    },
    { $sort: { "lastMessage.createdAt": -1 } },
  ]);

  const userSocketId = getOnlineUsers(userId.toString());
  if (userSocketId) {
    const totalUnread = conversation.reduce((sum, c) => sum + c.unreadCount, 0);
    io.to(userSocketId).emit("unreadCount", { totalUnread });
  }

  return res
    .status(200)
    .json(
      new apiResponse(200, conversation, "Conversations fetched successfully"),
    );
});

export const markMessageAsRead = asyncHandler(async (req, res) => {
  // Sahil opens Aman chat
  // /api/message/read/amanId

  const { senderId } = req.params;
  const receiverId = req.user._id;

  const result = await Message.updateMany(
    // updateMany() updates multiple documents at once
    {
      //Find messages where
      senderId,
      receiverId,
      isRead: false,
    },
    {
      // then set
      $set: { isRead: true },
    },
  );

  if (result.modifiedCount > 0) {
    const senderSocketId = getOnlineUsers(senderId);

    if (senderSocketId) {
      io.to(senderSocketId).emit("messageRead", {
        by: receiverId,
        count: result.modifiedCount,
      });
    }
  }

  return res.status(200).json(
    new apiResponse(
      200,
      {
        markedCount: result.modifiedCount,
      },
      "Messages marked as read",
    ),
  );
});

export const sendGroupMessage = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const { text } = req.body;
  const senderId = req.user._id;

  const group = await Group.findById(groupId);

  if (!group) {
    throw new apiError(404, "group not found");
  }

  const isMember = group.members.some(
    (memId) => memId.toString() === senderId.toString(),
  );

  if (!isMember) {
    throw new apiError(403, "only group members can send message");
  }

  if (!text?.trim() && !req.file) {
    throw new apiError(400, "can't send an empty message");
  }

  let mediaUrl = "";
  let publicId = "";
  let fileName = "";
  let fileSize = "";
  let mimeType = "";
  let messageType = "text";

  if (req.file) {
    const uploaded = await uploadOnCloudinary(req.file?.path);

    if (!uploaded) {
      throw new apiError(500, "falied to uplaod media to cloudinary");
    }

    mediaUrl = uploaded.secure_url;
    publicId = uploaded.public_id;
    fileName = req.file.originalname;
    fileSize = req.file.size;
    mimeType = req.file.mimetype;
    messageType = detectMessageType(req.file.mimetype);
  }

  const message = await Message.create({
    senderId,
    receiverId: null,
    groupId,
    text: text?.trim() || "",
    messageType,
    mediaUrl,
    publicId,
    fileName,
    fileSize,
    mimeType,
  });

  const populateMessage = await Message.findById(message._id)
    .populate("senderId", "fullName username profilePic")
    .populate("groupId", "groupName groupImage");

  group.members.forEach((memId) => {
    if (memId.toString() === senderId.toString()) return;

    const memberSocketId = getOnlineUsers(memId.toString());

    if (memberSocketId) {
      io.to(memberSocketId).emit("newGroupMessage", populateMessage);
    }
  });

  return res
    .status(201)
    .json(
      new apiResponse(201, populateMessage, "Group message sent successfully"),
    );
});

export const getGroupMessage = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const userId = req.user._id;

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 30;
  const skip = (page - 1) * limit;

  const group = await Group.findById(groupId);

  if (!group) {
    throw new apiError(404, "group not found");
  }

  const isMember = group.members.some(
    (membId) => membId.toString() === userId.toString(),
  );

  if (!isMember) {
    throw new apiError(403, "you'r not member of this group");
  }

  const messages = await Message.find({ groupId })
    .sort({ createdAt: 1 })
    .skip(skip)
    .limit(limit)
    .populate("senderId", "fullName username profilePic");

  const total = await Message.countDocuments({ groupId });

  return res.status(200).json(
    new apiResponse(
      200,
      {
        messages,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      "group message fetch successfully",
    ),
  );
});

export const deleteGroupMessage = asyncHandler(async (req, res) => {
  const { groupId, messageId } = req.params;
  const userId = req.user._id;

  const group = await Group.findById(groupId);

  if (!group) {
    throw new apiError(404, "group not found");
  }

  const message = await Message.findById(messageId);

  if (!message) {
    throw new apiError(404, "message not found");
  }

  const isSender = message.senderId.toString() === userId.toString();
  const isAdmin = group.admin.toString() === userId.toString();

  if (!isSender && !isAdmin) {
    throw new apiError(403, "not authorized to delete message");
  }

  if (message.publicId) {
    const deleted = await deleteFromCloudinary(message.publicId);

    if (!deleted || deleted.result !== "ok") {
      console.log(
        `cloudinary delete operation failed for PublicId: ${message.publicId}`,
      );
    }
  }

  await Message.findByIdAndDelete(messageId);

    group.members.forEach((membId) => {
      const memberSockeId = getOnlineUsers(membId.toString());
      if (memberSockeId) {
        io.to(memberSockeId).emit("groupMessageDeleted", {
          messageId,
          groupId,
          deletedBy: userId,
        });
      }
    });

  return res
    .status(200)
    .json(
      new apiResponse(200, messageId, "group message deleted successfully"),
    );
});
