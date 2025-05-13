import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext"; // Import AuthContext
import { useNavigate } from "react-router-dom"; // Import useNavigate for redirection
import "./Profile.css";

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate(); 
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    password: "",
    profileImage: "",
    previewImage: user?.profileImage || "",
  });

  // If the user is not logged in, redirect to login
  useEffect(() => {
    if (!user) {
      navigate("/login"); // Redirect to login if user is not logged in
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    if (e.target.name === "profileImage") {
      const file = e.target.files[0];
      setFormData({
        ...formData,
        profileImage: file,
        previewImage: URL.createObjectURL(file), // Display preview
      });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("accessToken");
    console.log("Access Token: ", token);

    if (!token) {
      alert("Please log in.");
      navigate("/login");
      return;
    }

    const tokenRes = await fetch("http://localhost:5000/api/users/protected-route", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!tokenRes.ok) {
      alert("Unauthorized or expired token. Please log in again.");
      navigate("/login"); // Redirect to login if token is invalid or expired
      return;
    }

    const formDataObj = new FormData();
    formDataObj.append("name", formData.name);
    formDataObj.append("email", formData.email);
    if (formData.password) formDataObj.append("password", formData.password);
    if (formData.profileImage) formDataObj.append("profileImage", formData.profileImage);

    try {
      const updateRes = await fetch("http://localhost:5000/api/users/update", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formDataObj,
      });

      if (updateRes.ok) {
        alert("Profile updated successfully");
        refreshUser(); // Refresh the user data in context
      }  else {
        const errorData = await updateRes.json();
        alert(errorData.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("An error occurred while updating your profile. Please try again.");
    }
  };

  return (
    <div className="profile-container">
      <h2>Update Profile</h2>

      {/* Profile Image Preview */}
      <img src={formData.previewImage || "/avatar.jpg"} alt="Profile" className="profile-image-preview" />

      <form onSubmit={handleSubmit} className="profile-form" encType="multipart/form-data">
        <label>Name:</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <label>Email:</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <label>New Password (leave blank to keep current password):</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
        />

        <label>Profile Image:</label>
        <input
          type="file"
          name="profileImage"
          onChange={handleChange}
          accept="image/*"
        />

        <button type="submit">Update Profile</button>
      </form>
      
      {/* Back button to navigate to /projects */}
      <button onClick={() => navigate("/projects")} className="back-button">
        Back to Projects
      </button>

    </div>
  );
};

export default Profile;
