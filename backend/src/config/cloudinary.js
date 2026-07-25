import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

// 1. Cloudinary Credentials Setup
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Storage Setup with Proper Param Resolution
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let folder = "skillforge/general";
    let resource_type = "image"; // Default for images

    if (file.mimetype.startsWith("image/")) {
      folder = "skillforge/images";
      resource_type = "image";
    } else if (file.mimetype.startsWith("video/")) {
      folder = "skillforge/videos";
      resource_type = "video";
    } else if (file.mimetype === "application/pdf") {
      folder = "skillforge/documents";
      resource_type = "raw"; // PDFs in Cloudinary must use 'raw'
    }

    // Clean original filename
    const cleanFileName = file.originalname
      .split(".")[0]
      .replace(/[^a-zA-Z0-9]/g, "_");

    return {
      folder: folder,
      resource_type: resource_type,
      public_id: `${Date.now()}-${cleanFileName}`,
    };
  },
});

// 3. Export Multer Upload Middleware
export const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB Limit
});
