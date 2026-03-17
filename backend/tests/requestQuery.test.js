const test = require("node:test");
const assert = require("node:assert/strict");

const { buildRequestListQuery, getListOptions } = require("../utils/requestQuery");

test("getListOptions falls back to safe defaults", () => {
  const options = getListOptions({});

  assert.deepEqual(options, {
    advanced: false,
    page: 1,
    pageSize: 6,
    search: "",
    status: "",
    type: ""
  });
});

test("getListOptions normalizes advanced query values", () => {
  const options = getListOptions({
    page: "2",
    pageSize: "50",
    search: "  leave ",
    status: "Approved",
    type: "Leave"
  });

  assert.equal(options.advanced, true);
  assert.equal(options.page, 2);
  assert.equal(options.pageSize, 20);
  assert.equal(options.search, "leave");
  assert.equal(options.status, "approved");
  assert.equal(options.type, "Leave");
});

test("buildRequestListQuery limits employees to their own requests", () => {
  const query = buildRequestListQuery({
    role: "employee",
    userId: 14,
    page: 1,
    pageSize: 6,
    search: "",
    status: "",
    type: ""
  });

  assert.match(query.whereClause, /employee_id = \?/);
  assert.deepEqual(query.filters, [14]);
  assert.deepEqual(query.listParams, [14, 6, 0]);
});

test("buildRequestListQuery includes manager filters and search", () => {
  const query = buildRequestListQuery({
    role: "manager",
    userId: 1,
    page: 3,
    pageSize: 5,
    search: "alpha",
    status: "pending",
    type: "Loan"
  });

  assert.match(query.whereClause, /status = \?/);
  assert.match(query.whereClause, /type = \?/);
  assert.match(query.whereClause, /title LIKE \?/);
  assert.deepEqual(query.filters, ["pending", "Loan", "%alpha%", "%alpha%", "%alpha%", "%alpha%"]);
  assert.deepEqual(query.listParams, ["pending", "Loan", "%alpha%", "%alpha%", "%alpha%", "%alpha%", 5, 10]);
});
