import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getActiveUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ isActive: true }).select("name email role isActive").sort({ name: 1 });
  res.json(users);
});
