"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiClient = void 0;
const axios_1 = __importDefault(require("axios"));
const logger_1 = require("./logger");
const config_1 = require("./config");
const errorHandler_1 = require("./errorHandler");
class ApiClient {
    constructor(authManager) {
        this.authManager = authManager;
        const config = (0, config_1.getConfig)();
        const apiConfig = config.getApiConfig();
        this.client = axios_1.default.create({
            baseURL: apiConfig.baseUrl,
            timeout: 30000, // 30 seconds
            headers: {
                'Content-Type': 'application/json'
            }
        });
        // Add request interceptor to include auth token
        this.client.interceptors.request.use(async (config) => {
            try {
                const token = await this.authManager.getToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            }
            catch (error) {
                logger_1.Logger.warn('Failed to get auth token for request');
            }
            return config;
        }, (error) => {
            return Promise.reject(error);
        });
        // Add response interceptor for error handling
        this.client.interceptors.response.use((response) => response, async (error) => {
            if (error.response?.status === 401) {
                logger_1.Logger.warn('Unauthorized request, clearing auth');
                await this.authManager.logout();
            }
            return Promise.reject(error);
        });
        logger_1.Logger.debug('ApiClient initialized');
    }
    // Snippet API methods (using /api/tecs endpoints)
    async getAllSnippets() {
        try {
            logger_1.Logger.debug('Fetching all snippets from API...');
            const response = await this.client.get('/api/tecs');
            logger_1.Logger.info(`Fetched ${response.data.length} snippets from API`);
            // Debug: Log the first snippet to see the structure
            if (response.data.length > 0) {
                logger_1.Logger.debug(`First snippet structure: ${JSON.stringify(response.data[0])}`);
            }
            // Return the raw backend data to preserve all fields including createdBy
            return response.data;
        }
        catch (error) {
            logger_1.Logger.error('Failed to fetch snippets from API', error);
            throw errorHandler_1.ErrorHandler.createError('API_ERROR', 'Failed to fetch snippets from server.');
        }
    }
    async getSnippet(id) {
        try {
            logger_1.Logger.debug(`Fetching snippet with ID "${id}" from API...`);
            const response = await this.client.get(`/api/tecs/${id}`);
            logger_1.Logger.info(`Fetched snippet with ID "${id}" from API`);
            // Map backend fields to extension fields
            const backendSnippet = response.data;
            const mappedSnippet = {
                id: backendSnippet._id || backendSnippet.id || '',
                name: backendSnippet.title || backendSnippet.name || 'Untitled',
                content: backendSnippet.content || '',
                language: backendSnippet.language || 'text',
                description: backendSnippet.description || '',
                usage_count: backendSnippet.usage_count || 0,
                file_path: backendSnippet.file_path || '',
                created_at: backendSnippet.created_at || backendSnippet.createdAt || '',
                updated_at: backendSnippet.updated_at || backendSnippet.updatedAt || ''
            };
            return mappedSnippet;
        }
        catch (error) {
            if (error.response?.status === 404) {
                logger_1.Logger.debug(`Snippet with ID "${id}" not found in API`);
                return null;
            }
            logger_1.Logger.error(`Failed to fetch snippet with ID "${id}" from API`, error);
            throw errorHandler_1.ErrorHandler.createError('API_ERROR', `Failed to fetch snippet with ID "${id}" from server.`);
        }
    }
    async createSnippet(options) {
        try {
            logger_1.Logger.debug(`Creating snippet "${options.name}" via API...`);
            // Map extension fields to backend API fields
            const backendPayload = {
                title: options.name,
                content: options.content,
                language: options.language,
                description: options.description || options.name, // Use name as description if not provided
                tags: '' // Backend expects tags field, send empty string if not provided
            };
            logger_1.Logger.debug(`Making POST request to: ${this.client.defaults.baseURL}/api/tecs`);
            logger_1.Logger.debug(`Request payload: ${JSON.stringify(backendPayload)}`);
            const response = await this.client.post('/api/tecs', backendPayload);
            logger_1.Logger.info(`Created snippet "${options.name}" via API`);
            return response.data;
        }
        catch (error) {
            if (error.response?.status === 409) {
                throw errorHandler_1.ErrorHandler.createError('SNIPPET_ALREADY_EXISTS', `Snippet "${options.name}" already exists.`);
            }
            logger_1.Logger.error(`Failed to create snippet "${options.name}" via API`, error);
            logger_1.Logger.error(`Request URL was: ${this.client.defaults.baseURL}/api/tecs`);
            logger_1.Logger.error(`Response status: ${error.response?.status}`);
            logger_1.Logger.error(`Response data: ${JSON.stringify(error.response?.data)}`);
            throw errorHandler_1.ErrorHandler.createError('API_ERROR', `Failed to create snippet "${options.name}" on server.`);
        }
    }
    async updateSnippet(name, updates) {
        try {
            logger_1.Logger.debug(`Updating snippet "${name}" via API...`);
            // Map extension fields to backend API fields
            const backendUpdates = {};
            if (updates.name)
                backendUpdates.title = updates.name;
            if (updates.content)
                backendUpdates.content = updates.content;
            if (updates.language)
                backendUpdates.language = updates.language;
            if (updates.description)
                backendUpdates.description = updates.description;
            const response = await this.client.patch(`/api/tecs/${name}`, backendUpdates);
            logger_1.Logger.info(`Updated snippet "${name}" via API`);
            return response.data;
        }
        catch (error) {
            if (error.response?.status === 404) {
                throw errorHandler_1.ErrorHandler.createError('SNIPPET_NOT_FOUND', `Snippet "${name}" not found.`);
            }
            logger_1.Logger.error(`Failed to update snippet "${name}" via API`, error);
            throw errorHandler_1.ErrorHandler.createError('API_ERROR', `Failed to update snippet "${name}" on server.`);
        }
    }
    async deleteSnippet(name) {
        try {
            logger_1.Logger.debug(`Deleting snippet "${name}" via API...`);
            await this.client.delete(`/api/tecs/${name}`);
            logger_1.Logger.info(`Deleted snippet "${name}" via API`);
        }
        catch (error) {
            if (error.response?.status === 404) {
                throw errorHandler_1.ErrorHandler.createError('SNIPPET_NOT_FOUND', `Snippet "${name}" not found.`);
            }
            logger_1.Logger.error(`Failed to delete snippet "${name}" via API`, error);
            throw errorHandler_1.ErrorHandler.createError('API_ERROR', `Failed to delete snippet "${name}" on server.`);
        }
    }
    // Package API methods (using /api/pacs endpoints)
    async getAllPackages() {
        try {
            logger_1.Logger.debug('Fetching all packages from API...');
            const response = await this.client.get('/api/pacs');
            logger_1.Logger.info(`Fetched ${response.data.length} packages from API`);
            // Debug: Log the first package to see the structure
            if (response.data.length > 0) {
                logger_1.Logger.debug(`First package structure: ${JSON.stringify(response.data[0])}`);
            }
            // Return the raw backend data to preserve all fields including createdBy
            return response.data;
        }
        catch (error) {
            logger_1.Logger.error('Failed to fetch packages from API', error);
            throw errorHandler_1.ErrorHandler.createError('API_ERROR', 'Failed to fetch packages from server.');
        }
    }
    async getPackage(id) {
        try {
            logger_1.Logger.debug(`Fetching package with ID "${id}" from API...`);
            const response = await this.client.get(`/api/pacs/${id}`);
            logger_1.Logger.info(`Fetched package with ID "${id}" from API`);
            // Map backend fields to extension fields
            const backendPackage = response.data;
            const mappedPackage = {
                id: backendPackage._id || backendPackage.id || '',
                name: backendPackage.name || 'Untitled',
                description: backendPackage.description || '',
                dependencies: backendPackage.dependencies || '',
                files: backendPackage.files || '',
                created_at: backendPackage.created_at || backendPackage.createdAt || '',
                updated_at: backendPackage.updated_at || backendPackage.updatedAt || ''
            };
            return mappedPackage;
        }
        catch (error) {
            if (error.response?.status === 404) {
                logger_1.Logger.debug(`Package with ID "${id}" not found in API`);
                return null;
            }
            logger_1.Logger.error(`Failed to fetch package with ID "${id}" from API`, error);
            throw errorHandler_1.ErrorHandler.createError('API_ERROR', `Failed to fetch package with ID "${id}" from server.`);
        }
    }
    async createPackage(options) {
        try {
            logger_1.Logger.debug(`Creating package "${options.name}" via API...`);
            // Map extension fields to backend API fields
            const backendPayload = {
                name: options.name,
                description: options.description,
                dependencies: options.dependencies || '',
                files: options.files || ''
            };
            logger_1.Logger.debug(`Making POST request to: ${this.client.defaults.baseURL}/api/pacs`);
            logger_1.Logger.debug(`Request payload: ${JSON.stringify(backendPayload)}`);
            const response = await this.client.post('/api/pacs', backendPayload);
            logger_1.Logger.info(`Created package "${options.name}" via API`);
            return response.data;
        }
        catch (error) {
            if (error.response?.status === 409) {
                throw errorHandler_1.ErrorHandler.createError('PACKAGE_ALREADY_EXISTS', `Package "${options.name}" already exists.`);
            }
            logger_1.Logger.error(`Failed to create package "${options.name}" via API`, error);
            throw errorHandler_1.ErrorHandler.createError('API_ERROR', `Failed to create package "${options.name}" on server.`);
        }
    }
    async deletePackage(name) {
        try {
            logger_1.Logger.debug(`Deleting package "${name}" via API...`);
            await this.client.delete(`/api/pacs/${name}`);
            logger_1.Logger.info(`Deleted package "${name}" via API`);
        }
        catch (error) {
            if (error.response?.status === 404) {
                throw errorHandler_1.ErrorHandler.createError('PACKAGE_NOT_FOUND', `Package "${name}" not found.`);
            }
            logger_1.Logger.error(`Failed to delete package "${name}" via API`, error);
            throw errorHandler_1.ErrorHandler.createError('API_ERROR', `Failed to delete package "${name}" on server.`);
        }
    }
    // User profile API methods
    async getUserProfile() {
        try {
            logger_1.Logger.debug('Fetching user profile from API...');
            const response = await this.client.get('/api/users/me');
            logger_1.Logger.info('Fetched user profile from API');
            return response.data;
        }
        catch (error) {
            logger_1.Logger.error('Failed to fetch user profile from API', error);
            throw errorHandler_1.ErrorHandler.createError('API_ERROR', 'Failed to fetch user profile from server.');
        }
    }
}
exports.ApiClient = ApiClient;
//# sourceMappingURL=apiClient.js.map