import * as vscode from 'vscode';
import { TecspacsCommands } from '../commands/tecspacsCommands';
export declare class TecspacsProvider implements vscode.TreeDataProvider<TecspacsItem> {
    private commands;
    private _onDidChangeTreeData;
    readonly onDidChangeTreeData: vscode.Event<TecspacsItem | undefined | null | void>;
    constructor(commands: TecspacsCommands);
    refresh(): void;
    getTreeItem(element: TecspacsItem): vscode.TreeItem;
    getChildren(element?: TecspacsItem): Promise<TecspacsItem[]>;
}
export declare class TecspacsItem extends vscode.TreeItem {
    readonly label: string;
    readonly collapsibleState: vscode.TreeItemCollapsibleState;
    readonly type: string;
    readonly icon: string;
    readonly id?: string | undefined;
    readonly description?: string | undefined;
    readonly language?: string | undefined;
    constructor(label: string, collapsibleState: vscode.TreeItemCollapsibleState, type: string, icon: string, id?: string | undefined, description?: string | undefined, language?: string | undefined, commandName?: string);
}
//# sourceMappingURL=tecspacsProvider.d.ts.map