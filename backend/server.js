// server.js
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

const tecRoutes = require('./routes/tecs');
const pacRoutes = require('./routes/pac');

const app = express();
app.use(express.json());

app.use('/tecs', tecRoutes);
app.use('/pacs', pacRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('⚠️  Server will start anyway for testing...');
  });

// Start server regardless of MongoDB connection
app.listen(5000, () => {
  console.log('🚀 Server running on http://localhost:5000');
  console.log('📋 Available endpoints:');
  console.log('   GET  /tecs');
  console.log('   POST /tecs');
  console.log('   GET  /pacs');
  console.log('   POST /pacs');
});
