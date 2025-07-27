import * as vscode from 'vscode';

export class Logger {
    private static outputChannel: vscode.OutputChannel | undefined;

    private static getOutputChannel(): vscode.OutputChannel {
        if (!Logger.outputChannel) {
            Logger.outputChannel = vscode.window.createOutputChannel('Tecspacs');
        }
        return Logger.outputChannel;
    }

    static info(message: string): void {
        const timestamp = new Date().toISOString();
        const logMessage = `[INFO] ${timestamp}: ${message}`;
        Logger.getOutputChannel().appendLine(logMessage);
        console.log(logMessage);
    }

    static error(message: string, error?: Error): void {
        const timestamp = new Date().toISOString();
        let logMessage = `[ERROR] ${timestamp}: ${message}`;
        
        if (error) {
            logMessage += `\n${error.stack || error.message}`;
        }
        
        Logger.getOutputChannel().appendLine(logMessage);
        console.error(logMessage);
    }

    static warn(message: string): void {
        const timestamp = new Date().toISOString();
        const logMessage = `[WARN] ${timestamp}: ${message}`;
        Logger.getOutputChannel().appendLine(logMessage);
        console.warn(logMessage);
    }

    static debug(message: string): void {
        const timestamp = new Date().toISOString();
        const logMessage = `[DEBUG] ${timestamp}: ${message}`;
        Logger.getOutputChannel().appendLine(logMessage);
        console.log(logMessage);
    }

    static showOutput(): void {
        Logger.getOutputChannel().show();
    }

    static clear(): void {
        Logger.getOutputChannel().clear();
    }
} 