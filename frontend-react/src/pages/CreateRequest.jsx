
import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import useEmployeeNotifications from "../hooks/useEmployeeNotifications";

const requestTypeOptions = ["Leave", "Purchase", "Expense", "Loan", "Work From Home"];
const loanTypeOptions = ["Personal", "Home", "Vehicle", "Education"];

function CreateRequest() {
  const navigate = useNavigate();

  const [type, setType] = useState("Leave");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [fromTime, setFromTime] = useState("");
  const [toDate, setToDate] = useState("");
  const [toTime, setToTime] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [amount, setAmount] = useState("");
  const [billFile, setBillFile] = useState(null);
  const [loanType, setLoanType] = useState("");
  const [typeOpen, setTypeOpen] = useState(false);
  const [loanTypeOpen, setLoanTypeOpen] = useState(false);
  const [uiAlert, setUiAlert] = useState("");
  const notif = useEmployeeNotifications();

  const fromDateRef = useRef(null);
  const toDateRef = useRef(null);
  const purchaseDateRef = useRef(null);
  const fromTimeRef = useRef(null);
  const toTimeRef = useRef(null);
  const wfhStartRef = useRef(null);
  const wfhEndRef = useRef(null);
  const wfhRequestRef = useRef(null);

  const fromDatePicker = useRef(null);
  const toDatePicker = useRef(null);
  const purchaseDatePicker = useRef(null);
  const fromTimePicker = useRef(null);
  const toTimePicker = useRef(null);
  const wfhStartPicker = useRef(null);
  const wfhEndPicker = useRef(null);
  const wfhRequestPicker = useRef(null);

  const [loanAmount, setLoanAmount] = useState("");
  const [loanPurpose, setLoanPurpose] = useState("");
  const [identityProof, setIdentityProof] = useState(null);
  const [salaryProof, setSalaryProof] = useState(null);
  const [bankStatement, setBankStatement] = useState(null);
  const [supportDoc, setSupportDoc] = useState(null);
  const [toast, setToast] = useState("");
  const [toastType, setToastType] = useState("success");

  // WFH fields
  const [wfhEmployeeId, setWfhEmployeeId] = useState("");
  const [wfhEmployeeName, setWfhEmployeeName] = useState("");
  const [wfhDepartment, setWfhDepartment] = useState("");
  const [wfhRequestDate, setWfhRequestDate] = useState("");
  const [wfhStartDate, setWfhStartDate] = useState("");
  const [wfhEndDate, setWfhEndDate] = useState("");
  const [wfhDays, setWfhDays] = useState(0);
  const [wfhReason, setWfhReason] = useState("");
  const [wfhWorkPlan, setWfhWorkPlan] = useState("");
  const [wfhContact, setWfhContact] = useState("");

  useEffect(() => {
    if (localStorage.getItem("userRole") !== "employee") {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    const fp = window.flatpickr;
    if (!fp) return;

    const initDate = (ref, store, value, onChange) => {
      if (ref.current && !store.current) {
        store.current = fp(ref.current, {
          dateFormat: "Y-m-d",
          altInput: true,
          altFormat: "F j, Y",
          allowInput: true,
          defaultDate: value || null,
          onChange: (_, dateStr) => onChange(dateStr),
        });
      }
      if (!ref.current && store.current) {
        store.current.destroy();
        store.current = null;
      }
    };

    const initTime = (ref, store, value, onChange) => {
      if (ref.current && !store.current) {
        store.current = fp(ref.current, {
          enableTime: true,
          noCalendar: true,
          dateFormat: "H:i",
          altInput: true,
          altFormat: "h:i K",
          allowInput: true,
          defaultDate: value || null,
          onChange: (_, dateStr) => onChange(dateStr),
        });
      }
      if (!ref.current && store.current) {
        store.current.destroy();
        store.current = null;
      }
    };

    initDate(fromDateRef, fromDatePicker, fromDate, setFromDate);
    initDate(toDateRef, toDatePicker, toDate, setToDate);
    initDate(purchaseDateRef, purchaseDatePicker, purchaseDate, setPurchaseDate);
    initDate(wfhStartRef, wfhStartPicker, wfhStartDate, setWfhStartDate);
    initDate(wfhEndRef, wfhEndPicker, wfhEndDate, setWfhEndDate);
    initDate(wfhRequestRef, wfhRequestPicker, wfhRequestDate, setWfhRequestDate);
    initTime(fromTimeRef, fromTimePicker, fromTime, setFromTime);
    initTime(toTimeRef, toTimePicker, toTime, setToTime);
  }, [type]);

  useEffect(() => {
    if (fromDatePicker.current) {
      if (!fromDate) fromDatePicker.current.clear();
      else fromDatePicker.current.setDate(fromDate, false);
    }
  }, [fromDate]);

  useEffect(() => {
    if (toDatePicker.current) {
      if (!toDate) toDatePicker.current.clear();
      else toDatePicker.current.setDate(toDate, false);
    }
  }, [toDate]);

  useEffect(() => {
    if (purchaseDatePicker.current) {
      if (!purchaseDate) purchaseDatePicker.current.clear();
      else purchaseDatePicker.current.setDate(purchaseDate, false);
    }
  }, [purchaseDate]);

  useEffect(() => {
    if (fromTimePicker.current) {
      if (!fromTime) fromTimePicker.current.clear();
      else fromTimePicker.current.setDate(fromTime, false);
    }
  }, [fromTime]);

  useEffect(() => {
    if (wfhStartPicker.current) {
      if (!wfhStartDate) wfhStartPicker.current.clear();
      else wfhStartPicker.current.setDate(wfhStartDate, false);
    }
  }, [wfhStartDate]);

  useEffect(() => {
    if (wfhEndPicker.current) {
      if (!wfhEndDate) wfhEndPicker.current.clear();
      else wfhEndPicker.current.setDate(wfhEndDate, false);
    }
  }, [wfhEndDate]);

  useEffect(() => {
    if (wfhRequestPicker.current) {
      if (!wfhRequestDate) wfhRequestPicker.current.clear();
      else wfhRequestPicker.current.setDate(wfhRequestDate, false);
    }
  }, [wfhRequestDate]);

  useEffect(() => {
    const closeAll = () => {
      setTypeOpen(false);
      setLoanTypeOpen(false);
    };
    const onDocClick = (event) => {
      const target = event.target;
      if (!target.closest(".select-shell")) {
        closeAll();
      }
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  useEffect(() => {
    if (type !== "Work From Home") {
      setWfhDays(0);
      return;
    }
    if (wfhStartDate && wfhEndDate) {
      const start = new Date(wfhStartDate);
      const end = new Date(wfhEndDate);
      const diff = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
      setWfhDays(diff > 0 ? diff : 0);
    } else {
      setWfhDays(0);
    }
  }, [type, wfhStartDate, wfhEndDate]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(""), 2600);
    return () => clearTimeout(timer);
  }, [toast]);

  function logout() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("currentUserEmail");
    localStorage.removeItem("currentUserName");
    navigate("/");
  }
  function resetTypeFields(nextType) {
    setType(nextType);
    setFromDate("");
    setFromTime("");
    setToDate("");
    setToTime("");
    setPurchaseDate("");
    setAmount("");
    setBillFile(null);
    setLoanType("");
    setLoanAmount("");
    setLoanPurpose("");
    setIdentityProof(null);
    setSalaryProof(null);
    setBankStatement(null);
    setSupportDoc(null);
    setWfhEmployeeId("");
    setWfhEmployeeName("");
    setWfhDepartment("");
    setWfhRequestDate("");
    setWfhStartDate("");
    setWfhEndDate("");
    setWfhDays(0);
    setWfhReason("");
    setWfhWorkPlan("");
    setWfhContact("");
    setTitle("");
    setDescription("");
  }

  async function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  }

  async function collectDocumentProofs() {
    const fileFields = [
      { fieldId: "billInvoice", file: billFile },
      { fieldId: "identityProof", file: identityProof },
      { fieldId: "salaryProof", file: salaryProof },
      { fieldId: "bankStatement", file: bankStatement },
      { fieldId: "supportDoc", file: supportDoc },
    ];

    const proofs = [];
    for (const item of fileFields) {
      if (!item.file) continue;
      const dataUrl = await readFileAsDataURL(item.file);
      proofs.push({
        fieldId: item.fieldId,
        fileName: item.file.name,
        mimeType: item.file.type || "application/octet-stream",
        size: item.file.size || 0,
        dbPath: `localdb://requests/${Date.now()}/${item.fieldId}/${item.file.name}`,
        dataUrl,
      });
    }
    return proofs;
  }

  const create = async (e) => {
    e.preventDefault();

    try {
      if (type === "Loan") {
        const missing = [];
        if (!identityProof) missing.push("Identity Proof");
        if (!salaryProof) missing.push("Salary Proof");
        if (!bankStatement) missing.push("Bank Statement");
        if (!supportDoc) missing.push("Supporting Document");
        if (missing.length > 0) {
          setUiAlert(`${missing.join(", ")} required.`);
          return;
        }
      }

      if (type === "Work From Home") {
        const missing = [];
        if (!wfhEmployeeId.trim()) missing.push("Employee ID");
        if (!wfhEmployeeName.trim()) missing.push("Employee Name");
        if (!wfhDepartment.trim()) missing.push("Department");
        if (!wfhRequestDate) missing.push("Request Date");
        if (!wfhStartDate) missing.push("Start Date");
        if (!wfhEndDate) missing.push("End Date");
        if (wfhDays <= 0) missing.push("Number of Days");
        if (!wfhReason.trim()) missing.push("Reason");
        if (!wfhWorkPlan.trim()) missing.push("Work Plan / Tasks");
        if (!wfhContact.trim()) missing.push("Contact Number");
        const contactOk = /^[6-9]\d{9}$/.test(wfhContact.trim());
        if (!contactOk) missing.push("Valid Indian Contact Number (10 digits starting 6/7/8/9)");
        if (missing.length) {
          setUiAlert(`Please fill: ${missing.join(", ")}`);
          return;
        }
      }

      const documentProofs = await collectDocumentProofs();
      const normalizedAmount = amount ? String(amount) : null;
      const resolvedDescription =
        type === "Leave"
          ? [description, fromTime ? `From Time: ${fromTime}` : "", toTime ? `To Time: ${toTime}` : ""]
              .filter(Boolean)
              .join(" | ")
          : type === "Loan"
          ? [description, loanPurpose ? `Purpose: ${loanPurpose}` : ""].filter(Boolean).join(" | ")
          : description;

      const payload = {
        employeeName: localStorage.getItem("currentUserName") || "Employee",
        employeeEmail: localStorage.getItem("currentUserEmail") || "",
        type,
        title,
        description: resolvedDescription,
        fromDate: fromDate || null,
        toDate: toDate || null,
        purchaseDate: purchaseDate || null,
        amount: normalizedAmount,
        loanType: loanType || null,
        loanAmount: loanAmount ? String(loanAmount) : null,
        documentProofs,
        status: "Pending",
      };

      if (type === "Work From Home") {
        Object.assign(payload, {
          employeeId: wfhEmployeeId,
          wfhEmployeeName,
          wfhDepartment,
          wfhRequestDate,
          wfhStartDate,
          wfhEndDate,
          wfhDays,
          wfhReason,
          wfhWorkPlan,
          wfhContact,
        });
      }

      await API.post("/requests/create", payload);

      setToastType("success");
      setToast("Request submitted successfully.");
      setTimeout(() => navigate("/my-requests"), 900);
    } catch (err) {
      setUiAlert(err?.response?.data?.error || "Failed to create request");
    }
  };
  return (
    <>
      <header className="navbar">
        <div className="logo">ApprovalFlow</div>
        <div className="nav-right">
          <div ref={notif.rootRef} className={`notif-bell ${notif.isOpen ? "open" : ""}`}>
            <button type="button" onClick={notif.toggleOpen} aria-label="Notifications">
              🔔
              {notif.unreadCount > 0 ? <span className="notif-badge">{notif.unreadCount}</span> : null}
            </button>
            <div className="notif-panel">
              <div className="notif-header">
                <span>Notifications</span>
                <button type="button" onClick={notif.clearAll}>
                  Clear
                </button>
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
          <Link to="/employee-dashboard">🏠 Dashboard</Link>
          <Link className="active" to="/create-request">
            ➕ Create Request
          </Link>
          <Link to="/my-requests">📄 My Requests</Link>
        </aside>

        <main className="content">
          <h1>Create Request</h1>
          <p className="subtitle">Submit a new approval request</p>

          <form className="form" onSubmit={create}>
            <div className="form-group">
              <label className="label-with-icon">
                <span className="label-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 5h18v4H3z" />
                    <path d="M3 15h18v4H3z" />
                  </svg>
                </span>
                Request Type
              </label>
              <div className={`select-shell ${typeOpen ? "open" : ""}`}>
                <button type="button" className="select-trigger" onClick={() => setTypeOpen((prev) => !prev)}>
                  {type}
                  <span className="select-chevron" />
                </button>
                <div className="select-menu" role="listbox">
                  {requestTypeOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={`select-option ${type === option ? "active" : ""}`}
                      onClick={() => {
                        resetTypeFields(option);
                        setTypeOpen(false);
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {type !== "Work From Home" && (
              <>
                <div className="form-group">
                  <label className="label-with-icon">
                    <span className="label-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 7h18" />
                        <path d="M3 12h12" />
                        <path d="M3 17h8" />
                      </svg>
                    </span>
                    Title
                  </label>
                  <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>

                <div className="form-group">
                  <label className="label-with-icon">
                    <span className="label-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 4h16v16H4z" />
                        <path d="M8 8h8" />
                        <path d="M8 12h8" />
                        <path d="M8 16h6" />
                      </svg>
                    </span>
                    Description
                  </label>
                  <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
              </>
            )}

            {type === "Leave" ? (
              <div className="section-anim" key={`${type}-section`}>
                <div className="form-group">
                  <label className="label-with-icon">
                    <span className="label-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="5" width="18" height="16" rx="2" />
                        <path d="M16 3v4M8 3v4M3 11h18" />
                      </svg>
                    </span>
                    From Date
                  </label>
                  <input type="text" placeholder="Select date" ref={fromDateRef} data-guard="no-past" readOnly />
                </div>
                <div className="form-group">
                  <label className="label-with-icon">
                    <span className="label-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 7v5l3 3" />
                      </svg>
                    </span>
                    From Time
                  </label>
                  <input type="text" placeholder="Select time" ref={fromTimeRef} readOnly />
                </div>
                <div className="form-group">
                  <label className="label-with-icon">
                    <span className="label-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="5" width="18" height="16" rx="2" />
                        <path d="M16 3v4M8 3v4M3 11h18" />
                      </svg>
                    </span>
                    To Date
                  </label>
                  <input type="text" placeholder="Select date" ref={toDateRef} data-guard="no-past" readOnly />
                </div>
                <div className="form-group">
                  <label className="label-with-icon">
                    <span className="label-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 7v5l3 3" />
                      </svg>
                    </span>
                    To Time
                  </label>
                  <input type="text" placeholder="Select time" ref={toTimeRef} readOnly />
                </div>
              </div>
            ) : null}

            {(type === "Purchase" || type === "Expense") ? (
              <div className="section-anim" key={`${type}-section`}>
                <h3>Purchase / Expense Details</h3>
                <div className="form-group">
                  <label className="label-with-icon">
                    <span className="label-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="5" width="18" height="16" rx="2" />
                        <path d="M16 3v4M8 3v4M3 11h18" />
                      </svg>
                    </span>
                    Purchase Date
                  </label>
                  <input type="text" placeholder="Select date" ref={purchaseDateRef} data-guard="no-past" readOnly />
                </div>
                <div className="form-group">
                  <label className="label-with-icon">
                    <span className="label-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 3v18" />
                        <path d="M17 7.5c0-2-2.2-3.5-5-3.5s-5 1.5-5 3.5 2.2 3.5 5 3.5 5 1.5 5 3.5-2.2 3.5-5 3.5-5-1.5-5-3.5" />
                      </svg>
                    </span>
                    Amount
                  </label>
                  <input type="number" placeholder="Enter amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="label-with-icon">
                    <span className="label-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 2h9l3 3v17H6z" />
                        <path d="M15 2v4h4" />
                        <path d="M8 10h8M8 14h8M8 18h5" />
                      </svg>
                    </span>
                    Bill / Invoice
                  </label>
                  <input type="file" onChange={(e) => setBillFile(e.target.files?.[0] || null)} />
                </div>
              </div>
            ) : null}

            {type === "Loan" ? (
              <div className="section-anim" key={`${type}-section`}>
                <h3>Loan Information</h3>
                <div className="form-group">
                  <label className="label-with-icon">
                    <span className="label-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 7h18" />
                        <path d="M6 7v10" />
                        <path d="M18 7v10" />
                        <path d="M6 17h12" />
                      </svg>
                    </span>
                    Loan Type
                  </label>
                  <div className={`select-shell ${loanTypeOpen ? "open" : ""}`}>
                    <button type="button" className="select-trigger" onClick={() => setLoanTypeOpen((prev) => !prev)}>
                      {loanType || "Select Loan Type"}
                      <span className="select-chevron" />
                    </button>
                    <div className="select-menu" role="listbox">
                      <button type="button" className={`select-option ${loanType === "" ? "active" : ""}`} onClick={() => { setLoanType(""); setLoanTypeOpen(false); }}>
                        Select Loan Type
                      </button>
                      {loanTypeOptions.map((option) => (
                        <button key={option} type="button" className={`select-option ${loanType === option ? "active" : ""}`} onClick={() => { setLoanType(option); setLoanTypeOpen(false); }}>
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <label className="label-with-icon">
                    <span className="label-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 3v18" />
                        <path d="M17 7.5c0-2-2.2-3.5-5-3.5s-5 1.5-5 3.5 2.2 3.5 5 3.5 5 1.5 5 3.5-2.2 3.5-5 3.5-5-1.5-5-3.5" />
                      </svg>
                    </span>
                    Loan Amount
                  </label>
                  <input type="number" value={loanAmount} onChange={(e) => setLoanAmount(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="label-with-icon">
                    <span className="label-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 4h16v16H4z" />
                        <path d="M8 8h8" />
                        <path d="M8 12h8" />
                        <path d="M8 16h6" />
                      </svg>
                    </span>
                    Loan Purpose
                  </label>
                  <textarea value={loanPurpose} onChange={(e) => setLoanPurpose(e.target.value)} />
                </div>
                <h3>Required Documents</h3>
                <div className="upload-grid">
                  <div className="upload-card">
                    <label className="label-with-icon">
                      <span className="label-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="5" width="18" height="14" rx="2" />
                          <circle cx="9" cy="12" r="2" />
                          <path d="M13 10h5M13 14h5" />
                        </svg>
                      </span>
                      Identity Proof
                    </label>
                    <input type="file" onChange={(e) => setIdentityProof(e.target.files?.[0] || null)} />
                  </div>
                  <div className="upload-card">
                    <label className="label-with-icon">
                      <span className="label-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M4 7h16v10H4z" />
                          <path d="M8 7V5h8v2" />
                          <path d="M12 11v3" />
                        </svg>
                      </span>
                      Salary Proof
                    </label>
                    <input type="file" onChange={(e) => setSalaryProof(e.target.files?.[0] || null)} />
                  </div>
                  <div className="upload-card">
                    <label className="label-with-icon">
                      <span className="label-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 10h18" />
                          <path d="M5 10v8M9 10v8M15 10v8M19 10v8" />
                          <path d="M12 4l9 6H3z" />
                        </svg>
                      </span>
                      Bank Statement
                    </label>
                    <input type="file" onChange={(e) => setBankStatement(e.target.files?.[0] || null)} />
                  </div>
                  <div className="upload-card">
                    <label className="label-with-icon">
                      <span className="label-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M6 2h9l3 3v17H6z" />
                          <path d="M15 2v4h4" />
                          <path d="M8 10h8M8 14h8M8 18h5" />
                        </svg>
                      </span>
                      Supporting Document
                    </label>
                    <input type="file" onChange={(e) => setSupportDoc(e.target.files?.[0] || null)} />
                  </div>
                </div>
              </div>
            ) : null}

            {type === "Work From Home" ? (
              <div className="section-anim" key={`${type}-section`}>
                <h3>Work From Home</h3>
                <div className="wfh-grid">
                  <div className="form-group">
                    <label>Employee ID</label>
                    <input value={wfhEmployeeId} onChange={(e) => setWfhEmployeeId(e.target.value)} placeholder="EMP123" required />
                  </div>
                  <div className="form-group">
                    <label>Employee Name</label>
                    <input value={wfhEmployeeName} onChange={(e) => setWfhEmployeeName(e.target.value)} placeholder="Your name" required />
                  </div>
                  <div className="form-group">
                    <label>Department</label>
                    <input value={wfhDepartment} onChange={(e) => setWfhDepartment(e.target.value)} placeholder="Department" required />
                  </div>
                  <div className="form-group">
                    <label>Request Date</label>
                    <input type="text" placeholder="Select date" ref={wfhRequestRef} readOnly />
                  </div>
                  <div className="form-group">
                    <label>Start Date</label>
                    <input type="text" placeholder="Select date" ref={wfhStartRef} data-guard="no-past" readOnly />
                  </div>
                  <div className="form-group">
                    <label>End Date</label>
                    <input type="text" placeholder="Select date" ref={wfhEndRef} data-guard="no-past" readOnly />
                  </div>
                  <div className="form-group">
                    <label>Number of Days</label>
                    <input value={wfhDays || ""} readOnly className="pill-input" />
                  </div>
                  <div className="form-group">
                    <label>Contact Number</label>
                    <input value={wfhContact} onChange={(e) => setWfhContact(e.target.value)} placeholder="10-digit mobile" required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Reason for Work From Home</label>
                  <textarea value={wfhReason} onChange={(e) => setWfhReason(e.target.value)} placeholder="Explain the reason" required />
                </div>
                <div className="form-group">
                  <label>Work Plan / Tasks</label>
                  <textarea value={wfhWorkPlan} onChange={(e) => setWfhWorkPlan(e.target.value)} placeholder="Outline planned tasks" required />
                </div>
              </div>
            ) : null}

            <button className="primary-btn">Submit Request</button>
          </form>
        </main>
      </div>

      {uiAlert ? (
        <div className="ui-alert-overlay" role="dialog" aria-modal="true">
          <div className="ui-alert-card">
            <div className="ui-alert-title">Notice</div>
            <div className="ui-alert-message">{uiAlert}</div>
            <button className="ui-alert-btn" onClick={() => setUiAlert("")} type="button">
              Okay
            </button>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div className={`toast ${toastType}`} role="status" aria-live="polite">
          <div className="toast-title">Success</div>
          <div className="toast-message">{toast}</div>
        </div>
      ) : null}
    </>
  );
}

export default CreateRequest;
