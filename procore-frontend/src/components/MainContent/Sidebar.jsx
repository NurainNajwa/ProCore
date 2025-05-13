import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // Importing the AuthContext to manage login/logout
import "./Sidebar.css";
import { FiUser } from "react-icons/fi";
import { FiMenu } from "react-icons/fi";
import { RiMenu2Line } from "react-icons/ri";
import { PiNutFill } from "react-icons/pi";
import { GrProjects } from "react-icons/gr";
import { CgNotes } from "react-icons/cg";
import { TbMessage2Question } from "react-icons/tb";
import { FaDatabase } from "react-icons/fa"; 
// import avatar from "../../assets/avatar.jpg";

const Sidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(
    localStorage.getItem("isSidebarOpen") === "true"
  );
  const navigate = useNavigate(); // Hook to handle redirection after logout
  const { user, logout } = useAuth(); // Get logged-in user and logout function from AuthContext
  const defaultAvatar = "/default-avatar.jpg"; // Placeholder avatar

  // Toggle sidebar open/close
  const toggleSidebar = () => {
    const newState = !isSidebarOpen;
    setIsSidebarOpen(newState);
    localStorage.setItem("isSidebarOpen", newState);
  };

  // Handle logout logic
  const handleLogout = () => {
    logout(); // Call logout from AuthContext to update the state and clear localStorage
    navigate("/login"); // Redirect to the login page after logout
  };

  return (
    <div className={`sidebar ${isSidebarOpen ? "expanded" : "collapsed"}`}>
      {/* Toggle Button */}
      <div className="sidebar-header">
        {isSidebarOpen && (
          <div className="logo">
            <PiNutFill />
            <h1>Dashboard v0.1</h1>
          </div>
        )}
        <button className="rounded-circle toggle-btn" id="sidebarToggle" onClick={toggleSidebar}>
          {isSidebarOpen ? <FiMenu /> : <RiMenu2Line />}
        </button>
      </div>

      {/* Menu Links */}
      <div className="menu-links">
        <NavLink
          to="/projects"
          className={({ isActive }) => (isActive ? "menu-item active" : "menu-item")}
        >
          <GrProjects />
          {isSidebarOpen && <span>Projects</span>}
        </NavLink>
        <NavLink
          to="/summary"
          className={({ isActive }) => (isActive ? "menu-item active" : "menu-item")}
        >
          <CgNotes />
          {isSidebarOpen && <span>Summary</span>}
        </NavLink>
        <NavLink to="/resources" className={({ isActive }) => (isActive ? "menu-item active" : "menu-item")}>
          <FaDatabase />
          {isSidebarOpen && <span>Resource Table</span>}
        </NavLink>
        <NavLink
          to="/help"
          className={({ isActive }) => (isActive ? "menu-item active" : "menu-item")}
        >
          <TbMessage2Question />
          {isSidebarOpen && <span>Help</span>}
        </NavLink>
      </div>

      {/* User Profile */}
      <div className="user-profile">
        <img src={user?.profileImage || defaultAvatar} alt="User Profile" className="profile-img" />
        {user && (
          <div>
            <p>{user.name}</p>
            <small>{user.role}</small>
            <NavLink to="/profile">
              <button className="profile-btn"><FiUser /> Profile</button>
            </NavLink>
          </div>
        )}
      </div>

      {/* Logout Button */}
      {user && (
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      )}
    </div>
  );
};

export default Sidebar;
