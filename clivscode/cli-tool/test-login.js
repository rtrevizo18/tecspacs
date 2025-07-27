import { loginAction } from './src/controllers/auth-controllers.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('Testing login action...');
console.log('Environment variables:');
console.log('- AUTH0_DOMAIN:', process.env.AUTH0_DOMAIN);
console.log('- AUTH0_CLIENT_ID:', process.env.AUTH0_CLIENT_ID);
console.log('- API_BASE_URL:', process.env.API_BASE_URL);

// Test the login action
loginAction().catch(console.error);
