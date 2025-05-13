//reportRoutes.js
const express = require("express");
const router = express.Router();
const reportController= require("../reports/reportController");

// Generate Reports
router.get("/", reportController.generateReports);

module.exports = router;
