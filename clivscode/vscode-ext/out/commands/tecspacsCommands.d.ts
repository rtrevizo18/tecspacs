import * as vscode from 'vscode';
import { Auth0Manager } from '../utils/auth0Manager';
import { ApiClient } from '../utils/apiClient';
export declare class TecspacsCommands {
    private context;
    private storageManager;
    private authManager;
    private apiClient;
    constructor(context: vscode.ExtensionContext);
    getAuthManager(): Auth0Manager;
    getApiClient(): ApiClient;
    getSnippet(): Promise<void>;
    createSnippet(): Promise<void>;
    login(): Promise<void>;
    logout(): Promise<void>;
    whoami(): Promise<void>;
    getPackage(): Promise<void>;
    createPackage(): Promise<void>;
    listSnippets(): Promise<void>;
    listPackages(): Promise<void>;
    insertSnippetById(snippetId: string): Promise<void>;
    viewPackageById(packageId: string): Promise<void>;
    private showPackagePreview;
    private previewPackageFiles;
    private installPackage;
    searchSnippets(): Promise<void>;
    searchPackages(): Promise<void>;
    openWebApp(): Promise<void>;
    showAllSnippets(): Promise<void>;
}
//# sourceMappingURL=tecspacsCommands.d.ts.map