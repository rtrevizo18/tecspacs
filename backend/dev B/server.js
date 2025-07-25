const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables from custom path
dotenv.config({ path: '.env' });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Routes
app.use('/tecs', require('./routes/tecs'));
app.use('/pacs', require('./routes/pac'));

// Basic route
app.get('/', (req, res) => {
  res.json({
    message: 'TecSpacs Backend API',
    version: '1.0.0',
    endpoints: {
      tecs: '/tecs',
      pacs: '/pacs'
    },
    status: 'Running'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// MongoDB connection with graceful startup
const connectDB = async () => {
  try {
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ MongoDB Atlas connected successfully');
    } else {
      console.log('⚠️  No MongoDB URI found - running without database');
    }
  } catch (error) {
    console.log('⚠️  MongoDB connection failed - running without database');
    console.log('Error:', error.message);
  }
};

// Start server (don't wait for DB)
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}`);
  
  // Try to connect to DB in background
  await connectDB();
});

module.exports = app;
