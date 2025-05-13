import React, { useState, useEffect } from "react";
import "./Login.css";
import { FaRegEnvelope } from "react-icons/fa";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate for redirection
import axios from "axios"; // Import axios for API requests
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate(); // Hook to navigate between routes
  const { login, isAuthenticated } = useAuth();
  // State to manage email, password, and errors
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/projects"); // Redirect to projects page if user is already authenticated
    }
  }, [isAuthenticated, navigate]);


  // Function to handle login submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent form from reloading the page

    try {
      const response = await axios.post("http://localhost:5000/api/users/login", {
        email,
        password,
      });


      // Use the login function from context to handle access and refresh tokens
      login(response.data.accessToken, response.data.refreshToken); // Set tokens and user in context 
      alert("Login successful!");
      navigate("/projects"); // Redirect to the projects page
    } catch (err) {
      console.error("Login Error:", err.response?.data?.message || err.message);
      setError(err.response?.data?.message || "Login failed. Try again.");
    }
  };

  // Toggle showPassword state when icon is clicked
  const togglePasswordVisibility = () => {
    console.log("Password visibility toggled!");
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          {/* Email Input */}
          <div className="input-group">
            <input
              type="email"
              placeholder="example@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <FaRegEnvelope className="icon" />
          </div>

          {/* Password Input */}
          <div className="input-group password">
            <input
              type={showPassword ? "text" : "password"} // Toggle between text and password type
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="icon" onClick={togglePasswordVisibility}>
              {showPassword ? (
                <MdVisibility className="icon" />
              ) : (
                <MdVisibilityOff className="icon" />
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && <p style={{ color: "red", fontSize: "14px" }}>{error}</p>}

          {/* Remember Me & Forgot Password */}
          <div className="options">
            <label>
              <input type="checkbox" /> Remember me
            </label>
            <Link to="/forgot-password">Forgot password?</Link>
          </div>

          {/* Login Button */}
          <div>
            <button type="submit" className="login-button">
              Login
            </button>
          </div>

          {/* Register Option */}
          <p>
            Don’t have an account? <Link to="/register">Register</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
