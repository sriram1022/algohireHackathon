
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { prisma } from "./config/prisma.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import batchRoutes from "./routes/batch.routes.js";
dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;


app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
  })
);

app.use(express.json());


app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CertiFlow backend is running",
    timestamp: new Date().toISOString(),
  });
});


app.get("/api/db-check", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      success: true,
      message: "PostgreSQL connected successfully",
    });
  } catch (error) {
    console.error("Database connection failed:", error);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

app.use("/api/auth", authRoutes);

app.use("/api/users", userRoutes);

app.use("/api/batches", batchRoutes);



app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});


app.listen(PORT, () => {
  console.log(`CertiFlow server running on http://localhost:${PORT}`);
});
