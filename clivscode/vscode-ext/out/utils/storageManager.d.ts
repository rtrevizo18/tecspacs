import { Snippet, SnippetSummary, Package, PackageSummary, CreateSnippetOptions, CreatePackageOptions } from '../types';
export declare class StorageManager {
    private snippets;
    private packages;
    constructor();
    getAllSnippets(): Promise<SnippetSummary[]>;
    getSnippet(name: string): Promise<Snippet | null>;
    createSnippet(options: CreateSnippetOptions): Promise<Snippet>;
    updateSnippet(name: string, updates: Partial<Snippet>): Promise<void>;
    deleteSnippet(name: string): Promise<void>;
    getAllPackages(): Promise<PackageSummary[]>;
    getPackage(name: string): Promise<Package | null>;
    createPackage(options: CreatePackageOptions): Promise<Package>;
    deletePackage(name: string): Promise<void>;
}
//# sourceMappingURL=storageManager.d.ts.map