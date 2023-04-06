import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand("conditionalFormat.format", async () => {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
      return;
    }

    const document = editor.document;
    const selection = editor.selection;
    const fullRange = new vscode.Range(0, 0, document.lineCount, 0);
    const formatOptions = getFormatOptions(document);
    const formattedTextEdits = await getFormattedTextEdits(document, fullRange, formatOptions);

    if (formattedTextEdits === undefined) {
      showError("Unable to execute the formatting command.");
      return;
    }

    if (selection.isEmpty) {
      formatDocument(editor, formattedTextEdits);
    } else {
      formatSelection(editor, selection, formattedTextEdits);
    }
  });

  context.subscriptions.push(disposable);
}

function getFormatOptions(document: vscode.TextDocument): vscode.FormattingOptions | undefined {
  return vscode.workspace.getConfiguration("editor", document.uri).get<vscode.FormattingOptions>("formatOnSave");
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

async function formatDocument(editor: vscode.TextEditor, formattedTextEdits: vscode.TextEdit[]): Promise<void> {
  if (formattedTextEdits.length === 0) {
    showInfo("The entire document is already formatted.");
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
    showInfo("The selected code block is already formatted.");
  }
}

function showInfo(message: string): void {
  vscode.window.showInformationMessage(message);
}

function showError(message: string): void {
  vscode.window.showErrorMessage(message);
}

export function deactivate() {}
