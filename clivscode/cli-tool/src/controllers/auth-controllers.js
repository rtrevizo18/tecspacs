import axios from 'axios';
import {
  saveUserConfig,
  getUserConfig,
  clearUserConfig,
} from '../util/config.js';
import { getTokenViaDeviceFlow } from '../util/auth0-device-flow.js';
import { resolve } from 'path';

const API_URL = process.env.API_BASE_URL;

// Configure axios defaults
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'content-type': 'application/json',
  },
});

export async function loginAction() {
  try {
    console.log('🚀 Starting authentication...');

    // Get Auth0 token via device flow
    const token = await getTokenViaDeviceFlow();

    console.log('\nAuthentication successful! Fetching your profile...');

    // Call the GET /api/users/me endpoint with the token
    const response = await apiClient.get('/api/users/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const userData = response.data;

    // Save user info including the token for future use
    await saveUserConfig({
      token: token,
      auth0Id: userData.auth0Id,
      email: userData.email,
      username: userData.username,
      tecs: userData.tecs || [],
      pacs: userData.pacs || [],
    });

    console.log(`\n🎉 Welcome back, ${userData.username}!`);
    console.log(`📧 Email: ${userData.email}`);
    if (userData.tecs && userData.tecs.length > 0) {
      console.log(`📚 You have ${userData.tecs.length} tecs`);
    }
    if (userData.pacs && userData.pacs.length > 0) {
      console.log(`📦 You have ${userData.pacs.length} pacs`);
    }
  } catch (error) {
    if (error.response) {
      console.error('❌ Login failed:', error || 'Authentication failed');
    } else {
      console.error('❌ Login error:', error.message);
    }
  }
}

export async function logoutAction() {
  try {
    await clearUserConfig();
    console.log('You have been logged out successfully.');
  } catch (error) {
    console.error('Logout error:', error.message);
  }
}

export async function profileAction() {
  try {
    const userConfig = await getUserConfig();

    if (!userConfig) {
      console.log('You are not logged in. Use "tecspacs login" to sign in.');
      return;
    }

    console.log('Profile Information:');
    console.log(`Username: ${userConfig.username}`);
    console.log(`Email: ${userConfig.email}`);
    console.log(`Auth0 ID: ${userConfig.auth0Id}`);
    console.log(`Tecs: ${userConfig.tecs?.length || 0}`);
    console.log(`Pacs: ${userConfig.pacs?.length || 0}`);
    console.log(`Last Login: ${userConfig.lastLogin}`);
  } catch (error) {
    console.error('Profile error:', error.message);
  }
}
