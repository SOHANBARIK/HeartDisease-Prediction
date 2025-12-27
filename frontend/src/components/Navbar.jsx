import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // ✅ Added useNavigate
import logo from "./image/logo.PNG"; 
import HeartFormModal from "./HeartFormModal"; 

const Navbar = () => {
  const [showPredictModal, setShowPredictModal] = useState(false);
  const navigate = useNavigate(); // ✅ Initialize navigation

  // ✅ Check if user is logged in
  const isLoggedIn = !!localStorage.getItem("medinauts_token");

  // ✅ Logout Function
  const handleLogout = () => {
    localStorage.removeItem("medinauts_token");
    alert("Logged out successfully!");
    window.location.href = "/"; // Refresh page to reset state
  };

  // ✅ Handle Predict Click (Security Check)
  const handlePredictClick = () => {
    if (isLoggedIn) {
      setShowPredictModal(true);
    } else {
      alert("🔒 You must be logged in to use the Prediction feature.");
      navigate("/login");
    }
  };

  return (
    <>
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "15px 40px",
          backgroundColor: "#fff",
          color: "#d32f2f",
          position: "sticky",
          top: 0,
          zIndex: 1000,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        {/* 1. Logo and Name */}
        <div 
          className="tour-logo" 
          style={{ display: "flex", alignItems: "center", gap: "15px", cursor: "pointer" }}
          onClick={() => navigate("/")}
        >
          <img
            src={logo}
            alt="Logo"
            style={{
              width: "55px",
              height: "55px",
              borderRadius: "12px", 
              transition: "all 0.3s ease",
              boxShadow: "0 0 0 rgba(0,0,0,0)", 
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 8px 20px rgba(211, 47, 47, 0.6)";
              e.currentTarget.style.transform = "translateY(-3px)"; 
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 0 0 rgba(0,0,0,0)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          />
          <h1
            style={{
              fontSize: "30px",
              fontWeight: "600",
              margin: 0,
              color: "#d32f2f",
            }}
          >
            MediNauts
          </h1>
        </div>

        {/* 2. Links */}
        <div style={{ display: "flex", alignItems: "center", gap: "30px", fontSize: "18px", fontWeight: "500" }}>
          
          <NavLink to="/" className="tour-nav-home">
            Home
          </NavLink>
          
          <NavLink to="/collaborators" className="tour-nav-team">
            Our Team
          </NavLink>
          
          <NavLink to="/contact" className="tour-nav-contact">
            Contact
          </NavLink>

          {/* ✅ Predict Link - Now checks login status */}
          <span
            className="tour-nav-predict"
            style={{ cursor: "pointer", color: "#d32f2f" }}
            onClick={handlePredictClick}
            onMouseEnter={(e) => e.target.style.color = "#b71c1c"}
            onMouseLeave={(e) => e.target.style.color = "#d32f2f"}
          >
            Predict
          </span>

          {/* ✅ DYNAMIC LOGIN/LOGOUT BUTTON */}
          {isLoggedIn ? (
            <button 
              onClick={handleLogout}
              style={{
                backgroundColor: "#d32f2f",
                color: "white",
                padding: "8px 20px",
                borderRadius: "20px",
                border: "none",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "16px",
                marginLeft: "10px"
              }}
            >
              Logout
            </button>
          ) : (
            <Link 
              to="/login"
              style={{
                textDecoration: "none",
                color: "#d32f2f",
                border: "2px solid #d32f2f",
                padding: "6px 20px",
                borderRadius: "20px",
                fontWeight: "bold",
                marginLeft: "10px",
                transition: "0.3s"
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#d32f2f";
                e.target.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "transparent";
                e.target.style.color = "#d32f2f";
              }}
            >
              Login
            </Link>
          )}

        </div>
      </nav>

      {/* Predict Modal */}
      {showPredictModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 2000,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "rgba(255,255,255,0.3)", 
            backdropFilter: "blur(8px)", 
          }}
          onClick={() => setShowPredictModal(false)}
        >
          <div
            style={{
              background: "#fff",
              padding: "30px",
              borderRadius: "16px",
              maxWidth: "900px",
              width: "90%",
              maxHeight: "90%",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()} 
          >
            <HeartFormModal close={() => setShowPredictModal(false)} />
          </div>
        </div>
      )}
    </>
  );
};

// 3. Custom NavLink (Unchanged)
const NavLink = ({ to, children, className }) => {
  const [hover, setHover] = React.useState(false);

  return (
    <Link
      to={to}
      className={className} 
      style={{
        color: hover ? "#b71c1c" : "#d32f2f",
        textDecoration: "none",
        transition: "0.3s",
        fontWeight: "500",
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {children}
    </Link>
  );
};

export default Navbar;
