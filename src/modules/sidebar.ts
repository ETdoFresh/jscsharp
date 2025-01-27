export class Sidebar {
    private container: HTMLElement;
    private toggle: HTMLButtonElement;
    private currentOrientation: 'portrait' | 'landscape';
    private lastLandscapeExpandedState: boolean;

    constructor(containerId: string) {
        const existingContainer = document.getElementById(containerId);
        if (existingContainer) {
            this.container = existingContainer;
        } else {
            this.container = document.createElement('div');
            this.container.id = containerId;
        }
        
        const existingToggle = document.getElementById(`${containerId}-toggle`);
        if (existingToggle instanceof HTMLButtonElement) {
            this.toggle = existingToggle;
        } else {
            this.toggle = document.createElement('button');
            this.toggle.id = `${containerId}-toggle`;
            this.toggle.className = 'sidebar-toggle';
            this.toggle.setAttribute('aria-label', 'Toggle Explorer');
            this.toggle.innerHTML = '<span class="icon">📁</span>';
            document.body.appendChild(this.toggle);
        }

        this.currentOrientation = window.matchMedia('(orientation: landscape)').matches ? 'landscape' : 'portrait';
        this.lastLandscapeExpandedState = true; // Default to expanded in landscape
        
        const startExpanded = (this.currentOrientation === 'landscape') ? this.lastLandscapeExpandedState : false;
        this.setupEventListeners();
        this.updateLayout(startExpanded);
    }

    private setupEventListeners() {
        this.toggle.addEventListener('click', () => {
            const isCurrentlyExpanded = this.container.classList.contains('expanded');
            const newExpanded = !isCurrentlyExpanded;

            if (this.currentOrientation === 'landscape') {
                this.lastLandscapeExpandedState = newExpanded;
            }

            this.updateLayout(newExpanded);
        });

        const orientationMediaQuery = window.matchMedia('(orientation: landscape)');
        orientationMediaQuery.addEventListener('change', (e) => {
            const newOrientation = e.matches ? 'landscape' : 'portrait';

            if (newOrientation !== this.currentOrientation) {
                this.currentOrientation = newOrientation;
                
                // In portrait mode, always collapse
                // In landscape, restore the last user preference
                const newExpanded = (newOrientation === 'landscape') 
                    ? this.lastLandscapeExpandedState 
                    : false;

                this.updateLayout(newExpanded);
            }
        });
    }

    private updateLayout(isExpanded: boolean) {
        // Update classes
        this.container.classList.toggle('expanded', isExpanded);
        document.body.classList.toggle('sidebar-expanded', isExpanded);

        // Update toggle icon
        const icon = this.toggle.querySelector('.icon');
        if (icon) {
            icon.textContent = isExpanded ? '⬅️' : '📁';
        }

        if (this.currentOrientation === 'landscape') {
            // In landscape mode, sidebar is part of the grid
            document.body.style.gridTemplateColumns = isExpanded 
                ? '200px 4px 1fr 4px 300px'
                : '48px 4px 1fr 4px 300px'; // Keep small width for toggle button

            // Always show in landscape (either full or collapsed)
            this.container.style.display = 'block';
            this.container.style.position = 'static';
            this.container.style.width = isExpanded ? '200px' : '48px';
        } else {
            // Portrait mode - overlay style
            document.body.style.gridTemplateColumns = '48px 4px 1fr 4px 300px';
            
            if (isExpanded) {
                this.container.style.display = 'block';
                this.container.style.position = 'fixed';
                this.container.style.width = '100%';
            } else {
                this.container.style.display = 'none';
            }
        }
    }

    public setContent(content: HTMLElement) {
        this.container.innerHTML = '';
        this.container.appendChild(content);
    }

    public getContainer(): HTMLElement {
        return this.container;
    }

    public getToggleButton(): HTMLButtonElement {
        return this.toggle;
    }
}