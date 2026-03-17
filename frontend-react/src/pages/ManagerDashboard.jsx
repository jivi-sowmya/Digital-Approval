import React from "react";
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function ManagerDashboard() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (localStorage.getItem("userRole") !== "manager") {
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
          <span className="user">{localStorage.getItem("currentUserName") || "Manager"}</span>
          <button onClick={logout}>Logout</button>
        </div>
      </header>

      <div className="layout">
        <aside className="sidebar">
          <Link className="active" to="/manager-dashboard">Dashboard</Link>
          <Link to="/manager-approval">Approvals</Link>
        </aside>

        <main className="content">
          <h1>Manager Dashboard</h1>
          <p className="subtitle">Overview of employee requests</p>
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

export default ManagerDashboard;
