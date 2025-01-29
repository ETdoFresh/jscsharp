import './styles.css';
import { Editor } from './modules/editor';
import { Sidebar } from './modules/sidebar';
import { initTheme } from './modules/theme-manager';
import { SplitLayout } from './modules/split-layout';

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded event fired');
    
    // Initialize theme
    initTheme();

    // Ensure body has editor-page class
    document.body.classList.add('editor-page');

    // Get the main container
    const container = document.getElementById('main-container');
    console.log('Initial container state:', container ? 'exists' : 'not found');
    if (!container) {
        throw new Error('Main container not found');
    }

    // Clear container before initializing layout
    container.innerHTML = '';

    // Initialize the split layout
    console.log('Creating SplitLayout instance');
    const splitLayout = new SplitLayout('main-container', [
        // [minRatio, maxRatio] values allow sidebar to collapse to 0
        { id: 'sidebar', minRatio: 0.1, maxRatio: 0.3 },
        { id: 'editor', minRatio: 0.3, maxRatio: 0.6 },
        { id: 'preview', minRatio: 0.2, maxRatio: 0.5 }
    ]);

    // Get panels
    console.log('Retrieving panels from SplitLayout');
    const sidebarPanel = splitLayout.getPanel('sidebar');
    const editorPanel = splitLayout.getPanel('editor');
    const previewPanel = splitLayout.getPanel('preview');

    // Add the split layout to main container first
    container.appendChild(splitLayout.getContainer());

    // Initialize all components
    const sidebar = new Sidebar('sidebar');
    const editor = new Editor('editor');
    const preview = document.createElement('div');
    preview.className = 'preview-content';

    // Set up preview content
    preview.innerHTML = `
        <h3>PREVIEW</h3>
        <div class="preview-output">
            <pre><code>// Output will appear here</code></pre>
        </div>
    `;

    // Initialize panels after container is in the DOM
    requestAnimationFrame(() => {
        // Initialize sidebar panel
        if (sidebarPanel) {
            sidebarPanel.classList.add('sidebar-panel');
            sidebarPanel.appendChild(sidebar.getContainer());

            const explorerContent = document.createElement('div');
            explorerContent.className = 'explorer-content';
            explorerContent.innerHTML = `
                <h3>EXPLORER</h3>
                <ul>
                    <li>file1.cs</li>
                    <li>file2.cs</li>
                    <li>folder1/</li>
                    <li>folder1/file3.cs</li>
                </ul>
            `;
            sidebar.setContent('explorer', explorerContent);
        }

        // Initialize editor panel
        if (editorPanel) {
            editorPanel.classList.add('editor-panel');
            editorPanel.appendChild(editor.getElement());
            editor.setValue('// Start coding here\n\nfunction hello() {\n    console.log("Hello, World!");\n}');
        }

        // Initialize preview panel
        if (previewPanel) {
            previewPanel.classList.add('preview-panel');
            previewPanel.appendChild(preview);

            editor.onChange((value) => {
                const previewOutput = preview.querySelector('.preview-output');
                if (previewOutput) {
                    previewOutput.innerHTML = `<pre><code>${value}</code></pre>`;
                }
            });
        }

        // Set initial ratios after all panels are initialized
        splitLayout.setRatios([0.2, 0.4, 0.4]);
    });
});