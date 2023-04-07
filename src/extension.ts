import * as vscode from "vscode";
import { formatCommand } from "./commands/formatCommand";

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand("conditionalFormat.format", formatCommand);
  context.subscriptions.push(disposable);
}

export function deactivate() {}