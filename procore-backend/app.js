const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client"); // Import Prisma Client
require("dotenv").config(); // Load environment variables

// Routes
const userRoutes = require("./src/users/userRoutes");
const projectRoutes = require("./src/projects/projectRoutes");
const resourceRoutes = require("./src/resources/resourceRoutes");
const reportRoutes = require("./src/reports/reportRoutes");
const taskRoutes = require("./src/tasks/taskRoutes");


const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Prisma Client
const prisma = new PrismaClient();

// Middleware
// Enable CORS for all routes
app.use(cors({
  origin: 'http://localhost:3000',  // Frontend URL (make sure to change if necessary)
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type, Authorization',  // Allow Authorization header
}));
app.use(express.json()); // Parse incoming JSON data (JSON bodies)

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Health Check Route
app.get("/", (req, res) => {
  res.send("");
});

// API Routes
app.use("/api/users", userRoutes); // User routes
app.use("/api/projects", projectRoutes); // Project routes
app.use("/api/resources", resourceRoutes); // Resource routes\
app.use("/api/reports", reportRoutes); // Report routes
app.use("/api/tasks", taskRoutes); // Task routes

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost: ${PORT}`);
});
