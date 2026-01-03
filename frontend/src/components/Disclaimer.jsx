import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom"; 
import { 
  FaExclamationTriangle, FaVials, FaStethoscope, 
  FaUserShield, FaTimes, FaCheckCircle, FaRegCircle 
} from "react-icons/fa";

const Disclaimer = () => {
  const navigate = useNavigate(); 
  const [agreed, setAgreed] = useState(false);

  // 1. Cross Button: Cancels and goes Home (since they didn't agree)
  const handleCancel = () => {
    navigate("/"); 
  };

  // 2. Agree Button: Goes back to Predict and tells it to OPEN the form
  const handleAgree = () => {
    if (agreed) {
        // We pass 'openModal: true' in the state
        navigate("/predict", { state: { openModal: true } });
    }
  };

  return (
    <div style={containerStyle}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={cardStyle}
      >
        {/* --- Cross Button (Cancel) --- */}
        <button 
          onClick={handleCancel} 
          style={closeBtnStyle}
          title="Cancel and Go Home"
          onMouseOver={(e) => e.currentTarget.style.color = "#ef4444"}
          onMouseOut={(e) => e.currentTarget.style.color = "#94a3b8"}
        >
          <FaTimes size={24} />
        </button>

        <div style={headerStyle}>
          <FaUserShield size={40} color="#00008b" />
          <h1 style={titleStyle}>Medical Disclaimer & Guidance</h1>
        </div>

        <section style={sectionStyle}>
          <div style={warningBox}>
            <FaExclamationTriangle color="#856404" size={24} />
            <p style={warningText}>
              <strong>IMPORTANT:</strong> Medinauts is an AI-powered screening tool, NOT a diagnostic replacement. 
              The results provided are statistical probabilities based on machine learning and should be discussed with a qualified cardiologist.
            </p>
          </div>
        </section>

        <h3 style={subTitleStyle}><FaVials style={{marginRight: 10}}/>Required Clinical Tests</h3>
        <div style={gridStyle}>
          <TestItem 
            test="Lipid Profile" 
            params="Cholesterol, Fasting Blood Sugar" 
            desc="Obtained via fasted blood work at a laboratory."
          />
          <TestItem 
            test="12-Lead ECG" 
            params="Resting ECG, ST Depression, Slope" 
            desc="Detects electrical abnormalities and silent heart damage."
          />
          <TestItem 
            test="Stress Test" 
            params="Max Heart Rate, Exercise Angina" 
            desc="Measured during physical exertion (treadmill/cycle)."
          />
          <TestItem 
            test="Cardiac CT / Fluoroscopy" 
            params="Major Vessels (CA), CAC Score" 
            desc="Identifies physical blockages and calcium buildup."
          />
        </div>

        {/* --- ✅ NEW: Agreement Section --- */}
        <div style={agreementSection}>
            <div 
                onClick={() => setAgreed(!agreed)} 
                style={{ ...checkboxContainer, borderColor: agreed ? "#22c55e" : "#ccc" }}
            >
                {agreed ? (
                    <FaCheckCircle size={24} color="#22c55e" /> 
                ) : (
                    <FaRegCircle size={24} color="#ccc" />
                )}
                <span style={{ fontSize: "15px", fontWeight: "600", color: agreed ? "#15803d" : "#64748b" }}>
                    I have read and understood the medical guidance.
                </span>
            </div>

            <button 
                onClick={handleAgree}
                disabled={!agreed}
                style={{
                    ...proceedBtn,
                    background: agreed ? "#00008b" : "#ccc",
                    cursor: agreed ? "pointer" : "not-allowed",
                    transform: agreed ? "scale(1)" : "scale(0.98)"
                }}
            >
                Agree & Proceed to Analysis
            </button>
        </div>

        <footer style={footerStyle}>
          <h3 style={subTitleStyle}><FaStethoscope style={{marginRight: 10}}/>Emergency Notice</h3>
          <p style={textStyle}>
            If you are currently experiencing chest pain, shortness of breath, or numbness, 
            <strong> do not use this app.</strong> Please call emergency services immediately.
          </p>
          <div style={divider} />
          <p style={{fontSize: "12px", color: "#666", textAlign: "center"}}>
            &copy; {new Date().getFullYear()} Medinauts AI Health. All Rights Reserved.
          </p>
        </footer>
      </motion.div>
    </div>
  );
};

const TestItem = ({ test, params, desc }) => (
  <div style={testCardStyle}>
    <h4 style={{margin: "0 0 5px 0", color: "#00008b"}}>{test}</h4>
    <p style={{fontSize: "13px", fontWeight: "bold", color: "#444", margin: "0 0 5px 0"}}>Fields: {params}</p>
    <p style={{fontSize: "12px", color: "#666", margin: 0}}>{desc}</p>
  </div>
);

// --- STYLES ---
const containerStyle = { 
  padding: "60px 20px", 
  background: "#f8fafc", 
  minHeight: "100vh", 
  display: "flex", 
  justifyContent: "center",
  alignItems: "flex-start" 
};

const cardStyle = { 
  maxWidth: "900px", 
  width: "100%", 
  background: "#fff", 
  borderRadius: "20px", 
  padding: "40px", 
  boxShadow: "0 10px 25px rgba(0,0,0,0.05)", 
  position: "relative",
  overflow: "visible" 
};

const closeBtnStyle = {
  position: "absolute",
  top: "20px",
  right: "20px",
  background: "#f1f5f9", 
  border: "none",
  borderRadius: "50%", 
  width: "40px",
  height: "40px",
  cursor: "pointer",
  color: "#94a3b8",
  transition: "0.2s ease",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 100, 
  boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
};

const headerStyle = { display: "flex", alignItems: "center", gap: "20px", borderBottom: "2px solid #eee", paddingBottom: "20px", marginBottom: "30px" };
const titleStyle = { fontSize: "28px", fontWeight: "800", color: "#222", margin: 0, paddingRight: "50px" };
const sectionStyle = { marginBottom: "30px" };
const subTitleStyle = { fontSize: "18px", fontWeight: "700", color: "#333", marginBottom: "15px", display: "flex", alignItems: "center" };
const warningBox = { background: "#fff3cd", border: "1px solid #ffeeba", padding: "20px", borderRadius: "12px", display: "flex", gap: "15px", alignItems: "center" };
const warningText = { margin: 0, color: "#856404", fontSize: "14px", lineHeight: "1.6" };
const gridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "40px" };
const testCardStyle = { background: "#f1f5f9", padding: "15px", borderRadius: "12px", border: "1px solid #e2e8f0" };
const textStyle = { fontSize: "15px", color: "#444", lineHeight: "1.6" };
const footerStyle = { marginTop: "40px", borderTop: "1px solid #eee", paddingTop: "20px" };
const divider = { height: "1px", background: "#eee", margin: "20px 0" };

// ✅ NEW STYLES FOR AGREEMENT SECTION
const agreementSection = {
    marginTop: "30px",
    background: "#f0fdf4", // Light green bg
    padding: "20px",
    borderRadius: "15px",
    border: "1px solid #bbf7d0",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "20px"
};

const checkboxContainer = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    cursor: "pointer",
    padding: "10px 20px",
    background: "#fff",
    borderRadius: "50px",
    border: "2px solid #ccc",
    transition: "0.3s ease"
};

const proceedBtn = {
    padding: "12px 30px",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "bold",
    border: "none",
    borderRadius: "12px",
    transition: "0.3s ease",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
};

export default Disclaimer;