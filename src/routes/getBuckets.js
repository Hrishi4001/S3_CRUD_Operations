const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");

// ===== Route to listing bucket =====
router.get("/", (req, res, next) => {
  const bucket = "./src/bucket";

  //  ===== Read the contents =====
  fs.readdir(bucket, { withFileTypes: true }, (err, contents) => {
    if (err) {
      return res.status(500).json({ error: "Error reading bucket contents." });
    }

    const subfolderNames = contents
      .filter((item) => item.isDirectory())
      .map((item) => item.name);

    res.status(200).json({
      message: "Bucket retrieved successfully.",
      subfolderNames: subfolderNames,
    });
  });
});

// ====== Error handling middleware ======
router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

module.exports = router;
