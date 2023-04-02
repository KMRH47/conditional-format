import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('conditionalFormat.format', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        const document = editor.document;
        const selection = editor.selection;

        const range = selection.isEmpty
            ? new vscode.Range(document.positionAt(0), document.positionAt(document.getText().length))
            : new vscode.Range(selection.start, selection.end);

        const formatOptions = vscode.workspace.getConfiguration('editor', document.uri).get<vscode.FormattingOptions>('formatOnSave');
        const formattedTextEdits = await vscode.commands.executeCommand<vscode.TextEdit[]>('vscode.executeFormatRangeProvider', document.uri, range, formatOptions);

        if (formattedTextEdits === undefined) {
            vscode.window.showErrorMessage('Unable to execute the formatting command.');
            return;
        }
        
        if (formattedTextEdits.length === 0) {
            const message = selection.isEmpty
                ? 'The entire document is already formatted.'
                : 'The selected code block is already formatted.';
            vscode.window.showInformationMessage(message);
            return;
        }

        await editor.edit(editBuilder => {
            for (const textEdit of formattedTextEdits) {
                editBuilder.replace(textEdit.range, textEdit.newText);
            }
        });
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}
