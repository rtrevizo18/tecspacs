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
exports.getConfig = exports.Config = void 0;
const vscode = __importStar(require("vscode"));
const logger_1 = require("./logger");
class Config {
    constructor() {
        // Load configuration from extension settings or environment
        this.config = this.loadConfig();
    }
    static getInstance() {
        if (!Config.instance) {
            Config.instance = new Config();
        }
        return Config.instance;
    }
    loadConfig() {
        // Try to get from VS Code settings first
        const settings = vscode.workspace.getConfiguration('tecspacs');
        const config = {
            auth0: {
                domain: settings.get('auth0.domain') || 'dev-z8vumng8vd7v16a5.us.auth0.com',
                clientId: settings.get('auth0.clientId') || 'nGV0n1wKc25rvRNK6qyQEOyjN83i7wWB',
                audience: settings.get('auth0.audience') || 'https://api.tecspacs.dev'
            },
            api: {
                baseUrl: settings.get('api.baseUrl') || 'https://821f1e79957c.ngrok-free.app'
            }
        };
        logger_1.Logger.debug('Configuration loaded: ' + JSON.stringify(config));
        return config;
    }
    getAuth0Config() {
        return this.config.auth0;
    }
    getApiConfig() {
        return this.config.api;
    }
    getFullConfig() {
        return this.config;
    }
    // Update configuration (for testing or dynamic updates)
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        logger_1.Logger.debug('Configuration updated: ' + JSON.stringify(this.config));
    }
}
exports.Config = Config;
// Export a convenience function
const getConfig = () => Config.getInstance();
exports.getConfig = getConfig;
//# sourceMappingURL=config.js.map