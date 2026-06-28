import Project from "../models/Project.js";
import Task from "../models/Task.js";
import asyncHandler from "../utils/asyncHandler.js";
import { canAccessProject } from "./projectController.js";

const taskPopulate = [
  {
    path: "project",
    select: "title members createdBy"
  },
  {
    path: "assignedTo",
    select: "name email"
  },
  {
    path: "createdBy",
    select: "name email"
  }
];

/* =====================================================
   GET TASKS
===================================================== */

export const getTasks = asyncHandler(async (req, res) => {

  const { status, priority, project } = req.query;

  const projects = await Project.find({
    $or: [
      { createdBy: req.user._id },
      { members: req.user._id }
    ]
  }).select("_id");

  const query = {
    project: {
      $in: projects.map((item) => item._id)
    }
  };

  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (project) query.project = project;

  const tasks = await Task.find(query)
    .populate(taskPopulate)
    .sort({
      dueDate: 1,
      updatedAt: -1
    });

  res.json(tasks);

});

/* =====================================================
   CREATE TASK
===================================================== */

export const createTask = asyncHandler(async (req, res) => {

  const {
    title,
    description,
    project,
    assignedTo,
    priority,
    status,
    dueDate
  } = req.body;

  if (
    !title ||
    !project ||
    !Array.isArray(assignedTo) ||
    assignedTo.length === 0
  ) {
    res.status(400);
    throw new Error(
      "Title, project and at least one assignee are required."
    );
  }

  const targetProject = await Project.findById(project);

  if (!targetProject) {
    res.status(404);
    throw new Error("Project not found");
  }

  if (
    !canAccessProject(targetProject, req.user._id) &&
    req.user.role !== "admin"
  ) {
    res.status(403);
    throw new Error(
      "You are not a member of this project."
    );
  }

  const allMembersValid = assignedTo.every((userId) =>
    targetProject.members.some(
      (member) =>
        String(member) === String(userId)
    )
  );

  if (!allMembersValid) {
    res.status(400);
    throw new Error(
      "One or more selected assignees are not members of this project."
    );
  }

  const task = await Task.create({
    title,
    description,
    project,
    assignedTo,
    createdBy: req.user._id,
    priority,
    status,
    dueDate
  });

  res.status(201).json(
    await task.populate(taskPopulate)
  );

});

/* =====================================================
   UPDATE TASK
===================================================== */

export const updateTask = asyncHandler(async (req, res) => {

  const task = await Task.findById(req.params.id).populate("project");

  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }

  if (
    !canAccessProject(task.project, req.user._id) &&
    req.user.role !== "admin"
  ) {
    res.status(403);
    throw new Error("You cannot update this task");
  }

  const {
    title,
    description,
    assignedTo,
    priority,
    status,
    dueDate
  } = req.body;

  task.title = title ?? task.title;
  task.description = description ?? task.description;
  task.priority = priority ?? task.priority;
  task.status = status ?? task.status;
  task.dueDate = dueDate ?? task.dueDate;

  if (assignedTo !== undefined) {

    if (
      !Array.isArray(assignedTo) ||
      assignedTo.length === 0
    ) {
      res.status(400);
      throw new Error(
        "Please select at least one assignee."
      );
    }

    const allMembersValid = assignedTo.every((userId) =>
      task.project.members.some(
        (member) =>
          String(member) === String(userId)
      )
    );

    if (!allMembersValid) {
      res.status(400);
      throw new Error(
        "One or more selected assignees are not project members."
      );
    }

    task.assignedTo = assignedTo;
  }

  await task.save();

  res.json(
    await task.populate(taskPopulate)
  );

});

/* =====================================================
   DELETE TASK
===================================================== */

export const deleteTask = asyncHandler(async (req, res) => {

  const task = await Task.findById(req.params.id)
    .populate("project");

  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }

  const isOwner =
    String(task.createdBy) === String(req.user._id);

  const isProjectOwner =
    String(task.project.createdBy) === String(req.user._id);

  if (
    !isOwner &&
    !isProjectOwner &&
    req.user.role !== "admin"
  ) {
    res.status(403);
    throw new Error(
      "Only the task creator or project owner can delete this task."
    );
  }

  await task.deleteOne();

  res.json({
    message: "Task deleted"
  });

});

/* =====================================================
   TASK SUMMARY
===================================================== */

export const getTaskSummary = asyncHandler(async (req, res) => {

  const projects = await Project.find({
    $or: [
      { createdBy: req.user._id },
      { members: req.user._id }
    ]
  }).select("_id");

  const projectIds = projects.map(
    (project) => project._id
  );

  const [
    totalTasks,
    completedTasks,
    pendingTasks,
    inProgressTasks
  ] = await Promise.all([

    Task.countDocuments({
      project: {
        $in: projectIds
      }
    }),

    Task.countDocuments({
      project: {
        $in: projectIds
      },
      status: "Completed"
    }),

    Task.countDocuments({
      project: {
        $in: projectIds
      },
      status: "Pending"
    }),

    Task.countDocuments({
      project: {
        $in: projectIds
      },
      status: "In Progress"
    })

  ]);

  res.json({

    totalTasks,

    completedTasks,

    pendingTasks,

    inProgressTasks,

    progress: totalTasks
      ? Math.round(
          (completedTasks / totalTasks) * 100
        )
      : 0

  });

});