import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { Logger } from './logger';
import { getConfig } from './config';
import { Auth0Manager } from './auth0Manager';
import { ErrorHandler } from './errorHandler';
import { Snippet, Package, CreateSnippetOptions, CreatePackageOptions } from '../types';

export class ApiClient {
    private client: AxiosInstance;
    private authManager: Auth0Manager;

    constructor(authManager: Auth0Manager) {
        this.authManager = authManager;
        const config = getConfig();
        const apiConfig = config.getApiConfig();

        this.client = axios.create({
            baseURL: apiConfig.baseUrl,
            timeout: 30000, // 30 seconds
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Add request interceptor to include auth token
        this.client.interceptors.request.use(
            async (config) => {
                try {
                    const token = await this.authManager.getToken();
                    if (token) {
                        config.headers.Authorization = `Bearer ${token}`;
                    }
                } catch (error) {
                    Logger.warn('Failed to get auth token for request');
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Add response interceptor for error handling
        this.client.interceptors.response.use(
            (response) => response,
            async (error) => {
                if (error.response?.status === 401) {
                    Logger.warn('Unauthorized request, clearing auth');
                    await this.authManager.logout();
                }
                return Promise.reject(error);
            }
        );

        Logger.debug('ApiClient initialized');
    }

    // Snippet API methods (using /api/tecs endpoints)
    async getAllSnippets(): Promise<any[]> {
        try {
            Logger.debug('Fetching all snippets from API...');
            const response: AxiosResponse<any[]> = await this.client.get('/api/tecs');
            Logger.info(`Fetched ${response.data.length} snippets from API`);
            
            // Debug: Log the first snippet to see the structure
            if (response.data.length > 0) {
                Logger.debug(`First snippet structure: ${JSON.stringify(response.data[0])}`);
            }
            
            // Return the raw backend data to preserve all fields including createdBy
            return response.data;
        } catch (error) {
            Logger.error('Failed to fetch snippets from API', error as Error);
            throw ErrorHandler.createError('API_ERROR', 'Failed to fetch snippets from server.');
        }
    }

    async getSnippet(id: string): Promise<Snippet | null> {
        try {
            Logger.debug(`Fetching snippet with ID "${id}" from API...`);
            const response: AxiosResponse<any> = await this.client.get(`/api/tecs/${id}`);
            Logger.info(`Fetched snippet with ID "${id}" from API`);
            
            // Map backend fields to extension fields
            const backendSnippet = response.data;
            const mappedSnippet: Snippet = {
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
        } catch (error: any) {
            if (error.response?.status === 404) {
                Logger.debug(`Snippet with ID "${id}" not found in API`);
                return null;
            }
            Logger.error(`Failed to fetch snippet with ID "${id}" from API`, error as Error);
            throw ErrorHandler.createError('API_ERROR', `Failed to fetch snippet with ID "${id}" from server.`);
        }
    }

    async createSnippet(options: CreateSnippetOptions): Promise<Snippet> {
        try {
            Logger.debug(`Creating snippet "${options.name}" via API...`);
            
            // Map extension fields to backend API fields
            const backendPayload = {
                title: options.name,
                content: options.content,
                language: options.language,
                description: options.description || options.name, // Use name as description if not provided
                tags: '' // Backend expects tags field, send empty string if not provided
            };
            
            Logger.debug(`Making POST request to: ${this.client.defaults.baseURL}/api/tecs`);
            Logger.debug(`Request payload: ${JSON.stringify(backendPayload)}`);
            const response: AxiosResponse<Snippet> = await this.client.post('/api/tecs', backendPayload);
            Logger.info(`Created snippet "${options.name}" via API`);
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 409) {
                throw ErrorHandler.createError('SNIPPET_ALREADY_EXISTS', `Snippet "${options.name}" already exists.`);
            }
            Logger.error(`Failed to create snippet "${options.name}" via API`, error as Error);
            Logger.error(`Request URL was: ${this.client.defaults.baseURL}/api/tecs`);
            Logger.error(`Response status: ${error.response?.status}`);
            Logger.error(`Response data: ${JSON.stringify(error.response?.data)}`);
            throw ErrorHandler.createError('API_ERROR', `Failed to create snippet "${options.name}" on server.`);
        }
    }

    async updateSnippet(name: string, updates: Partial<Snippet>): Promise<Snippet> {
        try {
            Logger.debug(`Updating snippet "${name}" via API...`);
            
            // Map extension fields to backend API fields
            const backendUpdates: any = {};
            if (updates.name) backendUpdates.title = updates.name;
            if (updates.content) backendUpdates.content = updates.content;
            if (updates.language) backendUpdates.language = updates.language;
            if (updates.description) backendUpdates.description = updates.description;
            
            const response: AxiosResponse<Snippet> = await this.client.patch(`/api/tecs/${name}`, backendUpdates);
            Logger.info(`Updated snippet "${name}" via API`);
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                throw ErrorHandler.createError('SNIPPET_NOT_FOUND', `Snippet "${name}" not found.`);
            }
            Logger.error(`Failed to update snippet "${name}" via API`, error as Error);
            throw ErrorHandler.createError('API_ERROR', `Failed to update snippet "${name}" on server.`);
        }
    }

    async deleteSnippet(name: string): Promise<void> {
        try {
            Logger.debug(`Deleting snippet "${name}" via API...`);
            await this.client.delete(`/api/tecs/${name}`);
            Logger.info(`Deleted snippet "${name}" via API`);
        } catch (error: any) {
            if (error.response?.status === 404) {
                throw ErrorHandler.createError('SNIPPET_NOT_FOUND', `Snippet "${name}" not found.`);
            }
            Logger.error(`Failed to delete snippet "${name}" via API`, error as Error);
            throw ErrorHandler.createError('API_ERROR', `Failed to delete snippet "${name}" on server.`);
        }
    }

    // Package API methods (using /api/pacs endpoints)
    async getAllPackages(): Promise<any[]> {
        try {
            Logger.debug('Fetching all packages from API...');
            const response: AxiosResponse<any[]> = await this.client.get('/api/pacs');
            Logger.info(`Fetched ${response.data.length} packages from API`);
            
            // Debug: Log the first package to see the structure
            if (response.data.length > 0) {
                Logger.debug(`First package structure: ${JSON.stringify(response.data[0])}`);
            }
            
            // Return the raw backend data to preserve all fields including createdBy
            return response.data;
        } catch (error) {
            Logger.error('Failed to fetch packages from API', error as Error);
            throw ErrorHandler.createError('API_ERROR', 'Failed to fetch packages from server.');
        }
    }

    async getPackage(id: string): Promise<Package | null> {
        try {
            Logger.debug(`Fetching package with ID "${id}" from API...`);
            const response: AxiosResponse<any> = await this.client.get(`/api/pacs/${id}`);
            Logger.info(`Fetched package with ID "${id}" from API`);
            
            // Map backend fields to extension fields
            const backendPackage = response.data;
            const mappedPackage: Package = {
                id: backendPackage._id || backendPackage.id || '',
                name: backendPackage.name || 'Untitled',
                description: backendPackage.description || '',
                dependencies: backendPackage.dependencies || '',
                files: backendPackage.files || '',
                created_at: backendPackage.created_at || backendPackage.createdAt || '',
                updated_at: backendPackage.updated_at || backendPackage.updatedAt || ''
            };
            
            return mappedPackage;
        } catch (error: any) {
            if (error.response?.status === 404) {
                Logger.debug(`Package with ID "${id}" not found in API`);
                return null;
            }
            Logger.error(`Failed to fetch package with ID "${id}" from API`, error as Error);
            throw ErrorHandler.createError('API_ERROR', `Failed to fetch package with ID "${id}" from server.`);
        }
    }

    async createPackage(options: CreatePackageOptions): Promise<Package> {
        try {
            Logger.debug(`Creating package "${options.name}" via API...`);
            
            // Map extension fields to backend API fields
            const backendPayload = {
                name: options.name,
                description: options.description,
                dependencies: options.dependencies || '',
                files: options.files || ''
            };
            
            Logger.debug(`Making POST request to: ${this.client.defaults.baseURL}/api/pacs`);
            Logger.debug(`Request payload: ${JSON.stringify(backendPayload)}`);
            const response: AxiosResponse<Package> = await this.client.post('/api/pacs', backendPayload);
            Logger.info(`Created package "${options.name}" via API`);
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 409) {
                throw ErrorHandler.createError('PACKAGE_ALREADY_EXISTS', `Package "${options.name}" already exists.`);
            }
            Logger.error(`Failed to create package "${options.name}" via API`, error as Error);
            throw ErrorHandler.createError('API_ERROR', `Failed to create package "${options.name}" on server.`);
        }
    }

    async deletePackage(name: string): Promise<void> {
        try {
            Logger.debug(`Deleting package "${name}" via API...`);
            await this.client.delete(`/api/pacs/${name}`);
            Logger.info(`Deleted package "${name}" via API`);
        } catch (error: any) {
            if (error.response?.status === 404) {
                throw ErrorHandler.createError('PACKAGE_NOT_FOUND', `Package "${name}" not found.`);
            }
            Logger.error(`Failed to delete package "${name}" via API`, error as Error);
            throw ErrorHandler.createError('API_ERROR', `Failed to delete package "${name}" on server.`);
        }
    }

    // User profile API methods
    async getUserProfile(): Promise<any> {
        try {
            Logger.debug('Fetching user profile from API...');
            const response: AxiosResponse<any> = await this.client.get('/api/users/me');
            Logger.info('Fetched user profile from API');
            return response.data;
        } catch (error) {
            Logger.error('Failed to fetch user profile from API', error as Error);
            throw ErrorHandler.createError('API_ERROR', 'Failed to fetch user profile from server.');
        }
    }
} 