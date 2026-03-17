import React from "react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import useEmployeeNotifications from "../hooks/useEmployeeNotifications";
import LoadingScreen from "../components/LoadingScreen";

function MyRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const notif = useEmployeeNotifications();

  useEffect(() => {
    if (localStorage.getItem("userRole") !== "employee") {
      navigate("/");
      return;
    }

    const fetchData = async () => {
      try {
        const res = await API.get("/requests");
        setRequests(Array.isArray(res.data) ? res.data : []);
      } catch (_err) {
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

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
              <span className="notif-icon" aria-hidden="true">🔔</span>
              {notif.unreadCount > 0 ? <span className="notif-badge">{notif.unreadCount}</span> : null}
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
          <Link to="/employee-dashboard">Dashboard</Link>
          <Link to="/create-request">Create Request</Link>
          <Link className="active" to="/my-requests">My Requests</Link>
        </aside>
        <main className="content">
          <h1>My Requests</h1>
          <p className="subtitle">Track submitted requests and manager comments.</p>
          <div id="requestList">
            {loading ? <LoadingScreen label="Loading your requests..." /> : null}
            {!loading && requests.length === 0 ? <p>No requests yet</p> : null}
            {requests.map((request) => (
              <div className="request-card" key={request.id}>
                <div className="request-left">
                  <div className="request-type">{request.type}</div>
                  <div className="request-title">{request.title}</div>
                  <div className="request-meta">{request.description}</div>
                  {request.managerComment ? (
                    <div className="employee-manager-note">
                      <span className="employee-manager-note-label">Manager Comment</span>
                      <p>{request.managerComment}</p>
                    </div>
                  ) : null}
                </div>
                <div className={`status ${request.status}`}>{request.status}</div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </>
  );
}

export default MyRequests;
