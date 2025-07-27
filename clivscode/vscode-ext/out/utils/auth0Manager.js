"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Auth0Manager = void 0;
const axios_1 = __importDefault(require("axios"));
const logger_1 = require("./logger");
const config_1 = require("./config");
const errorHandler_1 = require("./errorHandler");
class Auth0Manager {
    setContext(context) {
        this.context = context;
        // Load saved user config on initialization
        this.loadUserConfig().catch(error => {
            logger_1.Logger.error('Failed to load user config during initialization', error);
        });
    }
    async loadUserConfig() {
        try {
            if (!this.context)
                return;
            const savedConfig = this.context.globalState.get('userConfig');
            if (savedConfig) {
                this.userConfig = savedConfig;
                logger_1.Logger.debug('Loaded saved user configuration');
            }
        }
        catch (error) {
            logger_1.Logger.error('Failed to load user configuration', error);
        }
    }
    async saveUserConfig() {
        try {
            if (!this.context || !this.userConfig)
                return;
            await this.context.globalState.update('userConfig', this.userConfig);
            logger_1.Logger.debug('Saved user configuration');
        }
        catch (error) {
            logger_1.Logger.error('Failed to save user configuration', error);
        }
    }
    async clearUserConfig() {
        try {
            if (!this.context)
                return;
            await this.context.globalState.update('userConfig', undefined);
            logger_1.Logger.debug('Cleared user configuration');
        }
        catch (error) {
            logger_1.Logger.error('Failed to clear user configuration', error);
        }
    }
    constructor() {
        this.userConfig = null;
        this.currentAuthCode = null;
        this.context = null;
        logger_1.Logger.debug('Auth0Manager initialized');
    }
    getCurrentAuthCode() {
        return this.currentAuthCode;
    }
    async login() {
        try {
            logger_1.Logger.info('Starting Auth0 device flow login...');
            const config = (0, config_1.getConfig)();
            const auth0Config = config.getAuth0Config();
            // Step 1: Get device authorization
            const deviceAuthResponse = await axios_1.default.post(`https://${auth0Config.domain}/oauth/device/code`, {
                client_id: auth0Config.clientId,
                audience: auth0Config.audience,
                scope: 'openid profile email'
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const { device_code, user_code, verification_uri, expires_in, interval } = deviceAuthResponse.data;
            // Store the current auth code
            this.currentAuthCode = user_code;
            // Show user the verification code prominently
            const message = `Please visit ${verification_uri} and enter code: ${user_code}`;
            logger_1.Logger.info(message);
            // Show the code in a more prominent way
            const vscode = await Promise.resolve().then(() => __importStar(require('vscode')));
            // Show it in the status bar for easy reference
            const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
            statusBarItem.text = `$(key) Code: ${user_code}`;
            statusBarItem.tooltip = `Click to copy code: ${user_code}`;
            statusBarItem.command = 'tecspacs.copyCode';
            statusBarItem.show();
            // Auto-hide status bar item after expiration
            setTimeout(() => {
                statusBarItem.dispose();
                this.currentAuthCode = null; // Clear the stored code
            }, expires_in * 1000);
            // Show the main authentication notification with improved UX
            const action = await vscode.window.showInformationMessage(`🔐 Authentication Code: ${user_code}\n\nPlease visit ${verification_uri} and enter the code above.\n\nThis code will expire in ${Math.floor(expires_in / 60)} minutes.`, 'Copy Code & Open Browser', 'Copy Code Only', 'Open Browser Only');
            if (action === 'Copy Code & Open Browser') {
                // Do both actions: copy code and open browser
                await vscode.env.clipboard.writeText(user_code);
                const open = await Promise.resolve().then(() => __importStar(require('open')));
                open.default(verification_uri);
                // Show confirmation
                vscode.window.showInformationMessage(`✅ Code copied and browser opened! Paste the code on the Auth0 page.\n\nYou can return to VS Code - authentication will complete automatically.`);
            }
            else if (action === 'Copy Code Only') {
                // Just copy the code
                await vscode.env.clipboard.writeText(user_code);
                vscode.window.showInformationMessage(`✅ Code "${user_code}" copied to clipboard!`);
                // Wait a moment, then show the browser option again
                setTimeout(async () => {
                    const openBrowser = await vscode.window.showInformationMessage(`🔐 Ready to authenticate? Visit ${verification_uri} to continue.`, 'Open Browser');
                    if (openBrowser === 'Open Browser') {
                        const open = await Promise.resolve().then(() => __importStar(require('open')));
                        open.default(verification_uri);
                    }
                }, 1000);
            }
            else if (action === 'Open Browser Only') {
                // Just open browser
                const open = await Promise.resolve().then(() => __importStar(require('open')));
                open.default(verification_uri);
                // Show a reminder about the code
                vscode.window.showInformationMessage(`🌐 Browser opened! Don't forget to copy the code: ${user_code}\n\nYou can return to VS Code - authentication will complete automatically.`);
            }
            // Step 2: Poll for token
            const token = await this.pollForToken(device_code, interval, expires_in, auth0Config);
            // Step 3: Get user profile from Auth0
            const userProfile = await this.getUserProfile(token.access_token);
            // Step 4: Create/Get user profile from backend API
            const backendUserProfile = await this.createBackendUserProfile(token.access_token, userProfile);
            // Step 5: Save user config
            this.userConfig = {
                token: token,
                auth0Id: userProfile.sub,
                email: userProfile.email,
                username: userProfile.name || userProfile.email,
                tecs: backendUserProfile.tecs || [],
                pacs: backendUserProfile.pacs || [],
                lastLogin: new Date().toISOString()
            };
            // Save to persistent storage
            await this.saveUserConfig();
            logger_1.Logger.info('Auth0 login completed successfully');
            return this.userConfig;
        }
        catch (error) {
            logger_1.Logger.error('Auth0 login failed', error);
            throw errorHandler_1.ErrorHandler.createError('AUTH_FAILED', 'Authentication failed. Please try again.');
        }
    }
    async pollForToken(deviceCode, interval, expiresIn, auth0Config) {
        const startTime = Date.now();
        const maxWaitTime = expiresIn * 1000; // Convert to milliseconds
        while (Date.now() - startTime < maxWaitTime) {
            try {
                const response = await axios_1.default.post(`https://${auth0Config.domain}/oauth/token`, {
                    grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
                    device_code: deviceCode,
                    client_id: auth0Config.clientId
                }, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                if (response.data.access_token) {
                    logger_1.Logger.info('Token received successfully');
                    return response.data;
                }
            }
            catch (error) {
                if (error.response?.data?.error === 'authorization_pending') {
                    // Still waiting for user authorization
                    logger_1.Logger.debug('Waiting for user authorization...');
                }
                else if (error.response?.data?.error === 'slow_down') {
                    // Rate limited, increase interval
                    interval = Math.min(interval * 2, 60);
                    logger_1.Logger.debug('Rate limited, increased polling interval');
                }
                else {
                    // Other error
                    throw error;
                }
            }
            // Wait before next poll
            await new Promise(resolve => setTimeout(resolve, interval * 1000));
        }
        throw errorHandler_1.ErrorHandler.createError('AUTH_TIMEOUT', 'Authentication timed out. Please try again.');
    }
    async getUserProfile(accessToken) {
        try {
            const config = (0, config_1.getConfig)();
            const auth0Config = config.getAuth0Config();
            const response = await axios_1.default.get(`https://${auth0Config.domain}/userinfo`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            return response.data;
        }
        catch (error) {
            logger_1.Logger.error('Failed to get user profile', error);
            throw errorHandler_1.ErrorHandler.createError('PROFILE_FETCH_FAILED', 'Failed to fetch user profile.');
        }
    }
    async createBackendUserProfile(accessToken, auth0Profile) {
        try {
            const config = (0, config_1.getConfig)();
            const apiConfig = config.getApiConfig();
            logger_1.Logger.debug('Creating/Getting user profile from backend API...');
            const response = await axios_1.default.get(`${apiConfig.baseUrl}/api/users/me`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            logger_1.Logger.info('Backend user profile created/retrieved successfully');
            return response.data;
        }
        catch (error) {
            logger_1.Logger.error('Failed to create/get backend user profile', error);
            throw errorHandler_1.ErrorHandler.createError('BACKEND_PROFILE_FAILED', 'Failed to create user profile on backend.');
        }
    }
    async logout() {
        try {
            logger_1.Logger.info('Logging out...');
            this.userConfig = null;
            await this.clearUserConfig();
            logger_1.Logger.info('Logout completed');
        }
        catch (error) {
            logger_1.Logger.error('Logout failed', error);
            throw error;
        }
    }
    async getUserConfig() {
        return this.userConfig;
    }
    async getBackendUserProfile() {
        try {
            if (!this.userConfig || !this.userConfig.token) {
                return null;
            }
            const config = (0, config_1.getConfig)();
            const apiConfig = config.getApiConfig();
            const response = await axios_1.default.get(`${apiConfig.baseUrl}/api/users/me`, {
                headers: {
                    'Authorization': `Bearer ${this.userConfig.token.access_token}`
                }
            });
            return response.data;
        }
        catch (error) {
            logger_1.Logger.error('Failed to get backend user profile', error);
            return null;
        }
    }
    async isAuthenticated() {
        try {
            if (!this.userConfig || !this.userConfig.token) {
                return false;
            }
            // Check if token is expired
            const token = this.userConfig.token;
            if (token.expires_in && token.expires_at) {
                const now = Date.now();
                if (now >= token.expires_at) {
                    logger_1.Logger.debug('Token expired, clearing user config');
                    this.userConfig = null;
                    return false;
                }
            }
            return true;
        }
        catch (error) {
            logger_1.Logger.error('Error checking authentication', error);
            return false;
        }
    }
    async getToken() {
        try {
            const config = await this.getUserConfig();
            return config?.token?.access_token || null;
        }
        catch (error) {
            logger_1.Logger.error('Error getting token', error);
            return null;
        }
    }
    async refreshTokenIfNeeded() {
        // TODO: Implement token refresh logic
        // For now, we'll just check if token is valid
        const isValid = await this.isAuthenticated();
        if (!isValid) {
            throw errorHandler_1.ErrorHandler.createError('AUTH_REQUIRED', 'Authentication required. Please login again.');
        }
    }
}
exports.Auth0Manager = Auth0Manager;
//# sourceMappingURL=auth0Manager.js.map