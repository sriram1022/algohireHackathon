
import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.middleware.js";

export function getCurrentUser(req: AuthRequest, res: Response) {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
}
