# ABT-CLI: Modular Android Build System

A powerful, modular CLI tool for generating and building Android projects with automatic Git integration.

## Architecture
- **`src/commands/`**: Logic for CLI commands (generate, build).
- **`src/utils/`**: Shared utilities (shell execution, git automation).
- **`src/index.ts`**: Main entry point with interactive UI.

## Features
- **Modular Design**: Easy to extend with new commands.
- **Background Builds**: Runs Gradle commands in the background with real-time logging.
- **Git Automation**: Automatically commits and pushes changes after successful operations.
- **Interactive UI**: Guided project setup using arrow keys.

## Commands
- \`abt generate\`: Start the interactive project generator.
- \`abt build\`: Build the generated Android app.

## Development
\`\`\`bash
npm install
npm run build
npm run dev
\`\`\`
