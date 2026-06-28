import Project from "../models/Project.js";
import Task from "../models/Task.js";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import bcrypt from "bcryptjs";



export const getUsers = asyncHandler(async (req, res) => {
 const users = await User.find().select("-password").sort({ createdAt: -1 });
  // const users = await User.find().select("").sort({ createdAt: -1 });
  res.json(users);
});

export const updateUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (String(user._id) === String(req.user._id)) {
    res.status(400);
    throw new Error("Admins cannot deactivate their own account");
  }

  user.isActive = req.body.isActive ?? !user.isActive;
  await user.save();
  res.json({ message: "User status updated", user });
});
//Change password of other users
export const resetPassword = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

// console.log(`length of password:, ${newPassword.length}`);
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    const user = await User.findById(id);
    

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }
   if (user.role === "admin") {
        res.status(403);
        throw new Error("Cannot reset another admin's password.");
    }
    user.password = newPassword;
    await user.save();


    res.status(200).json({
      success: true,
      message: "Password reset successfully.",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
});


export const deleteUser = asyncHandler(async (req, res) => {
  if (String(req.params.id) === String(req.user._id)) {
    res.status(400);
    throw new Error("Admins cannot delete their own account");
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const ownedProjects = await Project.find({ createdBy: user._id }).select("_id");
  await Task.deleteMany({
    $or: [
      { assignedTo: user._id },
      { createdBy: user._id },
      { project: { $in: ownedProjects.map((project) => project._id) } }
    ]
  });
  await Project.updateMany({ members: user._id }, { $pull: { members: user._id } });
  await Project.deleteMany({ createdBy: user._id });
  await user.deleteOne();

  res.json({ message: "User and related owned records deleted" });
});


export const getAllProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find()
    .populate("createdBy", "name email")
    .populate("members", "name email role isActive")
    .sort({ updatedAt: -1 });
  res.json(projects);
});

export const deleteProjectAsAdmin = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }

  await Task.deleteMany({ project: project._id });
  await project.deleteOne();
  res.json({ message: "Project and its tasks deleted" });
});

export const getDashboard = asyncHandler(async (req, res) => {
  const [totalUsers, activeUsers, totalProjects, totalTasks, completedTasks, statusBreakdown] =
    await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      Project.countDocuments(),
      Task.countDocuments(),
      Task.countDocuments({ status: "Completed" }),
      Task.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }])
    ]);

  res.json({
    totalUsers,
    activeUsers,
    totalProjects,
    totalTasks,
    completedTasks,
    completionRate: totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0,
    statusBreakdown
  });
})

