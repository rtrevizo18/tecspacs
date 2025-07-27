import axios from 'axios';
import { getUserConfig } from '../util/config.js';
import { StorageManager } from '../util/storage-manager.js';
import { ErrorHandler } from '../util/error-handler.js';
import { isTokenExpired, refreshToken } from '../util/auth0-device-flow.js';

const API_URL = process.env.API_BASE_URL;

// Configure axios defaults
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'content-type': 'application/json',
  },
});

export async function getAllTecsAction(options = {}) {
  try {
    // Get user auth token
    const userConfig = await getUserConfig();
    if (!userConfig || !userConfig.token || !userConfig.token.access_token) {
      console.log(
        'You must be logged in to list tecs. Use "tecspacs login" first.'
      );
      return;
    }

    // Check if token is expired and try to refresh if needed
    let accessToken = userConfig.token.access_token;
    if (isTokenExpired(accessToken) && userConfig.token.refresh_token) {
      try {
        console.log('Token expired, refreshing...');
        const newTokenData = await refreshToken(userConfig.token.refresh_token);
        accessToken = newTokenData.access_token;

        // Update token in user config (would need to save this in a real implementation)
        userConfig.token = newTokenData;
        await saveUserConfig(userConfig);
      } catch (refreshError) {
        console.error('❌ Failed to refresh token. Please login again.');
        return;
      }
    }

    console.log('\nFetching your tecs from the server...');

    // Send to the backend
    const response = await apiClient.get('/api/tecs', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const tecs = response.data;

    if (!tecs || tecs.length === 0) {
      console.log("\nYou don't have any tecs on the server yet.");
      return [];
    }

    console.log(`\nFound ${tecs.length} tecs:`);

    // Display tecs in a formatted way
    tecs.forEach((tec, index) => {
      console.log(`\n${index + 1}. Name: ${tec.title}`);
      console.log(`   Language: ${tec.language}`);

      if (tec.description) {
        console.log(`   Description: ${tec.description}`);
      }

      if (tec.tags && tec.tags.length > 0) {
        console.log(`   Tags: ${tec.tags.join(', ')}`);
      }
    });

    return tecs;
  } catch (error) {
    if (error.response?.status === 401) {
      console.error(
        '❌ Authentication failed. Please login again using "tecspacs login"'
      );
    } else if (error.response?.data?.message) {
      console.error(`❌ Server error: ${error.response.data.message}`);
    } else {
      ErrorHandler.handle(error, 'Get All Snippets');
    }
    return [];
  }
}

export async function publishTecAction(name, options = {}) {
  try {
    // Validate input
    if (!name || name.trim() === '') {
      throw new Error('Snippet name is required');
    }

    // Get user auth token
    const userConfig = await getUserConfig();
    if (!userConfig || !userConfig.token || !userConfig.token.access_token) {
      console.log(
        'You must be logged in to publish tecs. Use "tecspacs login" first.'
      );
      return;
    }

    const tec = await StorageManager.getTec(name.trim());
    if (!tec) {
      console.log(`Local snippet "${name}" not found`);
      return;
    }

    console.log(`\nPublishing "${name}" to your online account...`);

    const tecData = {
      title: tec.name,
      description: tec.description || '',
      language: tec.language,
      content: tec.content,
      tags: options.tags ? options.tags.split(',').map(tag => tag.trim()) : [],
    };

    // Send to the backend
    const response = await apiClient.post('/api/tecs', tecData, {
      headers: {
        Authorization: `Bearer ${userConfig.token.access_token}`,
      },
    });

    console.log('\nSnippet published successfully!');
    console.log(`Title: ${tecData.title}`);
    console.log(`Language: ${tecData.language}`);

    if (tecData.description) {
      console.log(`Description: ${tecData.description}`);
    }

    if (tecData.tags && tecData.tags.length > 0) {
      console.log(`Tags: ${tecData.tags.join(', ')}`);
    }

    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      console.error(
        '❌ Authentication failed. Please login again using "tecspacs login"'
      );
    } else if (error.response?.data?.message) {
      console.error(`❌ Server error: ${error.response.data.message}`);
    } else {
      ErrorHandler.handle(error, 'Publish Snippet');
    }
  }
}
