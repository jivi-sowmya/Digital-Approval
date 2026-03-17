import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import API from "../services/api";
import useEmployeeNotifications from "../hooks/useEmployeeNotifications";

function EmployeeDashboard() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const notif = useEmployeeNotifications();

  useEffect(() => {
    if (localStorage.getItem("userRole") !== "employee") {
      navigate("/");
      return;
    }

    const run = async () => {
      try {
        const res = await API.get("/requests");
        setRequests(Array.isArray(res.data) ? res.data : []);
      } catch (_err) {
        setRequests([]);
      }
    };
    run();
  }, [navigate]);

  const pending = useMemo(() => requests.filter((r) => r.status === "Pending").length, [requests]);
  const approved = useMemo(() => requests.filter((r) => r.status === "Approved").length, [requests]);
  const rejected = useMemo(() => requests.filter((r) => r.status === "Rejected").length, [requests]);

  function logout() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("currentUserEmail");
    localStorage.removeItem("currentUserName");
    navigate("/");
  }

  return (
    <>
      <header className="navbar">
        <div className="logo">ApprovalFlow</div>
        <div className="nav-right">
          <div ref={notif.rootRef} className={`notif-bell ${notif.isOpen ? "open" : ""}`}>
            <button type="button" onClick={notif.toggleOpen} aria-label="Notifications">
              <span className="notif-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 16v-5a6 6 0 00-12 0v5" /><path d="M13.73 21a2 2 0 01-3.46 0" /><path d="M5 16h14" /></svg></span>
              {notif.unreadCount > 0 ? (
                <span className="notif-badge">{notif.unreadCount}</span>
              ) : null}
            </button>
            <div className="notif-panel">
              <div className="notif-header">
                <span>Notifications</span>
                <button type="button" onClick={notif.clearAll}>Clear</button>
              </div>
              {notif.items.length === 0 ? (
                <div className="notif-empty">No updates yet.</div>
              ) : (
                notif.items.map((item) => (
                  <div className={`notif-item ${item.status?.toLowerCase()}`} key={item.id}>
                    <div className="notif-title">{item.title}</div>
                    <div className="notif-meta">Status: {item.status}</div>
                  </div>
                ))
              )}
            </div>
          </div>
          <span className="user">{localStorage.getItem("currentUserName") || "Employee"}</span>
          <button onClick={logout}>Logout</button>
        </div>
      </header>

      <div className="layout">
        <aside className="sidebar">
          <Link className="active" to="/employee-dashboard">
            <span className="nav-icon home" aria-hidden="true" />
            Dashboard
          </Link>
          <Link to="/create-request">
            <span className="nav-icon add" aria-hidden="true" />
            Create Request
          </Link>
          <Link to="/my-requests">
            <span className="nav-icon file" aria-hidden="true" />
            My Requests
          </Link>
        </aside>

        <main className="content">
          <h1>Dashboard</h1>
          <p className="subtitle">
            Welcome back, {localStorage.getItem("currentUserName") || "Employee"} — overview of your requests
          </p>
          <div className="cards">
            <div className="card"><h3>Total Requests</h3><p>{requests.length}</p></div>
            <div className="card pending"><h3>Pending</h3><p>{pending}</p></div>
            <div className="card approved"><h3>Approved</h3><p>{approved}</p></div>
            <div className="card rejected"><h3>Rejected</h3><p>{rejected}</p></div>
          </div>
        </main>
      </div>
    </>
  );
}

export default EmployeeDashboard;
