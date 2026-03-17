const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const { ensureDatabase, testConnection, initializeDatabase } = require("./config/db");

const app = express();
const frontendDistPath = path.join(__dirname, "..", "frontend-react", "dist");
const swaggerPath = path.join(__dirname, "docs", "swagger.json");

/* ================= MIDDLEWARE ================= */
app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Cross-Origin-Resource-Policy", "same-site");
  res.setHeader("X-XSS-Protection", "0");
  next();
});

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

/* ================= MYSQL CONNECTION ================= */

/* ================= SERVE FRONTEND ================= */

app.use("/api/docs", express.static(path.join(__dirname, "docs")));
app.use(express.static(frontendDistPath));

/* ================= API ROUTES ================= */

const authRoutes = require("./routes/authRoutes");
const requestRoutes = require("./routes/requestRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/requests", requestRoutes);
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

/* ================= DEFAULT ROUTE ================= */

app.get("/", (req, res) => {
  res.sendFile(path.join(frontendDistPath, "index.html"));
});

app.get("/api/docs/swagger.json", (_req, res) => {
  res.sendFile(swaggerPath);
});

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return next();
  }

  return res.sendFile(path.join(frontendDistPath, "index.html"));
});

/* ================= START SERVER ================= */

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await ensureDatabase();
    await testConnection();
    await initializeDatabase();
    console.log("MySQL connected");

    const server = app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });

    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        console.error(`Port ${PORT} is already in use. Stop the existing process, then restart.`);
        process.exit(1);
      }

      console.error("Server failed to start:", error.message);
      process.exit(1);
    });
  } catch (error) {
    console.error("MySQL connection failed:", error.message);
    process.exit(1);
  }
}

startServer();
