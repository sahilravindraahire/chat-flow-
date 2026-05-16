import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// helpers

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_TOKEN_EXPIRE || "8d",
  });
};

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  maxAge: 8 * 24 * 60 * 60 * 1000,
};

// register

export const register = asyncHandler(async (req, res) => {

  //  console.log("register req.body →", req.body)

  const { fullName, username, password, gender, profilePic } = req.body;

  if (!fullName.trim() || !username.trim() || !password.trim() || !gender) {
    throw new apiError(400, "all fileds are required");
  }

  const existingUser = await User.findOne({ username: username.toLowerCase() });

  if (existingUser) {
    throw new apiError(409, "username is already taken");
  }

  if (password.length < 8) {
    throw new apiError(400, "password must be atleast 8 characters");
  }

  // const hashedPassword = await bcrypt.hash(password, 10);

  const defaultProfilePic = profilePic
    ? profilePic
    : gender === "male"
      ? `https://api.dicebear.com/9.x/adventurer/svg?seed=${username}&gender=male`
      : `https://api.dicebear.com/9.x/adventurer/svg?seed=${username}&gender=female`;

  const user = await User.create({
    fullName,
    username: username.toLowerCase(),
    password,
    profilePic: defaultProfilePic,
    gender,
  });

  const token = generateToken(user._id);

  const createdUser = await User.findById(user._id).select("-password");

  return res
    .status(201)
    .cookie("token", token, cookieOptions)
    .json(new apiResponse(201, createdUser, "user created successfully"));
});

// login

export const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  //  console.log("req.body →", req.body)
  //  console.log("username →", username)
  //  console.log("password →", password)

  if (!username.trim() || !password.trim()) {
    throw new apiError(400, "both fileds are required");
  }

  const user = await User.findOne({ username: username.toLowerCase() }).select("+password")

  if (!user) {
    throw new apiError(401, "user not found");
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    throw new apiError(401, "Invalid username or password");
  }

  user.isOnline = true;
  user.lastSeen = new Date();
  await user.save({ validateBeforeSave: false });

  const token = generateToken(user._id);

  const loggedInUser = await User.findById(user._id).select("-password");

  return res
    .status(200)
    .cookie("token", token, cookieOptions)
    .json(
      new apiResponse(
        200,
        {user: loggedInUser, token},
        "loggedin successfully",
      ),
    );
});

// logout

export const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { isOnline: false, lastSeen: new Date() },
    { new: true },
  );

  return res
    .status(200)
    .clearCookie("token", "", cookieOptions)
    .json(new apiResponse(200, "logged out successful"));
});

// get user

export const getMe = asyncHandler(async (req, res) => {
  return res.status(200).json(new apiResponse(200, req.user));
});

// update profile

export const updateProfile = asyncHandler(async (req, res) => {
  const { fullName, username } = req.body;
  const profilePicLocalPath = req.files?.profilePic?.[0]?.path;
  const userId = req.user._id;

  if (!username || !fullName || !profilePicLocalPath) {
    throw new apiError(400, "No fields are provided to update");
  }

  const user = await User.findById(userId);

  if (username) {
    const takenUsername = await User.findOne({
      username: username.toLowerCase().trim(),
      _id: { $ne: userId },
    });

    if (takenUsername) {
      throw new apiError(409, "username is already taken");
    }
  }

  let profilePicUrl = user.profilePic;

  if (profilePicLocalPath) {
    const response = await uploadOnCloudinary(profilePicLocalPath);
    if (!response) {
      throw new apiError(500, "failed to upload updated profile pic");
    }
    profilePicUrl = response.secure_url;
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        username: username.toLowerCase().trim(),
        fullName: fullName.trim(),
        profilePic: profilePicUrl,
      },
    },
    { new: true },
  ).select("-password");

  return res
    .status(400)
    .json(new apiResponse(200, updatedUser, "profile updated successfully"));
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const userId = req.user._id;

  if (!currentPassword.trim() || !newPassword.trim()) {
    throw new apiError(400, "Both fileds are m=empty");
  }

  if (newPassword.length < 8) {
    throw new apiError(400, "password atleast contain 8 characters");
  }

  const user = await User.findById(userId).select("+password");

  if (!user) {
    throw new apiError(404, "user not found");
  }

  const isPassCorrect = await bcrypt.compare(currentPassword, user.password);

  if (!isPassCorrect) {
    throw new apiError(401, "currentPassword is incorrect");
  }

  const isSamePassword = await bcrypt.compare(newPassword, user.password);

  if (isSamePassword) {
    throw new apiError(400, "new password is same as your current password");
  }

  const hashedPass = await bcrypt.hash(newPassword, 10);

  user.password = hashedPass;

//   user.password = newPassword;

  await user.save();

  return res
    .status(200)
    .json(new apiResponse(200, "password updated successfully"));
});

export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ _id: { $ne: req.user._id } })
    .select("-password")
    .sort({ isOnline: -1, fullName: 1 });

  return res.status(200).json(new apiResponse(200, users));
});

export const getUserById = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId).select("-password");

  return res
    .status(200)
    .json(new apiResponse(200, user, "user fetched successfully"));
});
