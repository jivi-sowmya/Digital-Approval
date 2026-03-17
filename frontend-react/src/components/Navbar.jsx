import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="container">
      <div className="card">
        <Link to="/">Login</Link>
        <Link to="/signup">Signup</Link>
      </div>
    </nav>
  );
}

export default Navbar;
