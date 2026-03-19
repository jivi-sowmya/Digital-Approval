const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const { ensureDatabase, testConnection, initializeDatabase } = require("./config/db");

const app = express();

/* ================= PATHS ================= */
const frontendDistPath = path.join(__dirname, "..", "frontend-react", "dist");
const swaggerPath = path.join(__dirname, "docs", "swagger.json");
const frontendIndexPath = path.join(frontendDistPath, "index.html");

/* ================= MIDDLEWARE ================= */

// ✅ FIXED CORS (ALLOW ALL — IMPORTANT FOR NOW)
app.use(cors());

// ✅ JSON parser
app.use(express.json({ limit: "2mb" }));

// ✅ Security headers
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Cross-Origin-Resource-Policy", "same-site");
  res.setHeader("X-XSS-Protection", "0");
  next();
});

// ✅ Logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const durationMs = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs}ms`
    );
  });
  next();
});

/* ================= SERVE FRONTEND ================= */

app.use("/api/docs", express.static(path.join(__dirname, "docs")));

if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
}

/* ================= API ROUTES ================= */

const authRoutes = require("./routes/authRoutes");
const requestRoutes = require("./routes/requestRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/requests", requestRoutes);

// ✅ Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

/* ================= DEFAULT ROUTE ================= */

app.get("/", (req, res) => {
  if (fs.existsSync(frontendIndexPath)) {
    return res.sendFile(frontendIndexPath);
  }

  return res.json({
    service: "digital-approval-backend",
    status: "running",
    docs: "/api/docs/",
    health: "/api/health"
  });
});

app.get("/api/docs/swagger.json", (_req, res) => {
  res.sendFile(swaggerPath);
});

// SPA fallback
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return next();
  }

  if (fs.existsSync(frontendIndexPath)) {
    return res.sendFile(frontendIndexPath);
  }

  return res.status(404).json({ error: "Route not found" });
});

/* ================= START SERVER ================= */

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await ensureDatabase();
    await testConnection();
    await initializeDatabase();

    console.log("✅ MySQL connected");

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });

    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        console.error(`❌ Port ${PORT} already in use`);
        process.exit(1);
      }

      console.error("❌ Server failed:", error.message);
      process.exit(1);
    });
  } catch (error) {
    console.error("❌ MySQL connection failed:", error.message);
    process.exit(1);
  }
}

startServer();