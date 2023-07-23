import * as vscode from "vscode";
import { showInfo } from "./messages";
import {
  INFO_DOCUMENT_ALREADY_FORMATTED,
  INFO_SELECTION_ALREADY_FORMATTED,
} from "../constants/strings";

export async function getFormattedTextEdits(
  document: vscode.TextDocument,
  range: vscode.Range
): Promise<vscode.TextEdit[] | undefined> {
  return await vscode.commands.executeCommand<vscode.TextEdit[]>(
    "vscode.executeFormatRangeProvider",
    document.uri,
    range
  );
}

export async function formatSelection(
  editor: vscode.TextEditor,
  selection: vscode.Selection,
  formattedTextEdits: vscode.TextEdit[]
): Promise<void> {
  let anyEditApplied = false;

  await editor.edit(
    editBuilder => {
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

export async function formatEntireDocument(
  editor: vscode.TextEditor,
  formattedTextEdits: vscode.TextEdit[]
): Promise<void> {
  if (formattedTextEdits.length === 0) {
    showInfo(INFO_DOCUMENT_ALREADY_FORMATTED);
    return;
  }
  const entireDocumentSelection = new vscode.Selection(
    0,
    0,
    editor.document.lineCount - 1,
    editor.document.lineAt(editor.document.lineCount - 1).text.length
  );

  await formatSelection(editor, entireDocumentSelection, formattedTextEdits);
}
