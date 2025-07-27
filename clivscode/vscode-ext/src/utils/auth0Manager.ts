import axios from 'axios';
import { Logger } from './logger';
import { getConfig } from './config';
import { AuthToken, UserConfig } from '../types';
import { ErrorHandler } from './errorHandler';
import * as vscode from 'vscode';

export class Auth0Manager {
    private userConfig: UserConfig | null = null;
    private currentAuthCode: string | null = null;
    private context: vscode.ExtensionContext | null = null;

    setContext(context: vscode.ExtensionContext) {
        this.context = context;
        // Load saved user config on initialization
        this.loadUserConfig().catch(error => {
            Logger.error('Failed to load user config during initialization', error as Error);
        });
    }

    private async loadUserConfig(): Promise<void> {
        try {
            if (!this.context) return;
            
            const savedConfig = this.context.globalState.get('userConfig');
            if (savedConfig) {
                this.userConfig = savedConfig as UserConfig;
                Logger.debug('Loaded saved user configuration');
            }
        } catch (error) {
            Logger.error('Failed to load user configuration', error as Error);
        }
    }

    private async saveUserConfig(): Promise<void> {
        try {
            if (!this.context || !this.userConfig) return;
            
            await this.context.globalState.update('userConfig', this.userConfig);
            Logger.debug('Saved user configuration');
        } catch (error) {
            Logger.error('Failed to save user configuration', error as Error);
        }
    }

    private async clearUserConfig(): Promise<void> {
        try {
            if (!this.context) return;
            
            await this.context.globalState.update('userConfig', undefined);
            Logger.debug('Cleared user configuration');
        } catch (error) {
            Logger.error('Failed to clear user configuration', error as Error);
        }
    }

    constructor() {
        Logger.debug('Auth0Manager initialized');
    }

    getCurrentAuthCode(): string | null {
        return this.currentAuthCode;
    }

    async login(): Promise<UserConfig> {
        try {
            Logger.info('Starting Auth0 device flow login...');
            
            const config = getConfig();
            const auth0Config = config.getAuth0Config();
            
            // Step 1: Get device authorization
            const deviceAuthResponse = await axios.post(
                `https://${auth0Config.domain}/oauth/device/code`,
                {
                    client_id: auth0Config.clientId,
                    audience: auth0Config.audience,
                    scope: 'openid profile email'
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            const { device_code, user_code, verification_uri, expires_in, interval } = deviceAuthResponse.data;

            // Store the current auth code
            this.currentAuthCode = user_code;

            // Show user the verification code prominently
            const message = `Please visit ${verification_uri} and enter code: ${user_code}`;
            Logger.info(message);
            
            // Show the code in a more prominent way
            const vscode = await import('vscode');
            
            // Show it in the status bar for easy reference
            const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
            statusBarItem.text = `$(key) Code: ${user_code}`;
            statusBarItem.tooltip = `Click to copy code: ${user_code}`;
            statusBarItem.command = 'tecspacs.copyCode';
            statusBarItem.show();
            
            // Auto-hide status bar item after expiration
            setTimeout(() => {
                statusBarItem.dispose();
                this.currentAuthCode = null; // Clear the stored code
            }, expires_in * 1000);
            
            // Show the main authentication notification with improved UX
            const action = await vscode.window.showInformationMessage(
                `🔐 Authentication Code: ${user_code}\n\nPlease visit ${verification_uri} and enter the code above.\n\nThis code will expire in ${Math.floor(expires_in / 60)} minutes.`,
                'Copy Code & Open Browser', 'Copy Code Only', 'Open Browser Only'
            );

            if (action === 'Copy Code & Open Browser') {
                // Do both actions: copy code and open browser
                await vscode.env.clipboard.writeText(user_code);
                const open = await import('open');
                open.default(verification_uri);
                
                // Show confirmation
                vscode.window.showInformationMessage(`✅ Code copied and browser opened! Paste the code on the Auth0 page.\n\nYou can return to VS Code - authentication will complete automatically.`);
                
            } else if (action === 'Copy Code Only') {
                // Just copy the code
                await vscode.env.clipboard.writeText(user_code);
                vscode.window.showInformationMessage(`✅ Code "${user_code}" copied to clipboard!`);
                
                // Wait a moment, then show the browser option again
                setTimeout(async () => {
                    const openBrowser = await vscode.window.showInformationMessage(
                        `🔐 Ready to authenticate? Visit ${verification_uri} to continue.`,
                        'Open Browser'
                    );
                    
                    if (openBrowser === 'Open Browser') {
                        const open = await import('open');
                        open.default(verification_uri);
                    }
                }, 1000);
                
            } else if (action === 'Open Browser Only') {
                // Just open browser
                const open = await import('open');
                open.default(verification_uri);
                
                // Show a reminder about the code
                vscode.window.showInformationMessage(`🌐 Browser opened! Don't forget to copy the code: ${user_code}\n\nYou can return to VS Code - authentication will complete automatically.`);
            }

            // Step 2: Poll for token
            const token = await this.pollForToken(device_code, interval, expires_in, auth0Config);
            
            // Step 3: Get user profile from Auth0
            const userProfile = await this.getUserProfile(token.access_token);
            
            // Step 4: Create/Get user profile from backend API
            const backendUserProfile = await this.createBackendUserProfile(token.access_token, userProfile);
            
            // Step 5: Save user config
            this.userConfig = {
                token: token,
                auth0Id: userProfile.sub,
                email: userProfile.email,
                username: userProfile.name || userProfile.email,
                tecs: backendUserProfile.tecs || [],
                pacs: backendUserProfile.pacs || [],
                lastLogin: new Date().toISOString()
            };

            // Save to persistent storage
            await this.saveUserConfig();

            Logger.info('Auth0 login completed successfully');
            return this.userConfig;

        } catch (error) {
            Logger.error('Auth0 login failed', error as Error);
            throw ErrorHandler.createError('AUTH_FAILED', 'Authentication failed. Please try again.');
        }
    }

    private async pollForToken(
        deviceCode: string, 
        interval: number, 
        expiresIn: number, 
        auth0Config: any
    ): Promise<AuthToken> {
        const startTime = Date.now();
        const maxWaitTime = expiresIn * 1000; // Convert to milliseconds

        while (Date.now() - startTime < maxWaitTime) {
            try {
                const response = await axios.post(
                    `https://${auth0Config.domain}/oauth/token`,
                    {
                        grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
                        device_code: deviceCode,
                        client_id: auth0Config.clientId
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                );

                if (response.data.access_token) {
                    Logger.info('Token received successfully');
                    return response.data;
                }

            } catch (error: any) {
                if (error.response?.data?.error === 'authorization_pending') {
                    // Still waiting for user authorization
                    Logger.debug('Waiting for user authorization...');
                } else if (error.response?.data?.error === 'slow_down') {
                    // Rate limited, increase interval
                    interval = Math.min(interval * 2, 60);
                    Logger.debug('Rate limited, increased polling interval');
                } else {
                    // Other error
                    throw error;
                }
            }

            // Wait before next poll
            await new Promise(resolve => setTimeout(resolve, interval * 1000));
        }

        throw ErrorHandler.createError('AUTH_TIMEOUT', 'Authentication timed out. Please try again.');
    }

    private async getUserProfile(accessToken: string): Promise<any> {
        try {
            const config = getConfig();
            const auth0Config = config.getAuth0Config();
            
            const response = await axios.get(
                `https://${auth0Config.domain}/userinfo`,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                }
            );

            return response.data;
        } catch (error) {
            Logger.error('Failed to get user profile', error as Error);
            throw ErrorHandler.createError('PROFILE_FETCH_FAILED', 'Failed to fetch user profile.');
        }
    }

    private async createBackendUserProfile(accessToken: string, auth0Profile: any): Promise<any> {
        try {
            const config = getConfig();
            const apiConfig = config.getApiConfig();
            
            Logger.debug('Creating/Getting user profile from backend API...');
            
            const response = await axios.get(
                `${apiConfig.baseUrl}/api/users/me`,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                }
            );

            Logger.info('Backend user profile created/retrieved successfully');
            return response.data;
        } catch (error) {
            Logger.error('Failed to create/get backend user profile', error as Error);
            throw ErrorHandler.createError('BACKEND_PROFILE_FAILED', 'Failed to create user profile on backend.');
        }
    }

    async logout(): Promise<void> {
        try {
            Logger.info('Logging out...');
            this.userConfig = null;
            await this.clearUserConfig();
            Logger.info('Logout completed');
        } catch (error) {
            Logger.error('Logout failed', error as Error);
            throw error;
        }
    }

    async getUserConfig(): Promise<UserConfig | null> {
        return this.userConfig;
    }

    async getBackendUserProfile(): Promise<any> {
        try {
            if (!this.userConfig || !this.userConfig.token) {
                return null;
            }

            const config = getConfig();
            const apiConfig = config.getApiConfig();
            
            const response = await axios.get(
                `${apiConfig.baseUrl}/api/users/me`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.userConfig.token.access_token}`
                    }
                }
            );

            return response.data;
        } catch (error) {
            Logger.error('Failed to get backend user profile', error as Error);
            return null;
        }
    }

    async isAuthenticated(): Promise<boolean> {
        try {
            if (!this.userConfig || !this.userConfig.token) {
                return false;
            }

            // Check if token is expired
            const token = this.userConfig.token;
            if (token.expires_in && token.expires_at) {
                const now = Date.now();
                if (now >= token.expires_at) {
                    Logger.debug('Token expired, clearing user config');
                    this.userConfig = null;
                    return false;
                }
            }

            return true;
        } catch (error) {
            Logger.error('Error checking authentication', error as Error);
            return false;
        }
    }

    async getToken(): Promise<string | null> {
        try {
            const config = await this.getUserConfig();
            return config?.token?.access_token || null;
        } catch (error) {
            Logger.error('Error getting token', error as Error);
            return null;
        }
    }

    async refreshTokenIfNeeded(): Promise<void> {
        // TODO: Implement token refresh logic
        // For now, we'll just check if token is valid
        const isValid = await this.isAuthenticated();
        if (!isValid) {
            throw ErrorHandler.createError('AUTH_REQUIRED', 'Authentication required. Please login again.');
        }
    }
} 