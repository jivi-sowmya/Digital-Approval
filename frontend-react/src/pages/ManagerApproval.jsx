import React, { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import API from "../services/api";
import LoadingScreen from "../components/LoadingScreen";
import ToastMessage from "../components/ToastMessage";

const requestTypes = ["", "Leave", "Purchase", "Expense", "Loan", "Work From Home"];

function ManagerApproval() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [requests, setRequests] = useState([]);
  const [comments, setComments] = useState({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [toast, setToast] = useState({ title: "", message: "", type: "success" });
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 6,
    total: 0,
    totalPages: 1
  });

  const deferredSearch = useDeferredValue(search.trim());
  const isSingleRequestView = Boolean(id);

  useEffect(() => {
    if (!toast.message) {
      return undefined;
    }

    const timer = setTimeout(() => {
      setToast({ title: "", message: "", type: "success" });
    }, 2600);

    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (localStorage.getItem("userRole") !== "manager") {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);
      try {
        if (isSingleRequestView) {
          const res = await API.get(`/requests/${id}`);
          if (ignore) return;
          const item = res.data ? [res.data] : [];
          setRequests(item);
          setComments(
            item.reduce((acc, request) => {
              acc[request.id] = request.managerComment || "";
              return acc;
            }, {})
          );
          setPagination({ page: 1, pageSize: 6, total: item.length, totalPages: 1 });
          return;
        }

        const res = await API.get("/requests", {
          params: {
            advanced: true,
            search: deferredSearch || undefined,
            status: statusFilter || undefined,
            type: typeFilter || undefined,
            page,
            pageSize: 6
          }
        });

        if (ignore) return;

        const items = Array.isArray(res.data?.items) ? res.data.items : [];
        setRequests(items);
        setComments((prev) => {
          const next = { ...prev };
          items.forEach((request) => {
            if (typeof next[request.id] !== "string") {
              next[request.id] = request.managerComment || "";
            }
          });
          return next;
        });
        setPagination(
          res.data?.pagination || {
            page: 1,
            pageSize: 6,
            total: items.length,
            totalPages: 1
          }
        );
      } catch (err) {
        if (ignore) return;
        setRequests([]);
        setPagination({ page: 1, pageSize: 6, total: 0, totalPages: 1 });
        setToast({
          title: "Load Failed",
          message: err?.response?.data?.error || "Failed to load requests",
          type: "error"
        });
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, [deferredSearch, id, isSingleRequestView, navigate, page, statusFilter, typeFilter]);

  async function refreshAfterAction(successMessage) {
    if (isSingleRequestView) {
      const res = await API.get(`/requests/${id}`);
      const item = res.data ? [res.data] : [];
      setRequests(item);
      setComments((prev) => ({
        ...prev,
        [item[0]?.id || ""]: item[0]?.managerComment || prev[item[0]?.id || ""] || ""
      }));
      setPagination({ page: 1, pageSize: 6, total: item.length, totalPages: 1 });
    } else {
      const res = await API.get("/requests", {
        params: {
          advanced: true,
          search: deferredSearch || undefined,
          status: statusFilter || undefined,
          type: typeFilter || undefined,
          page,
          pageSize: 6
        }
      });
      setRequests(Array.isArray(res.data?.items) ? res.data.items : []);
      setPagination(res.data?.pagination || { page: 1, pageSize: 6, total: 0, totalPages: 1 });
    }

    setToast({
      title: "Updated",
      message: successMessage,
      type: "success"
    });
  }

  async function updateStatus(requestId, status) {
    setActionLoading(`status-${requestId}-${status}`);
    try {
      await API.patch(`/requests/${requestId}/status`, {
        status,
        managerComment: comments[requestId] || ""
      });
      await refreshAfterAction(`Request ${status.toLowerCase()} successfully.`);
    } catch (err) {
      setToast({
        title: "Update Failed",
        message: err?.response?.data?.error || "Failed to update status",
        type: "error"
      });
    } finally {
      setActionLoading("");
    }
  }

  async function deleteRequest(requestId) {
    setActionLoading(`delete-${requestId}`);
    try {
      await API.delete(`/requests/${requestId}`);
      if (!isSingleRequestView && requests.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        await refreshAfterAction("Request deleted successfully.");
      }
    } catch (err) {
      setToast({
        title: "Delete Failed",
        message: err?.response?.data?.error || "Failed to delete request",
        type: "error"
      });
    } finally {
      setActionLoading("");
    }
  }

  async function saveComment(requestId) {
    setActionLoading(`comment-${requestId}`);
    try {
      await API.patch(`/requests/${requestId}/comment`, {
        managerComment: comments[requestId] || "",
        managerCommentUpdatedAt: new Date().toLocaleString()
      });
      await refreshAfterAction("Manager comment saved.");
    } catch (err) {
      setToast({
        title: "Save Failed",
        message: err?.response?.data?.error || "Failed to save comment",
        type: "error"
      });
    } finally {
      setActionLoading("");
    }
  }

  function logout() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("currentUserEmail");
    localStorage.removeItem("currentUserName");
    navigate("/");
  }

  const pending = useMemo(
    () => requests.filter((request) => request.status === "Pending"),
    [requests]
  );
  const history = useMemo(
    () => requests.filter((request) => request.status !== "Pending"),
    [requests]
  );

  return (
    <>
      <header className="navbar">
        <div className="logo">ApprovalFlow</div>
        <div className="nav-right">
          <span className="user">{localStorage.getItem("currentUserName") || "Manager"}</span>
          <button onClick={logout}>Logout</button>
        </div>
      </header>
      <div className="layout">
        <aside className="sidebar">
          <Link to="/manager-dashboard">Dashboard</Link>
          <Link className="active" to="/manager-approval">Approvals</Link>
        </aside>
        <main className="content">
          <h1>Manager Approvals</h1>
          <p className="subtitle">Review requests with search, filters, comments, and page controls.</p>

          {!isSingleRequestView ? (
            <section className="filter-panel">
              <div className="filter-grid">
                <label className="filter-field">
                  <span>Search</span>
                  <input
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value);
                      setPage(1);
                    }}
                    placeholder="Title, employee, email, description"
                  />
                </label>
                <label className="filter-field">
                  <span>Status</span>
                  <select
                    value={statusFilter}
                    onChange={(event) => {
                      setStatusFilter(event.target.value);
                      setPage(1);
                    }}
                  >
                    <option value="">All statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </label>
                <label className="filter-field">
                  <span>Type</span>
                  <select
                    value={typeFilter}
                    onChange={(event) => {
                      setTypeFilter(event.target.value);
                      setPage(1);
                    }}
                  >
                    {requestTypes.map((option) => (
                      <option key={option || "all"} value={option}>
                        {option || "All types"}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="filter-summary">
                <span>{pagination.total} matching request(s)</span>
                <button
                  type="button"
                  className="btn delete"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("");
                    setTypeFilter("");
                    setPage(1);
                  }}
                >
                  Reset Filters
                </button>
              </div>
            </section>
          ) : null}

          {loading ? <LoadingScreen label="Loading approvals..." /> : null}

          {!loading ? (
            <>
              <div id="managerRequestList">
                {pending.length === 0 ? <div className="empty-state">No pending approvals found.</div> : null}
                {pending.map((request) => (
                  <div className="request-card modern" key={request.id}>
                    <div className="left">
                      <div className="tag">{request.type}</div>
                      <h3>{request.title}</h3>
                      <p>{request.description || "No description provided."}</p>
                      <span className="small">
                        {request.employeeName} - {request.employeeEmail}
                      </span>
                      <Link className="btn view" to={`/manager-approval/${request.id}/view`}>
                        View
                      </Link>
                    </div>
                    <div className="approval-side">
                      <div className="manager-comment-box">
                        <label className="manager-comment-label">Manager Comment</label>
                        <textarea
                          className="manager-comment-input"
                          rows="3"
                          value={comments[request.id] ?? ""}
                          onChange={(event) =>
                            setComments((prev) => ({
                              ...prev,
                              [request.id]: event.target.value
                            }))
                          }
                        />
                        <button
                          className="btn comment"
                          onClick={() => saveComment(request.id)}
                          disabled={actionLoading === `comment-${request.id}`}
                        >
                          {actionLoading === `comment-${request.id}` ? "Saving..." : "Save Comment"}
                        </button>
                      </div>
                      <div className="actions">
                        <button
                          className="btn approve"
                          onClick={() => updateStatus(request.id, "Approved")}
                          disabled={actionLoading === `status-${request.id}-Approved`}
                        >
                          {actionLoading === `status-${request.id}-Approved` ? "Approving..." : "Approve"}
                        </button>
                        <button
                          className="btn reject"
                          onClick={() => updateStatus(request.id, "Rejected")}
                          disabled={actionLoading === `status-${request.id}-Rejected`}
                        >
                          {actionLoading === `status-${request.id}-Rejected` ? "Rejecting..." : "Reject"}
                        </button>
                        <button
                          className="btn delete"
                          onClick={() => deleteRequest(request.id)}
                          disabled={actionLoading === `delete-${request.id}`}
                        >
                          {actionLoading === `delete-${request.id}` ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <h2>History</h2>
              <div id="historyList">
                {history.length === 0 ? <div className="empty-state">No approved or rejected requests found.</div> : null}
                {history.map((request) => (
                  <div className="history-card" key={`history-${request.id}`}>
                    <div>
                      <b>{request.title}</b>
                      <span className="small">{request.type}</span>
                      {request.managerComment ? (
                        <span className="small">
                          <b>Manager:</b> {request.managerComment}
                        </span>
                      ) : null}
                    </div>
                    <span className={`badge ${String(request.status || "").toLowerCase()}`}>{request.status}</span>
                  </div>
                ))}
              </div>

              {!isSingleRequestView ? (
                <div className="pagination-bar">
                  <button
                    type="button"
                    className="btn view"
                    disabled={pagination.page <= 1}
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                  >
                    Previous
                  </button>
                  <span>
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    type="button"
                    className="btn view"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => setPage((current) => Math.min(pagination.totalPages, current + 1))}
                  >
                    Next
                  </button>
                </div>
              ) : null}
            </>
          ) : null}
        </main>
      </div>
      <ToastMessage title={toast.title} message={toast.message} type={toast.type} />
    </>
  );
}

export default ManagerApproval;
