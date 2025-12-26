import React, { useRef } from "react";
import emailjs from "@emailjs/browser";
import logo from "./image/logo.PNG"; // Make sure this path is correct

const Contact = () => {
  const form = useRef();

  const sendEmail = (e) => {
    e.preventDefault();

    // Debugging: Check if keys are actually replaced
    console.log("Sending email...");

    const service_ID = process.env.REACT_APP_SERVICE_ID
    const template_ID = process.env.REACT_APP_TEMPLATE_ID
    const public_Key = process.env.REACT_APP_PUBLIC_KEY

    emailjs
      .sendForm(
        service_ID,
        template_ID,
        form.current,
        public_Key
      )
      .then(
        (result) => {
          console.log("SUCCESS!", result.text);
          alert("Message sent successfully!");
          e.target.reset(); // Clears the form after sending
        },
        (error) => {
          console.error("FAILED...", error);
          // This will show the exact technical reason why it failed in the alert
          alert(`Failed to send message. Error: ${error.text}`); 
        }
      );
  };

  return (
    <div
      style={{
        minHeight: "80vh",
        padding: "50px 20px",
        background: "linear-gradient(to bottom, #ffffff, #fde0e0)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Arial, sans-serif", // Added to fix font issue
      }}
    >
      <div
        style={{
          background: "#fff",
          maxWidth: "900px",
          width: "100%",
          borderRadius: "15px",
          padding: "40px",
          boxShadow: "0 6px 18px rgba(0,0,0,0.1)",
          display: "flex",
          flexWrap: "wrap",
          gap: "40px",
        }}
      >
        {/* Left Section */}
        <div
          style={{
            flex: "1",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img
            src={logo}
            alt="Logo"
            style={{
              width: "140px",
              marginBottom: "20px",
              borderRadius: "12px",
              boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
            }}
          />

          <p
            style={{
              fontSize: "18px",
              color: "#b71c1c",
              marginBottom: "15px",
              fontWeight: "600",
            }}
          >
            📧 support@medinauts.com
          </p>

          <p
            style={{
              fontSize: "18px",
              color: "#b71c1c",
              fontWeight: "600",
            }}
          >
            📞 03582 21156
          </p>
        </div>

        {/* Right Section */}
        <div style={{ flex: "1" }}>
          <h2
            style={{
              textAlign: "center",
              marginBottom: "20px",
              fontSize: "28px",
              color: "#b71c1c",
              fontWeight: "700",
            }}
          >
            Get in Touch
          </h2>

          <form
            ref={form}
            onSubmit={sendEmail}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "15px",
              width: "100%",
            }}
          >
            <input
              type="text"
              name="user_name"  // Must match {{user_name}} in EmailJS
              placeholder="Your Name"
              style={inputStyle}
              required
            />
            <input
              type="email"
              name="user_email" // Must match {{user_email}} in EmailJS
              placeholder="Your Email"
              style={inputStyle}
              required
            />
            <textarea
              name="message"    // Must match {{message}} in EmailJS
              placeholder="Your Message"
              rows="5"
              style={inputStyle}
              required
            />

            <button
              type="submit"
              style={{
                ...btnStyle,
                width: "100%",
                display: "block",
              }}
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const inputStyle = {
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #e2bcbc",
  fontSize: "16px",
  width: "100%",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "Arial, sans-serif", // Ensures input font matches
};

const btnStyle = {
  padding: "12px",
  borderRadius: "8px",
  border: "none",
  backgroundColor: "#b71c1c",
  color: "#fff",
  fontSize: "16px",
  cursor: "pointer",
  fontWeight: "600",
  transition: "0.3s",
  boxSizing: "border-box",
  fontFamily: "Arial, sans-serif",
};

export default Contact;
