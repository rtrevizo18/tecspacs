// Shared type definitions for Tecspacs extension and CLI

export interface Snippet {
    id?: string;
    name?: string;
    title?: string;
    content: string;
    language: string;
    description?: string;
    usage_count?: number;
    file_path?: string;
    created_at?: string;
    updated_at?: string;
}

export interface SnippetSummary {
    id?: string;
    name?: string;
    title?: string;
    language: string;
    description?: string;
    usage_count?: number;
    created_at?: string;
}

export interface Package {
    id?: string;
    name: string;
    description: string;
    dependencies?: string;
    files?: string;
    created_at?: string;
    updated_at?: string;
}

export interface PackageSummary {
    id?: string;
    name: string;
    description: string;
    dependencies?: string;
    files?: string;
    created_at?: string;
}

export interface UserConfig {
    token: any;
    auth0Id: string;
    email: string;
    username: string;
    tecs?: SnippetSummary[];
    pacs?: PackageSummary[];
    lastLogin?: string;
}

export interface AuthToken {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
    token_type?: string;
}

export interface CreateSnippetOptions {
    name: string;
    content: string;
    language: string;
    description?: string;
}

export interface CreatePackageOptions {
    name: string;
    description: string;
    dependencies?: string;
    files?: string;
}

export interface UpdateSnippetOptions {
    content?: string;
    description?: string;
    language?: string;
}

export interface UpdatePackageOptions {
    version?: string;
    description?: string;
    language?: string;
    category?: string;
    author?: string;
    manifest?: any;
}

// Error types
export interface TecspacsError {
    code: string;
    message: string;
    details?: any;
}

// API Response types
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: TecspacsError;
}

// Configuration types
export interface ExtensionConfig {
    defaultLanguage?: string;
    defaultCategory?: string;
    autoSave?: boolean;
    showOutputPanel?: boolean;
    maxSnippetsInPicker?: number;
}

// Command result types
export interface CommandResult {
    success: boolean;
    message: string;
    data?: any;
    error?: Error;
} 