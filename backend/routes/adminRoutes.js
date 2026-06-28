import express from "express";
import {
  resetPassword,
  deleteProjectAsAdmin,
  deleteUser,
  getAllProjects,
  getDashboard,
  getUsers,
  updateUserStatus
} from "../controllers/adminController.js";
import adminOnly from "../middleware/adminMiddleware.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect, adminOnly);
router.get("/dashboard", getDashboard);
router.get("/users", getUsers);
router.put("/users/:id/status", updateUserStatus);
router.delete("/users/:id", deleteUser);
router.get("/projects", getAllProjects);
router.delete("/projects/:id", deleteProjectAsAdmin);
router.put("/users/:id/password", resetPassword);
export default router;
