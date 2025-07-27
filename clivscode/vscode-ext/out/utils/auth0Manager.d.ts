import { UserConfig } from '../types';
import * as vscode from 'vscode';
export declare class Auth0Manager {
    private userConfig;
    private currentAuthCode;
    private context;
    setContext(context: vscode.ExtensionContext): void;
    private loadUserConfig;
    private saveUserConfig;
    private clearUserConfig;
    constructor();
    getCurrentAuthCode(): string | null;
    login(): Promise<UserConfig>;
    private pollForToken;
    private getUserProfile;
    private createBackendUserProfile;
    logout(): Promise<void>;
    getUserConfig(): Promise<UserConfig | null>;
    getBackendUserProfile(): Promise<any>;
    isAuthenticated(): Promise<boolean>;
    getToken(): Promise<string | null>;
    refreshTokenIfNeeded(): Promise<void>;
}
//# sourceMappingURL=auth0Manager.d.ts.map