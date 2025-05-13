const cloudinary = require("cloudinary").v2;
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload a local file to Cloudinary
cloudinary.uploader.upload("uploads/test-image.jpg", { folder: "test_upload" })
  .then(result => console.log("Cloudinary URL:", result.secure_url))
  .catch(error => console.error("Upload error:", error));
