import { Auth0Manager } from './auth0Manager';
import { Snippet, Package, CreateSnippetOptions, CreatePackageOptions } from '../types';
export declare class ApiClient {
    private client;
    private authManager;
    constructor(authManager: Auth0Manager);
    getAllSnippets(): Promise<any[]>;
    getSnippet(id: string): Promise<Snippet | null>;
    createSnippet(options: CreateSnippetOptions): Promise<Snippet>;
    updateSnippet(name: string, updates: Partial<Snippet>): Promise<Snippet>;
    deleteSnippet(name: string): Promise<void>;
    getAllPackages(): Promise<any[]>;
    getPackage(id: string): Promise<Package | null>;
    createPackage(options: CreatePackageOptions): Promise<Package>;
    deletePackage(name: string): Promise<void>;
    getUserProfile(): Promise<any>;
}
//# sourceMappingURL=apiClient.d.ts.map