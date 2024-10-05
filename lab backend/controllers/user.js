const { v4: uuidv4 } = require("uuid");
const User = require("../models/user");
const { setUser } = require("../service/auth");
const fs = require("fs");
const path = require("path");

async function handleUserSignup(req, res) {
  const { name, email, password } = req.body;
  await User.create({
    name,
    email,
    password,
  });
  return res.redirect("/");
}

async function handleUserLogin(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email, password });

  if (!user)
    return res.render("login", {
      error: "Invalid Username or Password",
    });

  const sessionId = uuidv4();
  setUser(sessionId, user);
  res.cookie("uid", sessionId);
  return res.redirect("/");
}

async function handleProfilePhotoUpload(req, res) {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  // Save the file path to the user's profile in the database
  const userId = req.user.id; // Assuming you have the user ID in req.user
  const filePath = req.file.path;

  await User.updateOne({ _id: userId }, { profilePhoto: filePath });

  return res.send({
    message: 'Profile photo uploaded successfully!',
    filePath, // Path to the uploaded file
  });
}

module.exports = {
  handleUserSignup,
  handleUserLogin,
  handleProfilePhotoUpload,
};



