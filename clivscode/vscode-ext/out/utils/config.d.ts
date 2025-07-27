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
export declare class Config {
    private static instance;
    private config;
    private constructor();
    static getInstance(): Config;
    private loadConfig;
    getAuth0Config(): {
        domain: string;
        clientId: string;
        audience: string;
    };
    getApiConfig(): {
        baseUrl: string;
    };
    getFullConfig(): TecspacsConfig;
    updateConfig(newConfig: Partial<TecspacsConfig>): void;
}
export declare const getConfig: () => Config;
//# sourceMappingURL=config.d.ts.map