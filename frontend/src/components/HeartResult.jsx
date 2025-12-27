import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import jsPDF from "jspdf";
import emailjs from "@emailjs/browser"; 

import medinautsLogo from "./image_ce4908.png";
import feedbackIcon from "./image_1.png";

// ✅ URL for Feedback (Ensure this matches your backend)
const BACKEND_BASE = (process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
const FEEDBACK_URL = `${BACKEND_BASE}/feedback`;

// --------------- HELPER: IMAGE LOADER ------------------
const loadImage = (url) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = url;
    img.onload = () => resolve(img);
    img.onerror = () => {
      console.error("Failed to load logo for PDF");
      resolve(null);
    };
  });
};

// --------------- HELPER: VALUE FORMATTER ------------------
const formatValue = (key, value) => {
  const val = Number(value);
  switch (key.toLowerCase()) {
    case "sex": return val === 1 ? "Male" : "Female";
    case "cp":
      const cpMap = ["Typical Angina", "Atypical Angina", "Non-Anginal Pain", "Asymptomatic"];
      return cpMap[val] || value;
    case "fbs": return val === 1 ? "> 120 mg/dL" : "<= 120 mg/dL";
    case "restecg":
      const ecgMap = ["Normal", "ST-T Wave Abnormality", "LV Hypertrophy"];
      return ecgMap[val] || value;
    case "exang": return val === 1 ? "Yes" : "No";
    case "slope":
      const slopeMap = ["Upsloping", "Flat", "Downsloping"];
      return slopeMap[val] || value;
    case "ca": return `${val} Vessel${val !== 1 ? "s" : ""}`;
    case "thal":
      const thalMap = { 1: "Normal", 2: "Fixed Defect", 3: "Reversible Defect" };
      return thalMap[val] || value;
    case "trestbps": return `${val} mm Hg`;
    case "chol": return `${val} mg/dL`;
    case "thalach": return `${val} BPM`;
    default: return value;
  }
};

const parameterNames = {
  age: "Age", sex: "Sex", cp: "Chest Pain Type", trestbps: "Resting BP",
  chol: "Cholesterol", fbs: "Fasting BS", restecg: "Resting ECG",
  thalach: "Max Heart Rate", exang: "Exercise Angina", oldpeak: "ST Depression",
  slope: "ST Slope", ca: "Major Vessels", thal: "Thalassemia",
};

// --------------- FEEDBACK POPUP COMPONENT ------------------
const FeedbackPopup = ({ onComplete }) => {
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await fetch(FEEDBACK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, message }),
      });
    } catch (error) {
      console.error("Failed to send feedback:", error);
    }
    setSubmitting(false);
    onComplete(); 
  };

  return (
    <div style={feedbackOverlay}>
      <div style={feedbackBox}>
        
        {/* 🔴 ADDED: Centered feedback icon from image */}
        <div style={{ marginBottom: "10px", display: "flex", justifyContent: "center" }}>
          <img src={feedbackIcon} alt="Feedback Icon" style={{ width: "60px", height: "60px" }} />
        </div>

        {/* Red Title (from previous change) */}
        <h3 style={{ margin: "0 0 5px 0", color: "#d32f2f" }}>Wait! Before you go...</h3>
        <p style={{ color: "#2b0ae4ff", fontSize: 14, marginTop: 0 }}>How would you rate this analysis?</p>
        
        <div style={{ fontSize: 35, cursor: "pointer", margin: "15px 0" }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              onClick={() => setRating(star)}
              style={{ color: star <= rating ? "#FFD700" : "#ddd", margin: "0 5px" }}
            >★</span>
          ))}
        </div>

        <textarea
          placeholder="Your feedback is Important..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{ width: "100%", height: 60, padding: 8, borderRadius: 8, border: "1px solid #ccc", marginBottom: 15 }}
        />

        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button onClick={onComplete} style={{ ...btnStyle, background: "#eee", color: "#555" }}>Skip</button>
          {/* Red Submit button (from previous change) */}
          <button onClick={handleSubmit} disabled={rating === 0} style={{ ...btnStyle, background: rating > 0 ? "#ef4444" : "#ccc", color: "#fff" }}>
            {submitting ? "Sending..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};


// --------------- MAIN COMPONENT ------------------

const HeartResultModal = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state || {};
  const { form, prediction } = state;

  const [patientName, setPatientName] = useState(state.patientName || "");
  const [patientEmail, setPatientEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  
  // ✅ New State: Controls if Feedback popup is visible
  const [showFeedback, setShowFeedback] = useState(false);

  const riskScore = calculateRisk(form);
  const isHighRisk = prediction ? prediction.prediction === 1 : riskScore >= 50;

  // ❤️ Animated Heart Icon
  const HeartIcon = (
    <motion.div
      animate={isHighRisk ? { scale: [1, 1.2, 1], opacity: [1, 0.8, 1] } : { scale: [1, 1.1, 1], opacity: [1, 0.9, 1] }}
      transition={{ duration: 0.8, repeat: Infinity, repeatType: "mirror" }}
      style={{ fontSize: 70, color: isHighRisk ? "red" : "green", marginBottom: 10, display: "inline-block" }}
    >
      ❤️
    </motion.div>
  );

  // --- ACTIONS ---

  // 1. Triggered when clicking "X" or "Analyze New Patient"
  const handleCloseRequest = () => {
    setShowFeedback(true); // Show feedback first
  };

  // 2. Triggered after Feedback is done (or skipped)
  const handleExitFinal = () => {
    setShowFeedback(false);
    navigate(-1); // Go back to home
  };

  // PDF & Email Logic (Unchanged)
  const createPDFDocument = async () => {
    const doc = new jsPDF();
    const displayName = patientName.trim() || "NA";
    
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 51, 102);
    doc.setFontSize(24);
    doc.text("CARDIOLOGY REPORT", 105, 20, null, "center");
    
    doc.setFontSize(14);
    doc.setTextColor(100);
    doc.text("Patient Medical Report", 105, 30, null, "center");
    doc.setDrawColor(0, 51, 102);
    doc.setLineWidth(1);
    doc.line(20, 35, 190, 35);

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Patient Name: ${displayName}`, 20, 45);
    doc.text(`Email: ${patientEmail || "N/A"}`, 20, 52); 
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 140, 45);

    let yPos = 75;
    doc.setFontSize(14);
    doc.setTextColor(0, 51, 102);
    doc.text("Cardiac Stress Test Parameters:", 20, 65);
    doc.setFontSize(11);
    doc.setTextColor(0);

    if (form) {
      Object.entries(form).forEach(([key, value]) => {
        if (!parameterNames[key]) return;
        const formattedVal = formatValue(key, value);
        doc.setFont("helvetica", "bold");
        doc.text(`${parameterNames[key]}:`, 20, yPos);
        doc.setFont("helvetica", "normal");
        doc.text(String(formattedVal), 110, yPos);
        yPos += 8;
        if (yPos > 240) { doc.addPage(); yPos = 20; }
      });
    }

    yPos += 10;
    doc.line(20, yPos, 190, yPos);
    yPos += 15;
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 51, 102);
    doc.text("Diagnosis Conclusion:", 20, yPos);
    yPos += 10;
    doc.setFontSize(12);
    doc.setTextColor(isHighRisk ? 200 : 0, isHighRisk ? 0 : 150, 0);
    doc.text(isHighRisk ? "POSITIVE FOR HEART DISEASE RISK (HIGH RISK)" : "NEGATIVE FOR HEART DISEASE RISK (NORMAL)", 20, yPos);
    
    const logoImg = await loadImage(medinautsLogo);
    if (logoImg) {
      doc.addImage(logoImg, "PNG", 95, 265, 20, 20);
    }
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text(`Made by MediNauts © ${new Date().getFullYear()}`, 105, 290, null, "center");

    return doc;
  };

  const handleDownloadPDF = async () => {
    const doc = await createPDFDocument();
    doc.save(`Medical_Report_${patientName.trim()}.pdf`);
  };

  const handleSendEmail = async () => {
    if (!patientEmail) {
      alert("Please enter an email address first.");
      return;
    }
    setIsSending(true);

    try {
      const serviceID = process.env.REACT_APP_EMAILJS_SERVICE_ID;
      const templateID = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
      const publicKey = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;
      const templateParams = {
        to_name: patientName,
        to_email: patientEmail,
        date: new Date().toLocaleDateString(),
        risk_status: isHighRisk ? "⚠️ HIGH RISK (Positive)" : "✅ LOW RISK (Negative)",
        risk_score: prediction ? (prediction.probability * 100).toFixed(0) + "%" : riskScore + "%",
        age: form?.age || "N/A",
        sex: formatValue("sex", form?.sex),
        cp: formatValue("cp", form?.cp),
        trestbps: formatValue("trestbps", form?.trestbps),
        chol: formatValue("chol", form?.chol),
        fbs: formatValue("fbs", form?.fbs),          
        restecg: formatValue("restecg", form?.restecg),
        thalach: formatValue("thalach", form?.thalach),
        exang: formatValue("exang", form?.exang),    
        oldpeak: formatValue("oldpeak", form?.oldpeak),
        slope: formatValue("slope", form?.slope),    
        ca: formatValue("ca", form?.ca),             
        thal: formatValue("thal", form?.thal),       
      };

      await emailjs.send(serviceID, templateID, templateParams, publicKey);
      alert(`✅ Full Report sent successfully to ${patientEmail}!`);
    } catch (error) {
      console.error("Email Error:", error);
      alert("Failed to send email. Please check your internet connection.");
    } finally {
      setIsSending(false);
    }
  };

  // ---------------- UI -----------------

  return (
    <>
      {/* ✅ FEEDBACK POPUP - Only shows when showFeedback is true */}
      {showFeedback && <FeedbackPopup onComplete={handleExitFinal} />}

      <motion.div style={overlay}>
        <div style={card}>
          {/* ❌ Close button now triggers feedback */}
          <button style={closeBtn} onClick={handleCloseRequest}>×</button>
          
          <div style={{ textAlign: "center" }}>{HeartIcon}</div>
          <h1 style={mainTitle}>{isHighRisk ? "⚠️ High Risk Detected" : "✅ Low Risk Detected"}</h1>

          <div style={inputsWrapper}>
              <input type="text" placeholder="Enter Patient Name..." value={patientName} onChange={(e) => setPatientName(e.target.value)} style={inputStyle} />
              <input type="email" placeholder="Enter Patient Email..." value={patientEmail} onChange={(e) => setPatientEmail(e.target.value)} style={inputStyle} />
          </div>

          <p style={subTitle}>Based on your submitted clinical parameters</p>

          <motion.div style={resultBox} animate={isHighRisk ? { boxShadow: ["0 0 0 rgba(0,0,0,0.1)", "0 0 25px rgba(255,0,0,0.8)", "0 0 0 rgba(0,0,0,0.1)"] } : { boxShadow: ["0 0 0 rgba(0,0,0,0.05)", "0 0 25px rgba(0,200,0,0.7)", "0 0 0 rgba(0,0,0,0.05)"] }} transition={{ duration: 1.5, repeat: Infinity, repeatType: "mirror" }}>
            {prediction ? (
              <div style={{ marginTop: 6 }}>
                <div style={{ fontWeight: "bold", color: isHighRisk ? "red" : "green", marginBottom: 8 }}>
                  {isHighRisk ? "⚠️ The model predicts heart disease." : "✅ The model predicts NO heart disease."}
                </div>
                <div>Prediction value: <b>{prediction.prediction}</b></div>
                <div>Probability: <b>{(prediction.probability ?? 0).toFixed(3)}</b></div>
              </div>
            ) : <p>No server prediction — using heuristic score.</p>}
            <p style={riskPercentage}>Estimated Risk Score: <b>{prediction ? Math.round(prediction.probability * 100) + "%" : riskScore + "%"}</b></p>
          </motion.div>

          <h3 style={sectionTitle}>Patient Submitted Parameters</h3>
          <div style={grid}>
            {form && Object.entries(form).map(([key, value]) => {
              if (!parameterNames[key]) return null;
              return (
                <div key={key} style={infoItem}>
                  <span style={infoLabel}>{parameterNames[key].toUpperCase()}</span> : <span style={infoValue}>{formatValue(key, value)}</span>
                </div>
              );
            })}
          </div>

          <div style={buttonRow}>
            {/* ❌ Button now triggers feedback */}
            <button style={actionBtn} onClick={handleCloseRequest}>Analyze New Patient</button>
            <button style={pdfBtn} onClick={handleDownloadPDF}>⬇ Download PDF</button>
            <button style={{...pdfBtn, background: "#007bff"}} onClick={handleSendEmail} disabled={isSending}>
              {isSending ? "Sending..." : "✉️ Email Report"}
            </button>
          </div>

          <div style={footerContainer}>
            <img src={medinautsLogo} alt="MediNauts" style={footerLogo} />
            <span style={footerText}>Made by MediNauts &copy; {new Date().getFullYear()}</span>
          </div>
        </div>
      </motion.div>
    </>
  );
};

// ---------------- STYLES (Unchanged) ----------------
function calculateRisk(data) {
  if (!data) return 0;
  let score = 0;
  if (data.age > 50) score += 15;
  if (data.chol > 200) score += 15;
  if (data.trestbps > 130) score += 10;
  if (data.exang === 1) score += 20;
  if (data.cp >= 2) score += 15;
  if (data.thalach < 120) score += 10;
  if (data.oldpeak > 2.0) score += 15;
  return Math.min(score, 95);
}

const overlay = { position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", padding: 20, zIndex: 1000, backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(5px)" };
const card = { width: "90%", maxWidth: "1000px", background: "#fff", borderRadius: "20px", padding: "30px 40px", position: "relative", maxHeight: "90vh", overflowY: "auto" };
const closeBtn = { position: "absolute", top: 20, right: 20, fontSize: 32, border: "none", background: "none", cursor: "pointer" };
const mainTitle = { fontSize: 28, fontWeight: 700, textAlign: "center", color: "#222", marginBottom: 10 };
const subTitle = { textAlign: "center", fontSize: 14, color: "#555", marginBottom: 20 };
const inputsWrapper = { display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap", marginBottom: 15 };
const inputStyle = { padding: "10px 15px", width: "100%", maxWidth: "300px", border: "2px solid #ddd", borderRadius: "8px", fontSize: "16px", textAlign: "center", outline: "none", transition: "border 0.3s" };
const resultBox = { background: "#f6f6f6", padding: 25, borderRadius: 20, textAlign: "center", marginBottom: 25 };
const riskPercentage = { marginTop: 15, fontSize: 16 };
const sectionTitle = { fontSize: 18, marginTop: 25, marginBottom: 10, fontWeight: "600", borderBottom: "2px solid #ddd", paddingBottom: 5 };
const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 12 };
const infoItem = { background: "#fafafa", padding: 12, borderRadius: 12, boxShadow: "0 2px 6px rgba(0,0,0,0.1)" };
const infoLabel = { fontWeight: "600", color: "#777", fontSize: "0.85rem" };
const infoValue = { fontWeight: "700", color: "#222", fontSize: "0.95rem", display: "block", marginTop: "2px" };
const buttonRow = { display: "flex", justifyContent: "center", gap: 20, marginTop: 20, flexWrap: "wrap" };
const actionBtn = { padding: "10px 18px", background: "#00008b", color: "#fff", borderRadius: 12, border: "none", cursor: "pointer" };
const pdfBtn = { padding: "10px 18px", background: "#d32f2f", color: "#fff", borderRadius: 12, border: "none", cursor: "pointer" };
const footerContainer = { marginTop: "35px", paddingTop: "15px", borderTop: "1px solid #eaeaea", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", opacity: 0.8 };
const footerLogo = { height: "24px", width: "auto", objectFit: "contain" };
const footerText = { fontSize: "0.85rem", color: "#555", fontWeight: "500", fontFamily: "Helvetica, Arial, sans-serif" };
const feedbackOverlay = { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.6)", zIndex: 2000, display: "flex", justifyContent: "center", alignItems: "center" };
const feedbackBox = { background: "white", padding: 30, borderRadius: 15, width: "350px", textAlign: "center" };
const btnStyle = { padding: "8px 16px", border: "none", borderRadius: 8, cursor: "pointer" };

export default HeartResultModal;
