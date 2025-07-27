# Tecspacs VS Code Extension

A powerful VS Code extension for managing code snippets and packages with a beautiful visual interface.

## Features

### 🎯 Visual Interface
- **Personal Sidebar**: Browse your own snippets and packages in a clean tree view
- **Web Discovery**: Browse community content when you want to discover new things
- **Status Bar Integration**: See your login status at a glance
- **Quick Actions**: Click to insert snippets or view package details

### 📝 Snippet Management
- **Personal Snippets**: View only your own snippets in the sidebar
- **Community Discovery**: Browse snippets from other developers when needed
- **Insert Snippets**: Click any snippet to insert it at your cursor position
- **Create Snippets**: Create new snippets from selected text or manual input
- **Search & Filter**: Find snippets quickly with the built-in search

### 📦 Package Management
- **Personal Packages**: View only your own packages in the sidebar
- **Community Discovery**: Browse packages from other developers when needed
- **Package Preview**: Preview files and dependencies before installing
- **Install Packages**: Create actual project files from package templates
- **Smart File Generation**: Automatically generates appropriate file content based on file type
- **Installation Options**: Choose to install in current workspace or create new folder
- **Dependency Guidance**: Get help with installing dependencies after package installation

### 🔐 Authentication
- **Seamless Login**: One-click login with Auth0
- **Status Indicators**: Always know your authentication status
- **Auto-refresh**: Automatically refresh content when you log in/out

## Getting Started

1. **Install the Extension**: The extension will appear in your VS Code extensions panel
2. **Login**: Click the Tecspacs icon in the status bar or use the command palette
3. **Browse Your Content**: Open the Tecspacs sidebar to see your personal snippets and packages
4. **Discover Community**: Use "Browse Web Snippets/Packages" to find content from other developers
5. **Use**: Click on snippets to insert them, or packages to view details

## Commands

### Main Commands
- `Tecspacs: Login` - Authenticate with your account
- `Tecspacs: Logout` - Sign out of your account
- `Tecspacs: Show Profile` - View your profile information
- `Tecspacs: Refresh` - Refresh the sidebar content

### Snippet Commands
- `Tecspacs: Get Snippet` - Search and insert a snippet
- `Tecspacs: Create Snippet` - Create a new snippet
- `Tecspacs: List All Snippets` - Show all snippets in output panel

### Package Commands
- `Tecspacs: Get Package` - Search and view a package
- `Tecspacs: Create Package` - Create a new package
- `Tecspacs: List All Packages` - Show all packages in output panel

## Usage Examples

### Creating a Snippet
1. Select some code in your editor
2. Open the Tecspacs sidebar
3. Click "➕ Create New Snippet"
4. Choose to use selected text or enter new content
5. Add a name, language, and description
6. Your snippet is now available in the sidebar!

### Using Your Snippets
1. Open the Tecspacs sidebar
2. Expand the "📝 My Snippets" section
3. Click on any snippet to insert it at your cursor
4. The snippet will be inserted immediately!

### Discovering Community Snippets
1. Open the Tecspacs sidebar
2. Click "🌐 Browse Web Snippets"
3. Search and select a snippet to preview
4. Choose to copy to clipboard or insert at cursor

### Installing Your Packages
1. Open the Tecspacs sidebar
2. Expand the "📦 My Packages" section
3. Click on any package to preview it
4. Choose "Preview Files" to see what will be created
5. Choose "Install Package" to create the files in your workspace
6. Select installation location (current workspace or new folder)
7. Review the generated files and get guidance on installing dependencies

### Discovering Community Packages
1. Open the Tecspacs sidebar
2. Click "🌐 Browse Web Packages"
3. Search and select a package to preview
4. Choose to install the package in your workspace

### Package Features
- **Preview Before Installing**: See exactly what files and dependencies will be created
- **Smart File Generation**: Files are created with appropriate content based on file type
- **Installation Options**: Install in current workspace or create a new project folder
- **Dependency Guidance**: Get help with installing npm, yarn, pip, or other dependencies
- **Project Templates**: Use packages as project templates for consistent project structures

## Status Bar

The status bar shows your current authentication status:
- 🔄 **Loading**: Extension is initializing
- 🔑 **Sign In**: You need to login
- ✅ **Logged In**: You're authenticated and ready to use

## Configuration

The extension uses your backend API configuration. Make sure your API is running and accessible.

## Troubleshooting

If you encounter issues:
1. Check the Output panel for detailed logs
2. Try refreshing the sidebar with `Tecspacs: Refresh`
3. Re-authenticate if needed
4. Check your network connection to the API

## Development

This extension is built with TypeScript and uses the VS Code Extension API. The main components are:

- **Tree Data Provider**: Manages the sidebar view
- **Commands**: Handle user interactions
- **API Client**: Communicates with your backend
- **Auth Manager**: Handles authentication flow

## What's New

The extension now provides a **visual, interactive interface** instead of just command-line operations. You can:

- Browse snippets and packages visually
- Click to insert snippets directly into your code
- View package details in formatted documents
- See your authentication status at a glance
- Use quick actions from the sidebar

This makes the extension much more useful for daily development workflow! 