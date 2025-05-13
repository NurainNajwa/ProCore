import React, { useState, useEffect } from "react";
import axios from "axios";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext"; 
import Login from "./components/Login";
import Register from "./components/Register";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import VerifyEmail from "./components/VerifyEmail"; 
import ProjectList from "./components/MainContent/ProjectList";
import ResourceTable from "./components/MainContent/ResourceTable";
import UsersByResource from "./components/MainContent/UserByResource";
import Summary from "./components/MainContent/Summary";
import Help from "./components/MainContent/Help";
import ProjectDetails from "./components/MainContent/ProjectDetails";
import AddProject from "./components/MainContent/AddProject";
import Profile from "./components/MainContent/Profile"; 
import ProtectedRoute from "./components/ProtectedRoute";

import "./App.css";

function App() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost:5000")
      .then((response) => {
        setMessage(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="loading-indicator">Loading...</div>;
  }

  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <header>
            <h1>{message}</h1>
          </header>
          <main>
            <Routes>
              {/* Default route */}
              <Route path="/" element={<Navigate to="/login" />} />

              {/* Auth routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:resetToken" element={<ResetPassword />} />
              <Route path="/verify-email" element={<VerifyEmail />} /> 

              {/* Protected routes */}
              <Route path="/projects" element={<ProtectedRoute><ProjectList /></ProtectedRoute>} />
              <Route path="/resources" element={<ProtectedRoute><ResourceTable /></ProtectedRoute>} />
              <Route path="/users-by-resource/:resourceName" element={<ProtectedRoute><UsersByResource /></ProtectedRoute>} />
              <Route path="/summary" element={<ProtectedRoute><Summary /></ProtectedRoute>} />
              <Route path="/help" element={<ProtectedRoute><Help /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

              {/* Specific project details route */}
              <Route path="/projects/:projectId" element={<ProtectedRoute><ProjectDetails /></ProtectedRoute>} />
              
              {/* Add Project */}
              <Route path="/addproject" element={<ProtectedRoute><AddProject /></ProtectedRoute>} />

              {/* 404 Route */}
              <Route path="*" element={<div>404 - Page Not Found</div>} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
