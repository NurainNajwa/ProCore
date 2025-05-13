import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import Sidebar from "./Sidebar";
import Breadcrumb from "./Breadcrumb";
import "./UserByResource.css";

const UsersByResource = () => {
  const { resourceName } = useParams(); // Use resourceName
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUsers();
  }, [resourceName]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/resources/users/${resourceName}`);
      console.log("Users by Resource:", res.data);
      setUsers(res.data.users || []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users.");
      setLoading(false);
    }
  };

  const breadcrumbs = [
    { label: "Home", link: "/" },
    { label: "Resources", link: "/resources" },
    { label: resourceName || "Users", link: "#" },
  ];

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="main-content">
        <header className="header">
          <Breadcrumb crumbs={breadcrumbs} />
          <h1>Users for {resourceName}</h1>
        </header>

        {loading ? (
          <p className="loading-text">Loading users...</p>
        ) : error ? (
          <p className="error-text">{error}</p>
        ) : users.length > 0 ? (
          <div className="user-section">
            <table className="user-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Name</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={user.user_id}>
                    <td>{index + 1}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="no-users-text">No users found for this resource.</p>
        )}

        <Link to="/resources" className="back-btn">← Back to Resources</Link>
      </div>
    </div>
  );
};

export default UsersByResource; 
