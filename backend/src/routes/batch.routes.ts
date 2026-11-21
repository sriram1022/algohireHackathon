import { Router } from "express";
import { UserRole } from "@prisma/client";

import {
  createBatchController,
  getBatchesController,
} from "../controllers/batch.controller.js";

import { authenticate, authorize } from "../middleware/auth.middleware.js";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize(UserRole.TRAINING_CENTRE),
  createBatchController
);

router.get(
  "/",
  authenticate,
  authorize(UserRole.TRAINING_CENTRE),
  getBatchesController
);

export default router;