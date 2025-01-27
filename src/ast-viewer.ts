import './styles.css';
import { Editor } from './modules/editor';
import { SplitLayout } from './modules/split-layout';
import { TabbedView } from './modules/tabbed-view';
import { initTheme } from './modules/theme-manager';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme
    initTheme();

    // Initialize the split layout with two panels - editor and AST view
    const splitLayout = new SplitLayout('main-container', [
        { id: 'editor', minRatio: 0.3, maxRatio: 0.7 },
        { id: 'ast', minRatio: 0.3, maxRatio: 0.7 }
    ]);

    // Initialize editor in left panel
    const editor = new Editor('ast-editor');
    const editorPanel = splitLayout.getPanel('editor');
    if (editorPanel) {
        editorPanel.appendChild(editor.getElement());
    }

    // Initialize tabbed view in right panel
    const tabbedView = new TabbedView('ast-tabs');
    const astPanel = splitLayout.getPanel('ast');
    if (astPanel) {
        astPanel.appendChild(tabbedView.getContainer());
    }

    // Create JSON tab
    const jsonView = document.createElement('div');
    jsonView.id = 'json-view';
    jsonView.style.height = '100%';
    jsonView.style.overflow = 'auto';
    jsonView.style.fontFamily = 'monospace';
    jsonView.style.whiteSpace = 'pre';
    jsonView.style.padding = '10px';
    jsonView.style.boxSizing = 'border-box';

    // Create Graph tab
    const graphView = document.createElement('div');
    graphView.id = 'graph-view';
    graphView.style.height = '100%';
    graphView.style.padding = '10px';
    graphView.style.boxSizing = 'border-box';
    graphView.textContent = 'Graph visualization will be implemented';

    // Add tabs
    tabbedView.addTab({
        id: 'json',
        label: 'JSON',
        content: jsonView
    });

    tabbedView.addTab({
        id: 'graph',
        label: 'Graph',
        content: graphView
    });

    // Update AST when editor content changes
    editor.onChange((value) => {
        // Here you would parse the code and generate AST
        // For now, just show a placeholder
        const ast = {
            type: "Program",
            body: [
                {
                    type: "Comment",
                    value: "AST will be generated here"
                }
            ]
        };

        // Update JSON view
        jsonView.textContent = JSON.stringify(ast, null, 2);
    });

    // Set initial panel ratios (50/50 split)
    splitLayout.setRatios([0.5, 0.5]);

    // Add split layout to page
    const container = document.getElementById('main-container');
    if (container) {
        container.appendChild(splitLayout.getContainer());
    }
});