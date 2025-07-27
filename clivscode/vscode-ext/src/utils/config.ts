import * as vscode from 'vscode';
import { Logger } from './logger';

export interface TecspacsConfig {
    auth0: {
        domain: string;
        clientId: string;
        audience: string;
    };
    api: {
        baseUrl: string;
    };
}

export class Config {
    private static instance: Config;
    private config: TecspacsConfig;

    private constructor() {
        // Load configuration from extension settings or environment
        this.config = this.loadConfig();
    }

    static getInstance(): Config {
        if (!Config.instance) {
            Config.instance = new Config();
        }
        return Config.instance;
    }

    private loadConfig(): TecspacsConfig {
        // Try to get from VS Code settings first
        const settings = vscode.workspace.getConfiguration('tecspacs');
        
        const config: TecspacsConfig = {
            auth0: {
                domain: settings.get('auth0.domain') || 'dev-z8vumng8vd7v16a5.us.auth0.com',
                clientId: settings.get('auth0.clientId') || 'nGV0n1wKc25rvRNK6qyQEOyjN83i7wWB',
                audience: settings.get('auth0.audience') || 'https://api.tecspacs.dev'
            },
            api: {
                baseUrl: settings.get('api.baseUrl') || 'https://821f1e79957c.ngrok-free.app'
            }
        };

        Logger.debug('Configuration loaded: ' + JSON.stringify(config));
        return config;
    }

    getAuth0Config() {
        return this.config.auth0;
    }

    getApiConfig() {
        return this.config.api;
    }

    getFullConfig(): TecspacsConfig {
        return this.config;
    }

    // Update configuration (for testing or dynamic updates)
    updateConfig(newConfig: Partial<TecspacsConfig>) {
        this.config = { ...this.config, ...newConfig };
        Logger.debug('Configuration updated: ' + JSON.stringify(this.config));
    }
}

// Export a convenience function
export const getConfig = () => Config.getInstance(); 