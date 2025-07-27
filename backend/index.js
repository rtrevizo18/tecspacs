require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log('✅ MongoDB connected successfully');
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err);
  console.log('⚠️  Server will start anyway for testing...');
});

// Import and mount routes
const tecRoutes = require('./routes/tecs');
const pacRoutes = require('./routes/pacs');
const userRoutes = require('./routes/users');
const errorHandler = require('./middleware/errorHandler');

app.use('/api/tecs', tecRoutes);
app.use('/api/pacs', pacRoutes);
app.use('/api/users', userRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Tecspacs API is running' });
});

// Root route with API information
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Tecspacs API Server',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      users: '/api/users',
      tecs: '/api/tecs',
      pacs: '/api/pacs'
    },
    features: {
      authentication: 'Auth0 JWT',
      database: 'MongoDB with Mongoose',
      ai: 'Google Gemini AI integration'
    }
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
}); 