interface SplitState {
    ratio: number;
    lastX: number;
    containerWidth: number;
}

export class SplitLayout {
    private container!: HTMLElement;
    private leftPanel!: HTMLElement;
    private rightPanel!: HTMLElement;
    private separator!: HTMLElement;
    private state: SplitState = {
        ratio: 0.5,
        lastX: 0,
        containerWidth: 0
    };
    private isDragging = false;
    private animationFrameId: number | null = null;
    private disposed = false;

    constructor(containerId: string) {
        this.createDOMStructure(containerId);
        this.setupEventListeners();
        this.updateLayout();
        
        // Initial layout update on next frame
        requestAnimationFrame(() => this.updateContainerWidth());
        
        // Handle window resizes
        window.addEventListener('resize', this.handleResize);
    }

    private createDOMStructure(containerId: string) {
        // Create elements
        this.container = document.createElement('div');
        this.container.id = containerId;
        this.leftPanel = document.createElement('div');
        this.rightPanel = document.createElement('div');
        this.separator = document.createElement('div');

        // Set classes and ARIA attributes
        this.container.className = 'split-container';
        this.leftPanel.className = 'split-panel left-panel';
        this.rightPanel.className = 'split-panel right-panel';
        this.separator.className = 'separator';
        this.separator.setAttribute('role', 'separator');
        this.separator.setAttribute('aria-valuenow', '50');
        this.separator.setAttribute('aria-valuemin', '20');
        this.separator.setAttribute('aria-valuemax', '80');
        this.separator.setAttribute('tabindex', '0');

        // Add elements to container
        this.container.appendChild(this.leftPanel);
        this.container.appendChild(this.separator);
        this.container.appendChild(this.rightPanel);

        // Apply base styles
        this.container.style.cssText = 'position:relative; display:flex; width:100%; height:100%; overflow:hidden;';
        this.separator.style.cssText = 'position:absolute; width:4px; height:100%; cursor:col-resize; z-index:1;';
        this.leftPanel.style.cssText = 'position:relative; overflow:hidden;';
        this.rightPanel.style.cssText = 'position:relative; overflow:hidden;';
    }

    private updateContainerWidth = () => {
        const rect = this.container.getBoundingClientRect();
        if (rect.width !== this.state.containerWidth) {
            this.state.containerWidth = rect.width;
            this.updateLayout();
        }
    };

    private updateLayout = () => {
        if (this.disposed || !this.state.containerWidth) return;

        const percentage = this.state.ratio * 100;
        const separatorOffset = this.state.containerWidth * this.state.ratio;

        requestAnimationFrame(() => {
            if (this.disposed) return;
            
            this.leftPanel.style.width = `${percentage}%`;
            this.rightPanel.style.width = `${100 - percentage}%`;
            this.separator.style.transform = `translateX(${separatorOffset}px)`;
            this.separator.setAttribute('aria-valuenow', percentage.toString());
        });
    };

    private handleResize = () => {
        if (this.disposed) return;
        requestAnimationFrame(() => this.updateContainerWidth());
    };

    private handleMouseMove = (e: MouseEvent) => {
        if (!this.isDragging || this.disposed) return;

        // Cancel any pending frame
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
        }

        this.animationFrameId = requestAnimationFrame(() => {
            const containerRect = this.container.getBoundingClientRect();
            const deltaX = e.clientX - this.state.lastX;
            const deltaPct = deltaX / containerRect.width;
            const newRatio = Math.min(0.8, Math.max(0.2, this.state.ratio + deltaPct));
            
            this.state.lastX = e.clientX;
            this.state.ratio = newRatio;
            this.updateLayout();
        });
    };

    private handleMouseUp = () => {
        if (this.isDragging) {
            this.isDragging = false;
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            this.separator.classList.remove('dragging');
            
            // Store final position
            localStorage.setItem('splitLayoutRatio', this.state.ratio.toString());
        }
    };

    private handleKeyDown = (e: KeyboardEvent) => {
        if (this.disposed) return;

        const step = e.shiftKey ? 0.1 : 0.01;
        let newRatio = this.state.ratio;

        switch (e.key) {
            case 'ArrowLeft':
                newRatio = Math.max(0.2, this.state.ratio - step);
                break;
            case 'ArrowRight':
                newRatio = Math.min(0.8, this.state.ratio + step);
                break;
            default:
                return;
        }

        e.preventDefault();
        this.state.ratio = newRatio;
        this.updateLayout();
        localStorage.setItem('splitLayoutRatio', newRatio.toString());
    };

    private setupEventListeners() {
        // Mouse events
        this.separator.addEventListener('mousedown', (e: MouseEvent) => {
            if (!this.disposed) {
                this.isDragging = true;
                this.state.lastX = e.clientX;
                document.body.style.cursor = 'col-resize';
                document.body.style.userSelect = 'none';
                this.separator.classList.add('dragging');
                e.preventDefault();
            }
        });

        document.addEventListener('mousemove', this.handleMouseMove);
        document.addEventListener('mouseup', this.handleMouseUp);

        // Keyboard events
        this.separator.addEventListener('keydown', this.handleKeyDown);

        // Touch events
        this.separator.addEventListener('touchstart', (e) => {
            if (!this.disposed) {
                this.isDragging = true;
                const touch = e.touches[0];
                this.state.lastX = touch.clientX;
                this.separator.classList.add('dragging');
                document.body.style.userSelect = 'none';
                e.preventDefault();
            }
        });

        this.separator.addEventListener('touchmove', (e) => {
            if (!this.isDragging || this.disposed) return;
            const touch = e.touches[0];
            const event = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.handleMouseMove(event);
            e.preventDefault();
        });

        this.separator.addEventListener('touchend', () => {
            this.handleMouseUp();
        });
    }

    public dispose() {
        this.disposed = true;
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
        }
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('mouseup', this.handleMouseUp);
        window.removeEventListener('resize', this.handleResize);
    }

    public getContainer(): HTMLElement {
        return this.container;
    }

    public getLeftPanel(): HTMLElement {
        return this.leftPanel;
    }

    public getRightPanel(): HTMLElement {
        return this.rightPanel;
    }

    // Set split ratio (0-1)
    public setSplitRatio(ratio: number) {
        this.state.ratio = Math.min(Math.max(ratio, 0.2), 0.8);
        this.updateLayout();
    }
}
