import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Sidebar from "./Sidebar";
import Breadcrumb from "./Breadcrumb";
import { FaInfoCircle } from "react-icons/fa"; 
import "./ResourceTable.css";

const ResourceTable = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newResource, setNewResource] = useState({ name: "", rate: "", description: "" });
  const [editResource, setEditResource] = useState({ id: "", name: "", rate: "", description: "" });

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/resources/getAll");
      setResources(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching resources:", err);
      setError("Failed to load resources.");
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/resources/delete/${id}`);
      fetchResources(); // Reload the resource list after deletion
    } catch (err) {
      console.error("Error deleting resource:", err);
    }
  };

  
  const handleAddResource = async (e) => {
    e.preventDefault(); // Prevent page reload
  
    console.log("Submitting:", newResource); // Debugging
  
    if (!newResource.name || !newResource.rate || !newResource.description) {
      alert("Please fill in all fields before adding.");
      return;
    }
  
    try {
      const response = await axios.post("http://localhost:5000/api/resources/add", {
        name: newResource.name,
        rate: parseFloat(newResource.rate), // Ensure it's a number
        description: newResource.description,
      });
  
      console.log("Resource added:", response.data); // Debugging
      alert("Resource added successfully!");
  
      setShowAddModal(false);
      setNewResource({ name: "", rate: "", description: "" }); // Reset form
      fetchResources(); // Reload resources after adding a new one
    } catch (err) {
      console.error("Error adding resource:", err);
      alert(err.response?.data?.message || "Error adding resource");
    }
  };  
  

  const handleEditResource = (resource) => {
    setEditResource({
      id: resource.resource_id,
      name: resource.name,
      rate: resource.rate,
      description: resource.description,
    });
    setShowEditModal(true);
  };

  const handleUpdateResource = async (e) => {
    e.preventDefault();
    if (!editResource.name || !editResource.rate || !editResource.description) {
      alert("Please fill in all fields before updating.");
      return;
    }

    try {
      await axios.put("http://localhost:5000/api/resources/update", {
        id: editResource.id,
        name: editResource.name,
        rate: parseFloat(editResource.rate),
        description: editResource.description,
      });

      alert("Resource updated successfully!");
      setShowEditModal(false);
      fetchResources(); // Reload resources after updating
    } catch (err) {
      console.error("Error updating resource:", err);
      alert(err.response?.data?.message || "Error updating resource");
    }
  };

  const breadcrumbs = [
    { label: "Home", link: "/" },
    { label: "Resources", link: "/resources" },
  ];

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="main-content">
        <header className="header">
          <Breadcrumb crumbs={breadcrumbs} />
          <h1>Resource Table</h1>
        </header>

        {loading ? (
          <p className="loading-text">Loading resources...</p>
        ) : error ? (
          <p className="error-text">{error}</p>
        ) : (
          <div className="table-section">
            <table className="resource-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Role Name</th>
                  <th>Rate (RM/hr)</th>
                  <th>Number of Users</th>
                  <th>User List</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {resources.map((res, index) => (
                  <tr key={res.resource_id}>
                    <td>{index + 1}</td>
                    <td>
                      {res.name}{" "}
                      <span className="tooltip-container">
                        <FaInfoCircle className="info-icon" />
                        <span className="tooltip-text">{res.description}</span>
                      </span>
                    </td>
                    <td>{res.rate}</td>
                    <td>{res.users ? res.users.length : 0}</td>
                    <td>
                      <ul className="user-list">
                        {res.users.length === 0 ? (
                          <li>-</li>
                        ) : (
                          <>
                            {res.users.slice(0, 3).map((user, i) => (
                              <li key={i}>
                                {user.name} - {user.email}
                              </li>
                            ))}
                            {res.users.length > 3 && (
                              <li>
                                <Link to={`/users-by-resource/${encodeURIComponent(res.name)}`} className="more-link">
                                  More...
                                </Link>
                              </li>
                            )}
                          </>
                        )}
                      </ul>
                    </td>
                    <td>
                      <button onClick={() => handleEditResource(res)} className="edit-btn">
                        Update
                      </button>
                      <button onClick={() => handleDelete(res.resource_id)} className="delete-btn">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <button className="add-btn" onClick={() => setShowAddModal(true)}>Add Resource</button>

        {showEditModal && (
          <div className="modal">
            <div className="modal-content">
              <h2>Edit Resource</h2>
              <input
                type="text"
                value={editResource.name}
                onChange={(e) => setEditResource({ ...editResource, name: e.target.value })}
              />
              <input
                type="number"
                value={editResource.rate}
                onChange={(e) => setEditResource({ ...editResource, rate: e.target.value })}
              />
              <input
                type="text"
                value={editResource.description}
                onChange={(e) => setEditResource({ ...editResource, description: e.target.value })}
              />
              <div className="modal-actions">
                <button onClick={handleUpdateResource} className="save-btn">Save</button>
                <button onClick={() => setShowEditModal(false)} className="cancel-btn">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {showAddModal && (
          <div className="modal">
            <div className="modal-content">
              <h2>Add Resource</h2>
              <input
                type="text"
                placeholder="Role Name"
                value={newResource.name}
                onChange={(e) => setNewResource((prev) => ({ ...prev, name: e.target.value }))}
              />
              <input
                type="number"
                placeholder="Rate (RM/hr)"
                value={newResource.rate}
                onChange={(e) => setNewResource((prev) => ({ ...prev, rate: e.target.value }))}
              />
              <input
                type="text"
                placeholder="Description"
                value={newResource.description}
                onChange={(e) => setNewResource((prev) => ({ ...prev, description: e.target.value }))}
              />
              <div className="modal-actions">
              <button onClick={(e) => handleAddResource(e)} className="save-btn">Save</button>
              <button onClick={() => setShowAddModal(false)} className="cancel-btn">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourceTable;
