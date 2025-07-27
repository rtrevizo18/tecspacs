import axios from 'axios';
import { getUserConfig } from '../util/config.js';
import { StorageManager } from '../util/storage-manager.js';
import { ErrorHandler } from '../util/error-handler.js';
import { isTokenExpired, refreshToken } from '../util/auth0-device-flow.js';
import { FileManager } from '../util/file-manager.js';

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

    console.log(tecs);

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

export async function deleteTecAction(id, options = {}) {
  try {
    // Validate input
    if (!id || id.trim() === '') {
      throw new Error('TEC ID is required');
    }

    // Get user auth token
    const userConfig = await getUserConfig();
    if (!userConfig || !userConfig.token || !userConfig.token.access_token) {
      console.log(
        'You must be logged in to delete tecs. Use "tecspacs login" first.'
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

        // Update token in user config
        userConfig.token = newTokenData;
        await saveUserConfig(userConfig);
      } catch (refreshError) {
        console.error('❌ Failed to refresh token. Please login again.');
        return;
      }
    }

    console.log(`\nDeleting TEC with ID "${id}" from your account...`);

    // Send delete request to the backend
    const response = await apiClient.delete(`/api/tecs/${id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    console.log('\nTEC deleted successfully!');
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      console.error(
        '❌ Authentication failed. Please login again using "tecspacs login"'
      );
    } else if (error.response?.status === 404) {
      console.error(`❌ Error: TEC with ID "${id}" not found`);
    } else if (error.response?.status === 400) {
      console.error(`❌ Error: Invalid TEC ID format "${id}"`);
    } else if (error.response?.data?.message) {
      console.error(`❌ Server error: ${error.response.data.message}`);
    } else {
      ErrorHandler.handle(error, 'Delete TEC');
    }
  }
}

export async function improveTecAction(id, options = {}) {
  try {
    // Validate input
    if (!id || id.trim() === '') {
      throw new Error('TEC ID is required');
    }

    // Get user auth token
    const userConfig = await getUserConfig();
    if (!userConfig || !userConfig.token || !userConfig.token.access_token) {
      console.log(
        'You must be logged in to improve tecs. Use "tecspacs login" first.'
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

        // Update token in user config
        userConfig.token = newTokenData;
        await saveUserConfig(userConfig);
      } catch (refreshError) {
        console.error('❌ Failed to refresh token. Please login again.');
        return;
      }
    }

    console.log(`\n🧠 Generating AI improvements for TEC with ID "${id}"...`);
    console.log(`This may take a few moments...`);

    // Call the improve endpoint
    const response = await apiClient.post(
      `/api/tecs/${id}/improve`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const { improvements, tecTitle } = response.data;

    console.log(`\n✨ AI Improvements for "${tecTitle}":`);
    console.log(`\n${improvements}`);

    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      console.error(
        '❌ Authentication failed. Please login again using "tecspacs login"'
      );
    } else if (error.response?.status === 404) {
      console.error(`❌ Error: TEC with ID "${id}" not found`);
    } else if (error.response?.status === 400) {
      console.error(`❌ Error: Invalid TEC ID format "${id}"`);
    } else if (error.response?.data?.message) {
      console.error(`❌ Server error: ${error.response.data.message}`);
    } else {
      ErrorHandler.handle(error, 'Improve TEC');
    }
  }
}

export async function getTecByIdAction(id, options = {}) {
  try {
    // Validate input
    if (!id || id.trim() === '') {
      throw new Error('TEC ID is required');
    }

    // Get user auth token
    const userConfig = await getUserConfig();
    if (!userConfig || !userConfig.token || !userConfig.token.access_token) {
      console.log(
        'You must be logged in to view tecs. Use "tecspacs login" first.'
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

        // Update token in user config
        userConfig.token = newTokenData;
        await saveUserConfig(userConfig);
      } catch (refreshError) {
        console.error('❌ Failed to refresh token. Please login again.');
        return;
      }
    }

    console.log(`\nFetching TEC with ID "${id}"...`);

    // Send request to the backend
    const response = await apiClient.get(`/api/tecs/${id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const tec = response.data;

    // Display TEC details
    console.log(`\n📄 TEC: ${tec.title}`);
    console.log(`🔤 Language: ${tec.language}`);

    if (tec.description) {
      console.log(`📝 Description: ${tec.description}`);
    }

    if (tec.tags && tec.tags.length > 0) {
      console.log(`🏷️ Tags: ${tec.tags.join(', ')}`);
    }

    console.log(`\n📋 Content:\n`);
    console.log(tec.content);

    if (tec.createdAt) {
      console.log(`\n📅 Created: ${new Date(tec.createdAt).toLocaleString()}`);
    }

    if (tec.updatedAt && tec.updatedAt !== tec.createdAt) {
      console.log(`📅 Updated: ${new Date(tec.updatedAt).toLocaleString()}`);
    }

    return tec;
  } catch (error) {
    if (error.response?.status === 401) {
      console.error(
        '❌ Authentication failed. Please login again using "tecspacs login"'
      );
    } else if (error.response?.status === 404) {
      console.error(`❌ Error: TEC with ID "${id}" not found`);
    } else if (error.response?.status === 400) {
      console.error(`❌ Error: Invalid TEC ID format "${id}"`);
    } else if (error.response?.data?.message) {
      console.error(`❌ Server error: ${error.response.data.message}`);
    } else {
      ErrorHandler.handle(error, 'Get TEC');
    }
  }
}

export async function summarizeTecAction(id, options = {}) {
  try {
    // Validate input
    if (!id || id.trim() === '') {
      throw new Error('TEC ID is required');
    }

    // Get user auth token
    const userConfig = await getUserConfig();
    if (!userConfig || !userConfig.token || !userConfig.token.access_token) {
      console.log(
        'You must be logged in to summarize tecs. Use "tecspacs login" first.'
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

        // Update token in user config
        userConfig.token = newTokenData;
        await saveUserConfig(userConfig);
      } catch (refreshError) {
        console.error('❌ Failed to refresh token. Please login again.');
        return;
      }
    }

    console.log(`\n🤖 Generating AI summary for TEC with ID "${id}"...`);
    console.log(`This may take a few moments...`);

    // Call the summarize endpoint
    const response = await apiClient.post(
      `/api/tecs/${id}/summarize`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const { summary, tecTitle } = response.data;

    console.log(`\n📝 Summary for "${tecTitle}":`);
    console.log(`\n${summary}`);

    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      console.error(
        '❌ Authentication failed. Please login again using "tecspacs login"'
      );
    } else if (error.response?.status === 404) {
      console.error(`❌ Error: TEC with ID "${id}" not found`);
    } else if (error.response?.status === 400) {
      console.error(`❌ Error: Invalid TEC ID format "${id}"`);
    } else if (error.response?.data?.message) {
      console.error(`❌ Server error: ${error.response.data.message}`);
    } else {
      ErrorHandler.handle(error, 'Summarize TEC');
    }
  }
}

export async function getAllPacsAction(options = {}) {
  try {
    // Get user auth token
    const userConfig = await getUserConfig();
    if (!userConfig || !userConfig.token || !userConfig.token.access_token) {
      console.log(
        'You must be logged in to list pacs. Use "tecspacs login" first.'
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

        // Update token in user config
        userConfig.token = newTokenData;
        await saveUserConfig(userConfig);
      } catch (refreshError) {
        console.error('❌ Failed to refresh token. Please login again.');
        return;
      }
    }

    console.log('\nFetching your pacs from the server...');

    // Send to the backend
    const response = await apiClient.get('/api/pacs', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const pacs = response.data;

    if (!pacs || pacs.length === 0) {
      console.log("\nYou don't have any pacs on the server yet.");
      return [];
    }

    console.log(`\nFound ${pacs.length} pacs:`);

    // Display pacs in a formatted way
    pacs.forEach((pac, index) => {
      console.log(`\n${index + 1}. Name: ${pac.name}`);

      if (pac.description) {
        console.log(`   Description: ${pac.description}`);
      }

      if (pac.dependencies && pac.dependencies.length > 0) {
        console.log(`   Dependencies: ${pac.dependencies.join(', ')}`);
      }

      if (pac.files && pac.files.length > 0) {
        console.log(`   Files: ${pac.files.length}`);
      }

      if (pac.createdBy && pac.createdBy.username) {
        console.log(`   Created by: ${pac.createdBy.username}`);
      }

      if (pac.createdAt) {
        console.log(
          `   Created: ${new Date(pac.createdAt).toLocaleDateString()}`
        );
      }
    });

    return pacs;
  } catch (error) {
    if (error.response?.status === 401) {
      console.error(
        '❌ Authentication failed. Please login again using "tecspacs login"'
      );
    } else if (error.response?.data?.message) {
      console.error(`❌ Server error: ${error.response.data.message}`);
    } else {
      ErrorHandler.handle(error, 'Get All Pacs');
    }
    return [];
  }
}

export async function publishPacAction(name, options = {}) {
  try {
    // Validate input
    if (!name || name.trim() === '') {
      throw new Error('PAC name is required');
    }

    // Get user auth token
    const userConfig = await getUserConfig();
    if (!userConfig || !userConfig.token || !userConfig.token.access_token) {
      console.log(
        'You must be logged in to create pacs. Use "tecspacs login" first.'
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

        // Update token in user config
        userConfig.token = newTokenData;
        await saveUserConfig(userConfig);
      } catch (refreshError) {
        console.error('❌ Failed to refresh token. Please login again.');
        return;
      }
    }

    // Try to get local PAC information
    const localPac = await StorageManager.getPac(name.trim());
    if (!localPac) {
      console.log(`Local PAC "${name}" not found`);
      return;
    }

    console.log(`\nPublishing PAC "${name}" to your online account...`);

    // Process files to include content
    const processedFiles = [];
    if (localPac.files && localPac.files.length > 0) {
      for (const filePath of localPac.files) {
        try {
          const content = await FileManager.readFile(filePath);

          // Instead of creating an object with path and content properties,
          // prepend the file path to the content with a newline
          processedFiles.push(`${filePath}\n${content}`);
        } catch (fileError) {
          console.warn(`⚠️ Could not read file: ${filePath}`);
        }
      }
    }

    // Prepare the PAC data from the local PAC
    const pacData = {
      name: localPac.name,
      description: localPac.description || '',
      language: localPac.language || '',
      dependencies: localPac.dependencies || [],
      files: processedFiles,
      tag: localPac.tag || '',
    };

    // Send to the backend
    const response = await apiClient.post('/api/pacs', pacData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    console.log('\n✅ PAC published successfully!');
    console.log(`Name: ${pacData.name}`);

    if (pacData.description) {
      console.log(`Description: ${pacData.description}`);
    }

    if (pacData.language) {
      console.log(`Language: ${pacData.language}`);
    }

    if (pacData.dependencies && pacData.dependencies.length > 0) {
      console.log(`Dependencies: ${pacData.dependencies.join(', ')}`);
    }

    if (processedFiles.length > 0) {
      console.log(`Files: ${processedFiles.length} files included`);
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
      ErrorHandler.handle(error, 'Create PAC');
    }
  }
}

export async function getPacByIdAction(id, options = {}) {
  try {
    // Validate input
    if (!id || id.trim() === '') {
      throw new Error('PAC ID is required');
    }

    // Get user auth token
    const userConfig = await getUserConfig();
    if (!userConfig || !userConfig.token || !userConfig.token.access_token) {
      console.log(
        'You must be logged in to view pacs. Use "tecspacs login" first.'
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

        // Update token in user config
        userConfig.token = newTokenData;
        await saveUserConfig(userConfig);
      } catch (refreshError) {
        console.error('❌ Failed to refresh token. Please login again.');
        return;
      }
    }

    console.log(`\nFetching PAC with ID "${id}"...`);

    // Send request to the backend
    const response = await apiClient.get(`/api/pacs/${id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const pac = response.data;

    // Display PAC details
    console.log(`\n📦 PAC: ${pac.name}`);

    if (pac.description) {
      console.log(`📝 Description: ${pac.description}`);
    }

    if (pac.language) {
      console.log(`🔤 Language: ${pac.language}`);
    }

    if (pac.dependencies && pac.dependencies.length > 0) {
      console.log(`🔗 Dependencies: ${pac.dependencies.join(', ')}`);
    }

    if (pac.files && pac.files.length > 0) {
      console.log(`\n📄 Files (${pac.files.length}):`);
      pac.files.forEach((file, index) => {
        if (typeof file === 'string' && file.includes('\n')) {
          // If file is a string with the path and content format
          const filePath = file.substring(0, file.indexOf('\n'));
          console.log(`  ${index + 1}. ${filePath}`);
        } else if (file.path) {
          // If file is an object with path property
          console.log(`  ${index + 1}. ${file.path}`);
        } else {
          // Fallback
          console.log(`  ${index + 1}. File #${index + 1}`);
        }
      });
    }

    if (pac.createdBy) {
      console.log(
        `\n👤 Created by: ${pac.createdBy.username || 'Unknown user'}`
      );
    }

    if (pac.createdAt) {
      console.log(`📅 Created: ${new Date(pac.createdAt).toLocaleString()}`);
    }

    if (pac.updatedAt && pac.updatedAt !== pac.createdAt) {
      console.log(`📅 Updated: ${new Date(pac.updatedAt).toLocaleString()}`);
    }

    return pac;
  } catch (error) {
    if (error.response?.status === 401) {
      console.error(
        '❌ Authentication failed. Please login again using "tecspacs login"'
      );
    } else if (error.response?.status === 404) {
      console.error(`❌ Error: PAC with ID "${id}" not found`);
    } else if (error.response?.status === 400) {
      console.error(`❌ Error: Invalid PAC ID format "${id}"`);
    } else if (error.response?.data?.message) {
      console.error(`❌ Server error: ${error.response.data.message}`);
    } else {
      ErrorHandler.handle(error, 'Get PAC');
    }
  }
}

export async function deletePacAction(id, options = {}) {
  try {
    // Validate input
    if (!id || id.trim() === '') {
      throw new Error('PAC ID is required');
    }

    // Get user auth token
    const userConfig = await getUserConfig();
    if (!userConfig || !userConfig.token || !userConfig.token.access_token) {
      console.log(
        'You must be logged in to delete pacs. Use "tecspacs login" first.'
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

        // Update token in user config
        userConfig.token = newTokenData;
        await saveUserConfig(userConfig);
      } catch (refreshError) {
        console.error('❌ Failed to refresh token. Please login again.');
        return;
      }
    }

    console.log(`\nDeleting PAC with ID "${id}" from your account...`);

    // Send delete request to the backend
    const response = await apiClient.delete(`/api/pacs/${id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    console.log('\n✅ PAC deleted successfully!');
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      console.error(
        '❌ Authentication failed. Please login again using "tecspacs login"'
      );
    } else if (error.response?.status === 404) {
      console.error(`❌ Error: PAC with ID "${id}" not found`);
    } else if (error.response?.status === 400) {
      console.error(`❌ Error: Invalid PAC ID format "${id}"`);
    } else if (error.response?.data?.message) {
      console.error(`❌ Server error: ${error.response.data.message}`);
    } else {
      ErrorHandler.handle(error, 'Delete PAC');
    }
  }
}

export async function summarizePacAction(id, options = {}) {
  try {
    // Validate input
    if (!id || id.trim() === '') {
      throw new Error('PAC ID is required');
    }

    // Get user auth token
    const userConfig = await getUserConfig();
    if (!userConfig || !userConfig.token || !userConfig.token.access_token) {
      console.log(
        'You must be logged in to summarize pacs. Use "tecspacs login" first.'
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

        // Update token in user config
        userConfig.token = newTokenData;
        await saveUserConfig(userConfig);
      } catch (refreshError) {
        console.error('❌ Failed to refresh token. Please login again.');
        return;
      }
    }

    console.log(`\n🤖 Generating AI summary for PAC with ID "${id}"...`);
    console.log(`This may take a few moments...`);

    // Call the summarize endpoint
    const response = await apiClient.post(
      `/api/pacs/${id}/summarize`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const { summary, pacName } = response.data;

    console.log(`\n📝 Summary for package "${pacName}":`);
    console.log(`\n${summary}`);

    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      console.error(
        '❌ Authentication failed. Please login again using "tecspacs login"'
      );
    } else if (error.response?.status === 404) {
      console.error(`❌ Error: PAC with ID "${id}" not found`);
    } else if (error.response?.status === 400) {
      console.error(`❌ Error: Invalid PAC ID format "${id}"`);
    } else if (error.response?.data?.message) {
      console.error(`❌ Server error: ${error.response.data.message}`);
    } else {
      ErrorHandler.handle(error, 'Summarize PAC');
    }
  }
}

export async function searchTecsAction(searchTerm, options = {}) {
  try {
    // Get user auth token
    const userConfig = await getUserConfig();
    if (!userConfig || !userConfig.token || !userConfig.token.access_token) {
      console.log(
        'You must be logged in to search tecs. Use "tecspacs login" first.'
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

        // Update token in user config
        userConfig.token = newTokenData;
        await saveUserConfig(userConfig);
      } catch (refreshError) {
        console.error('❌ Failed to refresh token. Please login again.');
        return;
      }
    }

    console.log(`\nSearching for tecs matching "${searchTerm}"...`);

    // Send to the backend - fetch all tecs since we'll filter on client side
    const response = await apiClient.get('/api/tecs', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const allTecs = response.data;

    if (!allTecs || allTecs.length === 0) {
      console.log('\nNo tecs found on the server.');
      return [];
    }

    // Convert searchTerm to regex pattern for wildcard support
    // Escape special regex characters but convert * to .*
    const regexPattern = searchTerm
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // Escape special characters
      .replace(/\\\*/g, '.*'); // Convert * back to .* for wildcard matching

    const searchRegex = new RegExp(regexPattern, 'i'); // Case-insensitive

    // Filter and rank results
    const matchedTecs = allTecs.filter(tec => {
      // Search in title
      if (searchRegex.test(tec.title)) {
        return true;
      }

      // Search in description if available
      if (tec.description && searchRegex.test(tec.description)) {
        return true;
      }

      // Search in tags if available
      if (
        tec.tags &&
        tec.tags.length > 0 &&
        tec.tags.some(tag => searchRegex.test(tag))
      ) {
        return true;
      }

      return false;
    });

    // Sort by relevance (exact title match first, then title contains, then description)
    matchedTecs.sort((a, b) => {
      // Exact title match has highest priority
      if (a.title.toLowerCase() === searchTerm.toLowerCase()) return -1;
      if (b.title.toLowerCase() === searchTerm.toLowerCase()) return 1;

      // Title contains search term has second priority
      const aContainsInTitle = a.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const bContainsInTitle = b.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      if (aContainsInTitle && !bContainsInTitle) return -1;
      if (!aContainsInTitle && bContainsInTitle) return 1;

      return 0;
    });

    // Limit to top 20 results
    const limitedResults = matchedTecs.slice(0, 20);

    if (limitedResults.length === 0) {
      console.log(`\nNo matches found for "${searchTerm}".`);
      return [];
    }

    console.log(`\nFound ${limitedResults.length} matches (showing top 20):`);

    // Display tecs in a formatted way
    limitedResults.forEach((tec, index) => {
      console.log(`\n${index + 1}. Name: ${tec.title}`);
      console.log(`   Language: ${tec.language}`);

      if (tec.description) {
        console.log(`   Description: ${tec.description}`);
      }

      if (tec.tags && tec.tags.length > 0) {
        console.log(`   Tags: ${tec.tags.join(', ')}`);
      }
    });

    return limitedResults;
  } catch (error) {
    if (error.response?.status === 401) {
      console.error(
        '❌ Authentication failed. Please login again using "tecspacs login"'
      );
    } else if (error.response?.data?.message) {
      console.error(`❌ Server error: ${error.response.data.message}`);
    } else {
      ErrorHandler.handle(error, 'Search Snippets');
    }
    return [];
  }
}

export async function searchPacsAction(searchTerm, options = {}) {
  try {
    // Get user auth token
    const userConfig = await getUserConfig();
    if (!userConfig || !userConfig.token || !userConfig.token.access_token) {
      console.log(
        'You must be logged in to search pacs. Use "tecspacs login" first.'
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

        // Update token in user config
        userConfig.token = newTokenData;
        await saveUserConfig(userConfig);
      } catch (refreshError) {
        console.error('❌ Failed to refresh token. Please login again.');
        return;
      }
    }

    console.log(`\nSearching for packages matching "${searchTerm}"...`);

    // Send to the backend - fetch all pacs since we'll filter on client side
    const response = await apiClient.get('/api/pacs', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const allPacs = response.data;

    if (!allPacs || allPacs.length === 0) {
      console.log('\nNo packages found on the server.');
      return [];
    }

    // Convert searchTerm to regex pattern for wildcard support
    // Escape special regex characters but convert * to .*
    const regexPattern = searchTerm
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // Escape special characters
      .replace(/\\\*/g, '.*'); // Convert * back to .* for wildcard matching

    const searchRegex = new RegExp(regexPattern, 'i'); // Case-insensitive

    // Filter and rank results
    const matchedPacs = allPacs.filter(pac => {
      // Search in name
      if (searchRegex.test(pac.name)) {
        return true;
      }

      // Search in description if available
      if (pac.description && searchRegex.test(pac.description)) {
        return true;
      }

      // Search in dependencies if available
      if (
        pac.dependencies &&
        pac.dependencies.length > 0 &&
        pac.dependencies.some(dep => searchRegex.test(dep))
      ) {
        return true;
      }

      // Search in tag if available
      if (pac.tag && searchRegex.test(pac.tag)) {
        return true;
      }

      return false;
    });

    // Sort by relevance (exact name match first, then name contains, then description)
    matchedPacs.sort((a, b) => {
      // Exact name match has highest priority
      if (a.name.toLowerCase() === searchTerm.toLowerCase()) return -1;
      if (b.name.toLowerCase() === searchTerm.toLowerCase()) return 1;

      // Name contains search term has second priority
      const aContainsInName = a.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const bContainsInName = b.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      if (aContainsInName && !bContainsInName) return -1;
      if (!aContainsInName && bContainsInName) return 1;

      return 0;
    });

    // Get limit from options or default to 20
    const limit = parseInt(options.limit || '20', 10);
    const limitedResults = matchedPacs.slice(0, limit);

    if (limitedResults.length === 0) {
      console.log(`\nNo matches found for "${searchTerm}".`);
      return [];
    }

    console.log(
      `\nFound ${limitedResults.length} matches (showing top ${limit}):`
    );

    // Display pacs in a formatted way
    limitedResults.forEach((pac, index) => {
      console.log(`\n${index + 1}. Name: ${pac.name}`);

      if (pac.description) {
        console.log(`   Description: ${pac.description}`);
      }

      if (pac.language) {
        console.log(`   Language: ${pac.language}`);
      }

      if (pac.dependencies && pac.dependencies.length > 0) {
        console.log(`   Dependencies: ${pac.dependencies.join(', ')}`);
      }

      if (pac.files && pac.files.length > 0) {
        console.log(`   Files: ${pac.files.length}`);
      }

      if (pac.tag) {
        console.log(`   Tag: ${pac.tag}`);
      }

      if (pac.createdBy && pac.createdBy.username) {
        console.log(`   Created by: ${pac.createdBy.username}`);
      }
    });

    return limitedResults;
  } catch (error) {
    if (error.response?.status === 401) {
      console.error(
        '❌ Authentication failed. Please login again using "tecspacs login"'
      );
    } else if (error.response?.data?.message) {
      console.error(`❌ Server error: ${error.response.data.message}`);
    } else {
      ErrorHandler.handle(error, 'Search Packages');
    }
    return [];
  }
}
