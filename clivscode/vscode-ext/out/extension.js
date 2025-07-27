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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const tecspacsCommands_1 = require("./commands/tecspacsCommands");
const tecspacsProvider_1 = require("./providers/tecspacsProvider");
const logger_1 = require("./utils/logger");
function activate(context) {
    logger_1.Logger.info('Tecspacs extension is now active!');
    // Register commands
    const commands = new tecspacsCommands_1.TecspacsCommands(context);
    // Register the tree data provider for the sidebar
    const tecspacsProvider = new tecspacsProvider_1.TecspacsProvider(commands);
    vscode.window.registerTreeDataProvider('tecspacsExplorer', tecspacsProvider);
    // Register refresh command for the tree view
    const refreshCommand = vscode.commands.registerCommand('tecspacs.refresh', () => {
        tecspacsProvider.refresh();
    });
    const getSnippetCommand = vscode.commands.registerCommand('tecspacs.getSnippet', () => {
        commands.getSnippet();
    });
    const createSnippetCommand = vscode.commands.registerCommand('tecspacs.createSnippet', () => {
        commands.createSnippet();
    });
    const loginCommand = vscode.commands.registerCommand('tecspacs.login', () => {
        commands.login();
    });
    const logoutCommand = vscode.commands.registerCommand('tecspacs.logout', () => {
        commands.logout();
    });
    const whoamiCommand = vscode.commands.registerCommand('tecspacs.whoami', () => {
        commands.whoami();
    });
    const getPackageCommand = vscode.commands.registerCommand('tecspacs.getPackage', () => {
        commands.getPackage();
    });
    const createPackageCommand = vscode.commands.registerCommand('tecspacs.createPackage', () => {
        commands.createPackage();
    });
    const listSnippetsCommand = vscode.commands.registerCommand('tecspacs.listSnippets', () => {
        commands.listSnippets();
    });
    const listPackagesCommand = vscode.commands.registerCommand('tecspacs.listPackages', () => {
        commands.listPackages();
    });
    const copyCodeCommand = vscode.commands.registerCommand('tecspacs.copyCode', async () => {
        const currentCode = commands.getAuthManager().getCurrentAuthCode();
        if (currentCode) {
            await vscode.env.clipboard.writeText(currentCode);
            vscode.window.showInformationMessage(`Code "${currentCode}" copied to clipboard!`);
        }
        else {
            vscode.window.showInformationMessage('No active authentication code found.');
        }
    });
    // Insert snippet command for tree view items
    const insertSnippetCommand = vscode.commands.registerCommand('tecspacs.insertSnippet', async (snippetId) => {
        await commands.insertSnippetById(snippetId);
    });
    // View package details command for tree view items
    const viewPackageCommand = vscode.commands.registerCommand('tecspacs.viewPackage', async (packageId) => {
        await commands.viewPackageById(packageId);
    });
    // Search and web app commands
    const searchSnippetsCommand = vscode.commands.registerCommand('tecspacs.searchSnippets', () => {
        commands.searchSnippets();
    });
    const searchPackagesCommand = vscode.commands.registerCommand('tecspacs.searchPackages', () => {
        commands.searchPackages();
    });
    const openWebAppCommand = vscode.commands.registerCommand('tecspacs.openWebApp', () => {
        commands.openWebApp();
    });
    const showAllSnippetsCommand = vscode.commands.registerCommand('tecspacs.showAllSnippets', () => {
        commands.showAllSnippets();
    });
    // Create status bar item
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBarItem.text = "$(sync~spin) Tecspacs";
    statusBarItem.tooltip = "Click to login to Tecspacs";
    statusBarItem.command = 'tecspacs.login';
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);
    // Update status bar based on authentication
    const updateStatusBar = async () => {
        const isAuthenticated = await commands.getAuthManager().isAuthenticated();
        if (isAuthenticated) {
            statusBarItem.text = "$(check) Tecspacs";
            statusBarItem.tooltip = "Logged in to Tecspacs - Click to view profile";
            statusBarItem.command = 'tecspacs.whoami';
        }
        else {
            statusBarItem.text = "$(sign-in) Tecspacs";
            statusBarItem.tooltip = "Click to login to Tecspacs";
            statusBarItem.command = 'tecspacs.login';
        }
    };
    // Initial status bar update
    updateStatusBar();
    // Update status bar when authentication changes
    context.subscriptions.push(vscode.commands.registerCommand('tecspacs.updateStatusBar', updateStatusBar));
    context.subscriptions.push(refreshCommand, getSnippetCommand, createSnippetCommand, loginCommand, logoutCommand, whoamiCommand, getPackageCommand, createPackageCommand, listSnippetsCommand, listPackagesCommand, copyCodeCommand, insertSnippetCommand, viewPackageCommand, searchSnippetsCommand, searchPackagesCommand, openWebAppCommand, showAllSnippetsCommand);
}
function deactivate() {
    logger_1.Logger.info('Tecspacs extension is now deactivated!');
}
//# sourceMappingURL=extension.js.map