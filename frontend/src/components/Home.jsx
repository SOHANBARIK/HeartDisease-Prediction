import React, { useState, useEffect } from "react";
import { FaPlay, FaHeart, FaCheck } from "react-icons/fa";
// 1. Import Router hooks
import { useNavigate, useLocation } from "react-router-dom";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import HeartFormModal from "./HeartFormModal"; 

const HomePage = () => {
  const navigate = useNavigate(); // Hook to change URL
  const location = useLocation(); // Hook to read current URL
  const [showModal, setShowModal] = useState(false);

  // 2. Setup Motion Values for the counter
  const count = useMotionValue(0); 
  const rounded = useTransform(count, (latest) => Math.round(latest).toLocaleString());

  // 3. Sync Modal State with URL
  useEffect(() => {
    // If URL is "/predict", OPEN the modal
    if (location.pathname === "/predict") {
      setShowModal(true);
    } 
    // If URL is "/" (Home), CLOSE the modal
    else {
      setShowModal(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        const backendUrl = (process.env.REACT_APP_BACKEND_URL || "").replace(/\/$/, "");
        const response = await fetch(`${backendUrl}/user-count`);
        const data = await response.json();

        animate(count, data.count, {
          duration: 2.5,
          ease: "easeOut",
        });
      } catch (error) {
        console.error("Error fetching user count:", error);
        animate(count, 50, { duration: 2 });
      }
    };

    fetchUserCount();
  }, [count]);

  // Helper to close modal by navigating back Home
  const handleClose = () => {
    navigate("/");
  };

  return (
    <div style={{ width: "100%", overflowX: "hidden", minHeight: "100vh", backgroundColor: "#fff0f2" }}> 
      
      {/* Page Content */}
      <div
        style={{
          filter: showModal ? "blur(8px) brightness(0.6)" : "none",
          transition: "filter 0.3s ease",
          minHeight: "90vh", 
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(180deg, #ffffff 0%, #ffe4e6 100%)", 
          padding: "40px 5%", 
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            maxWidth: "1200px",
            flexWrap: "nowrap", 
            gap: "4%",
          }}
        >
          {/* LEFT CONTENT (Text) */}
          <div style={{ flex: "1.2", minWidth: "0", textAlign: "left" }}> 
            
            {/* Badge */}
            <div
              className="tour-badge"
              style={{
                background: "#ffe4e6",
                color: "#e11d48",
                padding: "8px 16px",
                borderRadius: "50px",
                fontSize: "13px",
                fontWeight: "700",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "25px",
              }}
            >
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: "#e11d48",
                  animation: "beep 1s infinite",
                }}
              ></span>
              AI-Powered Health Analysis
            </div>

            {/* Heading */}
            <h1
              className="tour-heading"
              style={{
                fontSize: "clamp(2.5rem, 5vw, 4.5rem)", 
                fontWeight: "800",
                lineHeight: "1.1",
                marginBottom: "20px",
                color: "#111827", 
                fontFamily: "sans-serif"
              }}
            >
              Protect Your <br/>
              <span style={{ color: "#e11d48" }}>Heart Health</span> <br />
              With AI.
            </h1>

            {/* Description Box */}
            <div
              className="tour-desc"
              style={{
                background: "white",
                padding: "20px",
                borderRadius: "12px",
                width: "100%",
                maxWidth: "500px",
                border: "1px solid #fecdd3",
                marginBottom: "35px",
                fontSize: "1rem",
                lineHeight: "1.6",
                color: "#4b5563",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)"
              }}
            >
              MediNauts utilizes advanced Machine Learning algorithms to
              predict heart disease risk with 100% accuracy. Early detection
              saves lives.
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", marginBottom: "40px" }}>
              
              {/* ✅ UPDATE: Navigate to /predict on Click */}
              <button
                className="tour-predict-btn"
                style={{
                  padding: "14px 28px",
                  background: "#be123c",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  fontWeight: "700",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  boxShadow: "0 4px 12px rgba(190, 18, 60, 0.25)",
                }}
                onClick={() => navigate("/predict")}
              >
                Start Prediction →
              </button>

              <button
                className="tour-demo-btn"
                style={{
                  padding: "14px 24px",
                  borderRadius: "8px",
                  border: "1px solid #be123c",
                  background: "white",
                  color: "#be123c",
                  fontSize: "1rem",
                  fontWeight: "700",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                  whiteSpace: "nowrap"
                }}
                onClick={() =>
                  window.open("https://www.youtube.com/watch?v=dQw4w9WgXcQ", "_blank")
                }
              >
                <FaPlay size={12} /> Watch Demo
              </button>
            </div>

            {/* Stats */}
            <div className="tour-stats" style={{ display: "flex", gap: "40px" }}>
              <div>
                <p style={{ margin: 0, fontSize: "2rem", fontWeight: "800", color: "#111" }}>100%</p>
                <p style={{ margin: 0, fontSize: "0.9rem", color: "#6b7280" }}>Accuracy Rate</p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: "2rem", fontWeight: "800", color: "#111" }}>24/7</p>
                <p style={{ margin: 0, fontSize: "0.9rem", color: "#6b7280" }}>Instant Results</p>
              </div>
              <div>
                <motion.p style={{ margin: 0, fontSize: "2rem", fontWeight: "800", color: "#111" }}>
                  {rounded}
                </motion.p>
                <p style={{ margin: 0, fontSize: "0.9rem", color: "#6b7280" }}>Users Analyzed</p>
              </div>
            </div>
          </div>

          {/* RIGHT CONTENT (Heart) */}
          <div
            className="tour-heart-visual"
            style={{
              flex: "1", 
              display: "flex",
              justifyContent: "flex-end", 
              alignItems: "center",
              position: "relative",
            }}
          >
            <div style={{ position: "relative", animation: "heartbeat 1.5s infinite" }}>
              <FaHeart 
                style={{ 
                  color: "#f43f5e", 
                  fontSize: "clamp(250px, 30vw, 400px)",
                  filter: "drop-shadow(0 10px 15px rgba(244, 63, 94, 0.2))"
                }} 
              /> 
              
              <div style={{
                position: "absolute",
                top: "15%",
                right: "-10%",
                background: "white",
                padding: "12px 20px",
                borderRadius: "12px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                whiteSpace: "nowrap",
                zIndex: 10
              }}>
                <FaCheck style={{ color: "#10b981", fontSize: "20px" }} />
                <div style={{ textAlign: "left" }}>
                   <p style={{ margin: 0, fontWeight: "800", fontSize: "14px", color: "#111827" }}>Heart Rate</p>
                   <p style={{ margin: 0, fontWeight: "500", fontSize: "13px", color: "#e11d48" }}>72 BPM</p>
                </div>
              </div>

              <div style={{
                position: "absolute",
                bottom: "20%",
                left: "10%", 
                background: "white",
                padding: "12px 20px",
                borderRadius: "12px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                whiteSpace: "nowrap",
                zIndex: 10
              }}>
                <div style={{ 
                  width: "16px", 
                  height: "16px", 
                  background: "#109ab9f2", 
                  borderRadius: "50%" 
                }}></div>
                <div style={{ textAlign: "left" }}>
                   <p style={{ margin: 0, fontWeight: "800", fontSize: "14px", color: "#111827" }}>Status</p>
                   <p style={{ margin: 0, fontWeight: "500", fontSize: "13px", color: "#10b981" }}>Normal</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Modal Code */}
      {showModal && (
        <div 
            style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: 2000, background: "rgba(255,255,255,0.4)", backdropFilter: "blur(10px)", display: "flex", justifyContent: "center", alignItems: "center" }} 
            onClick={handleClose} // ✅ CLICKING OUTSIDE NAVIGATES HOME
        >
           <div 
               style={{ background: "white", padding: "30px", borderRadius: "24px", maxWidth: "900px", width: "90%", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }} 
               onClick={e => e.stopPropagation()}
           >
             {/* ✅ PASS handleClose as the close prop */}
             <HeartFormModal close={handleClose} />
           </div>
        </div>
      )}
      <style>{`@keyframes heartbeat { 0% { transform: scale(1); } 15% { transform: scale(1.1); } 30% { transform: scale(1); } 45% { transform: scale(1.1); } 60% { transform: scale(1); } 100% { transform: scale(1); } }`}</style>
    </div>
  );
};

export default HomePage;
