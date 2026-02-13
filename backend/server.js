const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

/* ================= MIDDLEWARE ================= */
app.use(cors());
app.use(express.json());

/* ================= SERVE FRONTEND ================= */
app.use(express.static(path.join(__dirname, "..", "frontend")));

/* ================= DEFAULT ROUTE ================= */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "frontend", "login.html"));
});

/* ================= START SERVER ================= */
const PORT = 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
