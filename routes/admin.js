const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const verifyToken = require('../middleware/auth');


const router = express.Router();

// Register new admin
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if username exists
    const existingAdmin = await Admin.findOne({ where: { username } });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin
    const admin = await Admin.create({ username, password: hashedPassword });

    res.status(201).json({ message: 'Admin created', adminId: admin.id });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
// Admin Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
  
    try {
      // Find admin by username
      const admin = await Admin.findOne({ where: { username } });
      if (!admin) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
  
      // Compare password with hashed password
      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
  
      // Generate JWT token
      const token = jwt.sign(
        { id: admin.id, username: admin.username },   // payload
        process.env.JWT_SECRET,                        // secret key
        { expiresIn: '1h' }                           // expires in 1 hour
      );
      res.json({ token });
      // Send success response with token
      res.status(200).json({
        message: 'Login successful',
        adminId: admin.id,
        token: token
      });
      
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
router.post('/signup', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if username already exists
    const existingAdmin = await Admin.findOne({ where: { username } });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new admin
    await Admin.create({ username, password: hashedPassword });

    res.status(201).json({ message: 'Admin registered successfully' });
  } catch (error) {
    console.error('Admin Signup Error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
});
// Get all admins
router.get('/', async (req, res) => {
  try {
    const admins = await Admin.findAll({
      attributes: ['id', 'username'] // Do not send password
    });
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
router.get('/dashboard', verifyToken, (req, res) => {
    res.json({
      message: 'Welcome to the Admin Dashboard',
      admin: req.user, // contains id and username from the token
    });
  });
  
module.exports = router;
