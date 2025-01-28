interface SplitState {
    ratios: number[];
    lastX: number;
    containerWidth: number;
}

export interface SplitPanel {
    id: string;
    minRatio?: number;
    maxRatio?: number;
}

export class SplitLayout {
    private container!: HTMLElement;
    private panels: HTMLElement[] = [];
    private separators: HTMLElement[] = [];
    private state: SplitState = {
        ratios: [],
        lastX: 0,
        containerWidth: 0
    };
    private isDragging: number = -1; // Index of separator being dragged
    private resizeObserver!: ResizeObserver;
    private disposed = false;
    private panelConfigs: SplitPanel[] = [];

    constructor(containerId: string, panels: SplitPanel[]) {
        if (panels.length < 2) {
            throw new Error('SplitLayout requires at least 2 panels');
        }
        this.panelConfigs = panels;
        
        // Clear any previously saved ratios
        localStorage.removeItem(`splitLayoutRatios-${containerId}`);

        // Initialize empty ratios array with equal distributions
        this.state.ratios = Array(panels.length).fill(1/panels.length);

        this.createDOMStructure(containerId);
        this.setupEventListeners();
        
        // Wait for next frame to set up resize observer and get initial width
        requestAnimationFrame(() => {
            this.setupResizeObserver();
            this.updateContainerWidth();
        });
        
        // Initial layout update on next frame
        requestAnimationFrame(() => this.updateContainerWidth());
    }

    private createDOMStructure(containerId: string) {
        // Get existing container
        const existingContainer = document.getElementById(containerId);
        if (!existingContainer) {
            throw new Error(`Container element with id "${containerId}" not found`);
        }
        // Initialize container
        this.container = existingContainer;
        this.container.className = 'split-container';
        this.container.style.cssText = 'display:flex; height:100%; width:100%; overflow:hidden; position:relative;';

        // Create panels and separators
        this.panelConfigs.forEach((config, index) => {
            // Create panel with proper structure
            const panel = document.createElement('div');
            panel.className = `split-panel ${config.id}-panel`;
            panel.style.cssText = 'height: 100%; position: relative;';
            this.panels.push(panel);
            this.container.appendChild(panel);

            // Create separator (except after last panel)
            if (index < this.panelConfigs.length - 1) {
                const separator = document.createElement('div');
                separator.className = 'separator';
                separator.style.cssText = 'width:4px; height:100%; cursor:col-resize; background:var(--border-color); z-index:10; touch-action:none; user-select:none; -webkit-user-select:none; flex:0 0 4px; position:relative;';
                separator.setAttribute('role', 'separator');
                separator.setAttribute('aria-valuenow', '50');
                separator.setAttribute('aria-valuemin', '20');
                separator.setAttribute('aria-valuemax', '80');
                separator.setAttribute('tabindex', '0');
                separator.dataset.index = index.toString();
                
                this.separators.push(separator);
                this.container.appendChild(separator);
            }
        });
    }

    private setupResizeObserver() {
        this.resizeObserver = new ResizeObserver((entries) => {
            console.log('ResizeObserver width:', entries[0].contentRect.width);
            this.state.containerWidth = entries[0].contentRect.width;
            this.updateLayout();
        });
        console.log('Setting up ResizeObserver');
        this.resizeObserver.observe(this.container);
    }

    private updateContainerWidth = () => {
        const rect = this.container.getBoundingClientRect();
        console.log('Container width:', rect.width);
        if (rect.width !== this.state.containerWidth) {
            this.state.containerWidth = rect.width;
            this.updateLayout();
        }
    };

    private updateLayout = () => {
        if (this.disposed || !this.state.containerWidth) return;
        
        let currentPosition = 0;
        
        requestAnimationFrame(() => {
            if (this.disposed) return;
            
            this.panels.forEach((panel, index) => {
                const config = this.panelConfigs[index];
                const minRatio = config.minRatio ?? 0.1;
                const maxRatio = config.maxRatio ?? 0.8;
                
                // Calculate panel width as a percentage
                const ratio = Math.min(maxRatio, Math.max(minRatio, this.state.ratios[index]));
                const percentage = ratio * 100;
                panel.style.width = `${percentage}%`;
                panel.style.flexShrink = '0';
                console.log(`Panel ${index} - ratio: ${ratio}, width: ${percentage}%`);
                
                // Update separator aria attributes
                if (index < this.separators.length) {
                    const separator = this.separators[index];
                    separator.setAttribute('aria-valuenow', Math.round(ratio * 100).toString());
                }
            });
            
            // Save ratios
            localStorage.setItem(`splitLayoutRatios-${this.container.id}`, JSON.stringify(this.state.ratios));
        });
    };

    private handleMouseMove = (e: MouseEvent) => {
        if (this.isDragging === -1 || this.disposed) return;
        
        const containerRect = this.container.getBoundingClientRect();
        const relativeX = e.clientX - containerRect.left;
        
        // Calculate new ratios based on separator position
        const newRatios = [...this.state.ratios];
        const totalWidth = containerRect.width;
        const separatorIndex = this.isDragging;
        
        // Calculate the new position as a ratio of total width
        const newRatio = relativeX / totalWidth;
        
        // Calculate the sum of ratios before this separator
        const previousRatiosSum = newRatios.slice(0, separatorIndex).reduce((sum, r) => sum + r, 0);
        
        // Calculate the direct ratio difference from current position
        const ratioDiff = newRatio - previousRatiosSum;
        
        // Calculate the new ratio for the current panel
        const currentConfig = this.panelConfigs[separatorIndex];
        const nextConfig = this.panelConfigs[separatorIndex + 1];
        
        // Get the sum of all ratios from panels before this separator
        const beforeSum = newRatios.slice(0, separatorIndex).reduce((sum, r) => sum + r, 0);
        
        // Calculate the maximum available space for these two panels
        const availableRatio = 1 - beforeSum - newRatios.slice(separatorIndex + 2).reduce((sum, r) => sum + r, 0);
        
        // Calculate new ratio for current panel based on mouse position
        let newCurrentRatio = (relativeX - (beforeSum * totalWidth)) / totalWidth;
        
        // Constrain the ratio within min/max bounds
        newCurrentRatio = Math.min(
            Math.max(currentConfig.minRatio ?? 0.1, newCurrentRatio),
            Math.min(currentConfig.maxRatio ?? 0.8, availableRatio - (nextConfig.minRatio ?? 0.1))
        );
        
        // Calculate the next panel's ratio
        const newNextRatio = availableRatio - newCurrentRatio;
        
        // Update ratios if they're valid
        if (newNextRatio >= (nextConfig.minRatio ?? 0.1) &&
            newNextRatio <= (nextConfig.maxRatio ?? 0.8)) {
            newRatios[separatorIndex] = newCurrentRatio;
            newRatios[separatorIndex + 1] = newNextRatio;
        }
        
        // Only update if ratios have changed
        if (newRatios.some((r, i) => r !== this.state.ratios[i])) {
            this.state.ratios = newRatios;
            this.updateLayout();
        }
    };

    private handleMouseUp = () => {
        if (this.isDragging !== -1) {
            this.isDragging = -1;
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            this.separators.forEach(s => s.classList.remove('dragging'));
            localStorage.setItem(`splitLayoutRatios-${this.container.id}`, JSON.stringify(this.state.ratios));
        }
    };

    private handleKeyDown = (e: KeyboardEvent) => {
        if (this.disposed) return;

        const separatorIndex = parseInt((e.target as HTMLElement).dataset.index ?? '-1');
        if (separatorIndex === -1) return;

        const step = e.shiftKey ? 0.1 : 0.01;
        const newRatios = [...this.state.ratios];

        switch (e.key) {
            case 'ArrowLeft':
                newRatios[separatorIndex] = Math.max(
                    this.panelConfigs[separatorIndex].minRatio ?? 0.1, 
                    newRatios[separatorIndex] - step
                );
                newRatios[separatorIndex + 1] += step;
                break;
            case 'ArrowRight':
                newRatios[separatorIndex] = Math.min(
                    this.panelConfigs[separatorIndex].maxRatio ?? 0.8, 
                    newRatios[separatorIndex] + step
                );
                newRatios[separatorIndex + 1] -= step;
                break;
            default:
                return;
        }

        if (newRatios.some((r, i) => r !== this.state.ratios[i])) {
            e.preventDefault();
            this.state.ratios = newRatios;
            this.updateLayout();
            localStorage.setItem(`splitLayoutRatios-${this.container.id}`, JSON.stringify(this.state.ratios));
        }
    };

    private setupEventListeners() {
        // Mouse events for each separator
        this.separators.forEach((separator, index) => {
            separator.addEventListener('mousedown', (e: MouseEvent) => {
                if (!this.disposed) {
                    this.isDragging = index;
                    document.body.style.cursor = 'col-resize';
                    document.body.style.userSelect = 'none';
                    separator.classList.add('dragging');
                    e.preventDefault();
                }
            });

            // Keyboard events
            separator.addEventListener('keydown', this.handleKeyDown);

            // Touch events
            separator.addEventListener('touchstart', (e) => {
                if (!this.disposed) {
                    this.isDragging = index;
                    separator.classList.add('dragging');
                    document.body.style.userSelect = 'none';
                    e.preventDefault();
                }
            });
        });

        document.addEventListener('mousemove', this.handleMouseMove);
        document.addEventListener('mouseup', this.handleMouseUp);

        // Touch events
        document.addEventListener('touchmove', (e) => {
            if (this.isDragging === -1 || this.disposed) return;
            const touch = e.touches[0];
            const containerRect = this.container.getBoundingClientRect();
            if (touch.clientX < containerRect.left || touch.clientX > containerRect.right) return;
            
            const event = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY,
                bubbles: true,
                cancelable: true
            });
            this.handleMouseMove(event);
            e.preventDefault();
        }, { passive: false });

        document.addEventListener('touchend', () => {
            this.handleMouseUp();
        });
    }

    public dispose() {
        this.disposed = true;
        this.resizeObserver.disconnect();
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('mouseup', this.handleMouseUp);
    }

    public getContainer(): HTMLElement {
        return this.container;
    }

    public getPanel(id: string): HTMLElement | undefined {
        const index = this.panelConfigs.findIndex(p => p.id === id);
        return index !== -1 ? this.panels[index] : undefined;
    }

    public setRatios(ratios: number[]) {
        if (ratios.length !== this.panelConfigs.length) {
            throw new Error('Number of ratios must match number of panels');
        }
        this.state.ratios = ratios;
        this.updateLayout();
    }
}
