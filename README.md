# autodidact

Autodidact is a terminal-first study tool for extracting text from source material and turning it into structured learning notes.

## What It Does

- accepts raw text, file paths, PDFs, and URLs as source input
- analyzes source material into study-ready notes
- stores and reuses context for retrieval-assisted note generation
- ships with an OpenTUI interface for the analyze flow

## Project Layout

- `lib/` Ruby application code, commands, providers, and storage
- `tui/` OpenTUI frontend written in TypeScript
- `bin/autodidact` CLI entrypoint
- `templates/` note and prompt templates
- `spec/` Ruby specs

## Getting Started

### Ruby app

```bash
bundle install
bundle exec bin/autodidact
```

### TUI development

```bash
cd tui
bun install
bun dev
```

## Tests

### TUI

```bash
cd tui
npm test
```

## Notes

Autodidact depends on local configuration for models, tokens, and storage. On first run, the TUI setup flow will guide you through the required fields.

## Disclaimer

This project is in active development, I personally don't recommend trying to use it unless you're somewhat comfortable around JSON RPC, Embeddings, and OpenTUI. It'll work, but you might burn more tokens than you need to.
