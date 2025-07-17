const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const authenticateJWT = require('../middleware/authenticateJWT'); // we will create this middleware
console.log(typeof authenticateJWT);

router.post('/create', authenticateJWT, async (req, res) => {
  const { title, date, description, availableSeats } = req.body;

  try {
    const event = await Event.create({
     title,
     date,
    description,
    availableSeats
    });

    res.status(201).json({ message: 'Event created successfully', event });
  } catch (error) {
    console.error('Event creation failed:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});


// Read all events
router.get('/', async (req, res) => {
  try {
    const events = await Event.findAll();
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update event by id (admin only)
router.put('/:id', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, date } = req.body;
    const event = await Event.findByPk(id);

    if (!event) return res.status(404).json({ message: 'Event not found' });

    event.title = title ?? event.title;
    event.description = description ?? event.description;
    event.date = date ?? event.date;

    await event.save();
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete event by id (admin only)
router.delete('/:id', authenticateJWT, async (req, res) => {
  const eventId = req.params.id;
  const loggedInAdminId = req.adminId;

  try {
    const event = await Event.findByPk(eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.adminId !== loggedInAdminId) {
      return res.status(403).json({ message: 'You can only delete your own events' });
    }

    await event.destroy();
    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
router.post('/book/:id', async (req, res) => {
  const { id } = req.params;
  const { seatsToBook } = req.body;

  if (!seatsToBook || seatsToBook < 1) {
    return res.status(400).json({ message: 'Invalid number of seats.' });
  }

  try {
    const event = await Event.findByPk(id); // or use findOne if needed

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.availableSeats < seatsToBook) {
      return res.status(400).json({ message: 'Not enough seats available.' });
    }

    event.availableSeats -= seatsToBook;
    await event.save();

    return res.status(200).json({ message: 'Booking successful' });
  } catch (error) {
    console.error('Booking error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
