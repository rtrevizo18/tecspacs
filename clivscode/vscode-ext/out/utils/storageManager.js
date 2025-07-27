"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageManager = void 0;
const logger_1 = require("./logger");
const errorHandler_1 = require("./errorHandler");
class StorageManager {
    constructor() {
        this.snippets = [
            {
                name: 'console-log',
                content: 'console.log("Hello World");',
                language: 'javascript',
                description: 'Basic console.log statement',
                usage_count: 5,
                created_at: new Date().toISOString()
            },
            {
                name: 'function-template',
                content: 'function myFunction(param: string): void {\n    // TODO: Implement function\n    console.log(param);\n}',
                language: 'typescript',
                description: 'TypeScript function template',
                usage_count: 3,
                created_at: new Date().toISOString()
            }
        ];
        this.packages = [
            {
                name: 'react-component',
                description: 'Basic React component template',
                dependencies: 'react, react-dom',
                files: 'Component.tsx, index.ts',
                created_at: new Date().toISOString()
            }
        ];
        logger_1.Logger.debug('StorageManager initialized');
    }
    async getAllSnippets() {
        try {
            logger_1.Logger.debug('Getting all snippets...');
            // Return all snippets including newly created ones
            return this.snippets.map(snippet => ({
                name: snippet.name,
                language: snippet.language,
                description: snippet.description,
                usage_count: snippet.usage_count
            }));
        }
        catch (error) {
            logger_1.Logger.error('Error getting all snippets', error);
            throw error;
        }
    }
    async getSnippet(name) {
        try {
            logger_1.Logger.debug(`Getting snippet: ${name}`);
            // Find snippet in our stored snippets
            const snippet = this.snippets.find(s => s.name === name);
            return snippet || null;
        }
        catch (error) {
            logger_1.Logger.error(`Error getting snippet: ${name}`, error);
            throw error;
        }
    }
    async createSnippet(options) {
        try {
            logger_1.Logger.debug(`Creating snippet: ${options.name}`);
            // Validate input
            errorHandler_1.ErrorHandler.validateSnippetName(options.name);
            errorHandler_1.ErrorHandler.validateLanguage(options.language);
            if (!options.content || options.content.trim() === '') {
                throw errorHandler_1.ErrorHandler.createError('INVALID_INPUT', 'Snippet content is required');
            }
            // Check if snippet already exists
            const existingSnippet = this.snippets.find(s => s.name === options.name);
            if (existingSnippet) {
                throw errorHandler_1.ErrorHandler.createError('SNIPPET_ALREADY_EXISTS', `Snippet "${options.name}" already exists`);
            }
            // Create the new snippet
            const newSnippet = {
                ...options,
                usage_count: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            // Add the new snippet to our collection
            this.snippets.push(newSnippet);
            logger_1.Logger.info(`Snippet "${options.name}" created successfully`);
            return newSnippet;
        }
        catch (error) {
            logger_1.Logger.error(`Error creating snippet: ${options.name}`, error);
            throw error;
        }
    }
    async updateSnippet(name, updates) {
        try {
            logger_1.Logger.debug(`Updating snippet: ${name}`);
            // TODO: Integrate with actual CLI storage manager
            logger_1.Logger.info(`Snippet "${name}" would be updated`);
        }
        catch (error) {
            logger_1.Logger.error(`Error updating snippet: ${name}`, error);
            throw error;
        }
    }
    async deleteSnippet(name) {
        try {
            logger_1.Logger.debug(`Deleting snippet: ${name}`);
            const snippetIndex = this.snippets.findIndex(s => s.name === name);
            if (snippetIndex === -1) {
                throw errorHandler_1.ErrorHandler.createError('SNIPPET_NOT_FOUND', `Snippet "${name}" not found`);
            }
            this.snippets.splice(snippetIndex, 1);
            logger_1.Logger.info(`Snippet "${name}" deleted successfully`);
        }
        catch (error) {
            logger_1.Logger.error(`Error deleting snippet: ${name}`, error);
            throw error;
        }
    }
    // Package management methods
    async getAllPackages() {
        try {
            logger_1.Logger.debug('Getting all packages...');
            return this.packages.map(pkg => ({
                id: pkg.id,
                name: pkg.name,
                description: pkg.description,
                dependencies: pkg.dependencies,
                files: pkg.files,
                created_at: pkg.created_at
            }));
        }
        catch (error) {
            logger_1.Logger.error('Error getting all packages', error);
            throw error;
        }
    }
    async getPackage(name) {
        try {
            logger_1.Logger.debug(`Getting package: ${name}`);
            const pkg = this.packages.find(p => p.name === name);
            return pkg || null;
        }
        catch (error) {
            logger_1.Logger.error(`Error getting package: ${name}`, error);
            throw error;
        }
    }
    async createPackage(options) {
        try {
            logger_1.Logger.debug(`Creating package: ${options.name}`);
            // Validate input
            errorHandler_1.ErrorHandler.validatePackageName(options.name);
            // Check if package already exists
            const existingPackage = this.packages.find(p => p.name === options.name);
            if (existingPackage) {
                throw errorHandler_1.ErrorHandler.createError('PACKAGE_ALREADY_EXISTS', `Package "${options.name}" already exists`);
            }
            // Create the new package
            const newPackage = {
                ...options,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            // Add the new package to our collection
            this.packages.push(newPackage);
            logger_1.Logger.info(`Package "${options.name}" created successfully`);
            return newPackage;
        }
        catch (error) {
            logger_1.Logger.error(`Error creating package: ${options.name}`, error);
            throw error;
        }
    }
    async deletePackage(name) {
        try {
            logger_1.Logger.debug(`Deleting package: ${name}`);
            const packageIndex = this.packages.findIndex(p => p.name === name);
            if (packageIndex === -1) {
                throw errorHandler_1.ErrorHandler.createError('PACKAGE_NOT_FOUND', `Package "${name}" not found`);
            }
            this.packages.splice(packageIndex, 1);
            logger_1.Logger.info(`Package "${name}" deleted successfully`);
        }
        catch (error) {
            logger_1.Logger.error(`Error deleting package: ${name}`, error);
            throw error;
        }
    }
}
exports.StorageManager = StorageManager;
//# sourceMappingURL=storageManager.js.map