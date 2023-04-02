# Conditional Format

Conditional Format is a Visual Studio Code extension that combines the functionality of `Format Selection` and `Format Document` keybinds into a single command. When a code block is selected, the extension formats only the selected code. If no text is selected, the extension formats the entire document. This extension utilizes the built-in formatters provided by VSCode, as well as any other formatter extensions you have installed.

## Features

- Format a selected code block in the active text editor
- Format the entire document if no text is selected

## Usage

1. Select a code block in the active text editor or leave the selection empty to format the entire document
2. Press `CTRL+K CTRL+D` or `CMD+K CMD+D` (macOS) on macOS to format the selected code block or the entire document

### Change keybind

1. Open `Preferences -> Keyboard Shortcuts`
2. Search for `conditionalFormat.format`