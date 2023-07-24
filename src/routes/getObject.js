const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const dotenv = require("dotenv");
dotenv.config();

const privateKey = process.env.PRIVATE_KEY;

// ====== Function to decrypt data using AES-256-CBC ======
function decryptData(data, key) {
  const decipher = crypto.createDecipher("aes-256-cbc", key);
  let decryptedData = decipher.update(data, "hex", "utf8");
  decryptedData += decipher.final("utf8");
  return decryptedData;
}

// ====== Middleware to check if the bucket exists ======
function checkSubfolderExistence(req, res, next) {
  const bucketName = req.params.bucketName;
  if (!fs.existsSync(path.join("./src/bucket", bucketName))) {
    return res.status(404).send("Bucket does not exist.");
  }
  next();
}

// ====== Route to download ======
router.get(
  "/:bucketName/:fileName",
  checkSubfolderExistence,
  (req, res, next) => {
    const bucketName = req.params.bucketName;
    const fileName = req.params.fileName;
    const filePath = path.join("./src/bucket", bucketName, fileName);

    // ====== Read the file ======
    fs.readFile(filePath, "utf8", (err, fileData) => {
      if (err) {
        return res.status(500).json({ error: "Error reading the file." });
      }

      //  ====== Decrypt the file ======
      const decryptionKey = privateKey;
      const decryptedData = decryptData(fileData, decryptionKey);

      res.setHeader("Content-disposition", "attachment; filename=" + fileName);
      res.setHeader("Content-type", "application/octet-stream");

      res.status(200).send(decryptedData);
    });
  }
);

// ====== Error handling middleware ======
router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

module.exports = router;

// ==============   Open the route in folder to download ==============
// ==============   Open the route in postman to read text file ==============
