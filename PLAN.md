# Project Plan: Web-Based C# Editor

**Phase 1: UI Foundation - Detailed Steps**

1.  **Basic Layout Structure:**
    *   1.1. **HTML Structure:** Create the main `index.html` file and define the basic structure using `div` elements for `sidebar`, `editor-area`, and `preview-area`.
    *   1.2. **CSS Layout (Grid/Flexbox):**  Use CSS Grid to divide the page into three columns for sidebar, editor, and preview. Ensure responsiveness using media queries. Define basic CSS classes for these areas in a `styles.css` file.
    *   1.3. **Initial Styling:** Apply minimal styling to visually separate the three sections (e.g., different background colors, borders) for clarity.

2.  **Technology Stack Setup (Vanilla TypeScript):**
    *   2.1. **Project Setup (npm/yarn):** Initialize a new npm project using `npm init -y`.
    *   2.2. **TypeScript Setup:** Configure TypeScript (`npm install -D typescript`). Create `tsconfig.json`.
    *   2.3. **Build Script:** Add a build script to `package.json` to compile TypeScript to JavaScript.

3.  **Code Editor (Custom Implementation):**
    *   3.1. **Editor Area Element:** Use a `<textarea>` or `contenteditable div` for the editor area in `index.html`. Let's start with `<textarea>` for simplicity.
    *   3.2. **Basic Syntax Highlighting (Manual):** Implement basic client-side syntax highlighting for C# using JavaScript/TypeScript. This will be a simplified version initially, focusing on keywords and comments.
    *   3.3. **Basic Text Editing:** Handle basic text input and editing within the editor area.

4.  **Sidebar Structure (File Explorer Placeholder):**
    *   4.1. **Sidebar Element:** Create a `div` for the sidebar in `index.html`.
    *   4.2. **Placeholder Content:**  Add placeholder content in the sidebar, such as a title "EXPLORER" and a simple unordered list mimicking a file tree structure (static for now).

5.  **Preview Area Placeholder:**
    *   5.1. **Preview Area Element:** Create a `div` for the preview area in `index.html`.
    *   5.2. **Placeholder Content:** Add placeholder content in the preview area, such as a title "PREVIEW" and a message like "Preview will appear here".

**Updated Technology Choices:**
*   **Language:** TypeScript
*   **UI Framework:** Vanilla JavaScript/TypeScript, custom implementation
*   **Styling:** Vanilla CSS
*   **Code Editor:** Custom `<textarea>` or `contenteditable div` based editor
*   **Build Tool:**  TypeScript compiler (tsc)

**Phase 2: Core Functionality (To be detailed later)**

*   File System Interaction (simulated or browser-based)
*   Basic C# Syntax Highlighting and Error Checking (client-side)
*   Conceptual C# to JavaScript Transpilation Research
*   Preview Implementation (initially for web content, later for C# output)

**Phase 3: C# Execution and Browser Runtime (To be detailed much later)**

*   Implement C# to JavaScript transpilation.
*   Set up a runtime environment in the browser to execute the transpiled code.
*   Integrate with browser APIs and potentially external C# libraries (if feasible).

## Context-Dependent Sidebar and Left Bar

The content of the sidebar and left bar is context-dependent, changing based on the currently viewed HTML page.

- **editor/index.html:** This page displays the code editor and includes the file explorer in the sidebar to navigate project files.
- **ast-viewer.html:**  This page is for viewing the Abstract Syntax Tree (AST) and the sidebar content will be specific to AST visualization, not including the file explorer.
- **settings.html:** This page is dedicated to application settings. The sidebar here will contain settings-related navigation or options, and will not include the file explorer.

This context-dependent behavior helps to keep the UI focused and relevant to the current task.

### Implementation Details

- **Sidebar Component (`src/modules/sidebar.ts`):**
    - The `Sidebar` class was modified to include a `setContent(contentType: string, content: HTMLElement)` method.
    - The `setContent` method uses a `switch` statement based on the `contentType` to call different content creation functions:
        - `createFileExplorerContent()`: Generates content for the file explorer sidebar (used in `index.html`).
        - `createAstViewerContent()`: Generates content for the AST viewer sidebar (used in `ast-viewer.html`).
        - `createSettingsContent()`: Generates content for the settings sidebar (used in `settings.html`).
    - Currently, these content creation functions are placeholders, but they provide a structure for adding specific content in the future.

- **Page-Specific Initialization (`src/index.ts`, `src/ast-viewer.ts`, `src/settings.ts`):**
    - In each page's entry point file, the `Sidebar` class is initialized.
    - The `sidebar.setContent()` method is called with the appropriate `contentType` string to set the sidebar content based on the page.
    - For example, in `src/index.ts`, `sidebar.setContent('explorer', explorerContent)` is used to set the file explorer sidebar.

This implementation provides a modular and scalable approach to manage context-dependent sidebar content, making it easy to add or modify sidebar content for different pages in the future.