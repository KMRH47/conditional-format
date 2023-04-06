import * as vscode from "vscode";
import {
  UNABLE_TO_FORMAT,
  DOCUMENT_ALREADY_FORMATTED,
  SELECTION_ALREADY_FORMATTED,
} from "./strings";

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "conditionalFormat.format",
    async () => {
      const editor = vscode.window.activeTextEditor;

      if (!editor) {
        return;
      }

      const document = editor.document;
      const selection = editor.selection;
      const fullRange = new vscode.Range(0, 0, document.lineCount, 0);
      const formatOptions = getFormatOptions(document);
      const formattedTextEdits = await getFormattedTextEdits(
        document,
        fullRange,
        formatOptions
      );

      if (formattedTextEdits === undefined) {
        showError(UNABLE_TO_FORMAT);
        return;
      }

      if (selection.isEmpty) {
        formatDocument(editor, formattedTextEdits);
      } else {
        formatSelection(editor, selection, formattedTextEdits);
      }
    }
  );

  context.subscriptions.push(disposable);
}

function getFormatOptions(
  document: vscode.TextDocument
): vscode.FormattingOptions | undefined {
  return vscode.workspace
    .getConfiguration("editor", document.uri)
    .get<vscode.FormattingOptions>("formatOnSave");
}

async function getFormattedTextEdits(
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

async function formatDocument(
  editor: vscode.TextEditor,
  formattedTextEdits: vscode.TextEdit[]
): Promise<void> {
  if (formattedTextEdits.length === 0) {
    showInfo(DOCUMENT_ALREADY_FORMATTED);
  } else {
    await vscode.commands.executeCommand("editor.action.formatDocument");
  }
}

async function formatSelection(
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
    showInfo(SELECTION_ALREADY_FORMATTED);
  }
}

function showInfo(message: string): void {
  vscode.window.showInformationMessage(message);
}

function showError(message: string): void {
  vscode.window.showErrorMessage(message);
}

export function deactivate() {}
