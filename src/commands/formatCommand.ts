import * as vscode from "vscode";
import { MISSING_FORMATTER, UNABLE_TO_FORMAT } from "../constants/strings";
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
    showError(`Error: ${error.message || MISSING_FORMATTER}`);
    return;
  }

  if (!formattedTextEdits) {
    showError(UNABLE_TO_FORMAT);
    return;
  }

  const selection = editor.selection;

  if (selection.isEmpty) {
    formatDocument(formattedTextEdits);
  } else {
    formatSelection(editor, selection, formattedTextEdits);
  }
}
