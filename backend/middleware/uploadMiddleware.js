const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const path = require("path");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => ({
        folder: "visitor-management/visitors",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        public_id:
            `${Date.now()}-${Math.round(Math.random() * 1e9)}-${path.parse(file.originalname).name.replace(/[^a-zA-Z0-9_-]/g, "_")}`
    })
});

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype && file.mimetype.startsWith("image/")) {
            return cb(null, true);
        }

        cb(new Error("Only image files are allowed"));
    }
});

module.exports = upload;