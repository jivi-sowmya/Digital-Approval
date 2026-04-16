const mysql = require("mysql2/promise");
const { createUsersTableQuery } = require("../models/User");
const { createRequestsTableQuery } = require("../models/Request");

const dbName = process.env.DB_NAME;

// ✅ FORCE SSL (important for Aiven)
const baseConfig = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectTimeout: 20000,
  ssl: {
    rejectUnauthorized: false
  }
};

console.log("ENV CHECK:");
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_PORT:", process.env.DB_PORT);
console.log("DB_USER:", process.env.DB_USER);
console.log("SSL ENABLED ✅");

// ✅ Create pool
const pool = mysql.createPool({
  ...baseConfig,
  database: dbName,
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  queueLimit: 0
});

// ✅ Ensure DB exists
async function ensureDatabase() {
  const safeDbName = String(dbName || "").replace(/`/g, "");
  if (!safeDbName) {
    throw new Error("DB_NAME is not configured");
  }

  const connection = await mysql.createConnection({
    ...baseConfig,
    database: dbName,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${safeDbName}\``);
  } finally {
    await connection.end();
  }
}

// ✅ Test connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log("✅ MySQL Connected Successfully");
  } catch (err) {
    console.error("❌ MySQL connection failed:", err.message);
  }
}

// ✅ Initialize tables
async function initializeDatabase() {
  await pool.execute(createUsersTableQuery);
  await pool.execute(createRequestsTableQuery);
}

module.exports = {
  pool,
  ensureDatabase,
  testConnection,
  initializeDatabase
};