import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./VerifyEmail.css";

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "your email";
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [errorMessage, setErrorMessage] = useState("");
  const [resendMessage, setResendMessage] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [timer, setTimer] = useState(60); // Timer for OTP resend

  // Countdown timer
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) {
      document.getElementById(`otp-${index + 1}`).focus();
    } else if (!value && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  const handleVerify = async () => {
    const enteredOtp = otp.join("");
    try {
      const response = await axios.post("http://localhost:5000/api/users/verify-otp", {
        email,
        otp: enteredOtp,
      });

      if (response.data.success) {
        alert("OTP Verified!");  //CHANGE LATER 
        navigate("/login"); // Redirect to login page
      } else {
        setErrorMessage(response.data.message || "Invalid OTP. Please try again.");
      }
    } catch (error) {
      setErrorMessage("Something went wrong. Please try again.");
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setResendMessage("");

    try {
      await axios.post("http://localhost:5000/api/users/resend-otp", { email });
      setResendMessage("OTP has been resent to your email.");
      setTimer(60); // Reset timer
    } catch (error) {
      setResendMessage("Failed to resend OTP. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="verify-email-container">
      <div className="verify-email-box">
        <h2>OTP Verification</h2>
        <h4>Please check your email</h4>
        <p className="email-hint">We’ve sent a code to <strong>{email}</strong></p>

        <div className="otp-inputs">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e, index)}
            />
          ))}
        </div>

        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <p className="resend">
          Didn't get the code?{" "}
          <button
            className="resend-btn"
            onClick={handleResend}
            disabled={isResending || timer > 0}
          >
            {isResending ? "Resending..." : `Resend OTP ${timer > 0 ? `in ${timer}s` : ""}`}
          </button>
        </p>
        {resendMessage && <p className="resend-message">{resendMessage}</p>}

        <div className="actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate("/register")}
          >
            Cancel
          </button>
          <button
            type="button"
            className="verify-btn"
            onClick={handleVerify}
          >
            Verify
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
