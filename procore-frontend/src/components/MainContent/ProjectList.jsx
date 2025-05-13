import React, { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Breadcrumb from "./Breadcrumb";
import ProjectMetrics from "./ProjectMetrics"; 
import "./ProjectList.css";

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [metrics, setMetrics] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    start_date: "",
    manday: "",
    status: "Not Started",
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const navigate = useNavigate();

  // Fetch all projects from the backend
  useEffect(() => {
    fetchProjects();
    fetchMetrics();
  }, []);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      console.log("Access Token: ", token);

    // If the token is not available, prompt for login
    if (!token) {
      alert("Please log in to view the projects.");
      // navigate("/login");
      return;
    }

    const tokenRes = await fetch("http://localhost:5000/api/users/protected-route", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!tokenRes.ok) {
      alert("Unauthorized or expired token. Please log in again.");
      navigate("/login"); // Redirect to login if token is invalid or expired
      return;
    }

    const res = await axios.get("http://localhost:5000/api/projects", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        page: currentPage, // Pass the current page
        limit: 10,          // Set the limit per page
      },
    });

      // setProjects(res.data.data); // Assuming API returns an array of projects
      setProjects(res.data.projects); // Set the fetched projects
      setTotalPages(res.data.totalPages);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError("Failed to load projects.");
      setLoading(false);
    }
  };

    // Fetch project metrics from the backend
    const fetchMetrics = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          alert("Please log in to view the metrics.");
          return;
        }

        const tokenRes = await fetch("http://localhost:5000/api/users/protected-route", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
    
        if (!tokenRes.ok) {
          alert("Unauthorized or expired token. Please log in again.");
          navigate("/login"); // Redirect to login if token is invalid or expired
          return;
        }

        const response = await axios.get("http://localhost:5000/api/projects/metrics", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        // console.log('Metrics API Response:', response.data);

        const metricsData = {
          totalProjects: response.data.totalProjects || 0, // Access projects and fallback to 0
          totalEstimatedCost: response.data.totalEstimatedCost._sum?.total_cost || 0, // Access total_cost with safe navigation
          lastEditedProjectName: response.data.lastEditedProjectName || 'N/A',
          lastEditedBy: response.data.lastEditedBy || 'Unknown',
        };
    
        console.log('Updated metrics:', metricsData);
        setMetrics(metricsData); // Store the fetched metrics
        setLoading(false);
      } catch (err) {
        console.error("Error fetching project metrics:", err);
        setError("Failed to load metrics.");
        setLoading(false);
      }
    };
  
  
    if (loading) {
      return <div>Loading...</div>;
    }
  
    if (error) {
      return <div>{error}</div>;
    }

    
  const handlePagination = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleDeleteProject = async (projectId) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("Please log in to delete the project.");
      return;
    }

    try {
      const confirmDelete = window.confirm("Are you sure you want to delete this project?");
      if (confirmDelete) {
        await axios.delete(`http://localhost:5000/api/projects/${projectId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        alert("Project deleted successfully!");
        fetchProjects(); // Reload the project list after deletion
      }
    } catch (err) {
      console.error("Error deleting project:", err);
      alert("Error deleting project.");
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    setNewProject({ ...newProject, [e.target.name]: e.target.value });
  };

  // Handle Project Submission
  const handleAddProject = async (e) => {
    e.preventDefault();

    if (!newProject.name || !newProject.start_date || !newProject.manday) {
      alert("Please fill in all required fields.");
      return;
    }

    try {

      // Retrieve the token from localStorage (assuming it's stored there after login)
      const token = localStorage.getItem("accessToken");

      // If the token doesn't exist, alert the user to log in
      if (!token) {
        alert("Please log in to create a project.");
        return;
      }

      await axios.post("http://localhost:5000/api/projects", {
        ...newProject,
        // created_by: "LOGGED_IN_USER_ID",  // This is handled by the backend using req.user.user_id
      }, {
        headers: {
          Authorization: `Bearer ${token}`,  // Attach the token in the Authorization header
        },
      });

      alert("Project added successfully!");
      setShowAddModal(false);
      setNewProject({ name: "", description: "", start_date: "", manday: "", status: "" });
      fetchProjects();// Reload project list (Fetch updated projects)
    } catch (err) {
      console.error("Error adding project:", err);
      alert("Error adding project.");
    }
  };


  return (
    <div className="dashboard">
      {/* Sidebar */}
      <Sidebar />

      <div className="main-content">
        <header className="header">
          <Breadcrumb crumbs={[{ label: "Home", link: "/" }, { label: "Project List", link: "/projects" }]} />
          <h1>Project List</h1>
          <button className="add-project-btn" onClick={() => setShowAddModal(true)}>+ Add Projects</button>
        </header>

        {/* Project Metrics Section */}
        <ProjectMetrics metrics={metrics} />

        {/* Project Table */}
        <div className="table-section">
          <table className="project-table">
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Start Date</th>
                <th>Manday</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.project_id}>
                  <td>{project.name}</td>
                  <td>{project.start_date}</td>
                  <td>{project.manday}</td>
                  <td>{project.status}</td>
                  <td>
                    <button onClick={() => navigate(`/projects/${project.project_id}`)}>Details</button>
                    <button onClick={() => handleDeleteProject(project.project_id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Project Modal */}
        {showAddModal && (
          <div className="modal">
            <div className="modal-content">
              <h2>Add Project</h2>
              <input type="text" name="name" placeholder="Project Name" value={newProject.name} onChange={handleInputChange} required />
              <textarea name="description" placeholder="Project Description" value={newProject.description} onChange={handleInputChange} />
              <input type="date" name="start_date" value={newProject.start_date} onChange={handleInputChange} required />
              <input type="number" name="manday" placeholder="Manday (hrs/day)" value={newProject.manday} onChange={handleInputChange} required />
              <select name="status" value={newProject.status} onChange={handleInputChange}>
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
              <div className="modal-actions">
                <button onClick={handleAddProject}>Save</button>
                <button onClick={() => setShowAddModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}


          {/* Pagination */}
          <div className="pagination">
          <button 
            onClick={() => handlePagination(currentPage - 1)} 
            disabled={currentPage === 1}>
            Previous
          </button>
          <span>{currentPage}</span>
          <button 
            onClick={() => handlePagination(currentPage + 1)} 
            disabled={currentPage === totalPages}>
            Next
          </button>
        </div>
        </div>
      </div>
  );
};

export default ProjectList;
