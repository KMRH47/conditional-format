import * as vscode from "vscode";
import { showInfo } from "./messages";
import {
  INFO_DOCUMENT_ALREADY_FORMATTED,
  INFO_SELECTION_ALREADY_FORMATTED,
} from "../constants/strings";

export function getFormatOptions(
  document: vscode.TextDocument
): vscode.FormattingOptions | undefined {
  return vscode.workspace
    .getConfiguration("editor", document.uri)
    .get<vscode.FormattingOptions>("formatOnSave");
}

export async function getFormattedTextEdits(
  document: vscode.TextDocument,
  range: vscode.Range,
  formatOptions: vscode.FormattingOptions | undefined
): Promise<vscode.TextEdit[] | undefined> {
  return await vscode.commands.executeCommand<vscode.TextEdit[]>(
    "vscode.executeFormatRangeProvider",
    document.uri,
    range,
    formatOptions
  );
}

export async function formatDocument(
  formattedTextEdits: vscode.TextEdit[]
): Promise<void> {
  if (formattedTextEdits.length === 0) {
    showInfo(INFO_DOCUMENT_ALREADY_FORMATTED);
  } else {
    await vscode.commands.executeCommand("editor.action.formatDocument");
  }
}

export async function formatSelection(
  editor: vscode.TextEditor,
  selection: vscode.Selection,
  formattedTextEdits: vscode.TextEdit[]
): Promise<void> {
  let anyEditApplied = false;

  await editor.edit(
    (editBuilder) => {
      for (const textEdit of formattedTextEdits) {
        if (selection.contains(textEdit.range)) {
          editBuilder.replace(textEdit.range, textEdit.newText);
          anyEditApplied = true;
        }
      }
    },
    { undoStopBefore: false, undoStopAfter: false }
  );

  if (!anyEditApplied) {
    showInfo(INFO_SELECTION_ALREADY_FORMATTED);
  }
}
