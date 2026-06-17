// import React, { useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import { motion } from "framer-motion";
// import jsPDF from "jspdf";
// import emailjs from "@emailjs/browser"; 

// import medinautsLogo from "./image_ce4908.png";
// import feedbackIcon from "./image_1.png";

// // ✅ URL for Feedback (Ensure this matches your backend)
// const BACKEND_BASE = (process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
// const FEEDBACK_URL = `${BACKEND_BASE}/feedback`;

// // --------------- HELPER: IMAGE LOADER ------------------
// const loadImage = (url) => {
//   return new Promise((resolve) => {
//     const img = new Image();
//     img.src = url;
//     img.onload = () => resolve(img);
//     img.onerror = () => {
//       console.error("Failed to load logo for PDF");
//       resolve(null);
//     };
//   });
// };

// // --------------- HELPER: VALUE FORMATTER ------------------
// const formatValue = (key, value) => {
//   const val = Number(value);
//   switch (key.toLowerCase()) {
//     case "sex": return val === 1 ? "Male" : "Female";
//     case "cp":
//       const cpMap = ["Typical Angina", "Atypical Angina", "Non-Anginal Pain", "Asymptomatic"];
//       return cpMap[val] || value;
//     case "fbs": return val === 1 ? "> 120 mg/dL" : "<= 120 mg/dL";
//     case "restecg":
//       const ecgMap = ["Normal", "ST-T Wave Abnormality", "LV Hypertrophy"];
//       return ecgMap[val] || value;
//     case "exang": return val === 1 ? "Yes" : "No";
//     case "slope":
//       const slopeMap = ["Upsloping", "Flat", "Downsloping"];
//       return slopeMap[val] || value;
//     case "ca": return `${val} Vessel${val !== 1 ? "s" : ""}`;
//     case "thal":
//       const thalMap = { 1: "Normal", 2: "Fixed Defect", 3: "Reversible Defect" };
//       return thalMap[val] || value;
//     case "trestbps": return `${val} mm Hg`;
//     case "chol": return `${val} mg/dL`;
//     case "thalach": return `${val} BPM`;
//     default: return value;
//   }
// };

// const parameterNames = {
//   age: "Age", sex: "Sex", cp: "Chest Pain Type", trestbps: "Resting BP",
//   chol: "Cholesterol", fbs: "Fasting BS", restecg: "Resting ECG",
//   thalach: "Max Heart Rate", exang: "Exercise Angina", oldpeak: "ST Depression",
//   slope: "ST Slope", ca: "Major Vessels", thal: "Thalassemia",
// };

// // --------------- FEEDBACK POPUP COMPONENT ------------------
// const FeedbackPopup = ({ onComplete }) => {
//   const [rating, setRating] = useState(0);
//   const [message, setMessage] = useState("");
//   const [submitting, setSubmitting] = useState(false);

//   const handleSubmit = async () => {
//     setSubmitting(true);
//     try {
//       await fetch(FEEDBACK_URL, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ rating, message }),
//       });
//     } catch (error) {
//       console.error("Failed to send feedback:", error);
//     }
//     setSubmitting(false);
//     onComplete(); 
//   };

//   return (
//     <div style={feedbackOverlay}>
//       <div style={feedbackBox}>
        
//         {/* 🔴 ADDED: Centered feedback icon from image */}
//         <div style={{ marginBottom: "10px", display: "flex", justifyContent: "center" }}>
//           <img src={feedbackIcon} alt="Feedback Icon" style={{ width: "60px", height: "60px" }} />
//         </div>

//         {/* Red Title (from previous change) */}
//         <h3 style={{ margin: "0 0 5px 0", color: "#d32f2f" }}>Wait! Before you go...</h3>
//         <p style={{ color: "#02000cff", fontSize: 18, marginTop: 0 }}>How would you rate this analysis?</p>
        
//         <div style={{ fontSize: 35, cursor: "pointer", margin: "15px 0" }}>
//           {[1, 2, 3, 4, 5].map((star) => (
//             <span
//               key={star}
//               onClick={() => setRating(star)}
//               style={{ color: star <= rating ? "#FFD700" : "#ddd", margin: "0 5px" }}
//             >★</span>
//           ))}
//         </div>

//         <textarea
//           placeholder="Your feedback is Important..."
//           value={message}
//           onChange={(e) => setMessage(e.target.value)}
//           style={{ width: "100%", height: 60, padding: 8, borderRadius: 8, border: "1px solid #ccc", marginBottom: 15 }}
//         />

//         <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
//           <button onClick={onComplete} style={{ ...btnStyle, background: "#eee", color: "#555" }}>Skip</button>
//           {/* Red Submit button (from previous change) */}
//           <button onClick={handleSubmit} disabled={rating === 0} style={{ ...btnStyle, background: rating > 0 ? "#ef4444" : "#ccc", color: "#fff" }}>
//             {submitting ? "Sending..." : "Submit"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };


// // --------------- MAIN COMPONENT ------------------

// const HeartResultModal = () => {
//   const location = useLocation();
//   const navigate = useNavigate();

//   const state = location.state || {};
//   const { form, prediction } = state;

//   const [patientName, setPatientName] = useState(state.patientName || "");
//   const [patientEmail, setPatientEmail] = useState("");
//   const [isSending, setIsSending] = useState(false);
  
//   // ✅ New State: Controls if Feedback popup is visible
//   const [showFeedback, setShowFeedback] = useState(false);

//   const riskScore = calculateRisk(form);
//   const isHighRisk = prediction ? prediction.prediction === 1 : riskScore >= 50;

//   // ❤️ Animated Heart Icon
//   const HeartIcon = (
//     <motion.div
//       animate={isHighRisk ? { scale: [1, 1.2, 1], opacity: [1, 0.8, 1] } : { scale: [1, 1.1, 1], opacity: [1, 0.9, 1] }}
//       transition={{ duration: 0.8, repeat: Infinity, repeatType: "mirror" }}
//       style={{ fontSize: 70, color: isHighRisk ? "red" : "green", marginBottom: 10, display: "inline-block" }}
//     >
//       ❤️
//     </motion.div>
//   );

//   // --- ACTIONS ---

//   // 1. Triggered when clicking "X" or "Analyze New Patient"
//   const handleCloseRequest = () => {
//     setShowFeedback(true); // Show feedback first
//   };

//   // 2. Triggered after Feedback is done (or skipped)
//   const handleExitFinal = () => {
//     setShowFeedback(false);
//     navigate(-1); // Go back to home
//   };

//   // PDF & Email Logic (Unchanged)
//   const createPDFDocument = async () => {
//     const doc = new jsPDF();
//     const displayName = patientName.trim() || "NA";
    
//     doc.setFont("helvetica", "bold");
//     doc.setTextColor(0, 51, 102);
//     doc.setFontSize(24);
//     doc.text("CARDIOLOGY REPORT", 105, 20, null, "center");
    
//     doc.setFontSize(14);
//     doc.setTextColor(100);
//     doc.text("Patient Medical Report", 105, 30, null, "center");
//     doc.setDrawColor(0, 51, 102);
//     doc.setLineWidth(1);
//     doc.line(20, 35, 190, 35);

//     doc.setFontSize(12);
//     doc.setTextColor(0);
//     doc.text(`Patient Name: ${displayName}`, 20, 45);
//     doc.text(`Email: ${patientEmail || "N/A"}`, 20, 52); 
//     doc.text(`Date: ${new Date().toLocaleDateString()}`, 140, 45);

//     let yPos = 75;
//     doc.setFontSize(14);
//     doc.setTextColor(0, 51, 102);
//     doc.text("Cardiac Stress Test Parameters:", 20, 65);
//     doc.setFontSize(11);
//     doc.setTextColor(0);

//     if (form) {
//       Object.entries(form).forEach(([key, value]) => {
//         if (!parameterNames[key]) return;
//         const formattedVal = formatValue(key, value);
//         doc.setFont("helvetica", "bold");
//         doc.text(`${parameterNames[key]}:`, 20, yPos);
//         doc.setFont("helvetica", "normal");
//         doc.text(String(formattedVal), 110, yPos);
//         yPos += 8;
//         if (yPos > 240) { doc.addPage(); yPos = 20; }
//       });
//     }

//     yPos += 10;
//     doc.line(20, yPos, 190, yPos);
//     yPos += 15;
//     doc.setFontSize(16);
//     doc.setFont("helvetica", "bold");
//     doc.setTextColor(0, 51, 102);
//     doc.text("Diagnosis Conclusion:", 20, yPos);
//     yPos += 10;
//     doc.setFontSize(12);
//     doc.setTextColor(isHighRisk ? 200 : 0, isHighRisk ? 0 : 150, 0);
//     doc.text(isHighRisk ? "POSITIVE FOR HEART DISEASE RISK (HIGH RISK)" : "NEGATIVE FOR HEART DISEASE RISK (NORMAL)", 20, yPos);
    
//     const logoImg = await loadImage(medinautsLogo);
//     if (logoImg) {
//       doc.addImage(logoImg, "PNG", 95, 265, 20, 20);
//     }
//     doc.setFontSize(9);
//     doc.setTextColor(150);
//     doc.text(`Made by MediNauts © ${new Date().getFullYear()}`, 105, 290, null, "center");

//     return doc;
//   };

//   const handleDownloadPDF = async () => {
//     const doc = await createPDFDocument();
//     doc.save(`Medical_Report_${patientName.trim()}.pdf`);
//   };

//   const handleSendEmail = async () => {
//     if (!patientEmail) {
//       alert("Please enter an email address first.");
//       return;
//     }
//     setIsSending(true);

//     try {
//       const serviceID = process.env.REACT_APP_EMAILJS_SERVICE_ID;
//       const templateID = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
//       const publicKey = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;
//       const templateParams = {
//         to_name: patientName,
//         to_email: patientEmail,
//         date: new Date().toLocaleDateString(),
//         risk_status: isHighRisk ? "⚠️ HIGH RISK (Positive)" : "✅ LOW RISK (Negative)",
//         risk_score: prediction ? (prediction.probability * 100).toFixed(0) + "%" : riskScore + "%",
//         age: form?.age || "N/A",
//         sex: formatValue("sex", form?.sex),
//         cp: formatValue("cp", form?.cp),
//         trestbps: formatValue("trestbps", form?.trestbps),
//         chol: formatValue("chol", form?.chol),
//         fbs: formatValue("fbs", form?.fbs),          
//         restecg: formatValue("restecg", form?.restecg),
//         thalach: formatValue("thalach", form?.thalach),
//         exang: formatValue("exang", form?.exang),    
//         oldpeak: formatValue("oldpeak", form?.oldpeak),
//         slope: formatValue("slope", form?.slope),    
//         ca: formatValue("ca", form?.ca),             
//         thal: formatValue("thal", form?.thal),       
//       };

//       await emailjs.send(serviceID, templateID, templateParams, publicKey);
//       alert(`✅ Full Report sent successfully to ${patientEmail}!`);
//     } catch (error) {
//       console.error("Email Error:", error);
//       alert("Failed to send email. Please check your internet connection.");
//     } finally {
//       setIsSending(false);
//     }
//   };

//   // ---------------- UI -----------------

//   return (
//     <>
//       {/* ✅ FEEDBACK POPUP - Only shows when showFeedback is true */}
//       {showFeedback && <FeedbackPopup onComplete={handleExitFinal} />}

//       <motion.div style={overlay}>
//         <div style={card}>
//           {/* ❌ Close button now triggers feedback */}
//           <button style={closeBtn} onClick={handleCloseRequest}>×</button>
          
//           <div style={{ textAlign: "center" }}>{HeartIcon}</div>
//           <h1 style={mainTitle}>{isHighRisk ? "⚠️ High Risk Detected" : "✅ Low Risk Detected"}</h1>

//           <div style={inputsWrapper}>
//               <input type="text" placeholder="Enter Patient Name..." value={patientName} onChange={(e) => setPatientName(e.target.value)} style={inputStyle} />
//               <input type="email" placeholder="Enter Patient Email..." value={patientEmail} onChange={(e) => setPatientEmail(e.target.value)} style={inputStyle} />
//           </div>

//           <p style={subTitle}>Based on your submitted clinical parameters</p>

//           <motion.div style={resultBox} animate={isHighRisk ? { boxShadow: ["0 0 0 rgba(0,0,0,0.1)", "0 0 25px rgba(255,0,0,0.8)", "0 0 0 rgba(0,0,0,0.1)"] } : { boxShadow: ["0 0 0 rgba(0,0,0,0.05)", "0 0 25px rgba(0,200,0,0.7)", "0 0 0 rgba(0,0,0,0.05)"] }} transition={{ duration: 1.5, repeat: Infinity, repeatType: "mirror" }}>
//             {prediction ? (
//               <div style={{ marginTop: 6 }}>
//                 <div style={{ fontWeight: "bold", color: isHighRisk ? "red" : "green", marginBottom: 8 }}>
//                   {isHighRisk ? "⚠️ The model predicts heart disease." : "✅ The model predicts NO heart disease."}
//                 </div>
//                 <div>Prediction value: <b>{prediction.prediction}</b></div>
//                 <div>Probability: <b>{(prediction.probability ?? 0).toFixed(3)}</b></div>
//               </div>
//             ) : <p>No server prediction — using heuristic score.</p>}
//             <p style={riskPercentage}>Estimated Risk Score: <b>{prediction ? Math.round(prediction.probability * 100) + "%" : riskScore + "%"}</b></p>
//           </motion.div>

//           <h3 style={sectionTitle}>Patient Submitted Parameters</h3>
//           <div style={grid}>
//             {form && Object.entries(form).map(([key, value]) => {
//               if (!parameterNames[key]) return null;
//               return (
//                 <div key={key} style={infoItem}>
//                   <span style={infoLabel}>{parameterNames[key].toUpperCase()}</span> : <span style={infoValue}>{formatValue(key, value)}</span>
//                 </div>
//               );
//             })}
//           </div>

//           <div style={buttonRow}>
//             {/* ❌ Button now triggers feedback */}
//             <button style={actionBtn} onClick={handleCloseRequest}>Analyze New Patient</button>
//             <button style={pdfBtn} onClick={handleDownloadPDF}>⬇ Download PDF</button>
//             <button style={{...pdfBtn, background: "#007bff"}} onClick={handleSendEmail} disabled={isSending}>
//               {isSending ? "Sending..." : "✉️ Email Report"}
//             </button>
//           </div>

//           <div style={footerContainer}>
//             <img src={medinautsLogo} alt="MediNauts" style={footerLogo} />
//             <span style={footerText}>Made by MediNauts &copy; {new Date().getFullYear()}</span>
//           </div>
//         </div>
//       </motion.div>
//     </>
//   );
// };

// // ---------------- STYLES (Unchanged) ----------------
// function calculateRisk(data) {
//   if (!data) return 0;
//   let score = 0;
//   if (data.age > 50) score += 15;
//   if (data.chol > 200) score += 15;
//   if (data.trestbps > 130) score += 10;
//   if (data.exang === 1) score += 20;
//   if (data.cp >= 2) score += 15;
//   if (data.thalach < 120) score += 10;
//   if (data.oldpeak > 2.0) score += 15;
//   return Math.min(score, 95);
// }

// const overlay = { position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", padding: 20, zIndex: 1000, backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(5px)" };
// const card = { width: "90%", maxWidth: "1000px", background: "#fff", borderRadius: "20px", padding: "30px 40px", position: "relative", maxHeight: "90vh", overflowY: "auto" };
// const closeBtn = { position: "absolute", top: 20, right: 20, fontSize: 32, border: "none", background: "none", cursor: "pointer" };
// const mainTitle = { fontSize: 28, fontWeight: 700, textAlign: "center", color: "#222", marginBottom: 10 };
// const subTitle = { textAlign: "center", fontSize: 14, color: "#555", marginBottom: 20 };
// const inputsWrapper = { display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap", marginBottom: 15 };
// const inputStyle = { padding: "10px 15px", width: "100%", maxWidth: "300px", border: "2px solid #ddd", borderRadius: "8px", fontSize: "16px", textAlign: "center", outline: "none", transition: "border 0.3s" };
// const resultBox = { background: "#f6f6f6", padding: 25, borderRadius: 20, textAlign: "center", marginBottom: 25 };
// const riskPercentage = { marginTop: 15, fontSize: 16 };
// const sectionTitle = { fontSize: 18, marginTop: 25, marginBottom: 10, fontWeight: "600", borderBottom: "2px solid #ddd", paddingBottom: 5 };
// const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 12 };
// const infoItem = { background: "#fafafa", padding: 12, borderRadius: 12, boxShadow: "0 2px 6px rgba(0,0,0,0.1)" };
// const infoLabel = { fontWeight: "600", color: "#777", fontSize: "0.85rem" };
// const infoValue = { fontWeight: "700", color: "#222", fontSize: "0.95rem", display: "block", marginTop: "2px" };
// const buttonRow = { display: "flex", justifyContent: "center", gap: 20, marginTop: 20, flexWrap: "wrap" };
// const actionBtn = { padding: "10px 18px", background: "#00008b", color: "#fff", borderRadius: 12, border: "none", cursor: "pointer" };
// const pdfBtn = { padding: "10px 18px", background: "#d32f2f", color: "#fff", borderRadius: 12, border: "none", cursor: "pointer" };
// const footerContainer = { marginTop: "35px", paddingTop: "15px", borderTop: "1px solid #eaeaea", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", opacity: 0.8 };
// const footerLogo = { height: "24px", width: "auto", objectFit: "contain" };
// const footerText = { fontSize: "0.85rem", color: "#555", fontWeight: "500", fontFamily: "Helvetica, Arial, sans-serif" };
// const feedbackOverlay = { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.6)", zIndex: 2000, display: "flex", justifyContent: "center", alignItems: "center" };
// const feedbackBox = { background: "white", padding: 30, borderRadius: 15, width: "350px", textAlign: "center" };
// const btnStyle = { padding: "8px 16px", border: "none", borderRadius: 8, cursor: "pointer" };

// export default HeartResultModal;


import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import jsPDF from "jspdf";
import emailjs from "@emailjs/browser"; 

import medinautsLogo from "./image_ce4908.png";
import feedbackIcon from "./image_1.png";
import coverPageImg from "./image/cover_page.png"; 

const BACKEND_BASE = (process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
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
        <div style={{ marginBottom: "10px", display: "flex", justifyContent: "center" }}>
          <img src={feedbackIcon} alt="Feedback Icon" style={{ width: "60px", height: "60px" }} />
        </div>

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

  const finalRiskScore = prediction ? prediction.risk_score : 0;
  const isHighRisk = finalRiskScore >= 50; 
  const stage = prediction ? prediction.prediction : 0;
  
  const stageColor = (isHighRisk && stage === 0) ? stageColorMap[3] : (stageColorMap[stage] || "#22c55e");
  
  const predictionText = (prediction && prediction.prediction_text) 
    ? String(prediction.prediction_text) 
    : (isHighRisk ? "Potential Risk Detected" : "Low Risk Detected");

  const hasHeartDisease = stage > 0 || isHighRisk;

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
    
    // Pre-load necessary image assets
    const coverImg = await loadImage(coverPageImg);
    const logoImg = await loadImage(medinautsLogo);

    // --- PAGE 0: COVER PAGE ---
    if (coverImg) {
      doc.addImage(coverImg, "PNG", 0, 0, 210, 297);
      doc.addPage();
    }
    
    // --- PAGE 1: DIAGNOSIS & PARAMETERS ---
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

    if (logoImg) doc.addImage(logoImg, "PNG", 95, 265, 20, 20);

    // --- PAGE 2: GUIDELINES & AVOIDS ---
    doc.addPage();
    let p2Y = 20;

    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 51, 102);
    doc.setFontSize(18);
    doc.text("Health Guidelines & Recommendations", 105, p2Y, null, "center");
    p2Y += 15;

    const renderPdfBullet = (title, text, currentY) => {
      doc.setFont("helvetica", "bold");
      doc.text(`• ${title}:`, 20, currentY);
      doc.setFont("helvetica", "normal");
      const splitText = doc.splitTextToSize(text, 165);
      doc.text(splitText, 25, currentY + 6);
      return currentY + 8 + (splitText.length * 5); 
    };

    doc.setFontSize(14);
    if (hasHeartDisease) {
      doc.setTextColor(211, 47, 47); // Red
      doc.text("Recommended Precautions & Next Steps", 20, p2Y);
      doc.setTextColor(0);
      doc.setFontSize(11);
      p2Y += 10;
      p2Y = renderPdfBullet("Consult a Professional", "Share these preliminary findings with a certified cardiologist for an official diagnosis and treatment plan.", p2Y);
      p2Y = renderPdfBullet("Dietary Changes", "Adopt a heart-healthy diet. Strictly reduce sodium (salt), saturated fats, and heavily processed foods.", p2Y);
      p2Y = renderPdfBullet("Monitor Vitals", "Begin keeping a daily log of your resting blood pressure and heart rate.", p2Y);
      p2Y = renderPdfBullet("Exercise with Care", "Do not engage in sudden, intense cardiovascular exertion or heavy lifting until cleared by a doctor.", p2Y);
      p2Y = renderPdfBullet("Medication Adherence", "Do not stop or alter any current prescriptions without direct medical supervision.", p2Y);
    } else {
      doc.setTextColor(34, 197, 94); // Green
      doc.text("Preventative Heart Health Guidelines", 20, p2Y);
      doc.setTextColor(0);
      doc.setFontSize(11);
      p2Y += 10;
      p2Y = renderPdfBullet("Maintain Routine Checkups", "Continue with your annual physical exams to monitor blood pressure, blood sugar, and cholesterol levels.", p2Y);
      p2Y = renderPdfBullet("Stay Active", "Aim for at least 150 minutes of moderate aerobic exercise (like brisk walking or swimming) every week.", p2Y);
      p2Y = renderPdfBullet("Eat Smart", "Focus on whole foods, lean proteins, vegetables, and whole grains to keep your heart strong.", p2Y);
      p2Y = renderPdfBullet("Manage Stress", "Practice relaxation techniques and ensure you are getting 7-8 hours of quality sleep per night.", p2Y);
    }

    p2Y += 10;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(234, 88, 12); // Orange
    doc.text("What to Avoid", 20, p2Y);
    p2Y += 8;
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0);
    doc.text("To help reduce the risk of heart disease, try to avoid or limit:", 20, p2Y);
    p2Y += 10;

    const avoidsList = [
      "Smoking and tobacco products",
      "Excessive alcohol consumption",
      "Junk food, fast food, and foods high in trans fats",
      "Too much salt (sodium)",
      "Sugary drinks and excessive sugar intake",
      "A sedentary lifestyle (lack of exercise)",
      "Being overweight or obese",
      "Chronic stress",
      "Not getting enough sleep"
    ];

    // ✅ FIX: Changed to a single vertical column to prevent text overlap in the PDF
    const startX = 25;
    let currentAvoidY = p2Y;

    avoidsList.forEach((item) => {
      doc.text(`• ${item}`, startX, currentAvoidY);
      currentAvoidY += 8;
    });

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
          
          <h1 style={{ ...mainTitle, color: stageColor }}>
             {hasHeartDisease ? "⚠️ Potential Risk Detected" : "✅ Low Risk Detected"}
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

          {/* Conditional Precautions */}
          {hasHeartDisease ? (
            <div style={{ ...precautionsContainer, borderLeft: `5px solid ${stageColor}` }}>
              <h3 style={{ ...sectionTitle, color: stageColor }}>⚠️ Recommended Precautions & Next Steps</h3>
              <ul style={precautionsList}>
                <li style={precautionItem}><strong>Consult a Professional:</strong> Share these preliminary findings with a certified cardiologist for an official diagnosis and treatment plan.</li>
                <li style={precautionItem}><strong>Dietary Changes:</strong> Adopt a heart-healthy diet. Strictly reduce sodium (salt), saturated fats, and heavily processed foods.</li>
                <li style={precautionItem}><strong>Monitor Vitals:</strong> Begin keeping a daily log of your resting blood pressure and heart rate.</li>
                <li style={precautionItem}><strong>Exercise with Care:</strong> Do not engage in sudden, intense cardiovascular exertion or heavy lifting until cleared by a doctor.</li>
                <li style={precautionItem}><strong>Medication Adherence:</strong> Do not stop or alter any current prescriptions without direct medical supervision.</li>
              </ul>
            </div>
          ) : (
            <div style={{ ...precautionsContainer, background: "#f0fdf4", borderLeft: "5px solid #22c55e" }}>
              <h3 style={{ ...sectionTitle, color: "#22c55e" }}>💚 Preventative Heart Health Guidelines</h3>
              <ul style={precautionsList}>
                <li style={precautionItem}><strong>Maintain Routine Checkups:</strong> Continue with your annual physical exams to monitor blood pressure, blood sugar, and cholesterol levels.</li>
                <li style={precautionItem}><strong>Stay Active:</strong> Aim for at least 150 minutes of moderate aerobic exercise (like brisk walking or swimming) every week.</li>
                <li style={precautionItem}><strong>Eat Smart:</strong> Focus on whole foods, lean proteins, vegetables, and whole grains to keep your heart strong.</li>
                <li style={precautionItem}><strong>Manage Stress:</strong> Practice relaxation techniques and ensure you are getting 7-8 hours of quality sleep per night.</li>
              </ul>
            </div>
          )}

          {/* What to Avoid Section (UI remains as a grid) */}
          <div style={{ ...precautionsContainer, background: "#fffaf0", borderLeft: "5px solid #f97316" }}>
            <h3 style={{ ...sectionTitle, color: "#ea580c" }}>🚫 What to Avoid</h3>
            <p style={{ fontSize: "0.95rem", color: "#555", margin: "0 0 10px 0" }}>
              To help reduce the risk of heart disease, try to avoid or limit:
            </p>
            <ul style={{ ...precautionsList, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "5px", marginTop: 0 }}>
              <li style={precautionItem}>Smoking and tobacco products</li>
              <li style={precautionItem}>Excessive alcohol consumption</li>
              <li style={precautionItem}>Junk food, fast food, and foods high in trans fats</li>
              <li style={precautionItem}>Too much salt (sodium)</li>
              <li style={precautionItem}>Sugary drinks and excessive sugar intake</li>
              <li style={precautionItem}>A sedentary lifestyle (lack of exercise)</li>
              <li style={precautionItem}>Being overweight or obese</li>
              <li style={precautionItem}>Chronic stress</li>
              <li style={precautionItem}>Not getting enough sleep</li>
            </ul>
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
const precautionsContainer = { background: "#fafafa", padding: "20px", borderRadius: "12px", marginTop: "25px", marginBottom: "10px" };
const precautionsList = { textAlign: "left", paddingLeft: "20px", margin: "10px 0 0 0", color: "#444", fontSize: "0.95rem", lineHeight: "1.6" };
const precautionItem = { marginBottom: "8px" };
const sectionTitle = { fontSize: 18, marginTop: 0, marginBottom: 10, fontWeight: "600" };

export default HeartResultModal;