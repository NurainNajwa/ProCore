// taskRoutes.js
const express = require("express");
const router = express.Router();
const taskController = require("../tasks/taskController");
const { authenticate } = require("../users/userController");

// Create a New Task
router.post("/create", authenticate, taskController.createTask);

// Allocate a Resource to a Task
router.post("/allocate-resource", taskController.allocateResourceToTask);

// Calculate Task Duration & Cost
router.put("/calculate-metrics/:task_id", taskController.calculateTaskMetrics);

// Get All Tasks for a Project
router.get("/project/:project_id", taskController.getTasksByProject);

// Get a Single Task by ID
router.get("/:task_id", taskController.getTaskById);

// Update Task Details (Name, Status, Workload)
router.put("/update/:task_id", taskController.updateTask);

// Delete a Task
router.delete("/delete/:task_id", taskController.deleteTask);

module.exports = router;
