import './styles.css';
import { Editor } from './modules/editor';
import { Sidebar } from './modules/sidebar';
import { initTheme } from './modules/theme-manager';
import { SplitLayout } from './modules/split-layout';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme
    initTheme();

    // Initialize the split layout with three panels
    const splitLayout = new SplitLayout('main-container', [
        { id: 'sidebar', minRatio: 0.1, maxRatio: 0.3 },
        { id: 'editor', minRatio: 0.3, maxRatio: 0.6 },
        { id: 'preview', minRatio: 0.2, maxRatio: 0.5 }
    ]);

    // Initialize sidebar
    const sidebar = new Sidebar('sidebar');
    
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

    // Add sidebar to the first panel
    const sidebarPanel = splitLayout.getPanel('sidebar');
    if (sidebarPanel) {
        sidebarPanel.appendChild(sidebar.getContainer());
    }

    // Initialize editor in the middle panel
    const editor = new Editor('editor');
    const editorPanel = splitLayout.getPanel('editor');
    if (editorPanel) {
        editorPanel.appendChild(editor.getElement());
    }

    // Initialize preview area in the last panel
    const previewPanel = splitLayout.getPanel('preview');
    if (previewPanel) {
        const preview = document.createElement('div');
        preview.className = 'preview-content';
        preview.innerHTML = `
            <h3>PREVIEW</h3>
            <p>Preview will appear here</p>
        `;
        previewPanel.appendChild(preview);

        // Handle editor changes
        editor.onChange((value) => {
            // Update preview with syntax-highlighted content
            preview.innerHTML = value;
        });
    }

    // Set initial panel ratios (20% sidebar, 50% editor, 30% preview)
    splitLayout.setRatios([0.2, 0.5, 0.3]);

    // Add the split layout to the page
    const container = document.getElementById('main-container');
    if (container) {
        container.appendChild(splitLayout.getContainer());
    }
});