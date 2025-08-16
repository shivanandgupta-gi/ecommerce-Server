import multer from 'multer'
import fs from 'fs';
//it help to upload image on cloudanary

// Configure storage settings for Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads');
  },
  // Set the filename format: timestamp + original filename
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
    // Optional: you could push the filename to an array if needed
    // imagesArr.push(`${Date.now()}_${file.originalname}`);
  },
});

// Create the Multer upload middleware using the defined storage
const upload = multer({ storage: storage });

// Export the middleware for use in routes
export default upload;

