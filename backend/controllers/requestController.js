const { pool } = require("../config/db");
const { buildRequestListQuery, getListOptions } = require("../utils/requestQuery");

async function runStatement(sql, params = []) {
  if (!Array.isArray(params) || params.length === 0) {
    return pool.query(sql);
  }

  return pool.execute(sql, params);
}

function toDbStatus(status) {
  const value = String(status || "").toLowerCase();
  if (value === "approved") return "approved";
  if (value === "rejected") return "rejected";
  return "pending";
}

function parseDbStatus(status) {
  const value = String(status || "").toLowerCase();
  if (value === "approved" || value === "rejected" || value === "pending") return value;
  return null;
}

function toApiStatus(status) {
  const value = String(status || "").toLowerCase();
  if (value === "approved") return "Approved";
  if (value === "rejected") return "Rejected";
  return "Pending";
}

function validateCreatePayload(payload) {
  const errors = [];
  const type = String(payload.type || "").trim();
  const title = String(payload.title || "").trim();

  if (!title) errors.push("Title is required");
  if (title.length > 255) errors.push("Title is too long");
  if (!type) errors.push("Request type is required");

  if (type === "Leave") {
    if (!payload.fromDate || !payload.toDate) {
      errors.push("Leave request requires fromDate and toDate");
    }
  }

  if (type === "Purchase" || type === "Expense") {
    const amount = Number(payload.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      errors.push("Purchase/Expense request requires a valid amount");
    }
  }

  if (type === "Loan") {
    const loanAmount = Number(payload.loanAmount);
    if (!Number.isFinite(loanAmount) || loanAmount <= 0) {
      errors.push("Loan request requires a valid loanAmount");
    }
  }

  if (payload.documentProofs && !Array.isArray(payload.documentProofs)) {
    errors.push("documentProofs must be an array");
  }

  return errors;
}

function normalizeRequestRow(row) {
  let parsedProofs = [];
  try {
    parsedProofs = row.document_proofs ? JSON.parse(row.document_proofs) : [];
  } catch (_error) {
    parsedProofs = [];
  }

  return {
    _id: String(row.id),
    id: row.id,
    employeeName: row.employee_name,
    employeeEmail: row.employee_email,
    type: row.type,
    title: row.title,
    description: row.description,
    fromDate: row.from_date,
    toDate: row.to_date,
    purchaseDate: row.purchase_date,
    amount: row.amount,
    loanType: row.loan_type,
    loanAmount: row.loan_amount,
    documentProofs: parsedProofs,
    managerComment: row.manager_comment,
    managerCommentUpdatedAt: row.manager_comment_updated_at,
    status: toApiStatus(row.status),
    createdAt: row.created_at
  };
}

exports.createRequest = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "employee") {
      return res.status(403).json({ error: "Only employees can create requests" });
    }

    const {
      employeeName = null,
      employeeEmail = null,
      type = null,
      title,
      description = null,
      fromDate = null,
      toDate = null,
      purchaseDate = null,
      amount = null,
      loanType = null,
      loanAmount = null,
      documentProofs = [],
      managerComment = null,
      managerCommentUpdatedAt = null,
      status,
      employeeId
    } = req.body;

    const validationErrors = validateCreatePayload(req.body || {});
    if (validationErrors.length > 0) {
      return res.status(400).json({ error: validationErrors.join(", ") });
    }

    const [users] = await pool.execute(
      "SELECT id, name, email FROM users WHERE id = ? LIMIT 1",
      [req.user.id]
    );

    if (!users.length) {
      return res.status(401).json({ error: "Authenticated user not found" });
    }

    const authenticatedUser = users[0];
    const resolvedEmployeeId = authenticatedUser.id;

    const normalizedStatus = toDbStatus(status);

    const [result] = await pool.execute(
      `INSERT INTO requests (
        title,
        description,
        employee_id,
        employee_name,
        employee_email,
        type,
        from_date,
        to_date,
        purchase_date,
        amount,
        loan_type,
        loan_amount,
        document_proofs,
        manager_comment,
        manager_comment_updated_at,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description,
        resolvedEmployeeId,
        employeeName || authenticatedUser.name,
        (employeeEmail ? String(employeeEmail).trim().toLowerCase() : null) || authenticatedUser.email,
        type,
        fromDate,
        toDate,
        purchaseDate,
        amount,
        loanType,
        loanAmount,
        JSON.stringify(Array.isArray(documentProofs) ? documentProofs : []),
        managerComment,
        managerCommentUpdatedAt,
        normalizedStatus
      ]
    );

    const [rows] = await pool.execute("SELECT * FROM requests WHERE id = ?", [result.insertId]);

    return res.json({
      message: "Request saved to MySQL",
      data: normalizeRequestRow(rows[0])
    });
  } catch (error) {
    console.error("createRequest failed:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.getRequests = async (req, res) => {
  try {
    const options = getListOptions(req.query);

    if (!options.advanced) {
      let rows;
      if (req.user.role === "manager") {
        [rows] = await pool.execute("SELECT * FROM requests ORDER BY created_at DESC, id DESC");
      } else {
        [rows] = await pool.execute(
          "SELECT * FROM requests WHERE employee_id = ? ORDER BY created_at DESC, id DESC",
          [req.user.id]
        );
      }

      return res.json(rows.map(normalizeRequestRow));
    }

    const query = buildRequestListQuery({
      role: req.user.role,
      userId: req.user.id,
      page: options.page,
      pageSize: options.pageSize,
      search: options.search,
      status: options.status,
      type: options.type
    });

    const [[countRows], [rows]] = await Promise.all([
      runStatement(query.countSql, query.filters),
      runStatement(query.listSql, query.listParams)
    ]);

    const total = Number(countRows?.[0]?.total || 0);

    return res.json({
      items: rows.map(normalizeRequestRow),
      pagination: {
        page: options.page,
        pageSize: options.pageSize,
        total,
        totalPages: total > 0 ? Math.ceil(total / options.pageSize) : 1
      },
      filters: {
        search: options.search,
        status: options.status,
        type: options.type
      }
    });
  } catch (error) {
    console.error("getRequests failed:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.getRequestById = async (req, res) => {
  try {
    const requestId = Number(req.params.id);
    if (!Number.isInteger(requestId) || requestId <= 0) {
      return res.status(400).json({ error: "Invalid request id" });
    }

    let rows;
    if (req.user.role === "manager") {
      [rows] = await pool.execute("SELECT * FROM requests WHERE id = ?", [requestId]);
    } else {
      [rows] = await pool.execute(
        "SELECT * FROM requests WHERE id = ? AND employee_id = ?",
        [requestId, req.user.id]
      );
    }

    if (!rows.length) {
      return res.status(404).json({ error: "Request not found" });
    }

    return res.json(normalizeRequestRow(rows[0]));
  } catch (error) {
    console.error("getRequestById failed:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const requestId = Number(req.params.id);
    if (!Number.isInteger(requestId) || requestId <= 0) {
      return res.status(400).json({ error: "Invalid request id" });
    }

    const status = parseDbStatus(req.body.status);
    if (!status || status === "pending") {
      return res.status(400).json({ error: "Status must be Approved or Rejected" });
    }

    const managerComment = req.body.managerComment ? String(req.body.managerComment).trim() : null;

    const [result] = await pool.execute(
      "UPDATE requests SET status = ?, manager_comment = ? WHERE id = ?",
      [status, managerComment, requestId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Request not found" });
    }

    const [rows] = await pool.execute("SELECT * FROM requests WHERE id = ?", [requestId]);
    return res.json(normalizeRequestRow(rows[0]));
  } catch (error) {
    console.error("updateStatus failed:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.saveManagerComment = async (req, res) => {
  try {
    const requestId = Number(req.params.id);
    if (!Number.isInteger(requestId) || requestId <= 0) {
      return res.status(400).json({ error: "Invalid request id" });
    }

    const managerComment = String(req.body.managerComment || "");
    const managerCommentUpdatedAt = String(req.body.managerCommentUpdatedAt || new Date().toLocaleString());
    if (managerComment.length > 2000) {
      return res.status(400).json({ error: "Manager comment is too long" });
    }

    const [result] = await pool.execute(
      "UPDATE requests SET manager_comment = ?, manager_comment_updated_at = ? WHERE id = ?",
      [managerComment, managerCommentUpdatedAt, requestId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Request not found" });
    }

    const [rows] = await pool.execute("SELECT * FROM requests WHERE id = ?", [requestId]);
    return res.json(normalizeRequestRow(rows[0]));
  } catch (error) {
    console.error("saveManagerComment failed:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteRequest = async (req, res) => {
  try {
    const requestId = Number(req.params.id);
    if (!Number.isInteger(requestId) || requestId <= 0) {
      return res.status(400).json({ error: "Invalid request id" });
    }

    const [result] = await pool.execute("DELETE FROM requests WHERE id = ?", [requestId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Request not found" });
    }

    return res.json({ message: "Request deleted" });
  } catch (error) {
    console.error("deleteRequest failed:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};
