// Simple test server without MongoDB
const express = require('express');

const app = express();
app.use(express.json());

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ 
    message: '🎉 Server is working!', 
    status: 'success',
    timestamp: new Date().toISOString()
  });
});

// Mock tecs endpoint
app.get('/tecs', (req, res) => {
  res.json({ 
    message: '📚 Tecs endpoint working!',
    data: [
      { id: 1, name: 'React Hook', language: 'javascript', tag: 'frontend' },
      { id: 2, name: 'Python Function', language: 'python', tag: 'backend' }
    ]
  });
});

app.listen(5000, () => {
  console.log('🚀 Test Server running on http://localhost:5000');
  console.log('✅ Try: http://localhost:5000/test');
  console.log('✅ Try: http://localhost:5000/tecs');
});
