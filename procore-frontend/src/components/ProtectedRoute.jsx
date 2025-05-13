import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    // If the user is not authenticated, redirect them to the login page
    return <Navigate to="/login" replace />;
  }

  return children; // If authenticated, render the children (the protected page)
};

export default ProtectedRoute;
// now help me for projectlist.jsx and projectdetails.jsx