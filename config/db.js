require('dotenv').config(); // Load .env variables
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql'
  }
);

// Test connection
sequelize.authenticate()
  .then(() => {
    console.log('✅ Connected to MySQL database');
  })
  .catch((err) => {
    console.error('❌ Unable to connect to database:', err);
  });

module.exports = {sequelize,Sequelize} ;
