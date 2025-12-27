
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import jsPDF from "jspdf";
import emailjs from "@emailjs/browser"; 

import medinautsLogo from "./image_ce4908.png";
// 🔴 ADDED: Import for the new feedback icon
import feedbackIcon from "./image_1.png";

const BACKEND_BASE = (process.env.REACT_APP_BACKEND_URL).replace(/\/$/, "");
const FEEDBACK_URL = `${BACKEND_BASE}/feedback`;

// ✅ Dynamic Stage Color Mapping
const stageColorMap = {
  0: "#22c55e", // Green (Healthy/Safe)
  1: "#eab308", // Yellow (Stage 1 - Mild)
  2: "#f97316", // Orange (Stage 2 - Moderate)
  3: "#ef4444", // Red (Stage 3 - Advanced)
  4: "#991b1b", // Dark Red (Stage 4 - Severe)
};

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
      const thalMap = { 0: "Unknown", 1: "Normal", 2: "Fixed Defect", 3: "Reversible Defect" };
      return thalMap[val] || value;
    case "trestbps": return `${val} mm Hg`;
    case "chol": return `${val} mg/dL`;
    case "thalach": return `${val} BPM`;
    case "cac_score": return `${val} (Agatston Unit)`;
    default: return value;
  }
};

const parameterNames = {
  age: "Age", sex: "Sex", cp: "Chest Pain Type", trestbps: "Resting BP",
  chol: "Cholesterol", fbs: "Fasting BS", restecg: "Resting ECG",
  thalach: "Max Heart Rate", exang: "Exercise Angina", oldpeak: "ST Depression",
  slope: "ST Slope", ca: "Major Vessels", thal: "Thalassemia", cac_score: "CAC Score"
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
        <p style={{ color: "black", fontSize: 18, marginTop: 0 }}>How would you rate this analysis?</p>
        
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
  const [showFeedback, setShowFeedback] = useState(false);

  // ✅ STEP 1: Identify Numerical Risk Score
  const finalRiskScore = prediction ? prediction.risk_score : 0;
  
  // ✅ STEP 2: Logic Fix - Use Score to define High Risk threshold
  const isHighRisk = finalRiskScore >= 50; 
  
  // ✅ STEP 3: Identify Stage and Dynamic Color
  const stage = prediction ? prediction.prediction : 0;
  
  // ⚡ Logic Fix: If risk is high (>50) but stage is 0 (due to AI), force the color to Red/Orange for Clinical Safety
  const stageColor = (isHighRisk && stage === 0) ? stageColorMap[3] : (stageColorMap[stage] || "#22c55e");
  
  const predictionText = prediction ? prediction.prediction_text : "No Data";

  // ✅ Updated Dynamic Heart Animation
  const HeartIcon = (
    <motion.div
      animate={{ 
        scale: [1, 1.15, 1], 
        opacity: [1, 0.8, 1],
        color: stageColor 
      }}
      transition={{ duration: 0.8, repeat: Infinity, repeatType: "mirror" }}
      style={{ fontSize: 70, marginBottom: 10, display: "inline-block" }}
    >
      ❤️
    </motion.div>
  );

  const createPDFDocument = async () => {
    const doc = new jsPDF();
    const displayName = patientName.trim() || "NA";
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 51, 102);
    doc.setFontSize(24);
    doc.text("CARDIOLOGY REPORT", 105, 20, null, "center");
    doc.setFontSize(14);
    doc.text("Patient Medical Report", 105, 30, null, "center");
    doc.setLineWidth(1);
    doc.line(20, 35, 190, 35);
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Patient Name: ${displayName}`, 20, 45);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 140, 45);

    let yPos = 65;
    doc.setFontSize(14);
    doc.setTextColor(0, 51, 102);
    doc.text("Clinical Parameters:", 20, yPos);
    yPos += 10;
    doc.setFontSize(11);
    doc.setTextColor(0);

    if (form) {
      Object.entries(form).forEach(([key, value]) => {
        if (!parameterNames[key]) return;
        doc.setFont("helvetica", "bold");
        doc.text(`${parameterNames[key]}:`, 20, yPos);
        doc.setFont("helvetica", "normal");
        doc.text(String(formatValue(key, value)), 110, yPos);
        yPos += 8;
        if (yPos > 260) { doc.addPage(); yPos = 20; }
      });
    }

    yPos += 10;
    doc.line(20, yPos, 190, yPos);
    yPos += 15;
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(stageColor);
    doc.text(`DIAGNOSIS: ${predictionText.toUpperCase()}`, 20, yPos);
    doc.setFontSize(12);
    doc.text(`Total Calculated Risk: ${finalRiskScore}%`, 20, yPos + 10);

    const logoImg = await loadImage(medinautsLogo);
    if (logoImg) doc.addImage(logoImg, "PNG", 95, 265, 20, 20);
    return doc;
  };

  const handleDownloadPDF = async () => {
    const doc = await createPDFDocument();
    doc.save(`Medinauts_Report_${patientName.trim()}.pdf`);
  };

  const handleSendEmail = async () => {
    if (!patientEmail) return alert("Please enter email.");
    setIsSending(true);
    try {
      const templateParams = {
        to_name: patientName,
        to_email: patientEmail,
        risk_status: predictionText,
        risk_score: finalRiskScore + "%",
        age: form?.age,
        trestbps: form?.trestbps,
        chol: form?.chol,
        cac: form?.cac_score || "N/A"
      };
      await emailjs.send(
        process.env.REACT_APP_EMAILJS_SERVICE_ID,
        process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
        templateParams,
        process.env.REACT_APP_EMAILJS_PUBLIC_KEY
      );
      alert("Email Sent!");
    } catch (error) {
      console.error(error);
    } finally { setIsSending(false); }
  };

  return (
    <>
      {showFeedback && <FeedbackPopup onComplete={() => navigate(-1)} />}
      <motion.div style={overlay}>
        <div style={card}>
          <button style={closeBtn} onClick={() => setShowFeedback(true)}>×</button>
          <div style={{ textAlign: "center" }}>{HeartIcon}</div>
          
          {/* ✅ UI FIX: Header Color and Icon based on corrected isHighRisk */}
          <h1 style={{ ...mainTitle, color: stageColor }}>
             {isHighRisk ? "⚠️ Potential Risk Detected" : "✅ Low Risk Detected"}
          </h1>
          
          <div style={inputsWrapper}>
            <input type="text" placeholder="Patient Name" value={patientName} onChange={(e) => setPatientName(e.target.value)} style={inputStyle} />
            <input type="email" placeholder="Patient Email" value={patientEmail} onChange={(e) => setPatientEmail(e.target.value)} style={inputStyle} />
          </div>

          <motion.div 
            style={resultBox} 
            animate={{ 
              boxShadow: [
                `0 0 0px ${stageColor}00`, 
                `0 0 25px ${stageColor}99`, 
                `0 0 0px ${stageColor}00`
              ] 
            }} 
            transition={{ duration: 1.5, repeat: Infinity, repeatType: "mirror" }}
          >
            <h2 style={{ color: stageColor, marginBottom: 5 }}>{predictionText.toUpperCase()}</h2>
            <p style={{ fontSize: 18 }}>Estimated Total Risk: <b>{finalRiskScore}%</b></p>
          </motion.div>

          <div style={grid}>
            {form && Object.entries(form).map(([key, value]) => (
              parameterNames[key] && (
                <div key={key} style={infoItem}>
                  <span style={infoLabel}>{parameterNames[key]}</span>: <span style={infoValue}>{formatValue(key, value)}</span>
                </div>
              )
            ))}
          </div>

          <div style={buttonRow}>
            <button style={actionBtn} onClick={() => setShowFeedback(true)}>New Analysis</button>
            <button style={pdfBtn} onClick={handleDownloadPDF}>Download PDF</button>
            <button style={{...pdfBtn, background: "#007bff"}} onClick={handleSendEmail} disabled={isSending}>
              {isSending ? "Sending..." : "Email Report"}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
};

// --- STYLES ---
const overlay = { position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(5px)" };
const card = { width: "90%", maxWidth: "900px", background: "#fff", borderRadius: "25px", padding: "40px", position: "relative", maxHeight: "90vh", overflowY: "auto" };
const closeBtn = { position: "absolute", top: 20, right: 20, fontSize: 30, border: "none", background: "none", cursor: "pointer" };
const mainTitle = { textAlign: "center", marginBottom: 15, fontWeight: "bold" };
const resultBox = { background: "#f9f9f9", padding: "20px", borderRadius: "20px", textAlign: "center", marginBottom: "30px" };
const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px" };
const infoItem = { background: "#fafafa", padding: "10px", borderRadius: "10px", border: "1px solid #eee" };
const infoLabel = { fontWeight: "bold", color: "#666" };
const infoValue = { color: "#222" };
const buttonRow = { display: "flex", justifyContent: "center", gap: "15px", marginTop: "30px" };
const actionBtn = { padding: "12px 24px", background: "#00008b", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer" };
const pdfBtn = { padding: "12px 24px", background: "#d32f2f", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer" };
const inputsWrapper = { display: "flex", gap: "10px", marginBottom: "20px", justifyContent: "center" };
const inputStyle = { padding: "10px", borderRadius: "8px", border: "1px solid #ccc", width: "45%" };
const feedbackOverlay = { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.6)", zIndex: 2000, display: "flex", justifyContent: "center", alignItems: "center" };
const feedbackBox = { background: "white", padding: 30, borderRadius: 15, width: "350px", textAlign: "center" };
const btnStyle = { padding: "8px 16px", border: "none", borderRadius: 8, cursor: "pointer" };

export default HeartResultModal;