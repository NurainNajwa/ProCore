//ProjectRoutes.js
const express = require("express");
const router = express.Router();
const projectController = require("../projects/projectController");
const { authenticate } = require("../users/userController");


// Create a new project
router.post('/', authenticate, projectController.createProject);


// Add the new route for getting project metrics
router.get("/metrics", authenticate,  projectController.getProjectMetrics);

// Get all projects
router.get('/', projectController.getProjects);

// Get project by ID
router.get('/:id', projectController.getProjectById);

// Update a project
router.put('/:id', projectController.updateProject);

// Delete a project
router.delete('/:id',authenticate,  projectController.deleteProject);

// Calculate total workload
router.post('/:id/calculate-workload', projectController.calculateTotalWorkload);

// Calculate total estimated cost
router.post('/:id/calculate-cost', projectController.calculateTotalCost);

// Calculate total duration
router.post('/:id/calculate-duration', projectController.calculateTotalDuration);

module.exports = router;

