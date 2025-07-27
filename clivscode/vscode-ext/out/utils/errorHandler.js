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
exports.ErrorHandler = void 0;
const vscode = __importStar(require("vscode"));
const logger_1 = require("./logger");
class ErrorHandler {
    static handle(error, context) {
        const errorMessage = this.formatErrorMessage(error, context);
        const userMessage = this.getUserFriendlyMessage(error);
        // Log the error
        logger_1.Logger.error(errorMessage, error instanceof Error ? error : undefined);
        // Show user-friendly message
        this.showUserMessage(userMessage, this.getErrorSeverity(error));
        return {
            success: false,
            message: userMessage,
            error: error instanceof Error ? error : new Error(error.message)
        };
    }
    static async handleAsync(operation, context, fallback) {
        try {
            const result = await operation();
            return {
                success: true,
                message: 'Operation completed successfully',
                data: result
            };
        }
        catch (error) {
            return this.handle(error, context);
        }
    }
    static formatErrorMessage(error, context) {
        const errorType = error instanceof Error ? 'Error' : 'TecspacsError';
        const errorCode = 'code' in error ? ` (${error.code})` : '';
        return `${context} - ${errorType}${errorCode}: ${error.message}`;
    }
    static getUserFriendlyMessage(error) {
        // Handle specific error types
        if ('code' in error) {
            switch (error.code) {
                case 'AUTH_REQUIRED':
                    return 'Please login to continue. Use "Tecspacs: Login" to authenticate.';
                case 'SNIPPET_NOT_FOUND':
                    return 'The requested snippet was not found.';
                case 'SNIPPET_ALREADY_EXISTS':
                    return 'A snippet with this name already exists. Please choose a different name.';
                case 'PACKAGE_NOT_FOUND':
                    return 'The requested package was not found.';
                case 'PACKAGE_ALREADY_EXISTS':
                    return 'A package with this name already exists. Please choose a different name.';
                case 'INVALID_INPUT':
                    return 'The provided input is invalid. Please check your input and try again.';
                case 'NETWORK_ERROR':
                    return 'Network error occurred. Please check your internet connection and try again.';
                case 'PERMISSION_DENIED':
                    return 'You don\'t have permission to perform this action.';
                default:
                    return error.message || 'An unexpected error occurred.';
            }
        }
        // Handle common error patterns
        const message = error.message.toLowerCase();
        if (message.includes('not found')) {
            return 'The requested item was not found.';
        }
        if (message.includes('already exists')) {
            return 'An item with this name already exists. Please choose a different name.';
        }
        if (message.includes('permission') || message.includes('access')) {
            return 'You don\'t have permission to perform this action.';
        }
        if (message.includes('network') || message.includes('connection')) {
            return 'Network error occurred. Please check your connection and try again.';
        }
        return error.message || 'An unexpected error occurred.';
    }
    static getErrorSeverity(error) {
        if ('code' in error) {
            switch (error.code) {
                case 'AUTH_REQUIRED':
                    return 'warning';
                case 'SNIPPET_NOT_FOUND':
                case 'PACKAGE_NOT_FOUND':
                    return 'info';
                case 'INVALID_INPUT':
                    return 'warning';
                default:
                    return 'error';
            }
        }
        const message = error.message.toLowerCase();
        if (message.includes('not found')) {
            return 'info';
        }
        if (message.includes('already exists') || message.includes('invalid')) {
            return 'warning';
        }
        return 'error';
    }
    static showUserMessage(message, severity) {
        switch (severity) {
            case 'error':
                vscode.window.showErrorMessage(message);
                break;
            case 'warning':
                vscode.window.showWarningMessage(message);
                break;
            case 'info':
                vscode.window.showInformationMessage(message);
                break;
        }
    }
    static createError(code, message, details) {
        return {
            code,
            message,
            details
        };
    }
    static validateSnippetName(name) {
        if (!name || name.trim() === '') {
            throw this.createError('INVALID_INPUT', 'Snippet name is required');
        }
        if (name.length > 100) {
            throw this.createError('INVALID_INPUT', 'Snippet name must be less than 100 characters');
        }
        if (!/^[a-zA-Z0-9-_]+$/.test(name)) {
            throw this.createError('INVALID_INPUT', 'Snippet name can only contain letters, numbers, hyphens, and underscores');
        }
    }
    static validatePackageName(name) {
        if (!name || name.trim() === '') {
            throw this.createError('INVALID_INPUT', 'Package name is required');
        }
        if (name.length > 100) {
            throw this.createError('INVALID_INPUT', 'Package name must be less than 100 characters');
        }
        if (!/^[a-zA-Z0-9-_]+$/.test(name)) {
            throw this.createError('INVALID_INPUT', 'Package name can only contain letters, numbers, hyphens, and underscores');
        }
    }
    static validateLanguage(language) {
        const validLanguages = [
            'javascript', 'typescript', 'python', 'java', 'csharp', 'cpp', 'c',
            'html', 'css', 'json', 'yaml', 'markdown', 'sql', 'bash', 'powershell'
        ];
        if (!validLanguages.includes(language.toLowerCase())) {
            throw this.createError('INVALID_INPUT', `Language must be one of: ${validLanguages.join(', ')}`);
        }
    }
}
exports.ErrorHandler = ErrorHandler;
//# sourceMappingURL=errorHandler.js.map