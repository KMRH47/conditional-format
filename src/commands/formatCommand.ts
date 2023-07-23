import * as vscode from "vscode";
import { ERR_MISSING_FORMATTER } from "../constants/strings";
import {
  getFormattedTextEdits,
  formatSelection,
  formatEntireDocument,
} from "../utils/formatHelpers";
import { showError } from "../utils/messages";

export async function formatCommand(): Promise<void> {
  const editor = vscode.window.activeTextEditor;

  if (!editor) {
    return;
  }
  const document = editor.document;
  const fullRange = new vscode.Range(0, 0, document.lineCount, 0);
  const selection = editor.selection;
  let formattedTextEdits: vscode.TextEdit[] | undefined;

  try {
    formattedTextEdits = await getFormattedTextEdits(document, fullRange);
  } catch (error: any) {
    showError(error.message || ERR_MISSING_FORMATTER);
    return;
  }

  if (!formattedTextEdits) {
    const formatCommand = selection.isEmpty
      ? "editor.action.formatDocument"
      : "editor.action.formatSelection";
    await vscode.commands.executeCommand(formatCommand);
    return;
  }

  if (selection.isEmpty) {
    await formatEntireDocument(editor, formattedTextEdits);
  } else {
    await formatSelection(editor, selection, formattedTextEdits);
  }
}
