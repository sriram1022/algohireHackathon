
import { Router } from "express";
import { UserRole } from "@prisma/client";
import { getCurrentUser } from "../controllers/user.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/me", authenticate, getCurrentUser);

router.get(
  "/district-only",
  authenticate,
  authorize(UserRole.DISTRICT_OFFICER),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "District officer access granted",
    });
  }
);

export default router;
