const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.files || !req.files.picture) {
      return res.status(400).json({ status: 400, msg: "No file uploaded" });
    }

    const file = req.files.picture;
    const fileName = `profile_${Date.now()}_${file.name}`;

    await file.mv(`./public/uploads/${fileName}`);

    res.status(200).json({ status: 200, filename: fileName });
  } catch (err) {
    console.error('Error uploading profile picture:', err);
    res.status(500).json({ status: 500, msg: "Upload failed" });
  }
};

// ✅ EXPORT like this:
module.exports = {
  uploadProfilePicture
};
