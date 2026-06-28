import Project from "../models/Project.js";
import Task from "../models/Task.js";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";

const projectPopulate = [
  { path: "createdBy", select: "name email" },
  { path: "members", select: "name email role isActive" }
];

export const canAccessProject = (project, userId) => {
  const id = String(userId);
  return (
    String(project.createdBy?._id || project.createdBy) === id ||
    project.members.some((member) => String(member?._id || member) === id)
  );
};

export const getProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({
    $or: [{ createdBy: req.user._id }, { members: req.user._id }]
  })
    .populate(projectPopulate)
    .sort({ updatedAt: -1 });

  res.json(projects);
});

export const createProject = asyncHandler(async (req, res) => {
  const { title, description, members = [] } = req.body;

  if (!title) {
    res.status(400);
    throw new Error("Project title is required");
  }

  const memberIds = [...new Set([String(req.user._id), ...members])];
  const validMembers = await User.find({ _id: { $in: memberIds }, isActive: true }).select("_id");

  const project = await Project.create({
    title,
    description,
    createdBy: req.user._id,
    members: validMembers.map((member) => member._id)
  });

  res.status(201).json(await project.populate(projectPopulate));
});

export const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }

  if (String(project.createdBy) !== String(req.user._id) && req.user.role !== "admin") {
    res.status(403);
    throw new Error("Only the project owner can update this project");
  }

  const { title, description, members } = req.body;
  project.title = title ?? project.title;
  project.description = description ?? project.description;

  if (Array.isArray(members)) {
    const memberIds = [...new Set([String(project.createdBy), ...members])];
    const validMembers = await User.find({ _id: { $in: memberIds }, isActive: true }).select("_id");
    project.members = validMembers.map((member) => member._id);
  }

  await project.save();
  res.json(await project.populate(projectPopulate));
});

export const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }

  if (String(project.createdBy) !== String(req.user._id) && req.user.role !== "admin") {
    res.status(403);
    throw new Error("Only the project owner can delete this project");
  }

  await Task.deleteMany({ project: project._id });
  await project.deleteOne();

  res.json({ message: "Project and its tasks deleted" });
});

export const getProjectMembers = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id).populate(projectPopulate);

  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }

  if (!canAccessProject(project, req.user._id) && req.user.role !== "admin") {
    res.status(403);
    throw new Error("You are not a member of this project");
  }

  res.json(project.members);
});
