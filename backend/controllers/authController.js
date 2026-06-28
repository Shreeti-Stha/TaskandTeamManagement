import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import generateToken from "../utils/generateToken.js";

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  isActive: user.isActive,
  createdAt: user.createdAt,
  password: user.password
});

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Name, email, and password are required");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(409);
    throw new Error("Email is already registered");
  }

  const isFirstUser = (await User.countDocuments()) === 0;
  const user = await User.create({
    name,
    email,
    password,
    role: isFirstUser ? "admin" : role === "admin" ? "user" : "user"
  });

  res.status(201).json({
    user: sanitizeUser(user),
    token: generateToken(user)
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error("Your account has been deactivated");
  }

  res.json({
    user: sanitizeUser(user),
    token: generateToken(user)
  });
});

export const getProfile = asyncHandler(async (req, res) => {
  res.json(sanitizeUser(req.user));
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (email && email !== req.user.email) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409);
      throw new Error("Email is already in use");
    }
  }

  req.user.name = name ?? req.user.name;
  req.user.email = email ?? req.user.email;
  if (password) req.user.password = password;

  await req.user.save();

  res.json({
    user: sanitizeUser(req.user),
    token: generateToken(req.user)
  });
});
