// server.js (root level)
import express from "express";
import cors from "cors";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import passport from "passport";

import config from "./src/config/env.config.js";
import connectDB from "./src/config/db.js";
import authRoutes from "./src/routes/auth.routes.js";
import errorHandler from "./src/middleware/errorHandler.js";


// ✅ LOAD PASSPORT CONFIG
import "./src/config/passport.js";

const app = express();

// ================= DATABASE CONNECTION =================
await connectDB();

// ================= SECURITY MIDDLEWARE =================
app.use(helmet());

// ================= ✅ FIXED CORS CONFIG =================
const allowedOrigins = [
  "http://localhost:5173",
  "https://plm-frontend-prod.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow server-to-server tools like Postman
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true
  })
);

// ================= PASSPORT INIT =================
app.use(passport.initialize());

// ================= RATE LIMIT =================
const limiter = rateLimit({
  windowMs: config.security.rateLimitWindow,
  max: config.security.rateLimitMax,
  message: "Too many requests from this IP, please try again later"
});
app.use("/api/", limiter);

// ================= BODY PARSERS =================
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(mongoSanitize());

// ================= ROUTES =================
app.use("/api/auth", authRoutes);

// ================= HEALTH CHECK =================
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date(),
    environment: config.server.env,
    database: "connected"
  });
});

// ================= ROOT =================
app.get("/", (req, res) => {
  res.json({
    message: "PLM Backend API",
    version: "1.0.0",
    docs: "/api/docs",
    health: "/health"
  });
});

// ================= 404 HANDLER =================
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// ================= GLOBAL ERROR HANDLER =================
app.use(errorHandler);

// ================= SERVER START =================
const PORT = config.server.port;

const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════╗
║           PLM Backend Server Started              ║
╠════════════════════════════════════════════════════╣
║  Environment: ${config.server.env.padEnd(37)} ║
║  Port:        ${PORT.toString().padEnd(37)} ║
║  API URL:     http://localhost:${PORT}/api${" ".repeat(17)} ║
║  Health:      http://localhost:${PORT}/health${" ".repeat(14)} ║
╚════════════════════════════════════════════════════╝
  `);
});

// ================= PROCESS SAFETY =================
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION! 💥 Shutting down...");
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on("SIGTERM", () => {
  console.log("👋 SIGTERM RECEIVED. Shutting down gracefully");
  server.close(() => {
    console.log("💥 Process terminated!");
  });
});

export default app;
