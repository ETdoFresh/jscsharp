export class Sidebar {
    private container: HTMLElement;
    private fixedSidebar: HTMLElement;
    private explorerButton: HTMLButtonElement;
    private currentOrientation: 'portrait' | 'landscape';
    private isCollapsed: boolean;

    constructor(containerId: string) {
        // Create fixed sidebar
        this.fixedSidebar = document.createElement('div');
        this.fixedSidebar.id = 'fixed-sidebar';
        document.body.appendChild(this.fixedSidebar);

        // Create explorer button
        this.explorerButton = document.createElement('button');
        this.explorerButton.setAttribute('aria-label', 'Explorer');
        this.explorerButton.setAttribute('title', 'Explorer');
        this.explorerButton.innerHTML = '📁';
        this.fixedSidebar.appendChild(this.explorerButton);

        // Create search button
        const searchButton = document.createElement('button');
        searchButton.setAttribute('aria-label', 'Search');
        searchButton.setAttribute('title', 'Search');
        searchButton.innerHTML = '🔍';
        this.fixedSidebar.appendChild(searchButton);

        const settingsButton = document.createElement('button');
        settingsButton.setAttribute('aria-label', 'Settings');
        settingsButton.setAttribute('title', 'Settings');
        settingsButton.innerHTML = '⚙️';
        this.fixedSidebar.appendChild(settingsButton);

        // Setup file explorer sidebar
        const existingContainer = document.getElementById(containerId);
        if (existingContainer) {
            this.container = existingContainer;
        } else {
            this.container = document.createElement('div');
            this.container.id = containerId;
            document.body.appendChild(this.container);
        }

        this.currentOrientation = window.matchMedia('(orientation: landscape)').matches ? 'landscape' : 'portrait';
        this.isCollapsed = false;
        this.setupEventListeners();
        this.updateLayout();
    }

    private setupEventListeners() {
        this.explorerButton.addEventListener('click', () => {
            this.isCollapsed = !this.isCollapsed;
            this.updateLayout();
            
            // Force content redraw when expanding
            if (!this.isCollapsed) {
                requestAnimationFrame(() => {
                    const content = this.container.querySelector('.explorer-content') as HTMLElement;
                    if (content) {
                        content.style.display = 'none';
                        content.offsetHeight; // Force reflow
                        content.style.display = '';
                    }
                });
            }
        });

        const orientationMediaQuery = window.matchMedia('(orientation: landscape)');
        orientationMediaQuery.addEventListener('change', (e) => {
            const newOrientation = e.matches ? 'landscape' : 'portrait';
            if (newOrientation !== this.currentOrientation) {
                this.currentOrientation = newOrientation;
                
                // Don't automatically collapse in portrait mode
                // Let user control visibility explicitly
                this.updateLayout();
                
                // Force content redraw on orientation change
                requestAnimationFrame(() => {
                    const content = this.container.querySelector('.explorer-content') as HTMLElement;
                    if (content) {
                        content.style.display = 'none';
                        content.offsetHeight; // Force reflow
                        content.style.display = '';
                    }
                });
            }
        });
    }
    private updateLayout() {
        // Update sidebar classes
        this.container.classList.toggle('collapsed', this.isCollapsed);
        
        // Toggle hidden class based on collapsed state
        this.container.classList.toggle('hidden', this.isCollapsed);

        // Update toggle icon
        const icon = this.explorerButton.querySelector('.icon');
        if (icon) {
            icon.textContent = '📁';
        }

        // Always show fixed sidebar
        this.fixedSidebar.style.display = 'block';
    }

    public setContent(contentType: string, content: HTMLElement) {
        // Clear existing content
        this.container.innerHTML = '';
        let sidebarContent;
        
        switch (contentType) {
            case 'explorer':
                sidebarContent = this.createFileExplorerContent(content); // Pass content
                break;
            case 'ast-viewer':
                sidebarContent = this.createAstViewerContent();
                break;
            case 'settings':
                sidebarContent = this.createSettingsContent();
                break;
            default:
                sidebarContent = document.createElement('div'); // Default empty content
                break;
        }

        // Create explorer content wrapper
        const explorerContent = document.createElement('div');
        explorerContent.className = 'explorer-content';
        explorerContent.appendChild(sidebarContent);
        
        // Add to file explorer sidebar
        this.container.appendChild(explorerContent);
    }

    private createFileExplorerContent(content: HTMLElement): HTMLElement {
        const explorerContent = document.createElement('div');
        
        // Create the default explorer structure
        const defaultContent = document.createElement('div');
        defaultContent.innerHTML = `
            <h3>EXPLORER</h3>
            <div class="explorer-toolbar">
                <button title="New File"><span class="icon">📄</span></button>
                <button title="New Folder"><span class="icon">📁</span></button>
                <button title="Refresh"><span class="icon">🔄</span></button>
            </div>
            <div class="explorer-tree">
                <ul>
                    <li class="folder">
                        <span class="folder-name">📁 src</span>
                        <ul>
                            <li class="file">📄 index.ts</li>
                            <li class="file">📄 ast-viewer.ts</li>
                            <li class="file">📄 settings.ts</li>
                            <li class="file">📄 styles.css</li>
                            <li class="folder">
                                <span class="folder-name">📁 modules</span>
                                <ul>
                                    <li class="file">📄 editor.ts</li>
                                    <li class="file">📄 sidebar.ts</li>
                                </ul>
                            </li>
                        </ul>
                    </li>
                    <li class="file">📄 index.html</li>
                    <li class="file">📄 ast-viewer.html</li>
                    <li class="file">📄 settings.html</li>
                    <li class="file">📄 webpack.config.js</li>
                </ul>
            </div>
        `;
        
        // Add click handlers for folders
        const folders = defaultContent.querySelectorAll('.folder-name');
        folders.forEach(folder => {
            folder.addEventListener('click', (e) => {
                const li = (e.target as HTMLElement).closest('li');
                if (li) {
                    li.classList.toggle('expanded');
                }
            });
        });

        // Add the default content first
        explorerContent.appendChild(defaultContent);
        
        // Then add any custom content passed in
        if (content) {
            explorerContent.appendChild(content);
        }
        
        return explorerContent;
    }

    private createAstViewerContent(): HTMLElement {
        const astViewerContent = document.createElement('div');
        astViewerContent.innerHTML = `
            <h3>AST VIEWER</h3>
            <div class="ast-controls">
                <div class="control-group">
                    <h4>View Options</h4>
                    <label>
                        <input type="checkbox" id="show-types" checked>
                        Show Types
                    </label>
                    <label>
                        <input type="checkbox" id="show-modifiers" checked>
                        Show Modifiers
                    </label>
                </div>
                <div class="control-group">
                    <h4>Navigation</h4>
                    <button id="expand-all">Expand All</button>
                    <button id="collapse-all">Collapse All</button>
                </div>
            </div>
        `;
        return astViewerContent;
    }

    private createSettingsContent(): HTMLElement {
        const settingsContent = document.createElement('div');
        settingsContent.innerHTML = `
            <h3>SETTINGS</h3>
            <div class="settings-nav">
                <ul>
                    <li class="active">Editor</li>
                    <li>Code Analysis</li>
                    <li>File Associations</li>
                    <li>Extensions</li>
                    <li>About</li>
                </ul>
            </div>
        `;

        // Add click handler for navigation items
        const navItems = settingsContent.querySelectorAll('li');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                navItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
            });
        });

        return settingsContent;
    }

    public getContainer(): HTMLElement {
        return this.container;
    }

    public getFixedSidebar(): HTMLElement {
        return this.fixedSidebar;
    }

    public getToggleButton(): HTMLButtonElement {
        return this.explorerButton;
    }

    public isExplorerCollapsed(): boolean {
        return this.isCollapsed;
    }
}