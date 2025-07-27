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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TecspacsItem = exports.TecspacsProvider = void 0;
const vscode = __importStar(require("vscode"));
class TecspacsProvider {
    constructor(commands) {
        this.commands = commands;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element) {
        return element;
    }
    async getChildren(element) {
        if (!element) {
            // Root level - show main categories
            return [
                new TecspacsItem('📝 My Snippets', vscode.TreeItemCollapsibleState.Collapsed, 'my-snippets', 'folder'),
                new TecspacsItem('📦 My Packages', vscode.TreeItemCollapsibleState.Collapsed, 'my-packages', 'folder'),
                new TecspacsItem('🌐 Browse Web Snippets', vscode.TreeItemCollapsibleState.None, 'browse-snippets', 'globe'),
                new TecspacsItem('🌐 Browse Web Packages', vscode.TreeItemCollapsibleState.None, 'browse-packages', 'globe'),
                new TecspacsItem('➕ Create New Snippet', vscode.TreeItemCollapsibleState.None, 'create-snippet', 'add'),
                new TecspacsItem('➕ Create New Package', vscode.TreeItemCollapsibleState.None, 'create-package', 'add'),
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
                const userSnippets = snippets.filter((snippet) => {
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
                    const isOwnSnippet = snippet.createdBy && (snippet.createdBy._id === currentUser.auth0Id || // Auth0 ID comparison
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
                    const snippetAny = snippet;
                    Logger.info(`Debug: Snippet ${index + 1}: "${snippet.title || snippet.name}" (ID: ${snippet.id || snippetAny._id})`);
                });
                const treeItems = userSnippets.map((snippet) => {
                    const snippetAny = snippet;
                    const item = new TecspacsItem(`${snippet.title || snippet.name}`, vscode.TreeItemCollapsibleState.None, 'snippet', 'code', snippet.id || snippetAny._id || snippet.title || snippet.name, snippet.description || '', snippet.language);
                    Logger.info(`Debug: Created tree item for "${snippet.title || snippet.name}" with ID: ${item.id}`);
                    return item;
                });
                Logger.info(`Debug: Returning ${treeItems.length} tree items`);
                // Add test item to the beginning of the array
                const finalItems = [testItem, ...treeItems];
                Logger.info(`Debug: Final items array has ${finalItems.length} items (including test item)`);
                // Removed the infinite loop causing setTimeout
                return finalItems;
            }
            catch (error) {
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
                const userPackages = packages.filter((pkg) => {
                    // Check if user is authenticated and if package belongs to them
                    if (!currentUser)
                        return false; // Not logged in, show none
                    return pkg.createdBy && (pkg.createdBy._id === currentUser.auth0Id || // Auth0 ID comparison
                        pkg.createdBy._id === backendUserProfile?._id || // MongoDB ID comparison
                        pkg.createdBy.auth0Id === currentUser.auth0Id // Direct Auth0 ID comparison
                    );
                });
                if (userPackages.length === 0) {
                    return [new TecspacsItem('📦 No packages found', vscode.TreeItemCollapsibleState.None, 'empty', 'info')];
                }
                return userPackages.map((pkg) => new TecspacsItem(`${pkg.name}`, vscode.TreeItemCollapsibleState.None, 'package', 'package', pkg._id || pkg.id || pkg.name, pkg.description || '', pkg.dependencies || ''));
            }
            catch (error) {
                return [new TecspacsItem('❌ Failed to load packages', vscode.TreeItemCollapsibleState.None, 'error', 'error')];
            }
        }
        return [];
    }
}
exports.TecspacsProvider = TecspacsProvider;
class TecspacsItem extends vscode.TreeItem {
    constructor(label, collapsibleState, type, icon, id, description, language) {
        super(label, collapsibleState);
        this.label = label;
        this.collapsibleState = collapsibleState;
        this.type = type;
        this.icon = icon;
        this.id = id;
        this.description = description;
        this.language = language;
        this.tooltip = description || label;
        this.description = description;
        // Set icon
        this.iconPath = new vscode.ThemeIcon(icon);
        // Set context value for commands
        this.contextValue = type;
        // Set command based on type
        if (type === 'snippet' && id) {
            this.command = {
                command: 'tecspacs.insertSnippet',
                title: 'Insert Snippet',
                arguments: [id]
            };
        }
        else if (type === 'package' && id) {
            this.command = {
                command: 'tecspacs.viewPackage',
                title: 'View Package',
                arguments: [id]
            };
        }
        else if (type === 'create-snippet') {
            this.command = {
                command: 'tecspacs.createSnippet',
                title: 'Create Snippet'
            };
        }
        else if (type === 'create-package') {
            this.command = {
                command: 'tecspacs.createPackage',
                title: 'Create Package'
            };
        }
        else if (type === 'refresh') {
            this.command = {
                command: 'tecspacs.refresh',
                title: 'Refresh'
            };
        }
        else if (type === 'login' || type === 'login-required') {
            this.command = {
                command: 'tecspacs.login',
                title: 'Login'
            };
        }
        else if (type === 'browse-snippets') {
            this.command = {
                command: 'tecspacs.browseSnippets',
                title: 'Browse Web Snippets'
            };
        }
        else if (type === 'browse-packages') {
            this.command = {
                command: 'tecspacs.browsePackages',
                title: 'Browse Web Packages'
            };
        }
        else if (type === 'show-all-snippets') {
            this.command = {
                command: 'tecspacs.showAllSnippets',
                title: 'Show All Snippets'
            };
        }
    }
}
exports.TecspacsItem = TecspacsItem;
//# sourceMappingURL=tecspacsProvider.js.map