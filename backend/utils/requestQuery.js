const VALID_STATUSES = new Set(["pending", "approved", "rejected"]);

function normalizeStatus(status) {
  const value = String(status || "").trim().toLowerCase();
  return VALID_STATUSES.has(value) ? value : "";
}

function normalizeText(value) {
  return String(value || "").trim();
}

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
}

function getListOptions(query = {}) {
  const page = parsePositiveInt(query.page, 1);
  const pageSize = Math.min(parsePositiveInt(query.pageSize, 6), 20);
  const search = normalizeText(query.search);
  const status = normalizeStatus(query.status);
  const type = normalizeText(query.type);
  const advanced =
    query.advanced === "true" ||
    search.length > 0 ||
    status.length > 0 ||
    type.length > 0 ||
    Object.prototype.hasOwnProperty.call(query, "page") ||
    Object.prototype.hasOwnProperty.call(query, "pageSize");

  return {
    advanced,
    page,
    pageSize,
    search,
    status,
    type
  };
}

function buildRequestListQuery({ role, userId, page, pageSize, search, status, type }) {
  const where = [];
  const params = [];

  if (role !== "manager") {
    where.push("employee_id = ?");
    params.push(userId);
  }

  if (status) {
    where.push("status = ?");
    params.push(status);
  }

  if (type) {
    where.push("type = ?");
    params.push(type);
  }

  if (search) {
    where.push(
      "(title LIKE ? OR description LIKE ? OR employee_name LIKE ? OR employee_email LIKE ?)"
    );
    const searchValue = `%${search}%`;
    params.push(searchValue, searchValue, searchValue, searchValue);
  }

  const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const offset = (page - 1) * pageSize;
  const safeLimit = Number.isInteger(pageSize) && pageSize > 0 ? pageSize : 6;
  const safeOffset = Number.isInteger(offset) && offset >= 0 ? offset : 0;

  return {
    whereClause,
    filters: params,
    countSql: `SELECT COUNT(*) AS total FROM requests ${whereClause}`,
    listSql: `
      SELECT *
      FROM requests
      ${whereClause}
      ORDER BY created_at DESC, id DESC
      LIMIT ${safeLimit} OFFSET ${safeOffset}
    `,
    listParams: params
  };
}

module.exports = {
  buildRequestListQuery,
  getListOptions
};
