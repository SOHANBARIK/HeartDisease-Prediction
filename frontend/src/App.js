import React, { useState } from "react"; 
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { FaFlag } from "react-icons/fa"; 

// Components
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Collaborators from "./components/Collaborators";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import Login from "./components/Login";
import HeartResult from "./components/HeartResult";
import WebsiteTour from "./components/WebsiteTour";
import Chatbot from "./components/Chatbot"; 

import "./index.css"; 

function App() {
  const [runTour, setRunTour] = useState(false); 

  return (
    <Router>
      <div className="app-layout">
        
        <WebsiteTour run={runTour} setRun={setRunTour} />

        <Navbar />

        <div className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/collaborators" element={<Collaborators />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/heart-result" element={<HeartResult />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </div>

        <Footer />

        <button
          onClick={() => setRunTour(true)}
          style={{
            position: "fixed",
            bottom: "20px",
            left: "20px",
            zIndex: 9999,
            backgroundColor: "#2A9D8F", 
            color: "white",
            border: "none",
            borderRadius: "50px",
            padding: "12px 20px",
            fontSize: "15px",
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "transform 0.2s"
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
          onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
        >
          <FaFlag /> Tour
        </button>

        <Chatbot />
        
      </div>
    </Router>
  );
}

export default App;
