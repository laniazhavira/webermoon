const jwt = require("jsonwebtoken");
const jwtGenerator = require('../utils/jwtGenerator');
require("dotenv").config();

// this middleware will on continue on if the token is inside the local storage

const authorizeAdmin = (req, res, next) => {
  // Get token from header
  const authHeader = req.header("Authorization");
  const token = authHeader && authHeader.split(' ')[1];

  // Check if not token not exist
  if (!token || token === "undefined") {
    return res.status(403).json({ msg: "authorization denied" });
  }

  // Verify token
  try {
    const verify = jwt.verify(token, process.env.JWT_SECRET);
    
    if (verify.user.role == "admin"){
        req.user = verify.user;
        
        // Generate a new JWT token
        const jwtToken = jwtGenerator(verify.user.username, verify.user.role);
        res.setHeader("Authorization", `Bearer ${jwtToken}`);

        next();
    } else {
        return res.status(403).json({ msg: "authorization denied" });
    }

  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
    console.error(err);
  }
};

const authorizeMitra = (req, res, next) => {
  // Get token from header
  const authHeader = req.header("Authorization");
  const token = authHeader && authHeader.split(' ')[1];

  // Check if not token not exist
  if (!token || token === "undefined") {
    return res.status(403).json({ msg: "authorization denied" });
  }

  // Verify token
  try {
    const verify = jwt.verify(token, process.env.JWT_SECRET);
    
    if (verify.user.role == "mitra"){
        req.user = verify.user;
        
        // Generate a new JWT token
        const jwtToken = jwtGenerator(verify.user.username, verify.user.role);
        res.setHeader("Authorization", `Bearer ${jwtToken}`);

        next();
    } else {
        return res.status(403).json({ msg: "authorization denied" });
    }

  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
    console.error(err);
  }
};

const authorizeUser = (req, res, next) => {
  // Get token from header
  const authHeader = req.header("Authorization");
  const token = authHeader && authHeader.split(' ')[1];

  // Check if not token not exist
  if (!token || token === "undefined") {
    return res.status(403).json({ msg: "authorization denied" });
  }

  // Verify token
  try {
    const verify = jwt.verify(token, process.env.JWT_SECRET);

    req.user = verify.user;

    // Generate a new JWT token
    const jwtToken = jwtGenerator(verify.user.username, verify.user.role);
    res.setHeader("Authorization", `Bearer ${jwtToken}`);

    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
    console.error(err);
  }
};

const authorizeGuest = (req, res, next) => {
  // Get token from header
  const authHeader = req.header("Authorization");
  const token = authHeader && authHeader.split(' ')[1];

  // Check if the token doesn't exist
  if (!token || token === "undefined") {
    return next();
  }

  // Verify token
  try {
    const verify = jwt.verify(token, process.env.JWT_SECRET);

    req.user = verify.user;

    // Generate a new JWT token
    const jwtToken = jwtGenerator(verify.user.username, verify.user.role);
    res.setHeader("Authorization", `Bearer ${jwtToken}`);

    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
    console.error(err);
  }
};

module.exports = { authorizeAdmin, authorizeUser, authorizeGuest, authorizeMitra }