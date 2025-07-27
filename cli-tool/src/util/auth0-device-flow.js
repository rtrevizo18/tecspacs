import axios from 'axios';
import open from 'open';
import { jwtDecode } from 'jwt-decode';
import { configDotenv } from 'dotenv';

configDotenv({ quiet: true });

const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID;
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE;

const options = {
  method: 'POST',
  url: `https://${AUTH0_DOMAIN}/oauth/device/code`,
  headers: { 'content-type': 'application/x-www-form-urlencoded' },
  data: {
    client_id: AUTH0_CLIENT_ID,
    scope: encodeURIComponent('openid profile email'),
    audience: AUTH0_AUDIENCE,
  },
};

export async function getTokenViaDeviceFlow() {
  try {
    const deviceResponse = await axios.request(options);

    const {
      device_code,
      user_code,
      verification_uri,
      verification_uri_complete,
      expires_in,
      interval,
    } = deviceResponse.data;

    console.log('\n🔐 Authentication Required');
    console.log(`\nPlease visit: ${verification_uri_complete}`);
    console.log(`Or go to: ${verification_uri} and enter code: ${user_code}`);
    console.log('\nOpening browser...\n');

    // Open browser automatically
    await open(verification_uri_complete);

    // Step 2: Poll for token
    return await pollForToken(device_code, interval, expires_in);
  } catch (error) {
    throw new Error(`Device flow failed: ${error.message}`);
  }
}

async function pollForToken(deviceCode, interval, expiresIn) {
  const maxAttempts = Math.floor(expiresIn / interval);

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      await new Promise(resolve => setTimeout(resolve, interval * 1000));

      const tokenResponse = await axios.post(
        `https://${AUTH0_DOMAIN}/oauth/token`,
        {
          grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
          device_code: deviceCode,
          client_id: AUTH0_CLIENT_ID,
        }
      );

      return tokenResponse.data;
    } catch (error) {
      if (error.response?.data?.error === 'authorization_pending') {
        process.stdout.write('.');
        continue;
      } else if (error.response?.data?.error === 'slow_down') {
        await new Promise(resolve => setTimeout(resolve, 5000));
        continue;
      } else {
        throw new Error(`Token polling failed: ${error.message}`);
      }
    }
  }

  throw new Error('Authentication timed out');
}

// New function to check if a token is expired
export function isTokenExpired(token) {
  try {
    if (!token) return true;

    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    // Add a buffer of 60 seconds to account for time differences
    return decoded.exp < currentTime + 60;
  } catch (error) {
    // If we can't decode the token, consider it expired
    return true;
  }
}

// New function to refresh an access token using a refresh token
export async function refreshToken(refreshToken) {
  try {
    const response = await axios.post(
      `https://${AUTH0_DOMAIN}/oauth/token`,
      {
        grant_type: 'refresh_token',
        client_id: AUTH0_CLIENT_ID,
        refresh_token: refreshToken,
      },
      {
        headers: {
          'content-type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    throw new Error(`Token refresh failed: ${error.message}`);
  }
}
