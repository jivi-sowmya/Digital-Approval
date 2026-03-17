const express = require("express");
const router = express.Router();
const { signup, login } = require("../controllers/authController");

/* ================= TEST ROUTE ================= */

router.get("/test", (req, res) => {
    res.json({ message: "Auth API working" });
});

/* ================= LOGIN ================= */

router.post("/signup", signup);
router.post("/login", login);

module.exports = router;
