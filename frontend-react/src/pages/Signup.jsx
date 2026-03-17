import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import API from "../services/api";
import ToastMessage from "../components/ToastMessage";

function Signup(){

  const navigate = useNavigate();
  const [name,setName] = useState("");
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [role,setRole] = useState("employee");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ title: "", message: "", type: "success" });

  const signup = async(e) => {

    e.preventDefault();
    setLoading(true);
    setToast({ title: "", message: "", type: "success" });

    try {
      await API.post("/auth/signup",{
        name,
        email,
        password,
        role
      });

      setToast({ title: "Success", message: "Account created successfully.", type: "success" });
      navigate("/");
    } catch (err) {
      setToast({
        title: "Signup Failed",
        message: err?.response?.data?.message || "Signup failed",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  return(
    <div className="auth-page">
      <div className="signup-container">
        <h2>Create Account</h2>
        <p className="subtitle">Digital Approval Workflow</p>

        <form onSubmit={signup}>
          <div className="input-group">
            <label>Name</label>
            <input placeholder="Name" onChange={(e)=>setName(e.target.value)} required disabled={loading} />
          </div>

          <div className="input-group">
            <label>Email</label>
            <input type="email" placeholder="Email" onChange={(e)=>setEmail(e.target.value)} required disabled={loading} />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input type="password" placeholder="Password" onChange={(e)=>setPassword(e.target.value)} required disabled={loading} />
          </div>

          <div className="input-group">
            <label>Role</label>
            <select onChange={(e)=>setRole(e.target.value)} value={role} disabled={loading}>
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
            </select>
          </div>

          <button disabled={loading}>{loading ? "Creating Account..." : "Signup"}</button>
        </form>

        <p className="switch-text">
          Already have an account? <Link to="/">Login</Link>
        </p>
      </div>
      <ToastMessage title={toast.title} message={toast.message} type={toast.type} />
    </div>

  );
}

export default Signup;
