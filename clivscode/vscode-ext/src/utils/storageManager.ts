import { Logger } from './logger';
import { ErrorHandler } from './errorHandler';
import { Snippet, SnippetSummary, Package, PackageSummary, CreateSnippetOptions, CreatePackageOptions } from '../types';

export class StorageManager {
    private snippets: Snippet[] = [
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

    private packages: Package[] = [
        {
            name: 'react-component',
            description: 'Basic React component template',
            dependencies: 'react, react-dom',
            files: 'Component.tsx, index.ts',
            created_at: new Date().toISOString()
        }
    ];

    constructor() {
        Logger.debug('StorageManager initialized');
    }

    async getAllSnippets(): Promise<SnippetSummary[]> {
        try {
            Logger.debug('Getting all snippets...');
            
            // Return all snippets including newly created ones
            return this.snippets.map(snippet => ({
                name: snippet.name,
                language: snippet.language,
                description: snippet.description,
                usage_count: snippet.usage_count
            }));
        } catch (error) {
            Logger.error('Error getting all snippets', error as Error);
            throw error;
        }
    }

    async getSnippet(name: string): Promise<Snippet | null> {
        try {
            Logger.debug(`Getting snippet: ${name}`);
            
            // Find snippet in our stored snippets
            const snippet = this.snippets.find(s => s.name === name);
            return snippet || null;
        } catch (error) {
            Logger.error(`Error getting snippet: ${name}`, error as Error);
            throw error;
        }
    }

    async createSnippet(options: CreateSnippetOptions): Promise<Snippet> {
        try {
            Logger.debug(`Creating snippet: ${options.name}`);
            
            // Validate input
            ErrorHandler.validateSnippetName(options.name);
            ErrorHandler.validateLanguage(options.language);
            
            if (!options.content || options.content.trim() === '') {
                throw ErrorHandler.createError('INVALID_INPUT', 'Snippet content is required');
            }
            
            // Check if snippet already exists
            const existingSnippet = this.snippets.find(s => s.name === options.name);
            if (existingSnippet) {
                throw ErrorHandler.createError('SNIPPET_ALREADY_EXISTS', `Snippet "${options.name}" already exists`);
            }
            
            // Create the new snippet
            const newSnippet: Snippet = {
                ...options,
                usage_count: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            
            // Add the new snippet to our collection
            this.snippets.push(newSnippet);
            
            Logger.info(`Snippet "${options.name}" created successfully`);
            return newSnippet;
            
        } catch (error) {
            Logger.error(`Error creating snippet: ${options.name}`, error as Error);
            throw error;
        }
    }

    async updateSnippet(name: string, updates: Partial<Snippet>): Promise<void> {
        try {
            Logger.debug(`Updating snippet: ${name}`);
            
            // TODO: Integrate with actual CLI storage manager
            Logger.info(`Snippet "${name}" would be updated`);
            
        } catch (error) {
            Logger.error(`Error updating snippet: ${name}`, error as Error);
            throw error;
        }
    }

    async deleteSnippet(name: string): Promise<void> {
        try {
            Logger.debug(`Deleting snippet: ${name}`);
            
            const snippetIndex = this.snippets.findIndex(s => s.name === name);
            if (snippetIndex === -1) {
                throw ErrorHandler.createError('SNIPPET_NOT_FOUND', `Snippet "${name}" not found`);
            }
            
            this.snippets.splice(snippetIndex, 1);
            Logger.info(`Snippet "${name}" deleted successfully`);
            
        } catch (error) {
            Logger.error(`Error deleting snippet: ${name}`, error as Error);
            throw error;
        }
    }

    // Package management methods
    async getAllPackages(): Promise<PackageSummary[]> {
        try {
            Logger.debug('Getting all packages...');
            
            return this.packages.map(pkg => ({
                id: pkg.id,
                name: pkg.name,
                description: pkg.description,
                dependencies: pkg.dependencies,
                files: pkg.files,
                created_at: pkg.created_at
            }));
        } catch (error) {
            Logger.error('Error getting all packages', error as Error);
            throw error;
        }
    }

    async getPackage(name: string): Promise<Package | null> {
        try {
            Logger.debug(`Getting package: ${name}`);
            
            const pkg = this.packages.find(p => p.name === name);
            return pkg || null;
        } catch (error) {
            Logger.error(`Error getting package: ${name}`, error as Error);
            throw error;
        }
    }

    async createPackage(options: CreatePackageOptions): Promise<Package> {
        try {
            Logger.debug(`Creating package: ${options.name}`);
            
            // Validate input
            ErrorHandler.validatePackageName(options.name);
            
            // Check if package already exists
            const existingPackage = this.packages.find(p => p.name === options.name);
            if (existingPackage) {
                throw ErrorHandler.createError('PACKAGE_ALREADY_EXISTS', `Package "${options.name}" already exists`);
            }
            
            // Create the new package
            const newPackage: Package = {
                ...options,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            
            // Add the new package to our collection
            this.packages.push(newPackage);
            
            Logger.info(`Package "${options.name}" created successfully`);
            return newPackage;
            
        } catch (error) {
            Logger.error(`Error creating package: ${options.name}`, error as Error);
            throw error;
        }
    }

    async deletePackage(name: string): Promise<void> {
        try {
            Logger.debug(`Deleting package: ${name}`);
            
            const packageIndex = this.packages.findIndex(p => p.name === name);
            if (packageIndex === -1) {
                throw ErrorHandler.createError('PACKAGE_NOT_FOUND', `Package "${name}" not found`);
            }
            
            this.packages.splice(packageIndex, 1);
            Logger.info(`Package "${name}" deleted successfully`);
            
        } catch (error) {
            Logger.error(`Error deleting package: ${name}`, error as Error);
            throw error;
        }
    }
} 