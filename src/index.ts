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
    
    // Initialize the split layout with three panels
    console.log('Creating SplitLayout instance');
    const splitLayout = new SplitLayout('main-container', [
        { id: 'sidebar', minRatio: 0.1, maxRatio: 0.3 },
        { id: 'editor', minRatio: 0.3, maxRatio: 0.6 },
        { id: 'preview', minRatio: 0.2, maxRatio: 0.5 }
    ]);

    // Get all panels
    console.log('Retrieving panels from SplitLayout');
    const sidebarPanel = splitLayout.getPanel('sidebar');
    const editorPanel = splitLayout.getPanel('editor');
    const previewPanel = splitLayout.getPanel('preview');
    console.log('Panel retrieval results:', {
        sidebar: sidebarPanel ? 'found' : 'not found',
        editor: editorPanel ? 'found' : 'not found',
        preview: previewPanel ? 'found' : 'not found'
    });

    // Initialize sidebar panel
    if (sidebarPanel) {
        sidebarPanel.classList.add('sidebar-panel');
        const sidebar = new Sidebar('sidebar');
        sidebarPanel.appendChild(sidebar.getContainer());
        
        // Create explorer content
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

    // Initialize editor panel and create editor instance
    let editor: Editor | null = null;
    if (editorPanel) {
        editorPanel.classList.add('editor-panel');
        editor = new Editor('editor');
        editorPanel.appendChild(editor.getElement());
        
        // Set initial editor content
        editor.setValue('// Start coding here\n\nfunction hello() {\n    console.log("Hello, World!");\n}');
    }

    // Initialize preview panel
    if (previewPanel) {
        previewPanel.classList.add('preview-panel');
        const preview = document.createElement('div');
        preview.className = 'preview-content';
        preview.innerHTML = `
            <h3>PREVIEW</h3>
            <div class="preview-output">
                <pre><code>// Output will appear here</code></pre>
            </div>
        `;
        previewPanel.appendChild(preview);

        // Set up editor change handler if editor exists
        if (editor) {
            editor.onChange((value) => {
                const previewOutput = preview.querySelector('.preview-output');
                if (previewOutput) {
                    previewOutput.innerHTML = `<pre><code>${value}</code></pre>`;
                }
            });
        }
    }

    // Add the split layout
    const splitContainer = splitLayout.getContainer();
    container.appendChild(splitContainer);

    // Set initial layout after a brief delay to ensure proper rendering
    setTimeout(() => {
        splitLayout.setRatios([0.2, 0.5, 0.3]);
        console.log('Layout initialized with ratios:', {
            container: {
                width: container.offsetWidth,
                height: container.offsetHeight,
                display: getComputedStyle(container).display
            },
            splitContainer: {
                width: splitContainer.offsetWidth,
                height: splitContainer.offsetHeight,
                display: getComputedStyle(splitContainer).display
            }
        });
    }, 100);
    
    // Set initial panel ratios after adding to DOM and ensuring styles are applied
    requestAnimationFrame(() => {
        console.log('First animation frame - container dimensions:', {
            width: container.offsetWidth,
            height: container.offsetHeight
        });
        
        // Ensure container is properly sized before setting ratios
        if (container.offsetWidth > 0) {
            console.log('Setting initial ratios - container has width');
            splitLayout.setRatios([0.2, 0.5, 0.3]);
        } else {
            console.log('Container has no width, waiting for next frame');
            // If container is not sized yet, wait for next frame
            requestAnimationFrame(() => {
                console.log('Second animation frame - container dimensions:', {
                    width: container.offsetWidth,
                    height: container.offsetHeight
                });
                splitLayout.setRatios([0.2, 0.5, 0.3]);
            });
        }
    });
});