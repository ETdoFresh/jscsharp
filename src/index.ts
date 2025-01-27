import './styles.css';
import { Editor } from './modules/editor';
import { Sidebar } from './modules/sidebar';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize editor
    const editor = new Editor('editor-area');
    const preview = document.getElementById('preview-area');

    // Handle editor changes
    if (preview) {
        editor.onChange((value) => {
            // Update preview with syntax-highlighted content
            preview.innerHTML = value;
        });
    }

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

    // Get the original elements
    const editorArea = document.getElementById('editor-area');
    const leftSeparator = document.getElementById('left-separator');
    const rightSeparator = document.getElementById('right-separator');
    const previewArea = document.getElementById('preview-area');

    if (editorArea && leftSeparator && rightSeparator && previewArea) {
        // Replace the placeholder editor area with our editor component
        editorArea.replaceWith(editor.getElement());
    }
});