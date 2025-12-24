import * as vscode from "vscode";

let applyingEdit = false;

function startsWithNewline(s: string): boolean {
  return s.startsWith("\n") || s.startsWith("\r\n");
}

export function activate(context: vscode.ExtensionContext) {
  const sub = vscode.workspace.onDidChangeTextDocument(async (e) => {
    if (applyingEdit) return;

    const editor = vscode.window.activeTextEditor;
    if (!editor) return;
    if (editor.document.uri.toString() !== e.document.uri.toString()) return;

    for (const c of e.contentChanges) {
      // Enter often inserts "\n" plus indentation (e.g. "\n    ").
      if (!startsWithNewline(c.text)) continue;

      // Insertion point where the newline starts in the *new* document.
      const insertOffset = e.document.offsetAt(c.range.start);
      if (insertOffset <= 0) continue;

      const prevOffset = insertOffset - 1;
      const prevPos = e.document.positionAt(prevOffset);
      const insertPos = e.document.positionAt(insertOffset);

      const prevChar = e.document.getText(new vscode.Range(prevPos, insertPos));
      if (prevChar === "{" || prevChar === "}") continue;
      if (prevChar === ";") continue;

      applyingEdit = true;
      try {
        await editor.edit(
          (editBuilder) => {
            // Insert ';' before the newline (at start of inserted text).
            editBuilder.insert(c.range.start, ";");
          },
          { undoStopBefore: false, undoStopAfter: false }
        );
      } finally {
        applyingEdit = false;
      }
    }
  });

  context.subscriptions.push(sub);
}

export function deactivate() {}
