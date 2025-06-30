const jwt = require("jsonwebtoken");
require("dotenv").config();

function jwtGenerator(username, role) {
  const payload = {
    user: {
      username: username,
      role: role,
    }
  };

  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
}

module.exports = jwtGenerator;