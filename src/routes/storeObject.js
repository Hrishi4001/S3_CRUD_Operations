const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const dotenv = require("dotenv");
dotenv.config();

const privateKey = process.env.PRIVATE_KEY;

// ==== Configure Multer ====
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const bucket = "./src/bucket";
    const subfolderName = req.params.subfolderName;
    const storagePath = path.join(bucket, subfolderName);
    if (!fs.existsSync(storagePath)) {
      fs.mkdirSync(storagePath, { recursive: true });
    }
    cb(null, storagePath);
  },
  filename: (req, file, cb) => {
    const objectKey = req.params.objectKey || Date.now();
    cb(null, file.originalname);
  },
});

// ==== Initialize Multer ====
const upload = multer({ storage: storage });

// Function to encrypt data using AES-256-CBC
function encryptData(data, key) {
  const cipher = crypto.createCipher("aes-256-cbc", key);
  let encryptedData = cipher.update(data, "utf8", "hex");
  encryptedData += cipher.final("hex");
  return encryptedData;
}

// ==== Middleware ====
function checkSubfolderExistence(req, res, next) {
  const subfolderName = req.params.subfolderName;
  if (!fs.existsSync(path.join("./src/bucket", subfolderName))) {
    console.log(path.join("./src/bucket", subfolderName));
    return res.status(404).send("Subfolder does not exist.");
  }
  next();
}

// ==== Route to handle POST requests ====
router.post(
  "/:subfolderName/",
  checkSubfolderExistence,
  upload.single("file"),
  (req, res, next) => {
    const jsonObject = req.body;

    if (!req.file && Object.keys(jsonObject).length === 0) {
      return res.status(400).send("Both request body and file are empty.");
    }

    const subfolderName = req.params.subfolderName;

    // ==== Check if the bucket exist ====
    if (!fs.existsSync(path.join("./src/bucket", subfolderName))) {
      return res.status(400).send("Bucket  does not exist.");
    }

    // ==== Check the file existence ====
    if (req.file) {
      const filePath = req.file.path;
      fs.readFile(filePath, "utf8", (err, fileData) => {
        if (err) {
          return res.status(500).json({ error: "Error reading the file." });
        }

        // ==== Encrypt the file ====
        const encryptionKey = privateKey;
        const encryptedData = encryptData(fileData, encryptionKey);

        // ==== Write the encrypted content ====
        fs.writeFile(filePath, encryptedData, "utf8", (err) => {
          if (err) {
            return res.status(500).json({ error: "Error writing the file." });
          }

          res.status(200).json({
            message: "Object uploaded and encrypted successfully.",
            file: req.file,
          });
        });
      });
    }
  }
);

// ===== Error handling middleware =====
router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

module.exports = router;

// ==============   Upload 1 file per request  ==============
