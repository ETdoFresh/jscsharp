# Web-Based C# Editor

## Setup
- Install dependencies:  
```bash
npm install
```
- Start dev server with auto-reload:  
```bash
npm run dev
```

## Project Plan (from PLAN.md)
- **Phase 1: UI Foundation**
  - Basic layout (HTML `div`s for sidebar, editor, preview)
  - CSS Grid/Flex for three columns
  - Minimal styling to separate sections
  - TypeScript setup (tsconfig, build script)
  - Basic custom code editor (using textarea)
  - Basic syntax highlighting (client-side)
  - Sidebar placeholder (EXPLORER)
  - Preview placeholder (PREVIEW)

- **Phase 2: Core Functionality**
  - File system interaction (simulated/browser-based)
  - Expanded C# syntax highlighting/error checking
  - Preliminary C# to JavaScript transpilation research
  - Enhanced preview implementation

- **Phase 3: C# Execution & Browser Runtime**
  - Implement full C# to JavaScript transpilation
  - In-browser runtime environment to run C# code
  - Possible integration with external C# libraries

## Technology Stack
- Language: TypeScript
- UI: Vanilla JavaScript/TypeScript
- Styling: Vanilla CSS
- Code Editor: Custom `<textarea>` or `contenteditable div`
- Build Tool: TypeScript compiler (tsc)