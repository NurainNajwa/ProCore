import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Breadcrumb from "./Breadcrumb";
import "./ProjectDetails.css";

const ProjectDetails = () => {
  const { project_id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [availableResources, setAvailableResources] = useState([]);
  const [newTaskName, setNewTaskName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProjectDetails();
    fetchTasks();
    fetchResources();
  }, [project_id]);

  // Fetch Project Details
  const fetchProjectDetails = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/projects/${project_id}`);
      setProject(res.data.project);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching project details:", error);
      setError("Error fetching project details.");
      setLoading(false);
    }
  };

  // Fetch Tasks for the Project
  const fetchTasks = async () => {
    try {
      // Retrieve the token from localStorage
      const token = localStorage.getItem("accessToken");
      console.log("Access Token: ", token);
  
      // If the token is not available, prompt for login
      if (!token) {
        alert("Please log in to view the tasks.");
        // navigate("/login");  // Optionally, redirect to login
        return;
      }
  
      // Check if the token is valid by making a protected route request
      const tokenRes = await fetch("http://localhost:5000/api/users/protected-route", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!tokenRes.ok) {
        alert("Unauthorized or expired token. Please log in again.");
        // navigate("/login"); // Optionally, redirect to login if token is invalid or expired
        return;
      }
  
      // If the token is valid, proceed with fetching tasks
      const res = await axios.get(`http://localhost:5000/api/tasks/project/${project_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,  // Pass the token in the headers
        },
      });
      setTasks(res.data.tasks);  // Set the fetched tasks
      setLoading(false);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setError("Error fetching tasks.");
      setLoading(false);
    }
  };
  

  // Fetch Available Resources
  const fetchResources = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/resources/getAll");
      setAvailableResources(res.data);
    } catch (error) {
      console.error("Error fetching resources:", error);
    }
  };

  // Handle Workload Input Change
  const handleWorkloadChange = (taskIndex, value) => {
    const updatedTasks = [...tasks];
    updatedTasks[taskIndex].workload = parseFloat(value) || 0;
    setTasks(updatedTasks);
  };

  // Handle Resource Selection
  const handleResourceSelect = (taskIndex, resourceIndex, value) => {
    const updatedTasks = [...tasks];
    updatedTasks[taskIndex].resources[resourceIndex].resource_id = value;
    setTasks(updatedTasks);
  };

  // Add a New Task
  const addNewTask = async () => {
    if (!newTaskName.trim()) return;

    try {
      const response = await axios.post("http://localhost:5000/api/tasks/create", {
        project_id,
        name: newTaskName,
        status: "Not Started",
        workload: 0,
      });

      setTasks([...tasks, response.data.newTask]);
      setNewTaskName("");
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  // Allocate Resource to a Task
  const allocateResource = async (taskIndex, resource_id, percent) => {
    try {
      await axios.post("http://localhost:5000/api/tasks/allocate-resource", {
        project_id,
        task_id: tasks[taskIndex].task_id,
        resource_id,
        percentResources: percent,
      });

      fetchTasks(); // Refresh tasks after allocation
    } catch (error) {
      console.error("Error allocating resource:", error);
    }
  };

  // Calculate total workload for the project
  const calculateTotalWorkload = () => {
    return tasks.reduce((total, task) => total + task.workload, 0);
  };

  // Display loading or error messages
  if (loading) {
    return <div>Loading project details...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="project-details-page">
      {/* Breadcrumb Section */}
      <header className="breadcrumb">
        <Breadcrumb crumbs={[{ label: "Home", link: "/" }, { label: "Project Details", link: "/projects" }]} />
      </header>

      {project ? (
        <>
          {/* Project Header */}
          <div className="project-header">
            <h1>{project.name}</h1>
            <div className="metrics">
              <div>
                <strong>MANDAY:</strong> {project.manday} hours/day
              </div>
              <div>
                <strong>TOTAL WORKLOAD:</strong> {calculateTotalWorkload()} hours
              </div>
              <div>
                <strong>START DATE:</strong> {new Date(project.start_date).toDateString()}
              </div>
            </div>
          </div>

          {/* Tasks Table */}
          <table className="tasks-table">
            <thead>
              <tr>
                <th>Task</th>
                <th>Work Load (Hours)</th>
                <th>Duration (Days)</th>
                <th>Cost (RM)</th>
                <th>Resources</th>
                <th>% of Resources</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task, taskIndex) => (
                <tr key={task.task_id} className="task">
                  <td>{task.name}</td>
                  <td>
                    <input
                      type="number"
                      value={task.workload}
                      onChange={(e) => handleWorkloadChange(taskIndex, e.target.value)}
                      className="editable-input"
                    />
                  </td>
                  <td>{task.duration}</td>
                  <td>{task.cost}</td>
                  <td>
                    {task.resources &&
                      task.resources.map((res, resourceIndex) => (
                        <div key={resourceIndex} className="resource">
                          <select
                            value={res.resource_id}
                            onChange={(e) => handleResourceSelect(taskIndex, resourceIndex, e.target.value)}
                            className="resource-dropdown"
                          >
                            <option value="" disabled>Select Resource</option>
                            {availableResources.map((resource) => (
                              <option key={resource.resource_id} value={resource.resource_id}>
                                {resource.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}
                    <button className="add-resource-btn" onClick={() => allocateResource(taskIndex, "", 0)}>
                      + Add Resource
                    </button>
                  </td>
                  <td>
                    {task.resources &&
                      task.resources.map((res, resourceIndex) => (
                        <div key={resourceIndex} className="resource-allocation">
                          <input
                            type="number"
                            value={res.allocation_percentage}
                            onChange={(e) =>
                              allocateResource(taskIndex, res.resource_id, parseFloat(e.target.value))
                            }
                            className="editable-input"
                          />
                          <span> ({res.hrsPerDay} hrs/day)</span>
                        </div>
                      ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Add New Task Input */}
          <div className="add-task">
            <input
              type="text"
              placeholder="Task Name"
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              className="add-task-input"
            />
            <button onClick={addNewTask} className="add-task-btn">
              + Add Task
            </button>
          </div>
        </>
      ) : (
        <p>Loading project details...</p>
      )}
    </div>
  );
};

export default ProjectDetails;
