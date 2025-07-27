# tecspacs

**A powerful CLI tool for managing and sharing code snippets and packages across your development environments.**

---

## 🚀 Overview

tecspacs is a developer productivity tool that allows you to:

- 📚 Store code snippets (**TECs**) locally with syntax highlighting and organization
- 📦 Create reusable code packages (**PACs**) with dependencies and documentation
- 🌐 Share your snippets and packages with the community
- 🔍 Search and discover useful code from other developers
- 🔐 Secure your credentials across different computers

---

## 📦 Installation

> npm install -g tecspacs

---

## ⚡ Quick Start

# Log in to your account

> tecspacs login

# Create a new code snippet

> tecspacs create-tec my-snippet --language javascript --content "console.log('Hello world');"

# Get a snippet (copies to clipboard automatically)

> tecspacs get-tec my-snippet

# Create a package from a directory

> tecspacs create-pac my-package --source ./my-project-folder

# Share your snippet online

> tecspacs publish-tec my-snippet

# List all your tecs

> tecspacs list-tecs

---

## ✨ Features

### 📝 Code Snippets (tecs)

- Create, retrieve, update, and delete code snippets
- Organize by language and category
- Automatic syntax highlighting
- Usage tracking
- Clipboard integration
- Online sharing capabilities

### 📦 Code Packages (pacs)

- Bundle multiple files into reusable packages
- Version control for packages
- Dependency management
- Import/export functionality
- Documentation support

### ☁️ Online Integration

- User profiles
- Cloud storage for snippets and packages
- Community sharing
- Discover functionality

---

## 📚 Command Reference

### 🔐 General Commands

```bash
tecspacs login               # Authenticate with the TECspacs server
tecspacs logout              # Log out from the current session
```

### 📝 tecs Commands

```bash
tecspacs create-tec <name> [options]   # Create a new snippet
tecspacs get-tec <name>                # Retrieve a snippet
tecspacs update-tec <name> [options]   # Update an existing snippet
tecspacs delete-tec <name>             # Delete a snippet
tecspacs list-tecs [options]           # List all snippets
tecspacs get-my-tecs-online            # Get your online snippets
```

### 📦 pacs Commands

```bash
tecspacs create-pac <name> [options]   # Create a new package
tecspacs get-pac <name>                # Retrieve a package
tecspacs update-pac <name> [options]   # Update a package
tecspacs delete-pac <name>             # Delete a package
tecspacs list-pacs [options]           # List all packages
tecspacs get-my-pacs-online            # Get your online packages
```

### ☁️ Online Commands

```bash
tecspacs publish-tec <name>            # Publish a snippet online
tecspacs publish-pac <name>            # Publish a package online
tecspacs search <query>                # Search for online snippets and packages
```

---

## ⚙️ Configuration

tecspacs stores configuration in the standard user config directory:

- **macOS**: `~/Library/Preferences/tecspacs/`
- **Linux**: `~/.config/tecspacs/`
- **Windows**: `%APPDATA%\tecspacs\`

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

[MIT License](LICENSE)
