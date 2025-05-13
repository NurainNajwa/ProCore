const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Step 1: Create Task for a Project and save it in the database.
exports.createTask = async (req, res) => {
  try {
    const { project_id, name, status, workload } = req.body;
    const user_id = req.user?.user_id; // Assuming the user is authenticated

    // Validate Input
    if (!project_id || !name || !status || !workload) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Save Task in Database with the updated_by field
    const newTask = await prisma.task.create({
      data: {
        project_id,
        name,
        status,
        workload,
        duration: 0,  // Default value for now
        cost: 0,      // Default value for now
        updated_by: user_id,
      },
    });

    res.status(201).json({ message: "Task created successfully", newTask });
  } catch (error) {
    res.status(500).json({ message: "Error creating task", error: error.message });
  }
};

// Step 2: Allocate a Resource to a Task
exports.allocateResourceToTask = async (req, res) => {
  try {
    const { project_id, task_id, resource_id, percentResources } = req.body;

    // Fetch Project
    const project = await prisma.project.findUnique({
      where: { project_id },
    });
    if (!project) return res.status(404).json({ message: "Project not found" });

    // Fetch Resource
    const resource = await prisma.resource.findUnique({
      where: { resource_id },
    });
    if (!resource) return res.status(404).json({ message: "Resource not found" });

    // Calculate Resource Hours
    const resource_hours = project.manday * (percentResources / 100);

    // Save Resource Allocation
    const allocation = await prisma.resourceAllocations.create({
      data: {
        resource_id,
        project_id,
        task_id,
        allocation_percentage: percentResources,
        resource_hours,
      },
    });

    res.status(201).json({ message: "Resource allocated successfully", allocation });
  } catch (error) {
    res.status(500).json({ message: "Error allocating resource", error: error.message });
  }
};

// Calculate Task Duration & Cost
exports.calculateTaskMetrics = async (req, res) => {
  try {
    const { task_id } = req.params;

    // Fetch Task
    const task = await prisma.task.findUnique({ where: { task_id } });
    if (!task) return res.status(404).json({ message: "Task not found" });

    // Fetch All Allocations for this Task
    const allocations = await prisma.resourceAllocations.findMany({
      where: { task_id },
      include: { resource: true },
    });

    // Step 1: Sum Total Resource Hours
    const total_resource_hours = allocations.reduce((sum, alloc) => sum + alloc.resource_hours, 0);

    // Step 2: Calculate Duration (Days)
    const duration = total_resource_hours > 0 ? task.workload / total_resource_hours : 0;

    // Step 3: Calculate Cost (Summing cost per resource)
    const total_cost = allocations.reduce(
      (sum, alloc) => sum + alloc.resource.rate * alloc.resource_hours * duration,
      0
    );

    // Update Task with Calculated Values
    const updatedTask = await prisma.task.update({
      where: { task_id },
      data: { duration, cost: total_cost },
    });

    res.status(200).json({ message: "Task updated with new calculations", updatedTask });
  } catch (error) {
    res.status(500).json({ message: "Error calculating task metrics", error: error.message });
  }
};

// Get All Tasks for a Project
exports.getTasksByProject = async (req, res) => {
  const { project_id } = req.params;
  try {
    const tasks = await prisma.task.findMany({
      where: { project_id },
      include: {
        ResourceAllocations: {
          include: { resource: true }, // Include resource details in the response
        },
      },
    });

    if (!tasks || tasks.length === 0) {
      return res.status(404).json({ message: 'No tasks found for this project.' });
    }

    res.status(200).json({ success: true, tasks });
  } catch (error) {
    res.status(500).json({ message: "Error getting tasks.", error: error.message });
  }
};

// Get a Single Task by ID
exports.getTaskById = async (req, res) => {
  const { task_id } = req.params;

  try {
    const task = await prisma.task.findUnique({
      where: { task_id },
      include: {
        ResourceAllocations: {
          include: { resource: true },
        },
      },
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({ task });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving task", error: error.message });
  }
};

// Update Task Details (Name, Status, Workload)
exports.updateTask = async (req, res) => {
  const { task_id } = req.params;
  const { name, status, workload } = req.body;

  try {
    if (!name && !status && !workload) {
      return res.status(400).json({ message: "At least one field must be updated." });
    }

    const updatedTask = await prisma.task.update({
      where: { task_id },
      data: {
        ...(name && { name }),
        ...(status && { status }),
        ...(workload && { workload }),
      },
    });

    res.status(200).json({ message: "Task updated successfully", updatedTask });
  } catch (error) {
    res.status(500).json({ message: "Error updating task", error: error.message });
  }
};

// Delete a Task
exports.deleteTask = async (req, res) => {
  const { task_id } = req.params;

  try {
    const task = await prisma.task.findUnique({ where: { task_id } });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    await prisma.task.delete({ where: { task_id } });

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting task", error: error.message });
  }
};
