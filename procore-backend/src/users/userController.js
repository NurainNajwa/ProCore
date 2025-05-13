const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer');
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const streamifier = require("streamifier");
const { profile } = require("console");
require('dotenv').config();

const prisma = new PrismaClient();
//run command: node -e "console.log(require('crypto').randomBytes(64).toString('hex'));"
const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_JWT_SECRET = process.env.REFRESH_JWT_SECRET;


// User Registration - This endpoint is for creating a new user. The process includes:
// 1. Receiving user input (e.g., name, email, password, role). (line 15)
// 2. Hashing the password for security. (line 24)
// 3. Saving the user data in the database using Prisma. (line 27-33)

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role} = req.body;

    console.log(req.body);

    // Validate input
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check for existing user
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Ensure role exists in the Resource table
    const existingResource = await prisma.resource.findUnique({ where: { name: role } });
    if (!existingResource) {
      return res.status(400).json({ message: "Invalid role selected." });
    }

    // Save the user in the database
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role_id: existingResource.resource_id, // Link the user to the role
        verified: false,
      },
    });

    console.log("User created:", newUser);

    // Send OTP
    const otp = generateOtp();
    await sendOtpEmail(email, otp); // Reuse the `sendotp` logic


    // Save OTP in database for verification (temporary storage)
    const newOTP = await prisma.otp.create({
      data: {
        email,
        code: otp,
        expires_at: new Date(Date.now() + 15 * 60 * 1000), // OTP valid for 15 minutes
        user_id: newUser.user_id,
      },
    });


    console.log("OTP created:", newOTP);


    res.status(201).json({ success: true, message: "User registered. OTP sent to email." });
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error: error.message });
  }
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL, // Your sender email address (configured in .env)
    pass: process.env.EMAIL_PASSWORD, // Your email password or app-specific password
  },
  tls: {
    rejectUnauthorized: false, // Optional: bypass TLS certificate checks
  },
});

// Reusable function for sending OTP
const sendOtpEmail = async (email, otp) => {

  const mailOptions = {
    from: process.env.EMAIL, // Sender email address (your email)
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP code is: ${otp}`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
  } catch (error) {
    console.log("Error sending email:", error);
    throw error; // Re-throw to propagate the error
  }
};

const generateOtp = () => Math.floor(1000 + Math.random() * 9000).toString();


exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // // Fetch the OTP record
    // const otpRecord = await prisma.otp.findUnique({
    //   where: { email },
    // });

    // Fetch the OTP record associated with the user using email
    const otpRecord = await prisma.otp.findFirst({
      where: {
        email, // Look for OTP with this email
      },
      orderBy: {
        created_at: 'desc', // To get the most recent OTP first (if multiple exist)
      },
    });

    if (!otpRecord) {
      return res.status(400).json({ message: "OTP not found or expired" });
    }

    // Check OTP value and expiration
    if (otpRecord.code !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    if (new Date() > new Date(otpRecord.expires_at)) {
      return res.status(400).json({ message: "OTP expired" });
    }

    // Delete OTP after successful verification using otp_id (unique identifier)
    await prisma.otp.delete({ where: { otp_id: otpRecord.otp_id } });

    // Update user to verified
    await prisma.user.update({
      where: { email },
      data: { verified: true },
    });

    res.status(200).json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error verifying OTP", error: error.message });
  }
};

exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    // Fetch the latest OTP record for the given email
    const otpRecord = await prisma.otp.findFirst({
      where: { email },
      orderBy: {
        created_at: 'desc', // Fetch the most recent OTP record
      },
    });

    // Delete the existing OTP if it exists
    if (otpRecord) {
      await prisma.otp.delete({ where: { otp_id: otpRecord.otp_id } });
    }

    // Generate a new OTP
    const newOtp = generateOtp();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // OTP expires in 10 minutes

    // Save the new OTP to the database
    await prisma.otp.create({
      data: {
        email,
        code: newOtp,
        expires_at: expiresAt,
      },
    });

    console.log("OTP created:", newOtp);

    // Send the new OTP via email
    await sendOtpEmail(email, newOtp);

    res.status(200).json({ message: "OTP resent successfully" });
  } catch (error) {
    console.error("Error resending OTP:", error);
    res.status(500).json({ message: "Failed to resend OTP", error: error.message });
  }
};


// User Login- This endpoint authenticates a user by:
// 1. Verifying email and password.
// 2. Generating a JWT for authenticated access.

exports.loginUser = async (req, res) => {
  // Logic for user login
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await prisma.user.findUnique({ where: { email }, include: { resource: true } });
    if (!user) {
      return res.status(404).json({ message: "Invalid email or password" });
    }

    // Check if user is verified
    if (!user.verified) {
      return res.status(403).json({ message: "Email not verified. Please verify your email before logging in." });
    }

    // Compare the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate a JWT Token
    const accessToken = jwt.sign({ user_id: user.user_id }, JWT_SECRET, { expiresIn: '60m' });
    const refreshToken = jwt.sign({ user_id: user.user_id }, REFRESH_JWT_SECRET, { expiresIn: '7d' });

    // Save refresh token in the database
    await prisma.user.update({
      where: { user_id: user.user_id },
      data: { accessToken, refreshToken },
    });

    res.status(200).json({ message: "Login successful", accessToken, refreshToken,user: {
      name: user.name,
      email: user.email,
      role: user.resource?.name || "User",
    }});
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
  // Logic for forgot password functionality
  try{
    const { email } = req.body;

    //Check if the user exists
    const user = await prisma.user.findUnique({ where: {email} });
    if(!user) {
      return res.status(404).json({ message: "User not found" });
    }

    //Generate a reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    // const hashedToken = await bcrypt.hash(resetToken, 10);
    const resetTokenExpiry = new Date(Date.now() + 60*60*1000); //Token valid for 1 hour

    //Save the token and expiry in the database
    await prisma.user.update({
      where: {email},
      data: {resetToken, resetTokenExpiry},
    });

    // Construct reset link (frontend route)
    const resetLink = `http://localhost:3000/reset-password/${resetToken}`;

    // (Example: Use Nodemailer or any email-sending library)
    console.log(`Password reset link: ${resetLink}`); // For debugging

    // Construct the email content
    const mailOptions = {
      from: process.env.EMAIL, // Sender email address (your email)
      to: email,
      subject: "Reset Password",
      text: `Password reset link: ${resetLink}`, // Link to reset password
    };

     // Send the reset link via email using Nodemailer
     await transporter.sendMail(mailOptions);

    // Send the reset token to the user's email (email sending logic not included here)
    res.status(200).json({ message: "A reset link has been sent to your email." });
  } catch (error){
    res.status(500).json({ message: "Error sending reset link", error: error.message });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  // Logic for resetting user password
  try{
    const { resetToken, newPassword } = req.body;

    console.log("Received Token:", resetToken);
    // Find the user with the reset token and check if it hasn't expired
    const user = await prisma.user.findFirst({
      where: {
        resetToken,
        resetTokenExpiry: { gte: new Date() }, // Token should still be valid
      },
    });
    console.log("Database Token:", user?.resetToken);
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    console.log("Database User:", user);

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password and clear the reset token
    await prisma.user.update({
      where: { user_id: user.user_id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    res.status(200).json({ message: "Password reset successful" });
  } catch (error){
    res.status(500).json({ message: "Error resetting password", error: error.message });
  }
};


//Middleware for JWT Authentication
exports.authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Authorization Header:', req.headers.authorization);
    console.log("Decoded token:", decoded);
    req.user = decoded; // Attach decoded data to request
    next();
  } catch (error) {
    console.log("Error verifying token:", error.message);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired, please log in again." });
    }
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};


// Fetching the Profile of the Authenticated User:
exports.getAuthenticatedUser = async (req, res) => {
  // Logic for fetching authenticated user's details
  try{
    const user = await prisma.user.findUnique({
      where: { user_id: req.user.user_id },
      include: { resource: true },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user: {
      name: user.name,
      email: user.email,
      role: user.resource?.name,
      profileImage: user.profileImage,
    }});
  } catch (error){
    res.status(500).json({ message: "Error fetching user details", error: error.message });
  }
};

// Logout User (Clear Refresh Token)
exports.logoutUser = async (req, res) => {
  // Logic for logging out user
  try {
    const user_id = req.user.user_id; // Get user from decoded token

    await prisma.user.update({
      where: { user_id: user_id },
      data: { refreshToken: null }, // Invalidate refresh token
    });

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error logging out', error: error.message });
  }
};

//When implementing a token refresh endpoint, 
//verify the refreshToken in the database before issuing a new access token
exports.refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token is required" });
    }

    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, REFRESH_JWT_SECRET);

    // Find the user in the database
    const user = await prisma.user.findUnique({ where: { user_id: decoded.user_id } });

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    // Generate a new access token
    const newAccessToken = jwt.sign({ user_id: user.user_id }, JWT_SECRET, { expiresIn: '60m' });

    res.status(200).json({ message: "New Access Token", newAccessToken });
  } catch (error) {
    res.status(500).json({ message: "Error refreshing token", error: error.message });
  }
};


// // Fetching the Profile of a Specific User via user_id in the URL:
// exports.getProfile = async (req, res) => {
//   // Logic for getting user profile
//   try{
//     const user_id = req.params.user_id;

//     const user = await prisma.user.findUnique({ where: { user_id: user_id } });
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     res.status(200).json({ user });
//   } catch (error){
//     res.status(500).json({ message: "Error fetching profile", error: error.message });
//   }
// };

// ✅ Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Multer Memory Storage (for Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ Upload Image to Cloudinary
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder: "profile_pictures" }, (error, result) => {
      if (error) reject(error);
      else resolve(result.secure_url);
    });
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// Update User Profile (Authenticated)
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.user_id; // Extracted from JWT
    const { name, email, password } = req.body;
    let profileImageUrl = null;

    // Validate input
    if (!name && !email && !password) {
      return res.status(400).json({ message: "At least one field must be updated." });
    }

    // Upload image if provided
    if (req.file) {
      console.log('Received file:', req.file);
      profileImageUrl = await uploadToCloudinary(req.file.buffer);
    }

    const updateData = {};

    // Only update fields that are provided
    if (name) updateData.name = name;
    if (email) {
      // Check if email is already taken by another user
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser && existingUser.user_id !== userId) {
        return res.status(400).json({ message: "Email is already in use." });
      }
      updateData.email = email;
    }
    if (password) {
      updateData.password = await bcrypt.hash(password, 10); // Encrypt new password
    }
    if (profileImageUrl) updateData.profileImage = profileImageUrl;

    // Update user in database
    const updatedUser = await prisma.user.update({
      where: { user_id: userId },
      data: updateData,
    });

    console.log("Received file:", req.file); // Check if file is being uploaded correctly
    console.log("Received form data:", req.body); // Check if other data is correctly passed


    res.status(200).json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Error updating profile", error: error.message });
  }
};

