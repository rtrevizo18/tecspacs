export interface UserConfig {
    token: any;
    auth0Id: string;
    email: string;
    username: string;
    tecs?: any[];
    pacs?: any[];
    lastLogin?: string;
}
export declare class AuthManager {
    private userConfig;
    constructor();
    isAuthenticated(): Promise<boolean>;
    login(): Promise<void>;
    logout(): Promise<void>;
    getUserConfig(): Promise<UserConfig | null>;
    getToken(): Promise<string | null>;
}
//# sourceMappingURL=authManager.d.ts.map