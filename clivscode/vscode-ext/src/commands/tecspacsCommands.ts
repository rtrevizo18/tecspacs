import * as vscode from 'vscode';
import { Logger } from '../utils/logger';
import { StorageManager } from '../utils/storageManager';
import { Auth0Manager } from '../utils/auth0Manager';
import { ApiClient } from '../utils/apiClient';
import { ErrorHandler } from '../utils/errorHandler';
import { SnippetSummary, PackageSummary, CreateSnippetOptions, CreatePackageOptions } from '../types';

interface SnippetQuickPickItem extends vscode.QuickPickItem {
    snippet: SnippetSummary;
}

export class TecspacsCommands {
    private context: vscode.ExtensionContext;
    private storageManager: StorageManager;
    private authManager: Auth0Manager;
    private apiClient: ApiClient;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.storageManager = new StorageManager();
        this.authManager = new Auth0Manager();
        this.authManager.setContext(context);
        this.apiClient = new ApiClient(this.authManager);
    }

    getAuthManager(): Auth0Manager {
        return this.authManager;
    }

    getApiClient(): ApiClient {
        return this.apiClient;
    }

    async getSnippet(): Promise<void> {
        try {
            Logger.info('Getting snippet...');

            // Check if user is authenticated
            const isAuthenticated = await this.authManager.isAuthenticated();
            Logger.debug(`Authentication check result: ${isAuthenticated}`);
            
            if (!isAuthenticated) {
                const loginChoice = await vscode.window.showInformationMessage(
                    'You need to login first. Would you like to login now?',
                    'Yes', 'No'
                );
                
                if (loginChoice === 'Yes') {
                    await this.login();
                    // Check authentication again after login
                    if (!await this.authManager.isAuthenticated()) {
                        Logger.warn('Login completed but authentication still failed');
                        return;
                    }
                } else {
                    Logger.info('Login cancelled by user');
                    return;
                }
            }

            Logger.info('Authentication successful, proceeding with snippet retrieval...');

            // Get all available snippets from API
            const snippets = await this.apiClient.getAllSnippets();
            
            if (!snippets || snippets.length === 0) {
                vscode.window.showInformationMessage('No snippets found. Create your first snippet!');
                return;
            }

            // Create quick pick items with better formatting
            const items: SnippetQuickPickItem[] = snippets.map((snippet: SnippetSummary) => ({
                label: `$(code) ${snippet.title || snippet.name}`,
                description: snippet.description || '',
                detail: `${snippet.language} • Used ${snippet.usage_count || 0} times`,
                snippet: snippet
            }));

            // Show quick pick with search functionality
            const selected = await vscode.window.showQuickPick(items, {
                placeHolder: 'Search and select a snippet to insert...',
                matchOnDescription: true,
                matchOnDetail: true,
                canPickMany: false
            });

            if (!selected) {
                Logger.info('No snippet selected');
                return;
            }

            // Get the full snippet content from API using the snippet ID
            const snippet = await this.apiClient.getSnippet(selected.snippet.id || selected.snippet.title || selected.snippet.name || '');
            
            if (!snippet) {
                vscode.window.showErrorMessage(`Snippet "${selected.snippet.title || selected.snippet.name}" not found`);
                return;
            }

            // Insert snippet at cursor position
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                await editor.edit(editBuilder => {
                    const position = editor.selection.active;
                    editBuilder.insert(position, snippet.content);
                });
                
                Logger.info(`Inserted snippet: ${snippet.title || snippet.name}`);
                vscode.window.showInformationMessage(`Snippet "${snippet.title || snippet.name}" inserted!`);
            } else {
                // Copy to clipboard if no active editor
                await vscode.env.clipboard.writeText(snippet.content);
                Logger.info(`Copied snippet to clipboard: ${snippet.title || snippet.name}`);
                vscode.window.showInformationMessage(`Snippet "${snippet.title || snippet.name}" copied to clipboard!`);
            }

        } catch (error) {
            Logger.error('Error getting snippet', error as Error);
            vscode.window.showErrorMessage('Failed to get snippet. Check the output panel for details.');
        }
    }

    async createSnippet(): Promise<void> {
        try {
            Logger.info('Creating snippet...');

            // Check if user is authenticated
            const isAuthenticated = await this.authManager.isAuthenticated();
            Logger.debug(`Authentication check result: ${isAuthenticated}`);
            
            if (!isAuthenticated) {
                const loginChoice = await vscode.window.showInformationMessage(
                    'You need to login first. Would you like to login now?',
                    'Yes', 'No'
                );
                
                if (loginChoice === 'Yes') {
                    await this.login();
                    // Check authentication again after login
                    if (!await this.authManager.isAuthenticated()) {
                        Logger.warn('Login completed but authentication still failed');
                        return;
                    }
                } else {
                    Logger.info('Login cancelled by user');
                    return;
                }
            }

            Logger.info('Authentication successful, proceeding with snippet creation...');

            // Get snippet name
            const name = await vscode.window.showInputBox({
                prompt: 'Enter snippet name',
                placeHolder: 'my-snippet',
                validateInput: (value) => {
                    if (!value || value.trim() === '') {
                        return 'Snippet name is required';
                    }
                    return null;
                }
            });

            if (!name) {
                Logger.info('Snippet creation cancelled');
                return;
            }

            // Get snippet content from selected text or input
            let content = '';
            const editor = vscode.window.activeTextEditor;
            
            if (editor && !editor.selection.isEmpty) {
                const selectedText = editor.document.getText(editor.selection);
                Logger.info(`Found selected text: ${selectedText.substring(0, 50)}...`);
                
                // Ask user if they want to use selected text
                const useSelectedText = await vscode.window.showQuickPick(
                    ['Yes, use selected text', 'No, enter new content'],
                    {
                        placeHolder: `Use selected text? (${selectedText.length} characters)`
                    }
                );
                
                if (useSelectedText === 'Yes, use selected text') {
                    content = selectedText;
                    Logger.info('Using selected text for snippet content');
                } else if (useSelectedText === 'No, enter new content') {
                    content = await vscode.window.showInputBox({
                        prompt: 'Enter snippet content',
                        placeHolder: 'console.log("Hello World");',
                        validateInput: (value) => {
                            if (!value || value.trim() === '') {
                                return 'Snippet content is required';
                            }
                            return null;
                        }
                    }) || '';
                } else {
                    Logger.info('Snippet creation cancelled - no content choice made');
                    return;
                }
            } else {
                // No text selected, prompt for input
                content = await vscode.window.showInputBox({
                    prompt: 'Enter snippet content',
                    placeHolder: 'console.log("Hello World");',
                    validateInput: (value) => {
                        if (!value || value.trim() === '') {
                            return 'Snippet content is required';
                        }
                        return null;
                    }
                }) || '';
            }

            if (!content) {
                Logger.info('Snippet creation cancelled - no content');
                return;
            }

            // Get language
            const languages = ['javascript', 'typescript', 'python', 'java', 'csharp', 'cpp', 'html', 'css', 'json', 'yaml', 'markdown', 'sql', 'bash', 'powershell'];
            const language = await vscode.window.showQuickPick(languages, {
                placeHolder: 'Select language'
            });

            if (!language) {
                Logger.info('Snippet creation cancelled - no language selected');
                return;
            }

            // Get description (optional)
            const description = await vscode.window.showInputBox({
                prompt: 'Enter description (optional)',
                placeHolder: 'What does this snippet do?'
            });

            // Create the snippet via API
            await this.apiClient.createSnippet({
                name: name.trim(),
                content: content.trim(),
                language: language.toLowerCase(),
                description: description?.trim() || ''
            });

            Logger.info(`Created snippet: ${name}`);
            vscode.window.showInformationMessage(`Snippet "${name}" created successfully!`);
            
            // Refresh the sidebar to show the new snippet
            vscode.commands.executeCommand('tecspacs.refresh');

        } catch (error) {
            Logger.error('Error creating snippet', error as Error);
            vscode.window.showErrorMessage('Failed to create snippet. Check the output panel for details.');
        }
    }

    async login(): Promise<void> {
        try {
            Logger.info('Starting login process...');
            
            vscode.window.showInformationMessage('Starting authentication...');
            
            // Show progress
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Tecspacs Login",
                cancellable: false
            }, async (progress) => {
                progress.report({ message: 'Authenticating with Auth0...' });
                
                const userConfig = await this.authManager.login();
                
                progress.report({ message: 'Login successful!' });
                
                // Show welcome message
                vscode.window.showInformationMessage(
                    `Welcome back, ${userConfig.username}! You can now use Tecspacs commands.`
                );
                
                // Refresh the sidebar to show user's content
                vscode.commands.executeCommand('tecspacs.refresh');
                
                // Update status bar to show logged in state
                vscode.commands.executeCommand('tecspacs.updateStatusBar');
            });

            Logger.info('Login completed successfully');

        } catch (error) {
            Logger.error('Login failed', error as Error);
            vscode.window.showErrorMessage('Login failed. Check the output panel for details.');
        }
    }

    async logout(): Promise<void> {
        try {
            Logger.info('Starting logout process...');
            
            await this.authManager.logout();
            
            Logger.info('Logout completed successfully');
            vscode.window.showInformationMessage('Logged out successfully!');
            
            // Refresh the sidebar to clear content
            vscode.commands.executeCommand('tecspacs.refresh');
            
            // Update status bar to show logged out state
            vscode.commands.executeCommand('tecspacs.updateStatusBar');
            
        } catch (error) {
            Logger.error('Logout failed', error as Error);
            vscode.window.showErrorMessage('Logout failed. Check the output panel for details.');
        }
    }

    async whoami(): Promise<void> {
        try {
            Logger.info('Getting user profile...');
            
            const userConfig = await this.authManager.getUserConfig();
            
            if (!userConfig) {
                vscode.window.showInformationMessage('You are not logged in. Use "Tecspacs: Login" to sign in.');
                return;
            }

            const message = `Profile Information:\n` +
                `Username: ${userConfig.username}\n` +
                `Email: ${userConfig.email}\n` +
                `Auth0 ID: ${userConfig.auth0Id}\n` +
                `Snippets: ${userConfig.tecs?.length || 0}\n` +
                `Packages: ${userConfig.pacs?.length || 0}\n` +
                `Last Login: ${userConfig.lastLogin || 'Unknown'}`;

            vscode.window.showInformationMessage(message);
            Logger.info('Profile information displayed');
            
        } catch (error) {
            Logger.error('Error getting profile', error as Error);
            vscode.window.showErrorMessage('Failed to get profile. Check the output panel for details.');
        }
    }

    async getPackage(): Promise<void> {
        try {
            Logger.info('Getting package...');

            // Check if user is authenticated
            const isAuthenticated = await this.authManager.isAuthenticated();
            Logger.debug(`Authentication check result: ${isAuthenticated}`);
            
            if (!isAuthenticated) {
                const loginChoice = await vscode.window.showInformationMessage(
                    'You need to login first. Would you like to login now?',
                    'Yes', 'No'
                );
                
                if (loginChoice === 'Yes') {
                    await this.login();
                    if (!await this.authManager.isAuthenticated()) {
                        Logger.warn('Login completed but authentication still failed');
                        return;
                    }
                } else {
                    Logger.info('Login cancelled by user');
                    return;
                }
            }

            Logger.info('Authentication successful, proceeding with package retrieval...');

            // Get all available packages from API
            const packages = await this.apiClient.getAllPackages();
            
            if (!packages || packages.length === 0) {
                vscode.window.showInformationMessage('No packages found. Create your first package!');
                return;
            }

            // Create quick pick items
            const items = packages.map((pkg: PackageSummary) => ({
                label: `$(package) ${pkg.name}`,
                description: pkg.description || '',
                detail: `Dependencies: ${pkg.dependencies || 'none'} • Files: ${pkg.files || 'none'}`,
                package: pkg
            }));

            // Show quick pick
            const selected = await vscode.window.showQuickPick(items, {
                placeHolder: 'Search and select a package to retrieve...',
                matchOnDescription: true,
                matchOnDetail: true
            });

            if (!selected) {
                Logger.info('No package selected');
                return;
            }

            // Get the full package content from API using the package ID
            const pkg = await this.apiClient.getPackage(selected.package.id || selected.package.name);
            
            if (!pkg) {
                vscode.window.showErrorMessage(`Package "${selected.package.name}" not found`);
                return;
            }

            // Display package details in output panel
            const outputChannel = vscode.window.createOutputChannel('Tecspacs Package Details');
            outputChannel.show();
            outputChannel.appendLine(`📦 Package: ${pkg.name}`);
            outputChannel.appendLine('='.repeat(50));
            outputChannel.appendLine('');
            outputChannel.appendLine(`Description: ${pkg.description}`);
            if (pkg.dependencies) {
                outputChannel.appendLine(`Dependencies: ${pkg.dependencies}`);
            }
            if (pkg.files) {
                outputChannel.appendLine(`Files: ${pkg.files}`);
            }
            if (pkg.created_at) {
                outputChannel.appendLine(`Created: ${new Date(pkg.created_at).toLocaleString()}`);
            }
            outputChannel.appendLine('');

            Logger.info(`Retrieved package: ${pkg.name}`);
            vscode.window.showInformationMessage(`📦 Package "${pkg.name}" details shown in output panel`);

        } catch (error) {
            Logger.error('Error getting package', error as Error);
            vscode.window.showErrorMessage('Failed to get package. Check the output panel for details.');
        }
    }

    async createPackage(): Promise<void> {
        try {
            Logger.info('Creating package...');

            // Check if user is authenticated
            const isAuthenticated = await this.authManager.isAuthenticated();
            Logger.debug(`Authentication check result: ${isAuthenticated}`);
            
            if (!isAuthenticated) {
                const loginChoice = await vscode.window.showInformationMessage(
                    'You need to login first. Would you like to login now?',
                    'Yes', 'No'
                );
                
                if (loginChoice === 'Yes') {
                    await this.login();
                    if (!await this.authManager.isAuthenticated()) {
                        Logger.warn('Login completed but authentication still failed');
                        return;
                    }
                } else {
                    Logger.info('Login cancelled by user');
                    return;
                }
            }

            Logger.info('Authentication successful, proceeding with package creation...');

            // Get package name
            const name = await vscode.window.showInputBox({
                prompt: 'Enter package name',
                placeHolder: 'my-package',
                validateInput: (value) => {
                    if (!value || value.trim() === '') {
                        return 'Package name is required';
                    }
                    return null;
                }
            });

            if (!name) {
                Logger.info('Package creation cancelled');
                return;
            }



            // Get description (required)
            const description = await vscode.window.showInputBox({
                prompt: 'Enter description (required)',
                placeHolder: 'What does this package do?',
                validateInput: (value) => {
                    if (!value || value.trim() === '') {
                        return 'Package description is required';
                    }
                    return null;
                }
            });

            if (!description) {
                Logger.info('Package creation cancelled - no description provided');
                return;
            }

            // Get dependencies (optional)
            const dependencies = await vscode.window.showInputBox({
                prompt: 'Enter dependencies (optional)',
                placeHolder: 'package1, package2, package3'
            });

            // Get files (optional) - with file picker option
            const fileChoice = await vscode.window.showQuickPick([
                'Enter file names manually',
                'Select files from workspace',
                'Skip files (optional)'
            ], {
                placeHolder: 'How would you like to specify files?'
            });

            let files = '';
            if (fileChoice === 'Enter file names manually') {
                files = await vscode.window.showInputBox({
                    prompt: 'Enter file names (comma-separated)',
                    placeHolder: 'file1.js, file2.js, file3.js'
                }) || '';
            } else if (fileChoice === 'Select files from workspace') {
                const fileUris = await vscode.window.showOpenDialog({
                    canSelectFiles: true,
                    canSelectFolders: false,
                    canSelectMany: true,
                    openLabel: 'Select Package Files'
                });
                
                if (fileUris && fileUris.length > 0) {
                    files = fileUris.map(uri => uri.fsPath.split(/[/\\]/).pop()).join(', ');
                }
            }

            // Create the package via API
            await this.apiClient.createPackage({
                name: name.trim(),
                description: description.trim(),
                dependencies: dependencies?.trim() || '',
                files: files?.trim() || ''
            });

            Logger.info(`Created package: ${name}`);
            vscode.window.showInformationMessage(`Package "${name}" created successfully!`);
            
            // Refresh the sidebar to show the new package
            vscode.commands.executeCommand('tecspacs.refresh');

        } catch (error) {
            Logger.error('Error creating package', error as Error);
            vscode.window.showErrorMessage('Failed to create package. Check the output panel for details.');
        }
    }

    async listSnippets(): Promise<void> {
        try {
            Logger.info('Listing all snippets...');

            // Check if user is authenticated
            const isAuthenticated = await this.authManager.isAuthenticated();
            Logger.debug(`Authentication check result: ${isAuthenticated}`);
            
            if (!isAuthenticated) {
                const loginChoice = await vscode.window.showInformationMessage(
                    'You need to login first. Would you like to login now?',
                    'Yes', 'No'
                );
                
                if (loginChoice === 'Yes') {
                    await this.login();
                    if (!await this.authManager.isAuthenticated()) {
                        Logger.warn('Login completed but authentication still failed');
                        return;
                    }
                } else {
                    Logger.info('Login cancelled by user');
                    return;
                }
            }

            const snippets = await this.apiClient.getAllSnippets();
            
            if (!snippets || snippets.length === 0) {
                vscode.window.showInformationMessage('No snippets found.');
                return;
            }

            // Create or get the output channel
            const outputChannel = vscode.window.createOutputChannel('Tecspacs Snippets');
            outputChannel.show();

            // Format the snippet list nicely
            outputChannel.appendLine('📝 Your Snippets');
            outputChannel.appendLine('='.repeat(50));
            outputChannel.appendLine('');

            snippets.forEach((snippet, index) => {
                outputChannel.appendLine(`${index + 1}. ${snippet.title || snippet.name}`);
                outputChannel.appendLine(`   Language: ${snippet.language}`);
                if (snippet.description) {
                    outputChannel.appendLine(`   Description: ${snippet.description}`);
                }
                if (snippet.usage_count && snippet.usage_count > 0) {
                    outputChannel.appendLine(`   Used: ${snippet.usage_count} times`);
                }
                outputChannel.appendLine('');
            });

            outputChannel.appendLine(`Total: ${snippets.length} snippet(s)`);
            
            vscode.window.showInformationMessage(`📝 Listed ${snippets.length} snippets in the output panel`);
            Logger.info(`Listed ${snippets.length} snippets`);

        } catch (error) {
            Logger.error('Error listing snippets', error as Error);
            vscode.window.showErrorMessage('Failed to list snippets. Check the output panel for details.');
        }
    }

    async listPackages(): Promise<void> {
        try {
            Logger.info('Listing all packages...');

            // Check if user is authenticated
            const isAuthenticated = await this.authManager.isAuthenticated();
            Logger.debug(`Authentication check result: ${isAuthenticated}`);
            
            if (!isAuthenticated) {
                const loginChoice = await vscode.window.showInformationMessage(
                    'You need to login first. Would you like to login now?',
                    'Yes', 'No'
                );
                
                if (loginChoice === 'Yes') {
                    await this.login();
                    if (!await this.authManager.isAuthenticated()) {
                        Logger.warn('Login completed but authentication still failed');
                        return;
                    }
                } else {
                    Logger.info('Login cancelled by user');
                    return;
                }
            }

            const packages = await this.apiClient.getAllPackages();
            
            if (!packages || packages.length === 0) {
                vscode.window.showInformationMessage('No packages found.');
                return;
            }

            // Create or get the output channel
            const outputChannel = vscode.window.createOutputChannel('Tecspacs Packages');
            outputChannel.show();

            // Format the package list nicely
            outputChannel.appendLine('📦 Your Packages');
            outputChannel.appendLine('='.repeat(50));
            outputChannel.appendLine('');

            packages.forEach((pkg, index) => {
                outputChannel.appendLine(`${index + 1}. ${pkg.name}`);
                if (pkg.description) {
                    outputChannel.appendLine(`   Description: ${pkg.description}`);
                }
                if (pkg.dependencies) {
                    outputChannel.appendLine(`   Dependencies: ${pkg.dependencies}`);
                }
                if (pkg.files) {
                    outputChannel.appendLine(`   Files: ${pkg.files}`);
                }
                outputChannel.appendLine('');
            });

            outputChannel.appendLine(`Total: ${packages.length} package(s)`);
            
            vscode.window.showInformationMessage(`📦 Listed ${packages.length} packages in the output panel`);
            Logger.info(`Listed ${packages.length} packages`);

        } catch (error) {
            Logger.error('Error listing packages', error as Error);
            vscode.window.showErrorMessage('Failed to list packages. Check the output panel for details.');
        }
    }

    async insertSnippetById(snippetId: string): Promise<void> {
        try {
            Logger.info(`Inserting snippet with ID: ${snippetId}`);

            // Check if user is authenticated
            const isAuthenticated = await this.authManager.isAuthenticated();
            if (!isAuthenticated) {
                vscode.window.showErrorMessage('Please login first to use snippets.');
                return;
            }

            // Get the snippet from API
            const snippet = await this.apiClient.getSnippet(snippetId);
            
            if (!snippet) {
                vscode.window.showErrorMessage(`Snippet not found: ${snippetId}`);
                return;
            }

            // Insert snippet at cursor position
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                await editor.edit(editBuilder => {
                    const position = editor.selection.active;
                    editBuilder.insert(position, snippet.content);
                });
                
                Logger.info(`Inserted snippet: ${snippet.name}`);
                vscode.window.showInformationMessage(`✅ Snippet "${snippet.name}" inserted!`);
            } else {
                // Copy to clipboard if no active editor
                await vscode.env.clipboard.writeText(snippet.content);
                Logger.info(`Copied snippet to clipboard: ${snippet.name}`);
                vscode.window.showInformationMessage(`📋 Snippet "${snippet.name}" copied to clipboard!`);
            }

        } catch (error) {
            Logger.error('Error inserting snippet', error as Error);
            vscode.window.showErrorMessage('Failed to insert snippet. Check the output panel for details.');
        }
    }

    async viewPackageById(packageId: string): Promise<void> {
        try {
            Logger.info(`Viewing package with ID: ${packageId}`);

            // Check if user is authenticated
            const isAuthenticated = await this.authManager.isAuthenticated();
            if (!isAuthenticated) {
                const loginChoice = await vscode.window.showInformationMessage(
                    'You need to login to view package details. Would you like to login now?',
                    'Yes', 'No'
                );
                
                if (loginChoice === 'Yes') {
                    await this.login();
                    // Check authentication again after login
                    if (!await this.authManager.isAuthenticated()) {
                        Logger.warn('Login completed but authentication still failed');
                        return;
                    }
                } else {
                    Logger.info('Login cancelled by user');
                    return;
                }
            }

            // Get the package from API
            const pkg = await this.apiClient.getPackage(packageId);
            
            if (!pkg) {
                vscode.window.showErrorMessage(`Package not found: ${packageId}`);
                return;
            }

            // Show package preview with action buttons
            await this.showPackagePreview(pkg);

        } catch (error) {
            Logger.error('Error viewing package', error as Error);
            vscode.window.showErrorMessage('Failed to view package. Check the output panel for details.');
        }
    }

    private async showPackagePreview(pkg: any): Promise<void> {
        // Parse dependencies and files - handle both string and array formats
        let dependencies: string[] = [];
        if (pkg.dependencies) {
            if (Array.isArray(pkg.dependencies)) {
                // If it's an array, join it first then split by comma
                dependencies = pkg.dependencies.join(',').split(',').map((d: string) => d.trim());
            } else {
                // If it's a string, split directly
                dependencies = pkg.dependencies.split(',').map((d: string) => d.trim());
            }
        }
        
        let files: string[] = [];
        if (pkg.files) {
            if (Array.isArray(pkg.files)) {
                // If it's an array, join it first then split by comma
                files = pkg.files.join(',').split(',').map((f: string) => f.trim());
            } else {
                // If it's a string, split directly
                files = pkg.files.split(',').map((f: string) => f.trim());
            }
        }

        // Create preview content
        const previewContent = `📦 Package: ${pkg.name}
${'='.repeat(60)}

📝 Description: ${pkg.description || 'No description provided'}

📁 Files that will be created (${files.length}):
${files.length > 0 ? files.map((file: string, index: number) => `   ${index + 1}. ${file}`).join('\n') : '   No files specified'}

📦 Dependencies (${dependencies.length}):
${dependencies.length > 0 ? dependencies.map((dep: string, index: number) => `   ${index + 1}. ${dep}`).join('\n') : '   No dependencies specified'}

📅 Created: ${pkg.created_at ? new Date(pkg.created_at).toLocaleString() : 'Unknown'}
🔄 Updated: ${pkg.updated_at ? new Date(pkg.updated_at).toLocaleString() : 'Unknown'}

${'='.repeat(60)}
Package ID: ${pkg.id || pkg._id || 'Unknown'}

💡 This package will create the file structure above in your workspace.
   Dependencies will NOT be automatically installed.`;

        // Create preview document
        const document = await vscode.workspace.openTextDocument({
            content: previewContent,
            language: 'markdown'
        });

        const editor = await vscode.window.showTextDocument(document, { preview: false });

        // Show action buttons
        const action = await vscode.window.showInformationMessage(
            `📦 Package "${pkg.name}" - What would you like to do?`,
            'Preview Files',
            'Install Package',
            'Cancel'
        );

        if (action === 'Preview Files') {
            await this.previewPackageFiles(pkg, files);
        } else if (action === 'Install Package') {
            await this.installPackage(pkg, files, dependencies);
        } else {
            Logger.info('Package preview cancelled by user');
        }
    }

    private async previewPackageFiles(pkg: any, files: string[]): Promise<void> {
        if (files.length === 0) {
            vscode.window.showInformationMessage('This package has no files to preview.');
            return;
        }

        // Create a webview panel to show file previews
        const panel = vscode.window.createWebviewPanel(
            'packagePreview',
            `Package Preview: ${pkg.name}`,
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        // Generate sample content for each file
        const filePreviews = files.map((fileName: string) => {
            const extension = fileName.split('.').pop()?.toLowerCase();
            let sampleContent = '';

            switch (extension) {
                case 'js':
                    sampleContent = `// ${fileName}
// Generated from package: ${pkg.name}

console.log('Hello from ${fileName}');

module.exports = {
    // Your code here
};`;
                    break;
                case 'ts':
                    sampleContent = `// ${fileName}
// Generated from package: ${pkg.name}

interface Config {
    // Your types here
}

export const config: Config = {
    // Your configuration
};`;
                    break;
                case 'json':
                    sampleContent = `{
  "name": "${fileName.replace('.json', '')}",
  "version": "1.0.0",
  "description": "Generated from package: ${pkg.name}",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "test": "echo \\"Error: no test specified\\" && exit 1"
  }
}`;
                    break;
                case 'html':
                    sampleContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${fileName.replace('.html', '')}</title>
</head>
<body>
    <h1>Generated from package: ${pkg.name}</h1>
    <p>This file was created from the package template.</p>
</body>
</html>`;
                    break;
                default:
                    sampleContent = `# ${fileName}
# Generated from package: ${pkg.name}

This file was created from the package template.
Add your content here.`;
            }

            return { fileName, content: sampleContent };
        });

        // Create HTML content for the webview
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Package Preview: ${pkg.name}</title>
                <style>
                    body { 
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
                        margin: 20px; 
                        background-color: #1e1e1e;
                        color: #d4d4d4;
                    }
                    .file-preview { 
                        margin-bottom: 30px; 
                        border: 1px solid #404040; 
                        border-radius: 4px; 
                        background-color: #252526;
                    }
                    .file-header { 
                        background: #2d2d30; 
                        padding: 12px; 
                        border-bottom: 1px solid #404040; 
                        font-weight: bold; 
                        color: #cccccc;
                        font-size: 14px;
                    }
                    .file-content { 
                        padding: 15px; 
                        background: #1e1e1e; 
                        font-family: 'Consolas', 'Monaco', 'Courier New', monospace; 
                        white-space: pre-wrap; 
                        color: #d4d4d4;
                        font-size: 13px;
                        line-height: 1.4;
                    }
                    .package-info { 
                        background: #0e639c; 
                        padding: 15px; 
                        border-radius: 4px; 
                        margin-bottom: 20px; 
                        color: #ffffff;
                        border: 1px solid #007acc;
                    }
                    .package-info h2 {
                        margin: 0 0 10px 0;
                        color: #ffffff;
                        font-size: 18px;
                    }
                    .package-info p {
                        margin: 5px 0;
                        color: #e6f3ff;
                    }
                    /* Syntax highlighting for better readability */
                    .file-content .comment { color: #6a9955; }
                    .file-content .keyword { color: #569cd6; }
                    .file-content .string { color: #ce9178; }
                    .file-content .function { color: #dcdcaa; }
                </style>
            </head>
            <body>
                <div class="package-info">
                    <h2>📦 Package: ${pkg.name}</h2>
                    <p><strong>Description:</strong> ${pkg.description || 'No description'}</p>
                    <p><strong>Files:</strong> ${files.length} file(s)</p>
                </div>
                
                ${filePreviews.map(file => `
                    <div class="file-preview">
                        <div class="file-header">📄 ${file.fileName}</div>
                        <div class="file-content">${file.content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
                    </div>
                `).join('')}
                
                <div style="margin-top: 20px; padding: 15px; background: #2d2d30; border: 1px solid #404040; border-radius: 4px; color: #d4d4d4;">
                    <strong>💡 Note:</strong> These are sample file contents. The actual files will be created with this structure when you install the package.
                </div>
            </body>
            </html>
        `;

        panel.webview.html = htmlContent;
    }

    private async installPackage(pkg: any, files: string[], dependencies: string[]): Promise<void> {
        // Ensure dependencies and files are properly parsed
        let parsedDependencies: string[] = [];
        if (dependencies && dependencies.length > 0) {
            parsedDependencies = dependencies;
        } else if (pkg.dependencies) {
            if (Array.isArray(pkg.dependencies)) {
                parsedDependencies = pkg.dependencies.join(',').split(',').map((d: string) => d.trim());
            } else {
                parsedDependencies = pkg.dependencies.split(',').map((d: string) => d.trim());
            }
        }
        
        let parsedFiles: string[] = [];
        if (files && files.length > 0) {
            parsedFiles = files;
        } else if (pkg.files) {
            if (Array.isArray(pkg.files)) {
                parsedFiles = pkg.files.join(',').split(',').map((f: string) => f.trim());
            } else {
                parsedFiles = pkg.files.split(',').map((f: string) => f.trim());
            }
        }
        try {
            // Ask user where to install
            const installLocation = await vscode.window.showQuickPick([
                'Install in current workspace',
                'Create new folder for package'
            ], {
                placeHolder: 'Where would you like to install the package?'
            });

            if (!installLocation) {
                Logger.info('Package installation cancelled');
                return;
            }

            let targetFolder: vscode.Uri;
            let folderName: string;

            if (installLocation === 'Create new folder for package') {
                // Create new folder
                folderName = pkg.name.replace(/[^a-zA-Z0-9-_]/g, '_');
                const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
                
                if (!workspaceFolder) {
                    vscode.window.showErrorMessage('No workspace folder found. Please open a folder first.');
                    return;
                }

                targetFolder = vscode.Uri.joinPath(workspaceFolder.uri, folderName);
                
                // Create the folder
                try {
                    await vscode.workspace.fs.createDirectory(targetFolder);
                } catch (error) {
                    vscode.window.showErrorMessage(`Failed to create folder: ${folderName}`);
                    return;
                }
            } else {
                // Use current workspace
                const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
                if (!workspaceFolder) {
                    vscode.window.showErrorMessage('No workspace folder found. Please open a folder first.');
                    return;
                }
                targetFolder = workspaceFolder.uri;
                folderName = workspaceFolder.name;
            }

            // Create files
            const createdFiles: string[] = [];
            
            for (const fileName of parsedFiles) {
                const fileUri = vscode.Uri.joinPath(targetFolder, fileName);
                
                // Generate file content based on file type
                const extension = fileName.split('.').pop()?.toLowerCase();
                let fileContent = '';

                switch (extension) {
                    case 'js':
                        fileContent = `// ${fileName}
// Generated from package: ${pkg.name}

console.log('Hello from ${fileName}');

module.exports = {
    // Your code here
};`;
                        break;
                    case 'ts':
                        fileContent = `// ${fileName}
// Generated from package: ${pkg.name}

interface Config {
    // Your types here
}

export const config: Config = {
    // Your configuration
};`;
                        break;
                    case 'json':
                        fileContent = `{
  "name": "${fileName.replace('.json', '')}",
  "version": "1.0.0",
  "description": "Generated from package: ${pkg.name}",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "test": "echo \\"Error: no test specified\\" && exit 1"
  }
}`;
                        break;
                    case 'html':
                        fileContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${fileName.replace('.html', '')}</title>
</head>
<body>
    <h1>Generated from package: ${pkg.name}</h1>
    <p>This file was created from the package template.</p>
</body>
</html>`;
                        break;
                    default:
                        fileContent = `# ${fileName}
# Generated from package: ${pkg.name}

This file was created from the package template.
Add your content here.`;
                }

                try {
                    await vscode.workspace.fs.writeFile(fileUri, Buffer.from(fileContent, 'utf8'));
                    createdFiles.push(fileName);
                } catch (error) {
                    Logger.error(`Failed to create file: ${fileName}`, error as Error);
                }
            }

            // Show success message with next steps
            const nextSteps = [];
            if (parsedDependencies.length > 0) {
                nextSteps.push(`📦 Install dependencies: ${parsedDependencies.join(', ')}`);
            }
            nextSteps.push('📁 Files are ready in your workspace');

            const nextAction = await vscode.window.showInformationMessage(
                `✅ Package "${pkg.name}" installed successfully!\n\n📁 Created ${createdFiles.length} files in: ${folderName}\n\n${nextSteps.join('\n')}`,
                'Open Folder',
                'Install Dependencies',
                'Close'
            );

            if (nextAction === 'Open Folder') {
                // Open the folder in a new window
                await vscode.commands.executeCommand('vscode.openFolder', targetFolder);
            } else if (nextAction === 'Install Dependencies' && parsedDependencies.length > 0) {
                // Show guidance for installing dependencies
                const terminal = vscode.window.createTerminal('Package Dependencies');
                terminal.show();
                
                if (parsedDependencies.includes('npm')) {
                    terminal.sendText('npm install');
                } else if (parsedDependencies.includes('yarn')) {
                    terminal.sendText('yarn install');
                } else if (parsedDependencies.includes('pip')) {
                    terminal.sendText('pip install -r requirements.txt');
                } else {
                    terminal.sendText(`# Install dependencies: ${parsedDependencies.join(', ')}`);
                }
            }

            Logger.info(`Package "${pkg.name}" installed successfully with ${createdFiles.length} files`);

        } catch (error) {
            Logger.error('Error installing package', error as Error);
            vscode.window.showErrorMessage('Failed to install package. Check the output panel for details.');
        }
    }

    async searchSnippets(): Promise<void> {
        try {
            Logger.info('Searching snippets...');
            const isAuthenticated = await this.authManager.isAuthenticated();
            if (!isAuthenticated) {
                vscode.window.showInformationMessage('Please login to search snippets.');
                return;
            }
            const snippets = await this.apiClient.getAllSnippets();
            if (!snippets || snippets.length === 0) {
                vscode.window.showInformationMessage('No snippets found.');
                return;
            }
            const items: SnippetQuickPickItem[] = snippets.map((snippet: SnippetSummary) => ({
                label: `$(code) ${snippet.title || snippet.name}`,
                description: snippet.description || '',
                detail: `${snippet.language} • Used ${snippet.usage_count || 0} times`,
                snippet: snippet
            }));
            const selected = await vscode.window.showQuickPick(items, {
                placeHolder: 'Search and select a snippet...',
                matchOnDescription: true,
                matchOnDetail: true,
                canPickMany: false
            });
            if (selected) {
                await this.insertSnippetById(selected.snippet.id || "");
            }
        } catch (error) {
            Logger.error('Error searching snippets', error as Error);
            vscode.window.showErrorMessage('Failed to search snippets.');
        }
    }

    async searchPackages(): Promise<void> {
        try {
            Logger.info('Searching packages...');
            const isAuthenticated = await this.authManager.isAuthenticated();
            if (!isAuthenticated) {
                vscode.window.showInformationMessage('Please login to search packages.');
                return;
            }
            const packages = await this.apiClient.getAllPackages();
            if (!packages || packages.length === 0) {
                vscode.window.showInformationMessage('No packages found.');
                return;
            }
            const items = packages.map((pkg: PackageSummary) => ({
                label: `$(package) ${pkg.title || pkg.name}`,
                description: pkg.description || '',
                detail: `${pkg.version ? pkg.version + ' • ' : ''}Used ${pkg.usage_count || 0} times`,
                pkg: pkg
            }));
            const selected = await vscode.window.showQuickPick(items, {
                placeHolder: 'Search and select a package...',
                matchOnDescription: true,
                matchOnDetail: true,
                canPickMany: false
            });
            if (selected) {
                await this.viewPackageById(selected.pkg.id || "");
            }
        } catch (error) {
            Logger.error('Error searching packages', error as Error);
            vscode.window.showErrorMessage('Failed to search packages.');
        }
    }

    async openWebApp(): Promise<void> {
        try {
            const config = (await import('../utils/config')).getConfig();
            const fullConfig = config.getFullConfig();
            const frontendUrl = (fullConfig as any).frontendUrl ? (fullConfig as any).frontendUrl : 'https://frontend-nine-rosy-50.vercel.app/';
            vscode.env.openExternal(vscode.Uri.parse(frontendUrl));
        } catch (error) {
            Logger.error('Error opening web app', error as Error);
            vscode.window.showErrorMessage('Failed to open web app.');
        }
    }

    async showAllSnippets(): Promise<void> {
        try {
            Logger.info('Showing all snippets for debugging...');

            // Get all snippets from API
            const snippets = await this.apiClient.getAllSnippets();
            
            if (!snippets || snippets.length === 0) {
                vscode.window.showInformationMessage('No snippets found.');
                return;
            }

            // Create quick pick items with better formatting
            const items = snippets.map((snippet: any) => ({
                label: `$(code) ${snippet.title || snippet.name}`,
                description: snippet.description || '',
                detail: `${snippet.language} • By ${snippet.createdBy?.username || 'Unknown'} • ${snippet.usage_count || 0} uses`,
                snippet: snippet
            }));

            // Show quick pick with search functionality
            const selected = await vscode.window.showQuickPick(items, {
                placeHolder: 'All snippets (for debugging)...',
                matchOnDescription: true,
                matchOnDetail: true,
                canPickMany: false
            });

            if (!selected) {
                Logger.info('No snippet selected');
                return;
            }

            // Show snippet details for debugging
            const snippet = selected.snippet;
            const debugContent = `🔍 Debug: Snippet Details
${'='.repeat(60)}

📝 Name: ${snippet.title || snippet.name}
👤 Created by: ${snippet.createdBy?.username || 'Unknown'}
🆔 Created by ID: ${snippet.createdBy?._id || 'Unknown'}
🔤 Language: ${snippet.language}
📅 Created: ${snippet.created_at ? new Date(snippet.created_at).toLocaleString() : 'Unknown'}

📝 Description: ${snippet.description || 'No description provided'}

💻 Content:
\`\`\`${snippet.language}
${snippet.content}
\`\`\`

${'='.repeat(60)}
💡 This shows all snippet details for debugging user filtering.`;

            // Create debug document
            const document = await vscode.workspace.openTextDocument({
                content: debugContent,
                language: 'markdown'
            });

            await vscode.window.showTextDocument(document, { preview: false });

        } catch (error) {
            Logger.error('Error showing all snippets', error as Error);
            vscode.window.showErrorMessage('Failed to show all snippets. Check the output panel for details.');
        }
    }
} 