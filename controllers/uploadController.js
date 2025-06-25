const uploadProfilePicture = async (req, res, next) => {
  try {
    // Validate that a file was uploaded under the name "picture"
    if (!req.files || !req.files.picture) {
      return next({ status: 400, message: "No file uploaded" });
    }

    const file = req.files.picture;

    // Generate a unique filename with timestamp to avoid conflicts
    const fileName = `profile_${Date.now()}_${file.name}`;

    // Move the file to the uploads folder (publicly accessible)
    await file.mv(`./public/uploads/${fileName}`);

    // Respond with the filename (can be saved in DB or displayed on frontend)
    res.status(200).json({ status: 200, filename: fileName });
  } catch (err) {
    // Catch unexpected errors (e.g., permission issues, file system errors)
    next({ status: 500, message: "Upload failed" });
  }
};

// Export the controller function
module.exports = {
  uploadProfilePicture
};
