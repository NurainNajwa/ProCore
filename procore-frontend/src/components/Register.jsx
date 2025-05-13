import React, { useState } from "react";
import Select from "react-select";
import "./Register.css";
import { VscAccount } from "react-icons/vsc";
import { FaRegEnvelope } from "react-icons/fa";
import { MdVisibility, MdVisibilityOff, MdArrowDropDown } from "react-icons/md"; 
import { Link, useNavigate } from "react-router-dom";
import axios from "axios"; // For API requests

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); 
  const navigate = useNavigate();

   // Role options with descriptions for tooltips
  const roleOptions = [
    {
      label: "Business Analyst",
      options: [
        { value: "Junior Business Analyst", label: "Junior Business Analyst", description: "Entry-level analyst focusing on business processes."},
        { value: "Senior Business Analyst", label: "Senior Business Analyst", description: "Experienced analyst overseeing complex projects." },
      ],
    },
    {
      label: "UI/UX Designer",
      options: [
        { value: "Junior UIUX", label: "Junior UI/UX", description: "Beginner in designing user interfaces and experiences." },
        { value: "Senior UIUX", label: "Senior UI/UX", description: "Expert in crafting seamless user experiences." },
      ],
    },
    {
      label: "Frontend Developer",
      options: [
        { value: "Junior Frontend Developer", label: "Junior Frontend Developer", description: "Entry-level developer working on client-side code."  },
        { value: "Senior Frontend Developer", label: "Senior Frontend Developer", description: "Experienced developer specializing in front-end solutions." },
      ],
    },
    {
      label: "Backend Developer",
      options: [
        { value: "Junior Backend Developer", label: "Junior Backend Developer",description: "Beginner in server-side development." },
        { value: "Senior Backend Developer", label: "Senior Backend Developer",description: "Expert in back-end systems and architecture." },
      ],
    },
    {
      label: "FullStack Developer",
      options: [
        { value: "FullStack Developer", label: "FullStack Developer", description: "Proficient in both front-end and back-end development."  },
      ],
    },
    {
      label: "Tester",
      options: [
        { value: "Junior Tester", label: "Junior Tester", description: "Entry-level tester ensuring software quality." },
        { value: "Senior Tester", label: "Senior Tester",description: "Experienced tester managing quality assurance." },
      ],
    },
    {
      label: "Administrative Roles",
      options: [
        { value: "Admin", label: "Admin", description: "Administrator managing system settings." },
        { value: "Manager", label: "Manager", description: "Oversees projects and team performance." },
      ],
    },
  ];
  

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle role selection
  const handleRoleChange = (selectedOption) => {
    setFormData({ ...formData, role: selectedOption });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formattedFormData = {
      ...formData,
      role: formData.role?.value || "", // Extract only the value
    };

    try {
      const response = await axios.post(
        "http://localhost:5000/api/users/register", 
        formattedFormData
      );

      // console.log("Register API Response:", response);

      if (response.data.success) {
        navigate("/verify-email", { state: { email: formData.email } });
      } else {
        setError(response.data.message || "Registration failed");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState); 
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h2>Register</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            <VscAccount className="icon" />
          </div>
          <div className="input-group">
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            <FaRegEnvelope className="icon" />
          </div>
          <div className="input-group">
            <input
              type={showPassword ? "text" : "password"} // Toggle between text and password type
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
            <div className="password-toggle" onClick={togglePasswordVisibility}>
              {showPassword ? (
                <MdVisibility className="icon" />
              ) : (
                <MdVisibilityOff className="icon" />
              )}
            </div>
          </div>
          <div className="input-group">
            <Select
              name="role"
              options={roleOptions}
              onChange={handleRoleChange}
              value={formData.role}
              placeholder="Select a Role"
              isSearchable
              getOptionLabel={(e) => (
                <div title={e.description}>
                  {e.label}
                </div>
              )}
            />
            <MdArrowDropDown className="icon"  />
          </div>
          <div className="checkbox-group">
            <input type="checkbox" id="privacyPolicy" required />
            <label htmlFor="privacyPolicy">
              I agree with the
              <a href="/privacy-policy" target="_blank"> {" "} Privacy Policy</a>
            </label>
          </div>
          <button type="submit" className="register-btn" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
        <p className="signin-link">
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
