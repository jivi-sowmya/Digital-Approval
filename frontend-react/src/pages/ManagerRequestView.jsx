import React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import API from "../services/api";
import { renderAsync } from "docx-preview";

function parseDescription(text) {
  if (!text) return { reason: "", fromTime: "", toTime: "", purpose: "" };
  const parts = String(text).split("|").map((part) => part.trim()).filter(Boolean);
  let reasonParts = [];
  let fromTime = "";
  let toTime = "";
  let purpose = "";

  parts.forEach((part) => {
    if (part.toLowerCase().startsWith("from time:")) {
      fromTime = part.replace(/from time:\s*/i, "").trim();
      return;
    }
    if (part.toLowerCase().startsWith("to time:")) {
      toTime = part.replace(/to time:\s*/i, "").trim();
      return;
    }
    if (part.toLowerCase().startsWith("purpose:")) {
      purpose = part.replace(/purpose:\s*/i, "").trim();
      return;
    }
    reasonParts.push(part);
  });

  return { reason: reasonParts.join(" | "), fromTime, toTime, purpose };
}

function ManagerRequestView() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const viewerBodyRef = useRef(null);
  const [viewer, setViewer] = useState({ open: false, src: "", name: "", kind: "" });

  useEffect(() => {
    if (localStorage.getItem("userRole") !== "manager") {
      navigate("/");
      return;
    }

    const load = async () => {
      setNotFound(false);
      setRequest(null);
      try {
        const res = await API.get(`/requests/${id}`);
        setRequest(res.data || null);
      } catch (_err) {
        setNotFound(true);
      }
    };
    load();
  }, [id, navigate]);

  const derived = useMemo(() => parseDescription(request?.description || ""), [request]);
  const docs = Array.isArray(request?.documentProofs) ? request.documentProofs : [];

  const isPreviewable = (doc) => {
    const mime = String(doc?.mimeType || "").toLowerCase();
    const name = String(doc?.fileName || "").toLowerCase();
    if (mime.startsWith("image/")) return true;
    if (mime === "application/pdf") return true;
    if (name.endsWith(".pdf")) return true;
    if (name.match(/\.(png|jpg|jpeg|gif|webp)$/)) return true;
    return false;
  };

  const isDocx = (doc) => {
    const mime = String(doc?.mimeType || "").toLowerCase();
    const name = String(doc?.fileName || "").toLowerCase();
    if (mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") return true;
    if (name.endsWith(".docx")) return true;
    return false;
  };

  const dataUrlToArrayBuffer = (dataUrl) => {
    const base64 = String(dataUrl || "").split(",")[1] || "";
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  };

  const openDocument = (href, doc, name) => {
    if (!href) return;
    if (isDocx(doc)) {
      setViewer({ open: true, src: href, name, kind: "docx" });
      return;
    }
    if (isPreviewable(doc)) {
      const kind = String(doc?.mimeType || "").toLowerCase().startsWith("image/") ? "image" : "pdf";
      setViewer({ open: true, src: href, name, kind });
      return;
    }
    window.open(href, "_blank", "noopener,noreferrer");
  };

  const downloadDocument = async (href, fileName) => {
    if (!href) return;
    const safeName = fileName || "document";
    try {
      if (href.startsWith("data:")) {
        const link = document.createElement("a");
        link.href = href;
        link.download = safeName;
        link.rel = "noopener";
        document.body.appendChild(link);
        link.click();
        link.remove();
        return;
      }
      const response = await API.get(href, { responseType: "blob" });
      const blob = response?.data;
      if (!blob) {
        throw new Error("Download failed");
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = safeName;
      link.rel = "noopener";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (_err) {
      window.open(href, "_blank", "noopener,noreferrer");
    }
  };

  useEffect(() => {
    if (!viewer.open) return;
    if (viewer.kind !== "docx") return;
    if (!viewerBodyRef.current) return;
    try {
      viewerBodyRef.current.innerHTML = "";
      const buffer = dataUrlToArrayBuffer(viewer.src);
      renderAsync(buffer, viewerBodyRef.current, undefined, {
        className: "docx-render",
        inWrapper: false
      });
    } catch (_err) {
      // ignore render errors; user can still download
    }
  }, [viewer]);

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
          <Link to="/manager-dashboard">Dashboard</Link>
          <Link className="active" to="/manager-approval">Approvals</Link>
        </aside>
        <main className="content">
          <div className="view-header">
            <div>
              <h1>Request Details</h1>
              <p className="subtitle">Review full request information and documents</p>
            </div>
            <Link className="btn view" to="/manager-approval">Back</Link>
          </div>

          {notFound ? <p>Request not found.</p> : null}
          {!notFound && !request ? <p>Loading...</p> : null}

          {request ? (
            <div className="detail-grid">
              <section className="detail-section">
                <h3>Overview</h3>
                <div className="detail-card">
                  <div className="detail-row"><b>Title:</b> {request.title || "-"}</div>
                  <div className="detail-row"><b>Type:</b> {request.type || "-"}</div>
                  <div className="detail-row"><b>Status:</b> {request.status || "-"}</div>
                  <div className="detail-row"><b>Employee:</b> {request.employeeName || "-"}</div>
                </div>
              </section>

              {request.type === "Leave" ? (
                <section className="detail-section">
                  <h3>Leave Details</h3>
                  <div className="detail-card">
                    <div className="detail-row"><b>Reason:</b> {derived.reason || "-"}</div>
                    <div className="detail-row"><b>From Date:</b> {request.fromDate || "-"}</div>
                    <div className="detail-row"><b>To Date:</b> {request.toDate || "-"}</div>
                    <div className="detail-row"><b>From Time:</b> {derived.fromTime || "-"}</div>
                    <div className="detail-row"><b>To Time:</b> {derived.toTime || "-"}</div>
                  </div>
                </section>
              ) : null}

              {request.type === "Loan" ? (
                <>
                  <section className="detail-section">
                    <h3>Loan Details</h3>
                    <div className="detail-card">
                      <div className="detail-row"><b>Reason:</b> {derived.reason || "-"}</div>
                      <div className="detail-row"><b>Purpose:</b> {derived.purpose || "-"}</div>
                      <div className="detail-row"><b>Loan Type:</b> {request.loanType || "-"}</div>
                      <div className="detail-row"><b>Loan Amount:</b> {request.loanAmount || "-"}</div>
                    </div>
                  </section>
                  <section className="detail-section">
                    <h3>Documents</h3>
                    <div className="detail-card">
                      {docs.length === 0 ? (
                        <div className="detail-row muted">No documents uploaded.</div>
                      ) : (
                        <div className="doc-grid">
                          {docs.map((doc, idx) => {
                            const name = doc?.fileName || doc?.fieldId || `Document ${idx + 1}`;
                            const href = doc?.dataUrl || "";
                            const previewable = isPreviewable(doc);
                            return (
                              <div className="doc-card" key={`${request.id}-doc-${idx}`}>
                                <div className="doc-name">{name}</div>
                                <div className="doc-actions">
                                  <button
                                    type="button"
                                    className={`doc-btn view ${!href ? "disabled" : ""}`}
                                    onClick={() => {
                                      if (!href) return;
                                      openDocument(href, doc, name);
                                    }}
                                    disabled={!href}
                                  >
                                    View
                                  </button>
                                  {href ? (
                                    <button
                                      type="button"
                                      className="doc-btn download"
                                      onClick={() => downloadDocument(href, doc?.fileName || "document")}
                                    >
                                      Download
                                    </button>
                                  ) : (
                                    <span className="doc-btn disabled">Unavailable</span>
                                  )}
                                </div>
                                {!previewable ? (
                                  <div className="doc-note">Preview not available for this file type.</div>
                                ) : null}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </section>
                </>
              ) : null}
            </div>
          ) : null}
        </main>
      </div>
      {viewer.open ? (
        <div className="viewer-overlay" role="dialog" aria-modal="true">
          <div className="viewer-card">
            <div className="viewer-header">
              <div className="viewer-title">{viewer.name || "Document Preview"}</div>
              <button
                type="button"
                className="viewer-close"
                onClick={() => setViewer({ open: false, src: "", name: "", kind: "" })}
              >
                Close
              </button>
            </div>
            <div className="viewer-body">
              {viewer.kind === "image" ? (
                <img src={viewer.src} alt={viewer.name} />
              ) : null}
              {viewer.kind === "pdf" ? (
                <iframe title={viewer.name} src={viewer.src} />
              ) : null}
              {viewer.kind === "docx" ? (
                <div ref={viewerBodyRef} />
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default ManagerRequestView;
