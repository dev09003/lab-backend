const { getUser } = require("../service/auth");
const User = require("../models/user");

async function restrictToLoggedinUserOnly(req, res, next) {
  const userUid = req.cookies?.uid;

  if (!userUid) return res.redirect("/login");
  
  const user = getUser(userUid);

  if (!user) return res.redirect("/login");

  // Fetch the user from the database using user ID
  const dbUser = await User.findById(user._id);
  req.user = dbUser; // Attach the full user object to req.user

  next();
}

async function checkAuth(req, res, next) {
  const userUid = req.cookies?.uid;

  const user = getUser(userUid);

  if (user) {
    const dbUser = await User.findById(user._id);
    req.user = dbUser; // Attach the full user object to req.user
  } else {
    req.user = null;
  }
  next();
}

module.exports = {
  restrictToLoggedinUserOnly,
  checkAuth,
};
