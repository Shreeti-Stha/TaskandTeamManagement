import express from "express";
import { getActiveUsers } from "../controllers/userController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getActiveUsers);

export default router;
