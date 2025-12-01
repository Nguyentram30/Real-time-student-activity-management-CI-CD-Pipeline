import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./libs/db.js";
import authRoute from "./routes/authRouters.js";
import userRoute from "./routes/userRouters.js";
import adminRoute from "./routes/adminRouters.js";
import managerRoute from "./routes/managerRouters.js";
import cookieParser from "cookie-parser";
import { verifyAdmin, verifyManager, verifyToken } from "./Middlewares/authMiddleware.js";
import { ensureDefaultAdmin } from "./utils/ensureDefaultAdmin.js";
import { ensureDefaultManager } from "./utils/ensureDefaultManager.js";
import cors from "cors";
import activityRoute from "./routes/activityRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// middlewares
app.use(express.json());
app.use(cookieParser());
// Configure CORS to allow the client origin. In development we accept multiple localhost ports.
const clientUrl = process.env.CLIENT_URL;
const allowedOrigins = [clientUrl, "http://localhost:5173", "http://localhost:5174"].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// Serve uploaded files
import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import path from "path";
import fs from "fs";

// Tạo thư mục uploads nếu chưa có
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use("/api/uploads", express.static(uploadsDir));

// public routes
app.use("/api/auth", authRoute);
app.use("/api/activities", activityRoute);

// private routes
app.use("/api/users", verifyToken, userRoute);
app.use("/api/admin", verifyAdmin, adminRoute);
app.use("/api/manager", verifyManager, managerRoute);

connectDB()
  .then(async () => {
    await ensureDefaultAdmin();
    await ensureDefaultManager();
    app.listen(PORT, () => {
      console.log(`server bắt đầu trên cổng ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Không thể khởi động server:", error);
  });