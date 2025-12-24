import * as vscode from "vscode";

let applyingEdit = false;

function startsWithNewline(s: string): boolean {
  return s.startsWith("\n") || s.startsWith("\r\n");
}

function isInStringAtEnd(s: string): boolean {

  let q: string | null = null;
  let esc = false;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (esc) {
      esc = false;
      continue;
    }
    if (ch === "\\") {
      esc = true;
      continue;
    }
    if (q) {
      if (ch === q) q = null;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === "`") q = ch;
  }
  return q !== null;
}

function hasLineComment(prefix: string): boolean {

  let q: string | null = null;
  let esc = false;
  for (let i = 0; i + 1 < prefix.length; i++) {
    const ch = prefix[i];
    const nx = prefix[i + 1];

    if (esc) {
      esc = false;
      continue;
    }
    if (ch === "\\") {
      esc = true;
      continue;
    }
    if (q) {
      if (ch === q) q = null;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === "`") {
      q = ch;
      continue;
    }
    if (ch === "/" && nx === "/") return true;
  }
  return false;
}

function inBlockComment(prefix: string): boolean {

  const a = prefix.lastIndexOf("/*");
  if (a === -1) return false;
  const b = prefix.lastIndexOf("*/");
  return b < a;
}

export function activate(context: vscode.ExtensionContext) {
  const disabledLangs = new Set([
    "python",
    "markdown",
    "yaml",
    "json",
    "jsonc",
    "toml",
  ]);

  const sub = vscode.workspace.onDidChangeTextDocument(async (e) => {
    if (applyingEdit) return;

    const editor = vscode.window.activeTextEditor;
    if (!editor) return;
    if (editor.document.uri.toString() !== e.document.uri.toString()) return;

    if (disabledLangs.has(e.document.languageId)) return;

    for (const c of e.contentChanges) {
      if (!startsWithNewline(c.text)) continue;

      const line = e.document.lineAt(c.range.start.line);
      const prefix = line.text.slice(0, c.range.start.character);


      const trimmed = prefix.trim();
      if (trimmed.length === 0) continue;


      if (isInStringAtEnd(prefix)) continue;


      if (hasLineComment(prefix)) continue;
      if (inBlockComment(prefix)) continue;


      const last = prefix.trimEnd().slice(-1);
      if (last === "{" || last === "}" || last === ";") continue;


      const insertCol = prefix.trimEnd().length;
      const insertPos = new vscode.Position(c.range.start.line, insertCol);

      applyingEdit = true;
      try {
        await editor.edit(
          (editBuilder) => {
            editBuilder.insert(insertPos, ";");
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

export function deactivate() { }
