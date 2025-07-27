import fs from 'fs/promises';
import path from 'path';
import envPaths from 'env-paths';

const paths = envPaths('tecspacs', { suffix: '' });

// Ensure config directory exists
async function ensureConfigDir() {
  try {
    await fs.mkdir(paths.config, { recursive: true });
  } catch (error) {
    // Directory might already exist
  }
}

const configFile = path.join(paths.config, 'user.json');

export async function saveUserConfig(userInfo) {
  await ensureConfigDir();
  const config = {
    token: userInfo.token,
    auth0Id: userInfo.auth0Id,
    email: userInfo.email,
    username: userInfo.username, // Added username field
    name: userInfo.name,
    tecs: userInfo.tecs || [], // Added tecs field
    pacs: userInfo.pacs || [], // Added pacs field
    lastLogin: new Date().toISOString(),
  };

  await fs.writeFile(configFile, JSON.stringify(config, null, 2));
}

export async function getUserConfig() {
  try {
    const data = await fs.readFile(configFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return null;
  }
}

export async function clearUserConfig() {
  try {
    await fs.unlink(configFile);
  } catch (error) {}
}

export function getConfigPath() {
  return configFile;
}
