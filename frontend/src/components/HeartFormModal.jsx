import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaFileMedical, FaSync } from "react-icons/fa";

// Ensure this matches your live Docker URL
const BACKEND_BASE = (process.env.REACT_APP_BACKEND_URL).replace(/\/$/, "");
const PREDICT_URL = `${BACKEND_BASE}/predict`;
const SCAN_URL = `${BACKEND_BASE}/scan-report`;

const HeartFormModal = ({ close }) => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    age: "", sex: "", cp: "", trestbps: "", chol: "", fbs: "",
    restecg: "", thalach: "", exang: "", oldpeak: "", slope: "", ca: "", thal: ""
  });

  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  
  // Track missing fields to highlight them in red
  const [missingFields, setMissingFields] = useState([]);

  // ✅ UPDATED: Handle Multiple File Scanning
  const handleScanReport = async (e) => {
    // 1. Get all selected files
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setScanning(true);
    setError(null);
    setMissingFields([]); 

    let mergedData = {}; // Store results from all pages
    let successCount = 0;

    try {
      // 2. Loop through and scan each file one by one
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch(SCAN_URL, {
                method: "POST",
                body: formData,
            });

            if (res.ok) {
                const result = await res.json();
                if (result.status === "success") {
                    successCount++;
                    // 3. Merge Strategy: Only overwrite keys if the new value is NOT null
                    Object.keys(result.data).forEach(key => {
                        if (result.data[key] !== null && result.data[key] !== "") {
                            mergedData[key] = result.data[key];
                        }
                    });
                }
            }
        } catch (innerErr) {
            console.warn(`Failed to scan file ${file.name}`, innerErr);
        }
      }

      if (successCount === 0) throw new Error("Failed to read any reports. Please enter manually.");

      // 4. Check what is still missing after merging all files
      const requiredKeys = ["age", "sex", "cp", "trestbps", "chol", "fbs", "restecg", "thalach", "exang", "oldpeak", "slope", "ca", "thal"];
      const missing = requiredKeys.filter(key => mergedData[key] === null || mergedData[key] === undefined || mergedData[key] === "");

      if (missing.length > 0) {
        setMissingFields(missing);
        setError(`⚠️ Scanned ${files.length} file(s). Missed ${missing.length} parameters. Please fill highlighted fields.`);
      } else {
        setError(null);
      }

      // 5. Update Form State
      setForm((prev) => ({
        ...prev,
        ...mergedData,
      }));

    } catch (err) {
      setError(err.message);
    } finally {
      setScanning(false);
      e.target.value = null; // Reset input to allow selecting same files again
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    
    // Remove red highlight if user starts typing
    if (missingFields.includes(e.target.name)) {
        setMissingFields(prev => prev.filter(field => field !== e.target.name));
    }
  };

  const normalizeForm = (f) => ({
    age: Number(f.age), sex: Number(f.sex), cp: Number(f.cp),
    trestbps: Number(f.trestbps), chol: Number(f.chol), fbs: Number(f.fbs),
    restecg: Number(f.restecg), thalach: Number(f.thalach), exang: Number(f.exang),
    oldpeak: Number(f.oldpeak), slope: Number(f.slope), ca: Number(f.ca), thal: Number(f.thal),
  });

  const submitForm = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const payload = normalizeForm(form);
    const token = localStorage.getItem("medinauts_token");

    if (!token) {
        setError("You must be logged in to use this feature.");
        setLoading(false);
        return;
    }

    try {
      const res = await fetch(PREDICT_URL, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error("Session expired. Please log in again.");
        throw new Error(`Server Error: ${res.status}`);
      }

      const prediction = await res.json();
      if (close) close();
      // Pass data to result page
      navigate("/heart-result", { state: { form: payload, prediction } });

    } catch (err) {
      console.error("Prediction Failed", err);
      
      // ⚠️ ALERT THE USER (Added Logic)
      alert("Connection to the AI server was lost. Please refresh the page or login again.");
      
      setError(err.message || "Prediction failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <button onClick={close} style={closeBtn}>×</button>

        <div style={{ textAlign: "center", marginBottom: 10 }}>
          <h1 style={{ margin: 0, fontSize: 18, color: "red" }}>Medical Analysis</h1>
          <h2 style={{ margin: "3px 0", fontSize: 22, fontWeight: 700, color: "#222" }}>
            Enter Clinical Parameters
          </h2>
        </div>

        {/* ✅ SCANNER SECTION (UPDATED FOR MULTIPLE FILES) */}
        <div style={scanContainer}>
          <label style={scanLabel}>
            {scanning ? <FaSync className="spin" /> : <FaFileMedical />} 
            {scanning ? " Scanning..." : " Auto-Fill from Reports (Upload Multiple)"}
            <input 
                type="file" 
                accept="image/*,.pdf" 
                multiple 
                onChange={handleScanReport} 
                style={{ display: "none" }} 
            />
          </label>
        </div>

        <form onSubmit={submitForm}>
          <h3 style={sectionTitle}>🫀 Patient Details</h3>
          <div style={row}>
            <Field label="AGE" name="age" type="number" placeholder="Years" value={form.age} onChange={handleChange} isMissing={missingFields.includes("age")} />
            <Field label="SEX" name="sex" type="select" options={[0, 1]} value={form.sex} onChange={handleChange} hint={["0: Female", "1: Male"]} isMissing={missingFields.includes("sex")} />
            <Field label="CHEST PAIN TYPE" name="cp" type="select" options={[0, 1, 2, 3]} value={form.cp} onChange={handleChange} hint={["0: Typical", "1: Atypical", "2: Non-Anginal", "3: None"]} isMissing={missingFields.includes("cp")} />
          </div>

          <h3 style={sectionTitle}>🩺 Clinical Vitals</h3>
          <div style={row}>
            <Field label="RESTING BP" name="trestbps" type="number" placeholder="mm Hg" value={form.trestbps} onChange={handleChange} isMissing={missingFields.includes("trestbps")} />
            <Field label="CHOLESTEROL" name="chol" type="number" placeholder="mg/dL" value={form.chol} onChange={handleChange} isMissing={missingFields.includes("chol")} />
            <Field label="BLOOD SUGAR" name="fbs" type="select" options={[0, 1]} value={form.fbs} onChange={handleChange} hint={["0: ≤ 120", "1: > 120"]} isMissing={missingFields.includes("fbs")} />
          </div>

          <div style={row}>
            <Field label="RESTING ECG" name="restecg" type="select" options={[0, 1, 2]} value={form.restecg} onChange={handleChange} hint={["0: Normal", "1: ST-T Abn", "2: LV Hypertrophy"]} isMissing={missingFields.includes("restecg")} />
            <Field label="MAX HEART RATE" name="thalach" type="number" placeholder="BPM" value={form.thalach} onChange={handleChange} isMissing={missingFields.includes("thalach")} />
            <Field label="EXERCISE ANGINA" name="exang" type="select" options={[0, 1]} value={form.exang} onChange={handleChange} hint={["0: No", "1: Yes"]} isMissing={missingFields.includes("exang")} />
          </div>

          <h3 style={sectionTitle}>🧪 Test Results</h3>
          <div style={row}>
            <Field label="ST DEPRESSION" name="oldpeak" type="text" placeholder="e.g. 1.5" value={form.oldpeak} onChange={handleChange} isMissing={missingFields.includes("oldpeak")} />
            <Field label="ST SLOPE" name="slope" type="select" options={[0, 1, 2]} value={form.slope} onChange={handleChange} hint={["0: Up", "1: Flat", "2: Down"]} isMissing={missingFields.includes("slope")} />
            <Field label="MAJOR VESSELS" name="ca" type="select" options={[0, 1, 2, 3]} value={form.ca} onChange={handleChange} hint={["0-3 colored vessels"]} isMissing={missingFields.includes("ca")} />
          </div>
          <div style={row}>
            <Field label="THALLIUM" name="thal" type="select" options={[1, 2, 3]} value={form.thal} onChange={handleChange} hint={["1: Normal", "2: Fixed", "3: Reversible"]} isMissing={missingFields.includes("thal")} />
          </div>

          <div style={{ textAlign: "center", marginTop: 20 }}>
            <button type="submit" style={processBtn} disabled={loading || scanning}>
              {loading ? "Processing…" : "Process Data ❤️"}
            </button>
          </div>

          {error && <p style={{ color: "red", marginTop: 10, textAlign: "center", fontWeight: "bold" }}>{error}</p>}
        </form>
      </div>
      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

/* Field Component with Red Border Support */
const Field = ({ label, name, type, placeholder, value, onChange, options, hint, isMissing }) => {
    const dynamicInputStyle = {
        ...inputStyle,
        border: isMissing ? "2px solid #ff4d4d" : "1px solid #ccc",
        backgroundColor: isMissing ? "#fff5f5" : "#fff"
    };

    return (
      <div style={fieldBox}>
        <label style={labelStyle}>{label}</label>
        {type === "select" ? (
          <select name={name} value={value} onChange={onChange} required style={dynamicInputStyle}>
            <option value="">Select</option>
            {options.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        ) : (
          <input name={name} value={value} onChange={onChange} type={type} placeholder={placeholder} required style={dynamicInputStyle} />
        )}
        {hint && <div style={hintStyle}>{hint.map((h, i) => <div key={i}>{h}</div>)}</div>}
      </div>
    );
};

/* Styles */
const scanContainer = { 
  background: "#f8f9fa", 
  padding: "15px", 
  borderRadius: "15px", 
  border: "2px dashed #be123c", 
  textAlign: "center", 
  marginBottom: "15px",
  cursor: "pointer" 
};
const scanLabel = { cursor: "pointer", color: "#be123c", fontWeight: "bold", fontSize: "14px", display: "flex", justifyContent: "center", alignItems: "center", gap: "10px" };
const fieldBox = { flex: "1 1 250px", display: "flex", alignItems: "center", gap: 10 };
const labelStyle = { width: 140, fontSize: 12, fontWeight: 600, color: "#333" };
const inputStyle = { flex: 1, padding: 8, borderRadius: 10, fontSize: 13, outline: "none", transition: "border 0.2s" };
const hintStyle = { fontSize: 11, color: "#777", width: 100, lineHeight: 1.3 };
const overlayStyle = { position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 };
const modalStyle = { width: "85%", background: "#fff", borderRadius: 30, padding: "25px 30px", boxShadow: "0 10px 30px rgba(0,0,0,0.25)", maxHeight: "85vh", overflowY: "auto", position: "relative" };
const closeBtn = { fontSize: 28, border: "none", background: "none", cursor: "pointer", position: "absolute", top: 12, right: 15 };
const sectionTitle = { marginTop: 22, marginBottom: 8, fontSize: 16, color: "#444", fontWeight: 600, borderBottom: "2px solid #e0e0e0", paddingBottom: 4 };
const row = { display: "flex", gap: 18, marginBottom: 12, flexWrap: "wrap" };
const processBtn = { backgroundSize: "200% auto", backgroundImage: "linear-gradient(to right, #00008b 0%, #00008b 50%, #ff0000 50%, #ff0000 100%)", color: "#fff", padding: "10px 22px", fontSize: 14, borderRadius: 16, cursor: "pointer", border: "none", transition: "0.4s ease", backgroundPosition: "right center" };

export default HeartFormModal;
