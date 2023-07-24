const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");

// ====== Route for handling DELETE requests ======

router.delete("/:bucketName/:fileName", (req, res, next) => {
  const bucket = "./src/bucket";
  const bucketName = req.params.bucketName;
  const fileName = req.params.fileName;
  const filePath = path.join(bucket, bucketName, fileName);

  //====== Check file exists ======
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found." });
  }

  // ====== Delete the file ======
  fs.unlink(filePath, (err) => {
    if (err) {
      return res.status(500).json({ error: "Error deleting the file." });
    }

    res.status(200).json({
      message: "File deleted successfully.",
      bucketName: bucketName,
      file: fileName,
    });
  });
});

// ====== Error handling middleware ======
router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

module.exports = router;
