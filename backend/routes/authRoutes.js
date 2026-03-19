const express = require("express");
const router = express.Router();

// Import controllers
const { signup, login } = require("../controllers/authController");

/* ================= TEST ROUTE ================= */

router.get("/test", (req, res) => {
  res.json({ message: "Auth API working" });
});

/* ================= AUTH ROUTES ================= */

// Signup route
router.post("/signup", signup);

// Login route
router.post("/login", login);

module.exports = router;