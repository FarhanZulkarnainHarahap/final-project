// import express from "express";
// import { uploadProductImages } from "../controllers/image-controller.js";
// import { verifyToken, roleGuard } from "../middleware/auth-middleware.js";
// import upload from "../middleware/upload-middleware.js";

// const router = express.Router();

// // POST /api/v1/images
// router.post(
//   "/",
//   verifyToken,
//   roleGuard("SUPER_ADMIN"),
//   upload.fields([
//     { name: "imagePreview", maxCount: 1 },
//     { name: "imageContent", maxCount: 1 },
//   ]),
//   uploadProductImages
// );

// export default router;
