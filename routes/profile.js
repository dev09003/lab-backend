const express = require("express");
const User = require("../models/user"); // Import User model if needed for other operations
const router = express.Router();

// Route to get the user's profile
router.get("/", (req, res) => {
    // Ensure the user is logged in before accessing the profile
    if (!req.user) {
        return res.redirect("/login"); // Redirect to login if not authenticated
    }

    return res.render("profile", {
        user: req.user, // Pass the user data to the view
    });
});

// Add the upload route here if not already added
router.post("/upload-photo", async (req, res) => {
    const userId = req.user._id; // Assuming req.user contains the logged-in user's info
    const user = await User.findById(userId);

    if (req.file) {
        user.profilePhoto = req.file.path; // Update with the new profile photo path
    }

    await user.save(); // Save the updated user profile
    return res.redirect("/profile"); // Redirect to the profile page
});

module.exports = router;

