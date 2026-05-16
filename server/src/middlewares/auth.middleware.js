import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";

export const verifyJwt = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      throw new apiError(401, "Unauthorized request");
    }

    const decodedToken = await jwt.verify(token, process.env.JWT_SECRET);
    if (!decodedToken) {
      throw new apiError(400, "Invalid token");
    }

    const user = await User.findById(decodedToken.id).select("-password");
    if (!user) {
      throw new apiError(401, "user not found");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new apiError(401, error.message || "invalid token");
  }
});
