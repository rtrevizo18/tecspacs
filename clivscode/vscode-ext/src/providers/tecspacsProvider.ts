import * as vscode from 'vscode';
import { TecspacsCommands } from '../commands/tecspacsCommands';
import { SnippetSummary, PackageSummary } from '../types';

export class TecspacsProvider implements vscode.TreeDataProvider<TecspacsItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<TecspacsItem | undefined | null | void> = new vscode.EventEmitter<TecspacsItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<TecspacsItem | undefined | null | void> = this._onDidChangeTreeData.event;

    constructor(private commands: TecspacsCommands) {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: TecspacsItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: TecspacsItem): Promise<TecspacsItem[]> {
        if (!element) {
            // Root level - show main categories
            return [
                new TecspacsItem('📝 My Snippets', vscode.TreeItemCollapsibleState.Collapsed, 'my-snippets', 'folder'),
                new TecspacsItem('📦 My Packages', vscode.TreeItemCollapsibleState.Collapsed, 'my-packages', 'folder'),
                new TecspacsItem('🔍 Search Snippets', vscode.TreeItemCollapsibleState.None, 'search-snippets', 'globe', undefined, undefined, undefined, 'tecspacs.searchSnippets'),
                new TecspacsItem('🔍 Search Packages', vscode.TreeItemCollapsibleState.None, 'search-packages', 'globe', undefined, undefined, undefined, 'tecspacs.searchPackages'),
                new TecspacsItem('🌐 Open Web App', vscode.TreeItemCollapsibleState.None, 'open-web-app', 'globe', undefined, undefined, undefined, 'tecspacs.openWebApp'),
                new TecspacsItem('➕ Create New Snippet', vscode.TreeItemCollapsibleState.None, 'create-snippet', 'add', undefined, undefined, undefined, 'tecspacs.createSnippet'),
                new TecspacsItem('➕ Create New Package', vscode.TreeItemCollapsibleState.None, 'create-package', 'add', undefined, undefined, undefined, 'tecspacs.createPackage'),
                new TecspacsItem('🔄 Refresh', vscode.TreeItemCollapsibleState.None, 'refresh', 'refresh'),
                new TecspacsItem('🔑 Login to Create', vscode.TreeItemCollapsibleState.None, 'login', 'sign-in')
            ];
        }

        if (element.type === 'my-snippets') {
            try {
                // Check if user is authenticated before fetching data
                const isAuthenticated = await this.commands.getAuthManager().isAuthenticated();
                if (!isAuthenticated) {
                    return [new TecspacsItem('🔑 Please login to view your snippets', vscode.TreeItemCollapsibleState.None, 'login-required', 'sign-in')];
                }

                const snippets = await this.commands.getApiClient().getAllSnippets();
                if (snippets.length === 0) {
                    return [new TecspacsItem('📝 No snippets found', vscode.TreeItemCollapsibleState.None, 'empty', 'info')];
                }
                
                // Filter to show only user's own snippets
                const currentUser = await this.commands.getAuthManager().getUserConfig();
                const backendUserProfile = await this.commands.getAuthManager().getBackendUserProfile();
                
                // Debug logging
                console.log('Current user:', currentUser);
                console.log('Backend user profile:', backendUserProfile);
                console.log('All snippets:', snippets.length);
                
                // Also log to VS Code output
                const Logger = require('../utils/logger').Logger;
                Logger.info(`Debug: Current user: ${JSON.stringify(currentUser)}`);
                Logger.info(`Debug: Backend user profile: ${JSON.stringify(backendUserProfile)}`);
                Logger.info(`Debug: All snippets count: ${snippets.length}`);
                
                const userSnippets = snippets.filter((snippet: any) => {
                    // Check if user is authenticated and if snippet belongs to them
                    if (!currentUser) {
                        console.log('No current user, filtering out snippet:', snippet.title || snippet.name);
                        return false; // Not logged in, show none
                    }
                    
                    // Debug the actual snippet structure
                    Logger.info(`Debug: Full snippet structure for "${snippet.title || snippet.name}": ${JSON.stringify(snippet)}`);
                    
                    // Try multiple ID comparison strategies
                    // 1. Compare with Auth0 ID (if backend returns it)
                    // 2. Compare with MongoDB ID (if we have it from backend profile)
                    // 3. Compare with the actual createdBy._id from snippet
                    const isOwnSnippet = snippet.createdBy && (
                        snippet.createdBy._id === currentUser.auth0Id || // Auth0 ID comparison
                        snippet.createdBy._id === backendUserProfile?._id || // MongoDB ID comparison
                        snippet.createdBy.auth0Id === currentUser.auth0Id // Direct Auth0 ID comparison
                    );
                    
                    console.log(`Snippet "${snippet.title || snippet.name}": createdBy=${snippet.createdBy?._id}, currentUser=${currentUser.auth0Id}, backendId=${backendUserProfile?._id}, isOwn=${isOwnSnippet}`);
                    
                    // Also log to VS Code output
                    Logger.info(`Debug: Snippet "${snippet.title || snippet.name}": createdBy=${snippet.createdBy?._id}, currentUser=${currentUser.auth0Id}, backendId=${backendUserProfile?._id}, isOwn=${isOwnSnippet}`);
                    
                    return isOwnSnippet;
                });
                
                console.log('User snippets found:', userSnippets.length);
                Logger.info(`Debug: User snippets found: ${userSnippets.length}`);
                
                if (userSnippets.length === 0) {
                    Logger.info(`Debug: No user snippets found. Current user: ${currentUser ? 'logged in' : 'not logged in'}`);
                    
                    // If no user snippets found, show a message with option to show all
                    return [
                        new TecspacsItem('📝 No snippets found', vscode.TreeItemCollapsibleState.None, 'empty', 'info'),
                        new TecspacsItem('🔍 Show All Snippets', vscode.TreeItemCollapsibleState.None, 'show-all-snippets', 'search')
                    ];
                }
                
                // Add a test item to verify Tree View is working
                const testItem = new TecspacsItem('🧪 TEST ITEM - Tree View Working', vscode.TreeItemCollapsibleState.None, 'test', 'test');
                Logger.info(`Debug: Added test item to verify Tree View functionality`);
                
                // Debug: Log the snippets that will be returned
                Logger.info(`Debug: About to return ${userSnippets.length} snippets`);
                userSnippets.forEach((snippet, index) => {
                    const snippetAny = snippet as any;
                    Logger.info(`Debug: Snippet ${index + 1}: "${snippet.title || snippet.name}" (ID: ${snippet.id || snippetAny._id})`);
                });
                
                const treeItems = userSnippets.map((snippet: SnippetSummary) => {
                    const snippetAny = snippet as any;
                    const item = new TecspacsItem(
                        `${snippet.title || snippet.name}`,
                        vscode.TreeItemCollapsibleState.None,
                        'snippet',
                        'code',
                        snippet.id || snippetAny._id || snippet.title || snippet.name,
                        snippet.description || '',
                        snippet.language
                    );
                    Logger.info(`Debug: Created tree item for "${snippet.title || snippet.name}" with ID: ${item.id}`);
                    return item;
                });
                
                Logger.info(`Debug: Returning ${treeItems.length} tree items`);
                
                // Add test item to the beginning of the array
                const finalItems = [testItem, ...treeItems];
                Logger.info(`Debug: Final items array has ${finalItems.length} items (including test item)`);
                
                // Removed the infinite loop causing setTimeout
                
                return finalItems;
            } catch (error) {
                return [new TecspacsItem('❌ Failed to load snippets', vscode.TreeItemCollapsibleState.None, 'error', 'error')];
            }
        }

        if (element.type === 'my-packages') {
            try {
                // Check if user is authenticated before fetching data
                const isAuthenticated = await this.commands.getAuthManager().isAuthenticated();
                if (!isAuthenticated) {
                    return [new TecspacsItem('🔑 Please login to view your packages', vscode.TreeItemCollapsibleState.None, 'login-required', 'sign-in')];
                }

                const packages = await this.commands.getApiClient().getAllPackages();
                if (packages.length === 0) {
                    return [new TecspacsItem('📦 No packages found', vscode.TreeItemCollapsibleState.None, 'empty', 'info')];
                }
                
                // Filter to show only user's own packages
                const currentUser = await this.commands.getAuthManager().getUserConfig();
                const backendUserProfile = await this.commands.getAuthManager().getBackendUserProfile();
                const userPackages = packages.filter((pkg: any) => {
                    // Check if user is authenticated and if package belongs to them
                    if (!currentUser) return false; // Not logged in, show none
                    
                    return pkg.createdBy && (
                        pkg.createdBy._id === currentUser.auth0Id || // Auth0 ID comparison
                        pkg.createdBy._id === backendUserProfile?._id || // MongoDB ID comparison
                        pkg.createdBy.auth0Id === currentUser.auth0Id // Direct Auth0 ID comparison
                    );
                });
                
                if (userPackages.length === 0) {
                    return [new TecspacsItem('📦 No packages found', vscode.TreeItemCollapsibleState.None, 'empty', 'info')];
                }
                
                return userPackages.map((pkg: any) => 
                    new TecspacsItem(
                        `${pkg.name}`,
                        vscode.TreeItemCollapsibleState.None,
                        'package',
                        'package',
                        pkg._id || pkg.id || pkg.name,
                        pkg.description || '',
                        pkg.dependencies || ''
                    )
                );
            } catch (error) {
                return [new TecspacsItem('❌ Failed to load packages', vscode.TreeItemCollapsibleState.None, 'error', 'error')];
            }
        }

        return [];
    }
}

export class TecspacsItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly type: string,
        public readonly icon: string,
        public readonly id?: string,
        public readonly description?: string,
        public readonly language?: string,
        commandName?: string
    ) {
        super(label, collapsibleState);
        this.iconPath = new vscode.ThemeIcon(icon);
        if (commandName) {
            this.command = {
                command: commandName,
                title: label
            };
        }
    }
} 