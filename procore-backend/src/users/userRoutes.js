//userRoutes.js
const express = require("express");
const router = express.Router();
const userController = require("../users/userController");
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });


//User Registration
router.post("/register", userController.registerUser);

//Verify Email
router.post("/verify-otp", userController.verifyOtp)

//Resend OTP
router.post("/resend-otp", userController.resendOtp)

// User Login (authenticate a user and return a JWT access and refresh)
router.post("/login", userController.loginUser);

// Forgot Password
router.post("/auth/forgot-password", userController.forgotPassword);

// Reset Password
router.post("/auth/reset-password", userController.resetPassword);

// Get User Profile for Authenticate user
router.get("/me", userController.authenticate , userController.getAuthenticatedUser);

// Logout User
router.post("/auth/logout", userController.authenticate , userController.logoutUser);

// // Get User Profile for requested user
// router.get("/profile/:user_id", userController.getProfile);

// Update User Profile
router.put("/update", userController.authenticate, upload.single("profileImage"), userController.updateProfile);

// Refresh Token (refresh the JWT token)
router.post("/refresh-token", userController.refreshAccessToken);

// New Protected Route (example)
router.get("/protected-route", userController.authenticate, (req, res) => {
    res.status(200).json({ message: "This is a protected route", user: req.user });
  });

module.exports = router;
