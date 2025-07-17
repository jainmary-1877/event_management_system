
require('dotenv').config();
const { sequelize } = require('./config/db');
const express = require('express');
const app = express();
const Event = require('./models/Event');
const eventRoutes = require('./routes/events');
const cors = require('cors');
const PORT = 5000;


// Serve static files
app.use(express.static('public'));

// Redirect root to landing.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'landing.html'));
});


// Middleware
app.use(express.json());
const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);
app.use('/events', eventRoutes);
const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);
app.use(cors());
const eventsRouter = require('./routes/events');
app.use('/api/events', eventsRouter);
app.use('/api/events', require('./routes/events'));

// Test route
app.get('/', (req, res) => {
  res.send('Event Management API is running 🚀');
});
const path = require('path');

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'landing.html'));
});
sequelize.sync({ alter: true }).then(() => {
    console.log('Database & tables created/updated');
  });
  
  app.use('/api/events', eventRoutes);
// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
const Admin = require('./models/Admin');

sequelize.sync()
  .then(() => {
    console.log('✅ All models were synchronized successfully.');
  })
  .catch(err => {
    console.error('❌ An error occurred while syncing models:', err);
  });
