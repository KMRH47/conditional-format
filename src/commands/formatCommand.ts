import * as vscode from "vscode";
import { ERR_MISSING_FORMATTER, ERR_UNABLE_TO_FORMAT } from "../constants/strings";
import {
  getFormatOptions,
  getFormattedTextEdits,
  formatDocument,
  formatSelection,
} from "../utils/formatHelpers";
import { showError } from "../utils/messages";

export async function formatCommand(): Promise<void> {
  const editor = vscode.window.activeTextEditor;

  if (!editor) {
    return;
  }

  const document = editor.document;
  const fullRange = new vscode.Range(0, 0, document.lineCount, 0);
  const formatOptions = getFormatOptions(document);

  let formattedTextEdits: vscode.TextEdit[] | undefined;

  try {
    formattedTextEdits = await getFormattedTextEdits(
      document,
      fullRange,
      formatOptions
    );
  } catch (error: any) {
    showError(error.message || ERR_MISSING_FORMATTER);
    return;
  }

  if (!formattedTextEdits) {
    showError(ERR_UNABLE_TO_FORMAT);
    return;
  }

  const selection = editor.selection;

  if (selection.isEmpty) {
    await formatDocument(formattedTextEdits);
  } else {
    await formatSelection(editor, selection, formattedTextEdits);
  }
}
