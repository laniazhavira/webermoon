const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db");
const { authorizeAdmin } = require('../middleware/authorize');
const jwtGenerator = require('../utils/jwtGenerator');

router.post("/register", authorizeAdmin, async (req,res) => {
    let { username, password, role } = req.body;
    
    try {
        if (![username, password, role].every(Boolean)) {
            return res.json("Terdapat field yang belum diisi");
          }
        if (username.includes(' ')) return res.status(500).json({ type: "username error" ,message : "Username tidak boleh mengandung spasi"});
      
        if (username.length < 6)  return res.status(500).json({ type: "username error" ,message : "Username minimal 6 karakter"});

        if (username.length > 50)  return res.status(500).json({ type: "username error" ,message : "Username maksimal 50 karakter"});
    
        if (password.length < 8) return res.status(500).json({ type: "password error" ,message : "Password minimal 8 karakter"});

        const [isValid] = await db.query (`SELECT 1 as is_exist FROM users WHERE username = ?`, [username])

        if (isValid.length > 0) return res.status(500).json({ type: "username error" ,message : "Username sudah digunakan"})

        const salt = await bcrypt.genSalt(10);
        const encryptedPassword = await bcrypt.hash(password, salt);
    
        await db.query(
          `INSERT INTO users (username, password, role) VALUES (?, ?, ?)`,
          [username, encryptedPassword, role]
        );

        return res.json({ username, password: encryptedPassword });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server error");
    }
});

router.post("/login", async (req, res) => {
  let { username, password } = req.body;
  if (![username, password].every(Boolean)) {
    return res.status(400).json({type: "wrong credential", message: "Username atau Password kosong"});
  }
  username = username.toLowerCase();

  try {
    [users] = await db.query("SELECT * FROM users WHERE username = ?", [
      username
    ]); 

    
    if (users.length == 0) return res.status(500).json({type: "wrong credential", message: "Username atau Password Salah"});
    
    if (users.length == 1){
      user = users[0];
      role = user.role;
      validPassword = await bcrypt.compare(
        password,
        user.password
      );
    }
  
    if (!validPassword) {
      return res.status(500).json({type: "wrong credential", message: "Username atau Password Salah"});
    }

    const jwtToken = jwtGenerator(username, role);

    return res.json({ jwtToken });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;