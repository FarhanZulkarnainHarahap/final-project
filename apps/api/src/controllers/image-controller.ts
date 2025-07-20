// import { Request, Response } from "express";
// import cloudinary from "../config/cloudinary-config.js";
// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// export async function uploadProductImages(req: Request, res: Response) {
//   try {
//     const productId = req.body.productId;

//     if (!productId) {
//       return res.status(400).json({ message: "Missing productId" });
//     }

//     const files = req.files as {
//       imagePreview?: Express.Multer.File[];
//       imageContent?: Express.Multer.File[];
//     };

//     if (files.imagePreview?.[0]) {
//       const previewUpload = await cloudinary.uploader.upload(
//         files.imagePreview[0].path,
//         {
//           folder: "final-project/products",
//         }
//       );

//       await prisma.image.create({
//         data: {
//           productId,
//           imageUrl: previewUpload.secure_url,
//           type: "PREVIEW",
//         },
//       });
//     }

//     if (files.imageContent?.[0]) {
//       const contentUpload = await cloudinary.uploader.upload(
//         files.imageContent[0].path,
//         {
//           folder: "final-project/products",
//         }
//       );

//       await prisma.image.create({
//         data: {
//           productId,
//           imageUrl: contentUpload.secure_url,
//           type: "CONTENT",
//         },
//       });
//     }

//     return res.status(200).json({ message: "Images uploaded" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Failed to upload images" });
//   }
// }
