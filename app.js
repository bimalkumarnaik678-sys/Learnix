import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

import cookieParser from "cookie-parser";
import { CORS_ORIGIN } from "./config/env.js";
import "./config/db.js"; // MongoDB connection

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import courseRoutes from "./routes/courses.js";
import videoRoutes from "./routes/videos.js";
import quizRoutes from "./routes/quizzes.js";
import aiRoutes from "./routes/ai.js";
import adminRoutes from "./routes/admin.js";
import progressRoutes from "./routes/progressRoutes.js";
import certificateRoutes from "./routes/certificateRoutes.js";
import offlineRoutes from "./routes/offlineRoutes.js";
import { notFound, errorHandler } from "./middleware/error.js";

dotenv.config(); // ✅ ensure .env variables are loaded early

const app = express();

// ✅ Core middleware
app.use(helmet());
app.use(cookieParser());
app.use(
  cors({
    origin: CORS_ORIGIN || "http://localhost:5173", // fallback for local dev
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// ✅ Static files (subtitles, assets)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/public", express.static(path.join(__dirname, "public")));

// ✅ API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/offline", offlineRoutes);

// ✅ Health check route (helps verify server running)
app.get("/", (req, res) => {
  res.json({ message: "Server is running ✅" });
});

// ✅ Global error handlers
app.use(notFound);
app.use(errorHandler);

export default app;
