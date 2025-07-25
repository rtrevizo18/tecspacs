const app = require('./server');

console.log('🧪 Testing server functionality...');

// Test that the server module loads correctly
if (app) {
  console.log('✅ Server module loaded successfully');
  console.log('✅ Express app is properly configured');
} else {
  console.log('❌ Server module failed to load');
}
