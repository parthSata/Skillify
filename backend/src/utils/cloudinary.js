import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

const uploadInCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    // Upload an image
    const uploadResult = await cloudinary.uploader
      .upload(localFilePath, {
        resource_type: "auto",
      })
      .catch((error) => {
        console.log(error);
      }); 
    // fs.unlinkSync(localFilePath); // remove the locally saved temp file after the upload operation is done
    return uploadResult;
  } catch (error) {
    fs.unlinkSync(localFilePath); // remove the locally saved temp file as the upload opersation got failed
  }
};

// Configuration
cloudinary.config({
  cloud_name: process.env.VITE_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.VITE_CLOUDINARY_API_KEY,
  api_secret: process.env.VITE_CLOUDINARY_SECRET_KEY,
});

export { uploadInCloudinary };
