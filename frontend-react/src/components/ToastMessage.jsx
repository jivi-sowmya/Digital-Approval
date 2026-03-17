import React from "react";

function ToastMessage({ title, message, type = "success" }) {
  if (!message) {
    return null;
  }

  return (
    <div className={`toast ${type}`} role="status" aria-live="polite">
      <div className="toast-title">{title}</div>
      <div className="toast-message">{message}</div>
    </div>
  );
}

export default ToastMessage;
