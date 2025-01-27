export class Sidebar {
    private container: HTMLElement;
    private fixedSidebar: HTMLElement;
    private toggle: HTMLButtonElement;
    private currentOrientation: 'portrait' | 'landscape';
    private isCollapsed: boolean;

    constructor(containerId: string) {
        // Create fixed sidebar
        this.fixedSidebar = document.createElement('div');
        this.fixedSidebar.id = 'fixed-sidebar';
        document.body.appendChild(this.fixedSidebar);

        // Create toggle button in fixed sidebar
        this.toggle = document.createElement('button');
        this.toggle.setAttribute('aria-label', 'Toggle Explorer');
        this.toggle.innerHTML = '<span class="icon">📁</span>';
        this.fixedSidebar.appendChild(this.toggle);

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
        this.toggle.addEventListener('click', () => {
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

        // Update toggle icon
        const icon = this.toggle.querySelector('.icon');
        if (icon) {
            icon.textContent = this.isCollapsed ? '📁' : '⬅️';
        }

        // Always show fixed sidebar
        this.fixedSidebar.style.display = 'block';

        if (this.currentOrientation === 'landscape') {
            // Landscape mode - both sidebars are part of the grid
            document.body.style.gridTemplateColumns = this.isCollapsed
                ? '60px 0 4px 1fr 4px 300px'
                : '60px 200px 4px 1fr 4px 300px';
            
            // Reset any portrait-specific styles
            this.container.style.position = '';
            this.container.style.top = '';
            this.container.style.left = '';
            this.container.style.height = '';
            this.container.style.width = '';
            this.container.style.zIndex = '';
            this.container.style.transform = '';
        } else {
            // Portrait mode - sidebars are fixed
            document.body.style.gridTemplateColumns = '60px 0 4px 1fr 4px 300px';
            
            // Set portrait-specific styles
            this.container.style.position = 'fixed';
            this.container.style.top = '50px';
            this.container.style.left = '0';
            this.container.style.height = 'calc(100vh - 50px)';
            this.container.style.width = '100vw';
            this.container.style.zIndex = '1000';
            
            // Use transform for smooth animation instead of width
            this.container.style.transform = this.isCollapsed
                ? 'translateX(-100%)'
                : 'translateX(0)';
        }
    }

    public setContent(content: HTMLElement) {
        // Clear existing content
        this.container.innerHTML = '';
        
        // Create explorer content wrapper
        const explorerContent = document.createElement('div');
        explorerContent.className = 'explorer-content';
        explorerContent.appendChild(content);
        
        // Add to file explorer sidebar
        this.container.appendChild(explorerContent);
    }

    public getContainer(): HTMLElement {
        return this.container;
    }

    public getFixedSidebar(): HTMLElement {
        return this.fixedSidebar;
    }

    public getToggleButton(): HTMLButtonElement {
        return this.toggle;
    }

    public isExplorerCollapsed(): boolean {
        return this.isCollapsed;
    }
}