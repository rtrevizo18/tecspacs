import axios from 'axios';
import {
  saveUserConfig,
  getUserConfig,
  clearUserConfig,
} from '../util/config.js';
import {
  getTokenViaDeviceFlow,
  isTokenExpired,
  refreshToken,
} from '../util/auth0-device-flow.js';
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
    // Check if we already have a token
    const userConfig = await getUserConfig();
    let tokenData = null;

    if (userConfig && userConfig.token) {
      console.log('Checking existing authentication...');

      // Check if access_token is expired
      if (isTokenExpired(userConfig.token.access_token)) {
        console.log('Token expired, attempting to refresh...');

        // If we have a refresh_token, try to use it
        if (userConfig.token.refresh_token) {
          try {
            tokenData = await refreshToken(userConfig.token.refresh_token);
            console.log('Authentication refreshed successfully!');
          } catch (refreshError) {
            console.log('Could not refresh token, re-authentication required.');
            tokenData = null;
          }
        } else {
          console.log(
            'No refresh token available, re-authentication required.'
          );
        }
      } else {
        // Token is still valid
        console.log('Existing authentication is valid.');
        tokenData = userConfig.token;
      }
    }

    // If we don't have a valid token yet, initiate device flow
    if (!tokenData) {
      console.log('🚀 Starting authentication...');
      tokenData = await getTokenViaDeviceFlow();
    }

    console.log('\nAuthentication successful! Fetching your profile...');

    // Call the GET /api/users/me endpoint with the token
    const response = await apiClient.get('/api/users/me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const userData = response.data;

    // Save user info including the token for future use
    await saveUserConfig({
      token: tokenData, // Save the complete token object including refresh_token
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

    // Check token expiration
    let tokenStatus = 'Unknown';
    if (userConfig.token && userConfig.token.access_token) {
      tokenStatus = isTokenExpired(userConfig.token.access_token)
        ? 'Expired'
        : 'Valid';
    }

    console.log('Profile Information:');
    console.log(`Username: ${userConfig.username}`);
    console.log(`Email: ${userConfig.email}`);
    console.log(`Auth0 ID: ${userConfig.auth0Id}`);
    console.log(`Tecs: ${userConfig.tecs?.length || 0}`);
    console.log(`Pacs: ${userConfig.pacs?.length || 0}`);
    console.log(`Last Login: ${userConfig.lastLogin}`);
    console.log(`Token Status: ${tokenStatus}`);
  } catch (error) {
    console.error('Profile error:', error.message);
  }
}
