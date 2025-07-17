const express = require('express');
const router = express.Router();
const { sequelize, Sequelize } = require('../config/db');
 // Sequelize instance
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your_secret_key'; // Store in .env in production

// User Signup
router.post('/signup', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required' });
  }

  try {
    // Check if user exists
    const [existingUser] = await sequelize.query(
      'SELECT * FROM users WHERE username = ?',
      { replacements: [username], type: Sequelize.QueryTypes.SELECT }
    );

    if (existingUser) {
      return res.status(409).json({ message: 'Username already taken' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    await sequelize.query(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      { replacements: [username, hashedPassword], type: Sequelize.QueryTypes.INSERT }
    );

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Signup error:', error.stack);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// User Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const [user] = await sequelize.query(
      'SELECT * FROM users WHERE username = ?',
      { replacements: [username], type: Sequelize.QueryTypes.SELECT }
    );

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
// POST /api/events/book/:id
router.post('/book/:id', async (req, res) => {
  const eventId = req.params.id;
  const { seatsToBook } = req.body;

  try {
    const event = await Event.findByPk(eventId);

    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (event.availableSeats < seatsToBook) {
      return res.status(400).json({ message: 'Not enough seats available' });
    }

    event.availableSeats -= seatsToBook;
    await event.save();

    res.json({ message: 'Booking successful', remainingSeats: event.availableSeats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Booking failed' });
  }
});


module.exports = router;
