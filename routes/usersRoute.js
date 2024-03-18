const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/user");

router.post("/register", async (req, res) => {
  const { name, password } = req.body;

  const email = req.body.email.toLowerCase();

  try {
    // Find user by lowercase email
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        error: "Email already exists. Please choose a different email.",
      });
    }

    // If email does not exist in the database, continue with registration or other logic
    // ...
  } catch (error) {
    // Handle error
    return res.status(500).json({ error: "Internal server error" });
  }
  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  const newuser = new User({
    name,
    email,
    password: hashedPassword, // Store the hashed password in the database
  });

  try {
    const user = await newuser.save();
    res.send("User registered successfully");
  } catch (error) {
    return res.status(400).json({ error });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "No user found" });
    }

    // Compare the provided password with the hashed password stored in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const temp = {
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      _id: user._id,
    };
    res.send(temp);
  } catch (error) {
    return res.status(400).json({ error });
  }
});

router.get("/getallusers", async (req, res) => {
  try {
    const users = await User.find();
    res.send(users);
  } catch (error) {
    return res.status(400).json({ error });
  }
});
router.post("/checkemail", async (req, res) => {
  const { email } = req.body;

  try {
    // Check if email exists in the database
    const existingUser = await User.findOne({ email });
    const emailExists = !!existingUser; // Convert to boolean

    // Send response indicating whether email exists
    res.status(200).json({ exists: emailExists });
  } catch (error) {
    // Handle any errors
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/reset", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "No user found" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password with the new hashed password
    user.password = hashedPassword;
    await user.save();

    // Send a success message
    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    // Handle any errors
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
