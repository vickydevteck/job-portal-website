
const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Please login first",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
}


function requireAdmin(req, res, next) {
  console.log("Logged in email:", req.user?.email);
  console.log("Logged in role:", req.user?.role);

  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      message: "Admin access only",
    });
  }

  next();
}


module.exports = { authenticateToken, requireAdmin };
