const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");

//  ====== Route to list bucket ======
router.get("/:bucketName", (req, res, next) => {
  const bucket = "./src/bucket";
  const bucketName = req.params.bucketName;

  const bucketPath = path.join(bucket, bucketName);
  if (!fs.existsSync(bucketPath)) {
    return res.status(404).json({ error: "Bucket not found." });
  }

  fs.readdir(bucketPath, (err, contents) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "Error reading subfolder contents." });
    }

    // ====== Check for bucket files ======
    if (contents.length === 0) {
      return res.status(200).json({
        message: "Bucket is empty.",
        subfolder: bucketName,
        contents: [],
      });
    }

    const itemsDetails = contents.map((item) => {
      const itemPath = path.join(bucketPath, item);
      const itemStats = fs.statSync(itemPath);
      const isDirectory = itemStats.isDirectory();

      return {
        name: item,
        isDirectory: isDirectory,
        size: isDirectory ? null : itemStats.size,
      };
    });

    res.status(200).json({
      message: "Bucket contents retrieved successfully.",
      bucket: bucketName,
      objects: itemsDetails,
    });
  });
});

// ====== Error handling middleware ======
router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

module.exports = router;
