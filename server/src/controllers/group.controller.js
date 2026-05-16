import {Group} from "../models/group.model.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary, deleteFromCloudinary} from "../utils/cloudinary.js"
import {User} from "../models/user.model.js"
import {Message} from "../models/message.model.js"
import {getOnlineUsers, io} from "../socket/socket.js"

export const createGroup = asyncHandler(async(req, res) => {
    const {groupName, members} = req.body
    const adminId = req.user._id

    if(!groupName?.trim()){
        throw new apiError(400, "Group name is required")
    }

    let parsedMembers = []

    if(members){
        parsedMembers = Array.isArray(members) ? members : JSON.parse(members)
    }

    if(parsedMembers.length > 0){
        const validUsers = await User.find({_id: {$in: parsedMembers}})
        if(validUsers.length !== parsedMembers.length){
            throw new apiError(400, "one or more member ID's are invalid")
        }
    }

    const uniqueMembers = [
        ...new Set([adminId.toString(), ...parsedMembers.map(String)])
    ]

    let groupImageUrl = ""

    if(req.file){
        const uploadRes = await uploadOnCloudinary(req.file.path)
        if(!uploadRes){
            throw new apiError(500, "failed to uplaod group image")
        }

        groupImageUrl = uploadRes.secure_url
    }

    const group = await Group.create({
        groupName: groupName.trim(),
        groupImage: groupImageUrl,
        members: uniqueMembers,
        admin: adminId
    })

    const populateGroup = await Group.findById(group._id)
    .populate("members", "fullName username profilePic isOnline lastSeen")
    .populate("admin", "fullName username profilePic")

    uniqueMembers.forEach((membId) => {
        if(membId.toString() === adminId.toString()) return
        const memberSocketId = getOnlineUsers(membId.toString())
        if(memberSocketId){
            io.to(memberSocketId).emit("addedToGroup", populateGroup)
        }
    })

    return res
    .status(201)
    .json(new apiResponse(201, populateGroup, "group created successfully"))
})

export const getMyGroups = asyncHandler(async(req, res) => {
    const userId = req.user._id

    const groups = await Group.find({members: userId})
    .populate("members", "fullName username profilePic isOnline lastSeen")
    .populate("admin", "fullName username profilePic")
    .sort({upadtedAt: -1})

    return res
    .status(200)
    .json(new apiResponse(200, groups, "Groups fetched successfully"))
})

export const getGroupById = asyncHandler(async(req, res) => {
    const {groupId} = req.params
    const  userId = req.user._id

    const group = await Group.findById(groupId)
    .populate("members", "fullName username profilePic isOnline lastSeen")
    .populate("admin", "fullName username profilePic")

    if(!group){
        throw new apiError(404, "group not found")
    }

    const isMember = group.members.some(
        (memb) => memb._id.toString() === userId.toString()
    )

    if(!isMember){
        throw new apiError(403, "you are not the member of this group")
    }

    return res
    .status(200)
    .json(new apiResponse(200, group, "group fetched successfully"))
})

export const updateGroup = asyncHandler(async(req, res) => {
    const {groupId} = req.params
    const {groupName} = req.body
    const userId = req.user._id

    const group = await Group.findById(groupId)

    if(!group){
        throw new apiError(404, "group not found")
    }

    if(group.admin.toString() !== userId.toString()){
        throw new apiError(403, "only admin can update group details")
    }

    if(!groupName?.trim() && !req.file){
        throw new apiError(403, "no fields provided to update")
    }

    let groupImgUrl = group.groupImage

    if(req.file){
        if(group.groupImage){
            const segment = group.groupImage.split("/")
            const oldPublicId = segment[segment.length - 1].split(".")[0]
            await deleteFromCloudinary(oldPublicId, "image")
        }

        const uploadRes = await uploadOnCloudinary(req.file.path)
        if(!uploadRes){
            throw new apiError(500, "failed to upload group image")
        }

        groupImgUrl = uploadRes.secure_url
    }

    const updatedGroup = await Group.findByIdAndUpdate(
        groupId,
        {
            $set: {
                ...(groupName?.trim() && {groupName: groupName.trim()}),
                groupImage: groupImgUrl
            }
        },
        {new: true}
    )
    .populate("members", "fullName username profilePic isOnline lastSeen")
    .populate("admin", "fullName username profilePic")

    updatedGroup.members.forEach((memb) => {
        const memberSocketId = getOnlineUsers(memb._id.toString())
        if(memberSocketId){
            io.to(memberSocketId).emit("groupUpdated", updatedGroup)
        }
    })

    return res
    .status(200)
    .json(new apiResponse(200, updatedGroup, "group updated successfully"))
})

export const addMembers = asyncHandler(async(req, res) => {
    const {groupId} = req.params
    const {members} = req.body
    const userId = req.user._id

    if(!members || !Array.isArray(members) || members.length === 0){
        throw new apiError(400, "provide at least one memberId to add")
    }

    const group = await Group.findById(groupId)

    if(!group){
        throw new apiError(404, "group not found")
    }

    if(group.admin.toString() !== userId.toString()){
        throw new apiError(403, "only group admin can add members")
    }

    const validUser = await User.find({_id: {$in: members}})

    if(validUser.length !== members.length){
        throw new apiError(400, "one or more memberId's are invalid")
    }

    const existingIds = group.members.map((memb) => memb.toString())
    const newMember = members.filter(
        (id) => !existingIds.includes(id.toString())
    )

    if(newMember.length === 0){
        throw new apiError(400, "users already exists in group")
    }

    const updatedGroup = await Group.findByIdAndUpdate(
        groupId,
        {$push: {members: {$each: newMember}}},
        {new: true}
    )
    .populate("members", "fullName username profilePic isOnline lastSeen")
    .populate("admin", "fullName username profilePic")

    newMember.forEach((membId) => {
        const memberSocketId = getOnlineUsers(membId.toString())

        if(memberSocketId){
            io.to(memberSocketId).emit("addedToGroup", updatedGroup)
        }
    })

    existingIds.forEach((membId) => {
        const memberSocketId = getOnlineUsers(membId)
        if(memberSocketId){
            io.to(memberSocketId).emit("groupUpdated", updatedGroup)
        }
    })

    return res
    .status(200)
    .json(new apiResponse(200, updatedGroup, "members added successfully"))
})

export const removeMember = asyncHandler(async(req, res) => {
    const {groupId, memberId} = req.params
    const userId = req.user._id

    const group = await Group.findById(groupId)

    if(!group){
        throw new apiError(404, "group not found")
    }

    if(group.admin.toString() !== userId.toString()){
        throw new apiError(403, "only group admin can remove members")
    }

    if(memberId.toString() === group.admin.toString()){
        throw new apiError(400, "admin cannot be removed from the group")
    }

    const isMember = group.members.some((memb) => memb.toString() === memberId)

    if(!isMember){
        throw new apiError(400, "user is not member of this group")
    }

    const updatedGroup = await Group.findByIdAndUpdate(
        groupId,
        {
            $pull: {members: memberId},
        },
        {new: true}
    )
    .populate("members", "fullName username profilePic isOnline lastSeen")
    .populate("admin", "fullName username profilePic")

    const removeSocketId = getOnlineUsers(memberId.toString())
    if(removeSocketId){
        io.to(removeSocketId).emit("removedFromGroup", {
            groupId,
            groupName: group.groupName
        })
    }

    updatedGroup.members.forEach((memb) => {
        const memberSocketId = getOnlineUsers(memb._id.toString())
        if(memberSocketId){
            io.to(memberSocketId).emit("groupUpdated", updatedGroup)
        }
    })

    return res
    .status(200)
    .json(new apiResponse(200, updatedGroup, "member removed successfully"))
})

export const leaveGroup = asyncHandler(async(req, res) => {
    const {groupId} = req.params
    const userId = req.user._id

    const group = await Group.findById(groupId)

    if(!group){
        throw new apiError(404, "group not found")
    }

    const isMember = group.members.some((memb) => 
    memb.toString() === userId.toString())

    if(!isMember){
        throw new apiError(403, "you are not the member of this group")
    }

    if(group.admin.toString() === userId.toString()){
        throw new apiError(400, "admin must transfter admin status then leave the group")
    }

    const updatedGroup = await Group.findByIdAndUpdate(
        groupId,
        {$pull: {members: userId}},
        {new: true}
    )
    .populate("members", "fullName username profilePic isOnline lastSeen")
    .populate("admin", "fullName username profilePic")

    updatedGroup.members.forEach((memb) => {
        const memberSocketId = getOnlineUsers(memb._id.toString())
        if(memberSocketId){
            io.to(memberSocketId).emit("groupUpdated", updatedGroup)
        }
    })

    return res
    .status(200)
    .json(new apiResponse(200, {}, "you have left the group"))
})

export const transferAdmin = asyncHandler(async(req, res) => {
    const {groupId} = req.params
    const {newAdminId} = req.body
    const userId = req.user._id

    if(!newAdminId){
        throw new apiError(400, "provide new admin id")
    }

    const group = await Group.findById(groupId)

    if(!group){
        throw new apiError(404, "group not found")
    }

    if(group.admin.toString() !== userId.toString()){
        throw new apiError(403, "only admin can transfer admin status")
    }

    const isMember = group.members.some(
        (memb) => memb.toString() === newAdminId.toString()
    )

    if(!isMember){
        throw new apiError(400, "new admin must already be a member of the group")
    }

    const updatedGroup = await Group.findByIdAndUpdate(
        groupId,
        {$set: {admin: newAdminId}},
        {new: true}
    )
    .populate("members", "fullName username profilePic isOnline lastSeen")
    .populate("admin", "fullName username profilePic")

    updatedGroup.members.forEach((membId) => {
        const memberSocketId = getOnlineUsers(membId._id.toString())
        if(memberSocketId){
            io.to(memberSocketId).emit("groupUpdated", updatedGroup)
        }
    })

    return res
    .status(200)
    .json(new apiResponse(200, updatedGroup, "admin transferred successfully"))
})

export const deleteGroup = asyncHandler(async(req, res) => {
    const {groupId} = req.params
    const userId = req.user._id

    const group = await Group.findById(groupId)

    if(!group){
        throw new apiError(404, "group not found")
    }

    if(group.admin.toString() !== userId.toString()){
        throw new apiError(403, "only admin can delete group")
    }

    if(group.groupImage){
        const segments = group.groupImage.split("/")
        const publicId = segments[segments.length - 1].split(".")[0]
        await deleteFromCloudinary(publicId, "image")
    }

    const groupMessage = await Message.find({groupId})

    const deleteMedaiPromises = groupMessage
    .filter((msg) => msg.publicId)
    .map((msg) => deleteFromCloudinary(msg.publicId))

    await Promise.allSettled(deleteMedaiPromises)
    await Message.deleteMany({groupId})

    const memberId = group.members.map((memb) => memb.toString())

    await Group.findByIdAndDelete(groupId)

    memberId.forEach((membId) => {
        const memberSocketId = getOnlineUsers(membId)
        if(memberSocketId){
            io.to(memberSocketId).emit("groupDeleted", {
                groupId,
                groupName: group.groupName
            })
        }
    })

    return res
    .status(200)
    .json(new apiResponse(200, {groupId}, "group deleted successfully"))
})