import './styles.css';
import { Editor } from './modules/editor';
import { SplitLayout } from './modules/split-layout';
import { TabbedView } from './modules/tabbed-view';
import { Sidebar } from './modules/sidebar';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize sidebar with AST-specific content
    const sidebar = new Sidebar('sidebar');
    sidebar.setContent('ast-viewer', document.createElement('div'));

    // Initialize split layout
    const splitLayout = new SplitLayout('ast-container');
    splitLayout.setSplitRatio(0.5); // 50/50 split

    // Initialize editor in left panel
    const editor = new Editor('ast-editor');
    splitLayout.getLeftPanel().appendChild(editor.getElement());

    // Initialize tabbed view in right panel
    const tabbedView = new TabbedView('ast-tabs');

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

    splitLayout.getRightPanel().appendChild(tabbedView.getContainer());

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

    // Add split layout to page
    const container = document.getElementById('ast-container');
    if (container) {
        container.appendChild(splitLayout.getContainer());
    }
});