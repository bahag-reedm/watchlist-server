const { Sequelize } = require('sequelize');

// Option 1: Passing a connection URI
const sequelize = new Sequelize('postgres://user:pass@example.com:5432/dbname') // Example for postgres