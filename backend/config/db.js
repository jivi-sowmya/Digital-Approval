const mysql = require("mysql2/promise");
const { createUsersTableQuery } = require("../models/User");
const { createRequestsTableQuery } = require("../models/Request");

const dbName = process.env.DB_NAME;
const baseConfig = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false
  },
  connectTimeout: 10000
};
const pool = mysql.createPool({
  ...baseConfig,
  database: dbName,
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  queueLimit: 0
});

async function ensureDatabase() {
  const safeDbName = String(dbName || "").replace(/`/g, "");
  if (!safeDbName) {
    throw new Error("DB_NAME is not configured");
  }

  const connection = await mysql.createConnection(baseConfig);
  try {
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${safeDbName}\``);
  } finally {
    await connection.end();
  }
}


async function testConnection() {
  const connection = await pool.getConnection();
  try {
    await connection.ping();
  } finally {
    connection.release();
  }
}

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
