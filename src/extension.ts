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

      const insertOffset = e.document.offsetAt(c.range.start);
      if (insertOffset <= 0) continue;

      // Character immediately before Enter.
      const prevOffset = insertOffset - 1;
      const prevPos = e.document.positionAt(prevOffset);
      const insertPos = e.document.positionAt(insertOffset);

      const prevChar = e.document.getText(new vscode.Range(prevPos, insertPos));

      // Do not add on empty/whitespace-only lines.
      const line = e.document.lineAt(c.range.start.line);
      const linePrefix = line.text.slice(0, c.range.start.character);
      if (linePrefix.trim().length === 0) continue;

      if (prevChar === "{" || prevChar === "}") continue;
      if (prevChar === ";") continue;

      applyingEdit = true;
      try {
        await editor.edit(
          (editBuilder) => {
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
