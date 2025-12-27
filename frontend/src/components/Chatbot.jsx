import React, { useState, useRef, useEffect } from "react";
import { FaCommentMedical, FaTimes, FaPaperPlane, FaRobot } from "react-icons/fa";

// ✅ FIXED: Use the secure Environment Variable for Production
// This ensures it works on Netlify/Vercel (Production) AND Localhost automatically.
const BACKEND_BASE = (process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
const CHAT_API_URL = `${BACKEND_BASE}/chat`;

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi! I am the Medinauts Assistant. Ask me about heart health terms like 'CP' or 'Slope'!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Auto-scroll to bottom of chat
  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // 1. Add User Message
    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // 2. Call Backend
      const res = await fetch(CHAT_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();

      // 3. Add Bot Response
      const botMsg = { sender: "bot", text: data.reply || "Sorry, I couldn't understand that." };
      setMessages((prev) => [...prev, botMsg]);

    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [...prev, { sender: "bot", text: "⚠️ Network error. Is the backend running?" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", bottom: "20px", right: "20px", zIndex: 9999, fontFamily: "sans-serif" }}>
      
      {/* 1. Toggle Button (Closed State) */}
      {!isOpen && (
        <button
          className="tour-chatbot" // 👈 ✅ ADDED THIS FOR THE TOUR
          onClick={() => setIsOpen(true)}
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            backgroundColor: "#E63946", // Medical Red
            color: "white",
            border: "none",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "transform 0.2s"
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
          onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
        >
          <FaCommentMedical size={28} />
        </button>
      )}

      {/* 2. Chat Window (Open State) */}
      {isOpen && (
        <div style={{
          width: "350px",
          height: "500px",
          backgroundColor: "#fff",
          borderRadius: "15px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          border: "1px solid #ddd"
        }}>
          
          {/* Header */}
          <div style={{
            backgroundColor: "#E63946",
            padding: "15px",
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontWeight: "bold"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <FaRobot size={20} />
              <span>Medinauts AI</span>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: "none", border: "none", color: "white", cursor: "pointer" }}>
              <FaTimes size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div style={{ flex: 1, padding: "15px", overflowY: "auto", backgroundColor: "#f9f9f9" }}>
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
                  marginBottom: "10px"
                }}
              >
                <div style={{
                  maxWidth: "80%",
                  padding: "10px 14px",
                  borderRadius: "12px",
                  fontSize: "14px",
                  lineHeight: "1.4",
                  backgroundColor: msg.sender === "user" ? "#1D3557" : "#fff",
                  color: msg.sender === "user" ? "#fff" : "#333",
                  border: msg.sender === "user" ? "none" : "1px solid #ddd",
                  borderBottomRightRadius: msg.sender === "user" ? "0" : "12px",
                  borderBottomLeftRadius: msg.sender === "bot" ? "0" : "12px"
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && <div style={{ fontSize: "12px", color: "#888", fontStyle: "italic" }}>Typing...</div>}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={sendMessage} style={{ padding: "10px", borderTop: "1px solid #eee", display: "flex", gap: "10px" }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your heart health..."
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "20px",
                border: "1px solid #ddd",
                outline: "none"
              }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: "#1D3557",
                color: "white",
                border: "none",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <FaPaperPlane size={14} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
