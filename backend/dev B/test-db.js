const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('Testing MongoDB connection...');
    console.log('URI:', process.env.MONGODB_URI ? 'Found' : 'Not found');
    
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Test a simple operation
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📋 Available collections: ${collections.length}`);
    
    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }
};

// Load environment variables
require('dotenv').config();

connectDB();
