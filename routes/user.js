const express = require("express");
const { handleUserSignup, handleUserLogin, handleProfilePhotoUpload } = require("../controllers/user");
const { restrictToLoggedinUserOnly } = require('../middlewares/auth');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Save to the uploads directory
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to the file name
  },
});

const upload = multer({ dest: 'uploads/' });

// Route to handle user signup
router.post("/", handleUserSignup);

// Route to handle user login
router.post("/login", handleUserLogin);

// Route to handle profile photo upload
router.post('/upload', restrictToLoggedinUserOnly, upload.single('photo'), handleProfilePhotoUpload);



module.exports = router; 




