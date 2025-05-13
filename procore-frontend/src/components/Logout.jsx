import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();  // Remove token from localStorage and update context
    navigate("/login");  // Redirect to login page
  };

  return <button onClick={handleLogout}>Logout</button>;
};

export default Logout;
