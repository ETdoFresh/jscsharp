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

        // Create container wrapper
        const splitContainer = document.createElement('div');
        splitContainer.className = 'split-container';
        splitContainer.style.cssText = 'display:grid; grid-template-columns:auto 4px auto 4px auto; height:100%; width:100%; overflow:hidden;';
        
        // Initialize container
        this.container = splitContainer;

        // Create panels and separators
        this.panelConfigs.forEach((config, index) => {
            const panel = document.createElement('div');
            panel.className = `split-panel ${config.id}-panel`;
            panel.style.cssText = 'height:100%; display:flex; flex-direction:column; overflow:hidden;';
            this.panels.push(panel);

            // Add panel to the appropriate grid column
            panel.style.gridColumn = (index * 2 + 1).toString();
            splitContainer.appendChild(panel);

            // Create separator (except after last panel)
            if (index < this.panelConfigs.length - 1) {
                const separator = document.createElement('div');
                separator.className = 'separator';
                separator.style.cssText = 'height:100%; cursor:col-resize; background:var(--border-color); grid-column:' + (index * 2 + 2);
                separator.setAttribute('role', 'separator');
                separator.setAttribute('tabindex', '0');
                separator.dataset.index = index.toString();
                
                this.separators.push(separator);
                splitContainer.appendChild(separator);
            }
        });

        // Add the split container to the existing container
        existingContainer.appendChild(splitContainer);
    }

    private updateGridTemplateColumns() {
        if (!this.container || !this.state.containerWidth) return;

        const columns = this.state.ratios.map((ratio, index) => {
            const width = Math.floor(this.state.containerWidth * ratio);
            return width + 'px';
        }).join(' 4px ');

        this.container.style.gridTemplateColumns = columns;
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
        
        requestAnimationFrame(() => {
            if (this.disposed) return;

            // Apply min/max constraints to ratios
            const adjustedRatios = this.state.ratios.map((ratio, index) => {
                // Skip hidden panels
                if (this.panels[index].classList.contains('hidden')) {
                    return 0;
                }
                const config = this.panelConfigs[index];
                const minRatio = config.minRatio ?? 0;  // Allow panels to collapse to 0
                const maxRatio = config.maxRatio ?? 0.8;
                return Math.min(maxRatio, Math.max(minRatio, ratio));
            });

            // Count visible panels and normalize their ratios
            const visiblePanels = this.panels.filter(p => !p.classList.contains('hidden')).length;
            const totalRatio = adjustedRatios.reduce((sum, ratio) => sum + ratio, 0);
            
            // Adjust ratios to distribute space between visible panels
            const normalizedRatios = adjustedRatios.map(ratio => {
                if (totalRatio === 0) return 1 / visiblePanels;
                return ratio / totalRatio;
            });

            // Build grid template columns
            const columns = this.panels.map((panel, index) => {
                if (panel.classList.contains('hidden')) return '0';
                const width = Math.floor(this.state.containerWidth * normalizedRatios[index]);
                return width + 'px';
            }).join(' 4px ');

            this.container.style.gridTemplateColumns = columns;

            // Save ratios
            localStorage.setItem(`splitLayoutRatios-${this.container.id}`, JSON.stringify(this.state.ratios));
        });
    };

    private handleMouseMove = (e: MouseEvent) => {
        if (this.isDragging === -1 || this.disposed || !this.container) return;

        const containerRect = this.container.getBoundingClientRect();
        const totalWidth = containerRect.width - (this.separators.length * 4); // Account for separator widths
        const mouseX = e.clientX - containerRect.left;
        const separatorIndex = this.isDragging;

        // Calculate the position as a ratio
        let leftWidth = mouseX;
        const minLeftWidth = totalWidth * (this.panelConfigs[separatorIndex].minRatio ?? 0);
        const maxLeftWidth = totalWidth * (this.panelConfigs[separatorIndex].maxRatio ?? 0.8);
        
        // Constrain the width
        leftWidth = Math.max(minLeftWidth, Math.min(maxLeftWidth, leftWidth));
        
        // Calculate new ratios
        const newRatios = [...this.state.ratios];
        const remainingWidth = totalWidth - leftWidth;
        
        // Update ratios for the panels on either side of the separator
        newRatios[separatorIndex] = leftWidth / totalWidth;
        newRatios[separatorIndex + 1] = remainingWidth / totalWidth;
        
        // Normalize ratios to ensure they sum to 1
        const sum = newRatios.reduce((a, b) => a + b, 0);
        const normalizedRatios = newRatios.map(r => r / sum);
        
        // Update if ratios have changed
        if (normalizedRatios.some((r, i) => Math.abs(r - this.state.ratios[i]) > 0.001)) {
            this.state.ratios = normalizedRatios;
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
