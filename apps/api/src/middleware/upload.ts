// upload.ts
import express from "express";
import multer from "multer";
import cloudinary from "../config/cloudinary-config.js";
import fs from "fs";
import path from "path";

const router = express.Router();

// Store file temporarily on disk
const upload = multer({ dest: "uploads/" });

router.post("/upload", upload.single("paymentProof"), async (req, res) => {
  try {
    const data = JSON.parse(req.body.data); // your object sent as JSON string
    const filePath = req.file.path;

    const result = await cloudinary.uploader.upload(filePath, {
      folder: "upload-payment-proof",
    });

    // Optionally delete the file after upload
    fs.unlinkSync(filePath);

    res.json({
      message: "Uploaded successfully",
      imageUrl: result.secure_url,
      data,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
});

export default router;
