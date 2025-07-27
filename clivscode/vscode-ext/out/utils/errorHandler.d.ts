import { TecspacsError, CommandResult } from '../types';
export declare class ErrorHandler {
    static handle(error: Error | TecspacsError, context: string): CommandResult;
    static handleAsync<T>(operation: () => Promise<T>, context: string, fallback?: T): Promise<CommandResult>;
    private static formatErrorMessage;
    private static getUserFriendlyMessage;
    private static getErrorSeverity;
    private static showUserMessage;
    static createError(code: string, message: string, details?: any): TecspacsError;
    static validateSnippetName(name: string): void;
    static validatePackageName(name: string): void;
    static validateLanguage(language: string): void;
}
//# sourceMappingURL=errorHandler.d.ts.map