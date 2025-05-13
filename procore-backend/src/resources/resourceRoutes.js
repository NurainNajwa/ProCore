// resourceRoutes.js
const express = require("express");
const router = express.Router();
const resourceController = require("../resources/resourceController");

// Add new resource to task (ONE TIME )
router.post("/add-resource", resourceController.addResources);

// Add a new resource manually
router.post("/add", resourceController.addResource);

// Update a resource rate by ID or name
router.put("/update", resourceController.updateResource);

// Get a resource by ID or name
router.get("/get", resourceController.getResource);

// Delete a resource by ID
router.delete("/delete/:id", resourceController.deleteResource);

// Get all resources with assigned users
router.get("/getAll", resourceController.getAllResources);

// Get all users assigned to a specific resource (role)
router.get("/users/:resourceName", resourceController.getUsersByResource);

// Add a user to a specific resource (role)
router.post("/add-user", resourceController.addUserToResource);

module.exports = router;
