import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import { createBatch } from "../services/batch.service.js";
import { getBatchesByCentre } from "../services/batch.service.js";

export async function createBatchController(
  req: AuthRequest,
  res: Response
) {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const batch = await createBatch(userId, req.body);

    return res.status(201).json({
      success: true,
      message: "Batch created successfully",
      batch,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create batch";

    return res.status(400).json({
      success: false,
      message,
    });
  }
}

export async function getBatchesController(
  req: AuthRequest,
  res: Response
) {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const batches = await getBatchesByCentre(userId);

    return res.status(200).json({
      success: true,
      count: batches.length,
      batches,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch batches";

    return res.status(400).json({
      success: false,
      message,
    });
  }
}