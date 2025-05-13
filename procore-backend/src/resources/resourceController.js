const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();


// Role mapping with fixed rates and descriptions
const roleRates = {
  "Junior Business Analyst": { rate: 40, description: "Entry-level analyst focusing on business processes." },
  "Senior Business Analyst": { rate: 60, description: "Experienced analyst overseeing complex projects." },
  "Junior UIUX": { rate: 45, description: "Beginner in designing user interfaces and experiences." },
  "Senior UIUX": { rate: 65, description: "Expert in crafting seamless user experiences." },
  "Junior Frontend Developer": { rate: 50, description: "Entry-level developer working on client-side code." },
  "Senior Frontend Developer": { rate: 75, description: "Experienced developer specializing in front-end solutions." },
  "Junior Backend Developer": { rate: 50, description: "Beginner in server-side development." },
  "Senior Backend Developer": { rate: 80, description: "Expert in back-end systems and architecture." },
  "FullStack Developer": { rate: 85, description: "Proficient in both front-end and back-end development." },
  "Junior Tester": { rate: 45, description: "Entry-level tester ensuring software quality." },
  "Senior Tester": { rate: 65, description: "Experienced tester managing quality assurance." },
  "Admin": { rate: 70, description: "Administrator managing system settings." },
  "Manager": { rate: 90, description: "Oversees projects and team performance." }
};

// API to Populate the `Resource` Table
exports.addResources = async (req, res) => {
  try {
    // Convert `roleRates` into an array of resource objects
    const resourceEntries = Object.entries(roleRates).map(([roleName, data]) => ({
      name: roleName,
      rate: data.rate,
      description: data.description
    }));

    // Upsert resources (insert if not exists, update if exists)
    const addedResources = await Promise.all(
      resourceEntries.map(async (resource) => {
        return prisma.resource.upsert({
          where: { name: resource.name },
          update: { rate: resource.rate,description: resource.description }, // If role exists, update
          create: resource, // If role doesn't exist, create it
        });
      })
    );

    res.status(201).json({ message: "Resources added successfully", data: addedResources });
  } catch (error) {
    res.status(500).json({ message: "Error adding resources", error: error.message });
  }
};

// 🔹 Add a New Resource Manually (POST)
exports.addResource = async (req, res) => {
  try {
    const { name, rate, description } = req.body;

    if (!name || rate === undefined || !description) {
      return res.status(400).json({ message: "Name and rate are required." });
    }

    const existingResource = await prisma.resource.findUnique({
      where: { name },
    });

    if (existingResource) {
      return res.status(400).json({ message: "Resource already exists." });
    }

    const newResource = await prisma.resource.create({
      data: { name, rate, description },
    });

    res.status(201).json({ message: "Resource added successfully", data: newResource });
  } catch (error) {
    res.status(500).json({ message: "Error adding resource", error: error.message });
  }
};

// 🔹 Update Resource Rate by ID or Name (PUT)
exports.updateResource = async (req, res) => {
  try {
    const { id, name, rate, description } = req.body;

    if (!id && !name) {
      return res.status(400).json({ message: "Provide either ID or Name." });
    }
    if (rate === undefined && !description) {
      return res.status(400).json({ message: "New rate is required." });
    }

    let updateData = {};
    if (rate !== undefined) updateData.rate = rate;
    if (description) updateData.description = description;

    let updatedResource;
    if (id) {
      updatedResource = await prisma.resource.update({
        where: { resource_id: id },
        data: updateData,
      });
    } else {
      updatedResource = await prisma.resource.update({
        where: { name },
        data: updateData,
      });
    }

    res.status(200).json({ message: "Resource updated successfully", data: updatedResource });
  } catch (error) {
    res.status(500).json({ message: "Error updating resource", error: error.message });
  }
};

// 🔹 Search for Resource by ID or Name (GET)
exports.getResource = async (req, res) => {
  try {
    const { id, name } = req.query;

    if (!id && !name) {
      return res.status(400).json({ message: "Provide either ID or Name." });
    }

    let resource;
    if (id) {
      resource = await prisma.resource.findUnique({
        where: { resource_id: id },
      });
    } else {
      resource = await prisma.resource.findUnique({
        where: { name },
      });
    }

    if (!resource) {
      return res.status(404).json({ message: "Resource not found." });
    }

    res.status(200).json({ data: resource });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving resource", error: error.message });
  }
};

// 🔹 Delete a Resource by ID (DELETE)
exports.deleteResource = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Resource ID is required." });
    }

    const existingResource = await prisma.resource.findUnique({
      where: { resource_id: id },
    });

    if (!existingResource) {
      return res.status(404).json({ message: "Resource not found." });
    }

    await prisma.resource.delete({
      where: { resource_id: id },
    });

    res.status(200).json({ message: "Resource deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting resource", error: error.message });
  }
};

// 🔹 Get all resources (including users assigned to each resource)
exports.getAllResources = async (req, res) => {
  try {
    const resources = await prisma.resource.findMany({
      include: {
        users: {
          select: {
            user_id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(200).json(resources);
  } catch (error) {
    res.status(500).json({ message: "Error fetching resources", error: error.message });
  }
};


// Get all users for a specific resource (role)
exports.getUsersByResource = async (req, res) => {
  try {
    const { resourceName } = req.params; // Get the role name from URL params

    if (!resourceName) {
      return res.status(400).json({ message: "Resource name is required." });
    }

    // Find the resource by name
    const resource = await prisma.resource.findUnique({
      where: { name: resourceName },
      include: { users: true }, // Include all users linked to this role
    });

    if (!resource) {
      return res.status(404).json({ message: "Resource not found." });
    }

    // Get users with matching role_id and select only necessary fields
    const users = await prisma.user.findMany({
      where: { role_id: resource.resource_id },
      select: {
        user_id: true,
        name: true,
        email: true,
        role_id: true,
      },
    });

    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error: error.message });
  }
};

exports.addUserToResource = async (req, res) => {
  try {
    const { name, email, temporaryPassword, resourceName } = req.body;

    if (!name || !email || !temporaryPassword || !resourceName) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists." });
    }

    // Find the resource by name
    const resource = await prisma.resource.findUnique({
      where: { name: resourceName },
    });

    if (!resource) {
      return res.status(404).json({ message: "Resource not found." });
    }

    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    // Create the user and link it to the resource
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role_id: resource.resource_id, // Assign user to resource
      },
    });

    res.status(201).json({ message: "User added successfully!", data: newUser });
  } catch (error) {
    res.status(500).json({ message: "Error adding user", error: error.message });
  }
};
