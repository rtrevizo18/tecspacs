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
exports.Logger = void 0;
const vscode = __importStar(require("vscode"));
class Logger {
    static getOutputChannel() {
        if (!Logger.outputChannel) {
            Logger.outputChannel = vscode.window.createOutputChannel('Tecspacs');
        }
        return Logger.outputChannel;
    }
    static info(message) {
        const timestamp = new Date().toISOString();
        const logMessage = `[INFO] ${timestamp}: ${message}`;
        Logger.getOutputChannel().appendLine(logMessage);
        console.log(logMessage);
    }
    static error(message, error) {
        const timestamp = new Date().toISOString();
        let logMessage = `[ERROR] ${timestamp}: ${message}`;
        if (error) {
            logMessage += `\n${error.stack || error.message}`;
        }
        Logger.getOutputChannel().appendLine(logMessage);
        console.error(logMessage);
    }
    static warn(message) {
        const timestamp = new Date().toISOString();
        const logMessage = `[WARN] ${timestamp}: ${message}`;
        Logger.getOutputChannel().appendLine(logMessage);
        console.warn(logMessage);
    }
    static debug(message) {
        const timestamp = new Date().toISOString();
        const logMessage = `[DEBUG] ${timestamp}: ${message}`;
        Logger.getOutputChannel().appendLine(logMessage);
        console.log(logMessage);
    }
    static showOutput() {
        Logger.getOutputChannel().show();
    }
    static clear() {
        Logger.getOutputChannel().clear();
    }
}
exports.Logger = Logger;
//# sourceMappingURL=logger.js.map