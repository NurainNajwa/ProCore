const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Create a New Project
exports.createProject = async (req, res) => {
  try {
    const { name, description, start_date, manday, status } = req.body;
    const createdBy = req.user.user_id;

    if (!name || !start_date || !manday || !status) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const newProject = await prisma.project.create({
      data: {
        name,
        description,
        start_date: new Date(start_date),
        manday: parseFloat(manday),
        status,
        created_by: createdBy,
        total_duration: 0,
        total_cost: 0,
      },
    });
    res.status(201).json({ message: "Project created successfully", project: newProject });
  } catch (error) {
    res.status(500).json({ message: "Error creating project", error: error.message });
  }
};

// Get All Projects
exports.getProjects = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const projects = await prisma.project.findMany({
      skip: (page - 1) * limit,  // Skip the number of projects based on page
      take: parseInt(limit),     // Limit the number of projects
      orderBy: {
        created_at: 'desc',      // Sort projects by creation date (optional)
      },
    });

    const totalProjects = await prisma.project.count();  // Get total number of projects to calculate total pages

    const totalPages = Math.ceil(totalProjects / limit);  // Calculate total pages based on count and limit

    res.status(200).json({
      projects,
      totalPages,  // Send total number of pages in the response
      currentPage: parseInt(page), // Send current page
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching projects", error: error.message });
  }
};

// Get a Single Project by ID
exports.getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await prisma.project.findUnique({
      where: { project_id: id },
      include: { tasks: true },
    });
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.status(200).json({ data: project });
  } catch (error) {
    res.status(500).json({ message: "Error fetching project", error: error.message });
  }
};

// Update Project
exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status, manday } = req.body;

    const updatedProject = await prisma.project.update({
      where: { project_id: id },
      data: { name, description, status, manday },
    });
    res.status(200).json({ message: "Project updated successfully", data: updatedProject });
  } catch (error) {
    res.status(500).json({ message: "Error updating project", error: error.message });
  }
};

// Delete Project
exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await prisma.project.delete({
      where: { project_id: id },
    });
    res.status(200).json({ message: "Project deleted successfully", project });
  } catch (error) {
    res.status(500).json({ message: "Error deleting project", error: error.message });
  }
};

// Calculate Total Workload for a Project
exports.calculateTotalWorkload = async (req, res) => {
  try {
    const { id } = req.params;
    const tasks = await prisma.task.findMany({ where: { project_id: id } });
    const totalWorkload = tasks.reduce((sum, task) => sum + task.workload, 0);

    await prisma.project.update({
      where: { project_id: id },
      data: { totalWorkload },
    });

    res.status(200).json({ message: "Total workload calculated", totalWorkload });
  } catch (error) {
    res.status(500).json({ message: "Error calculating workload", error: error.message });
  }
};

// Calculate Total Estimated Cost for a Project
exports.calculateTotalCost = async (req, res) => {
  try {
    const { id } = req.params;
    const tasks = await prisma.task.findMany({ where: { project_id: id } });
    const totalCost = tasks.reduce((sum, task) => sum + task.cost, 0);

    await prisma.project.update({ where: { project_id: id }, data: { estimated_cost: totalCost } });
    res.status(200).json({ message: "Total estimated cost calculated", totalCost });
  } catch (error) {
    res.status(500).json({ message: "Error calculating estimated cost", error: error.message });
  }
};

// Calculate Total Duration
exports.calculateTotalDuration = async (req, res) => {
  try {
    const { id } = req.params;
    const tasks = await prisma.task.findMany({ where: { project_id: id } });
    const totalDuration = tasks.reduce((sum, task) => sum + task.duration, 0);

    await prisma.project.update({ where: { project_id: id }, data: { estimated_duration: totalDuration } });
    res.status(200).json({ message: "Total estimated duration calculated", totalDuration });
  } catch (error) {
    res.status(500).json({ message: "Error calculating estimated duration", error: error.message });
  }
};


// Get Project Metrics (Total Projects, Total Estimated Cost, Last Edited Project)
exports.getProjectMetrics = async (req, res) => {
  try {
    // Get the total number of projects
    console.log("Fetching total number of projects...");
    const totalProjects = await prisma.project.count();
    console.log("Total Projects:", totalProjects);

    // Get the total estimated cost of all projects
    console.log("Calculating total estimated cost...");
    const totalEstimatedCost = await prisma.project.aggregate({
      _sum: {
        total_cost: true,
      },
    });
    console.log("Total Estimated Cost:", totalEstimatedCost);

    // Fetch the most recently updated project (based on last edit date)
    console.log("Fetching the most recently updated project...");
    const lastEditedProject = await prisma.project.findFirst({
      orderBy: {
        updated_at: 'desc',  // Order by the last updated project
      },
      include: {
        createdByUser: true, // Include the user who created the project
      },
    });
    console.log("Last Edited Project:", lastEditedProject);

    // Extract the name of the project and the user who last edited it
    const lastEditedProjectName = lastEditedProject ? lastEditedProject.name : 'No projects yet';
    const lastEditedBy = lastEditedProject && lastEditedProject.createdByUser
      ? lastEditedProject.createdByUser.name
      : 'Unknown';

    res.status(200).json({
      totalProjects,
      totalEstimatedCost: totalEstimatedCost._sum.total_cost || 0,
      lastEditedProjectName,
      lastEditedBy,
    });
  } catch (error) {
    console.error("Error fetching project metrics:", error);
    res.status(500).json({ message: "Error fetching project metrics", error: error.message });
  }
};
