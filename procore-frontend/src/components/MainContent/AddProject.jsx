import React, { useState } from "react";
import "./AddProject.css";

const AddProject = ({ isPopupOpen, togglePopup, projectDetails, setProjectDetails }) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProjectDetails({ ...projectDetails, [name]: value });
  };

  const handleTaskChange = (index, field, value) => {
    const updatedTasks = [...projectDetails.tasks];
    updatedTasks[index] = { ...updatedTasks[index], [field]: value };
    setProjectDetails({ ...projectDetails, tasks: updatedTasks });

    // Recalculate duration and cost
    const totalDuration = updatedTasks.reduce((acc, task) => acc + parseInt(task.duration || 0, 10), 0);
    const totalCost = updatedTasks.reduce((acc, task) => acc + parseFloat(task.cost || 0), 0);
    setProjectDetails({ ...projectDetails, duration: totalDuration, cost: totalCost });
  };

  const addTask = () => {
    setProjectDetails({
      ...projectDetails,
      tasks: [...projectDetails.tasks, { task: "", workload: "", duration: "", cost: "", resources: "", percent: "" }],
    });
  };

  const removeTask = (index) => {
    const updatedTasks = projectDetails.tasks.filter((_, i) => i !== index);
    setProjectDetails({ ...projectDetails, tasks: updatedTasks });
  };

  const handleSubmit = () => {
    console.log("Project Submitted:", projectDetails);
    // Add project to database logic here
    togglePopup();
  };

  return (
    <>
      {isPopupOpen && (
        <div className="popup-overlay" onClick={togglePopup}>
          <div className="popup" onClick={(e) => e.stopPropagation()}>
            <h2>Add New Project</h2>
            <div className="popup-content">
              <section className="project-section">
                <h3>Project Information</h3>
                <label>
                  Project Name:
                  <input
                    type="text"
                    name="name"
                    value={projectDetails.name}
                    onChange={handleInputChange}
                    placeholder="Enter project name"
                  />
                </label>
                <label>
                  Start Date:
                  <input
                    type="date"
                    name="startDate"
                    value={projectDetails.startDate}
                    onChange={handleInputChange}
                  />
                </label>
                <label>
                  Duration:
                  <input
                    type="text"
                    value={`${projectDetails.duration || 0} days`}
                    disabled
                  />
                </label>
                <label>
                  Cost:
                  <input
                    type="text"
                    value={`RM ${projectDetails.cost || 0}`}
                    disabled
                  />
                </label>
                <label>
                  Status:
                  <select
                    name="status"
                    value={projectDetails.status}
                    onChange={handleInputChange}
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Finished">Finished</option>
                  </select>
                </label>
              </section>

              <section className="task-section">
                <h3>Task Details</h3>
                <label>
                  Manday:
                  <input
                    type="number"
                    name="manday"
                    value={projectDetails.manday}
                    onChange={handleInputChange}
                    placeholder="Enter manday value"
                  />
                </label>

                <table className="tasks-table">
                  <thead>
                    <tr>
                      <th>Task</th>
                      <th>Work Load (Hours)</th>
                      <th>Duration (Days)</th>
                      <th>Cost (RM)</th>
                      <th>Resources</th>
                      <th>% of Resources</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projectDetails.tasks.map((task, index) => (
                      <tr key={index}>
                        <td>
                          <input
                            type="text"
                            value={task.task}
                            onChange={(e) =>
                              handleTaskChange(index, "task", e.target.value)
                            }
                            placeholder="Task name"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={task.workload}
                            onChange={(e) =>
                              handleTaskChange(index, "workload", e.target.value)
                            }
                            placeholder="Hours"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={task.duration}
                            onChange={(e) =>
                              handleTaskChange(index, "duration", e.target.value)
                            }
                            placeholder="Days"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={task.cost}
                            onChange={(e) =>
                              handleTaskChange(index, "cost", e.target.value)
                            }
                            placeholder="Cost"
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            value={task.resources}
                            onChange={(e) =>
                              handleTaskChange(index, "resources", e.target.value)
                            }
                            placeholder="Resource name"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={task.percent}
                            onChange={(e) =>
                              handleTaskChange(index, "percent", e.target.value)
                            }
                            placeholder="%"
                          />
                        </td>
                        <td>
                          <button onClick={() => removeTask(index)}>Remove</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button onClick={addTask} className="add-task-btn">+ Add Task</button>
              </section>
            </div>

            <div className="popup-actions">
              <button className="close-btn" onClick={togglePopup}>
                Cancel
              </button>
              <button className="submit-btn" onClick={handleSubmit}>
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddProject;
