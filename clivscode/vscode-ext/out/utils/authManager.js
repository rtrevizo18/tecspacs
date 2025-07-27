"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthManager = void 0;
const logger_1 = require("./logger");
class AuthManager {
    constructor() {
        this.userConfig = null;
        logger_1.Logger.debug('AuthManager initialized');
    }
    async isAuthenticated() {
        try {
            logger_1.Logger.debug('Checking authentication status...');
            // Check if we have user config stored
            const config = await this.getUserConfig();
            const isAuthenticated = config !== null && config.token !== null;
            logger_1.Logger.debug(`Authentication status: ${isAuthenticated}`);
            return isAuthenticated;
        }
        catch (error) {
            logger_1.Logger.error('Error checking authentication', error);
            return false;
        }
    }
    async login() {
        try {
            logger_1.Logger.info('Starting login process...');
            // For now, simulate a login process
            // TODO: Integrate with actual CLI auth manager (Auth0 device flow)
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            // Mock successful login
            this.userConfig = {
                token: { access_token: 'mock-token' },
                auth0Id: 'mock-auth0-id',
                email: 'user@example.com',
                username: 'testuser',
                tecs: [],
                pacs: [],
                lastLogin: new Date().toISOString()
            };
            logger_1.Logger.info('Login completed successfully');
        }
        catch (error) {
            logger_1.Logger.error('Login failed', error);
            throw error;
        }
    }
    async logout() {
        try {
            logger_1.Logger.info('Logging out...');
            // TODO: Integrate with actual CLI auth manager
            this.userConfig = null;
            logger_1.Logger.info('Logout completed');
        }
        catch (error) {
            logger_1.Logger.error('Logout failed', error);
            throw error;
        }
    }
    async getUserConfig() {
        try {
            logger_1.Logger.debug('Getting user config...');
            // TODO: Integrate with actual CLI auth manager
            return this.userConfig;
        }
        catch (error) {
            logger_1.Logger.error('Error getting user config', error);
            return null;
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
}
exports.AuthManager = AuthManager;
//# sourceMappingURL=authManager.js.map