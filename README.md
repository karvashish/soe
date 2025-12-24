````md
# soe — Semicolon On Enter

A small VS Code extension that automatically inserts `;` when you press **Enter**, with sensible guardrails.

Built to reduce noise while writing C-like languages without getting in your way.

## What it does

When you press **Enter**, `soe` inserts a semicolon **before the newline** if all of the following are true:

- The current line is not empty or whitespace-only
- The line does **not** end with `{` or `}`
- The line does **not** already end with `;`
- You are not inside a string
- You are not inside a comment
- The file language is semicolon-oriented

Example:

```c
int x = 1⏎
````

Becomes:

```c
int x = 1;
```

## What it deliberately avoids

No semicolon is inserted when:

* Pressing Enter after `{` or `}`
* Pressing Enter on an empty line
* Inside line comments (`//`)
* Inside block comments (`/* */`)
* Inside strings (`" ' ``)
* In languages where semicolons are wrong or meaningless

Disabled by default for:

* `python`
* `markdown`
* `yaml`
* `json`
* `jsonc`
* `toml`

## Philosophy

* No AST parsing
* No language servers
* No configuration bloat
* No background polling

Just react to **Enter**, inspect the line, and act if it is safe.

The logic is intentionally simple and predictable.

## Installation

From GitHub Releases:

1. Download the `.vsix` from the latest release
2. In VS Code:

   * Extensions view
   * `…` → **Install from VSIX…**
   * Select the file

Or via CLI:

```bash
code --install-extension soe-<version>.vsix
```

## Development

```bash
npm install
npm run compile
F5
```

This opens an **Extension Development Host** window.

## Packaging

```bash
npm run compile
npx vsce package
```

## GitHub Releases

Releases are built automatically on tag push.

```bash
git tag v0.0.1
git push origin v0.0.1
```

The workflow builds the extension and attaches the `.vsix` to the release.

## Scope and non-goals

This extension does **not** try to:

* Understand syntax trees
* Be correct for every language edge case
* Replace formatters or linters

If you want opinionated formatting, use a formatter.
If you want less friction when typing, this is for you.

## License

MIT

```
```
