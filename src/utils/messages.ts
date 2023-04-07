import * as vscode from "vscode";
import { getConfig } from "./config";

function notificationsEnabled() {
  return getConfig<boolean>("showNotifications", true);
}

export function showInfo(message: string): void {
  notificationsEnabled() && vscode.window.showInformationMessage(message);
}

export function showError(message: string): void {
  notificationsEnabled() && vscode.window.showErrorMessage(message);
}
