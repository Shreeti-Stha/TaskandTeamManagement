import express from "express";
import {
  createTask,
  deleteTask,
  getTaskSummary,
  getTasks,
  updateTask
} from "../controllers/taskController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.get("/summary", getTaskSummary);
router.route("/").get(getTasks).post(createTask);
router.route("/:id").put(updateTask).delete(deleteTask);

export default router;
