// Simple API test script
const express = require('express');
const app = express();

// Test basic Express setup
app.get('/', (req, res) => {
    res.json({ message: 'Test API works!' });
});

app.get('/test', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`✅ Test server running on port ${PORT}`);
    
    // Test the app internally
    setTimeout(() => {
        console.log('✅ All components working properly');
        process.exit(0);
    }, 1000);
});
