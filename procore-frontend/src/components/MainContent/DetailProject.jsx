import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Breadcrumb from "./Breadcrumb";
import "./ProjectDetails.css";

const ProjectDetails = () => {
  const { project_id } = useParams(); // Get project ID from URL params
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [availableResources, setAvailableResources] = useState([]);
  const [newTaskName, setNewTaskName] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [resourcePercent, setResourcePercent] = useState(0);

  useEffect(() => {
    fetchProjectDetails();
    fetchResources();
  }, []);

  // Fetch Project Details
  const fetchProjectDetails = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/projects/${project_id}`);
      setProject(res.data.project);
      setTasks(res.data.tasks || []);
    } catch (error) {
      console.error("Error fetching project details:", error);
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

  // Add New Task
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

  // Open Edit Task Modal
  const openEditTaskModal = (task) => {
    setSelectedTask(task);
    setShowEditModal(true);
  };

  // Update Task
  const updateTask = async () => {
    if (!selectedTask) return;

    try {
      await axios.put(`http://localhost:5000/api/tasks/update/${selectedTask.task_id}`, {
        name: selectedTask.name,
        workload: selectedTask.workload,
        status: selectedTask.status,
      });

      setShowEditModal(false);
      fetchProjectDetails(); // Refresh data
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  // Open Resource Allocation Modal
  const openResourceModal = (task) => {
    setSelectedTask(task);
    setShowResourceModal(true);
  };

  // Allocate Resource to Task
  const allocateResource = async () => {
    if (!selectedTask || !selectedResource || resourcePercent <= 0) return;

    try {
      await axios.post("http://localhost:5000/api/tasks/allocate-resource", {
        project_id,
        task_id: selectedTask.task_id,
        resource_id: selectedResource,
        percentResources: resourcePercent,
      });

      setShowResourceModal(false);
      fetchProjectDetails(); // Refresh after allocation
    } catch (error) {
      console.error("Error allocating resource:", error);
    }
  };

  return (
    <div className="project-details-page">
      {/* Breadcrumb Section */}
      <header className="breadcrumb">
        <Breadcrumb crumbs={[{ label: "Home", link: "/" }, { label: "Project List", link: "/projects" }]} />
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
                <strong>TOTAL WORKLOAD:</strong> {project.estimated_duration} hours
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
                <th>Status</th>
                <th>Resources</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.task_id}>
                  <td>{task.name}</td>
                  <td>{task.workload}</td>
                  <td>{task.status}</td>
                  <td>
                    {task.resources?.length > 0
                      ? task.resources.map((res) => <span key={res.resource_id}>{res.name}, </span>)
                      : "No Resources"}
                  </td>
                  <td>
                    <button className="edit-btn" onClick={() => openEditTaskModal(task)}>Edit</button>
                    <button className="allocate-btn" onClick={() => openResourceModal(task)}>Allocate Resource</button>
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

      {/* Edit Task Modal */}
      {showEditModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Edit Task</h2>
            <input
              type="text"
              value={selectedTask.name}
              onChange={(e) => setSelectedTask({ ...selectedTask, name: e.target.value })}
            />
            <input
              type="number"
              value={selectedTask.workload}
              onChange={(e) => setSelectedTask({ ...selectedTask, workload: e.target.value })}
            />
            <select
              value={selectedTask.status}
              onChange={(e) => setSelectedTask({ ...selectedTask, status: e.target.value })}
            >
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
            <div className="modal-actions">
              <button onClick={updateTask} className="save-btn">Save</button>
              <button onClick={() => setShowEditModal(false)} className="cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Resource Allocation Modal */}
      {showResourceModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Allocate Resource</h2>
            <select onChange={(e) => setSelectedResource(e.target.value)}>
              <option value="">Select Resource</option>
              {availableResources.map((resource) => (
                <option key={resource.resource_id} value={resource.resource_id}>
                  {resource.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="% Allocation"
              onChange={(e) => setResourcePercent(e.target.value)}
            />
            <div className="modal-actions">
              <button onClick={allocateResource} className="save-btn">Allocate</button>
              <button onClick={() => setShowResourceModal(false)} className="cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
