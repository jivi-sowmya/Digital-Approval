const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../config/db");

/* ================= HELPERS ================= */

function normalizeRole(role) {
  return role === "manager" ? "manager" : "employee";
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

/* ================= SIGNUP ================= */

exports.signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    console.log("Signup request:", { name, email, role }); // ✅ DEBUG

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const trimmedName = String(name).trim();

    if (!trimmedName || trimmedName.length > 255) {
      return res.status(400).json({ message: "Invalid name" });
    }

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const normalizedRole = normalizeRole(role);

    // Check existing user
    const [existingUsers] = await pool.execute(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [normalizedEmail]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await pool.execute(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [trimmedName, normalizedEmail, hashedPassword, normalizedRole]
    );

    return res.status(201).json({
      message: "Signup successful",
      user: {
        id: result.insertId,
        name: trimmedName,
        email: normalizedEmail,
        role: normalizedRole
      }
    });

  } catch (error) {
    console.error("Signup error FULL:", error); // ✅ VERY IMPORTANT
    return res.status(500).json({
      message: "Signup failed",
      error: error.message
    });
  }
};

/* ================= LOGIN ================= */

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("Login request:", email); // ✅ DEBUG

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const [rows] = await pool.execute(
      "SELECT id, name, email, password, role FROM users WHERE email = ? LIMIT 1",
      [normalizedEmail]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = rows[0];

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Login error FULL:", error); // ✅ VERY IMPORTANT
    return res.status(500).json({
      message: "Login failed",
      error: error.message
    });
  }
};