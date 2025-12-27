import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Get backend URL
const BACKEND_BASE = (process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

const Login = () => {
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // New state for visibility
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (isRegistering) {
      try {
        const res = await fetch(`${BACKEND_BASE}/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });
        if (!res.ok) throw new Error("Registration failed. Username might exist.");
        alert("Account created! Please log in.");
        setIsRegistering(false);
      } catch (err) {
        setError(err.message);
      }
    } else {
      const formData = new URLSearchParams();
      formData.append("username", username);
      formData.append("password", password);

      try {
        const res = await fetch(`${BACKEND_BASE}/token`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: formData,
        });
        
        if (!res.ok) throw new Error("Invalid credentials");
        
        const data = await res.json();
        localStorage.setItem("medinauts_token", data.access_token);
        navigate("/"); 
      } catch (err) {
        setError(err.message);
      }
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={{color: "#b71c1c"}}>{isRegistering ? "Create Account" : "Medinauts Login"}</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}
        
        <form onSubmit={handleSubmit} style={formStyle}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={inputStyle}
            required
          />
          
          {/* Password Wrapper */}
          <div style={passwordWrapperStyle}>
            <input
              type={showPassword ? "text" : "password"} // Toggle type here
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{...inputStyle, width: "100%"}} // Fill the wrapper
              required
            />
            {/* Toggle Icon */}
            <span 
              onClick={() => setShowPassword(!showPassword)} 
              style={toggleIconStyle}
            >
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>

          <button type="submit" style={buttonStyle}>
            {isRegistering ? "Sign Up" : "Log In"}
          </button>
        </form>

        <p style={{ marginTop: 20, fontSize: 14 }}>
          {isRegistering ? "Already have an account? " : "New to Medinauts? "}
          <span 
            onClick={() => setIsRegistering(!isRegistering)} 
            style={linkStyle}
          >
            {isRegistering ? "Log In" : "Register Here"}
          </span>
        </p>
      </div>
    </div>
  );
};

// --- STYLES ---
const containerStyle = { height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#f0f2f5" };
const cardStyle = { padding: 40, background: "white", borderRadius: 10, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", textAlign: "center", width: 350 };
const formStyle = { display: "flex", flexDirection: "column", gap: 15, marginTop: 20 };
const inputStyle = { padding: 12, borderRadius: 5, border: "1px solid #ddd", fontSize: 16, boxSizing: "border-box" };
const buttonStyle = { padding: 12, background: "#b71c1c", color: "white", border: "none", borderRadius: 5, fontSize: 16, cursor: "pointer" };
const linkStyle = { color: "#007bff", cursor: "pointer", fontWeight: "bold" };

// New Styles for the toggle
const passwordWrapperStyle = { position: "relative", display: "flex", alignItems: "center" };
const toggleIconStyle = { 
  position: "absolute", 
  right: "10px", 
  cursor: "pointer", 
  fontSize: "18px",
  userSelect: "none" 
};

export default Login;
