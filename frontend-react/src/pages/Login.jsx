import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import API from "../services/api";
import ToastMessage from "../components/ToastMessage";

function Login() {

  const navigate = useNavigate();

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ title: "", message: "", type: "success" });

  const handleLogin = async (e) => {

    e.preventDefault();
    setLoading(true);
    setToast({ title: "", message: "", type: "success" });

    try{

      const res = await API.post("/auth/login",{
        email,
        password
      });

      const user = res.data.user || {};
      localStorage.setItem("authToken",res.data.token || "");
      localStorage.setItem("userRole",user.role || "");
      localStorage.setItem("currentUserEmail",String(user.email || email).toLowerCase());
      localStorage.setItem("currentUserName",user.name || "User");

      if(user.role === "manager"){
        setToast({ title: "Success", message: "Manager login successful.", type: "success" });
        navigate("/manager-dashboard");
      }else{
        setToast({ title: "Success", message: "Employee login successful.", type: "success" });
        navigate("/employee-dashboard");
      }

    }catch(err){
      setToast({
        title: "Login Failed",
        message: err?.response?.data?.message || "Login failed",
        type: "error"
      });
    } finally {
      setLoading(false);
    }

  };

  return(
    <div className="auth-page login-page">
      <div className="signup-container">
        <h2>Login</h2>
        <p className="subtitle">Welcome back</p>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" onChange={(e)=>setEmail(e.target.value)} required disabled={loading} />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" onChange={(e)=>setPassword(e.target.value)} required disabled={loading} />
          </div>

          <button type="submit" disabled={loading}>{loading ? "Signing In..." : "Login"}</button>
        </form>

        <p className="switch-text">
          Don&apos;t have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
      <ToastMessage title={toast.title} message={toast.message} type={toast.type} />
    </div>
  );
}

export default Login;
