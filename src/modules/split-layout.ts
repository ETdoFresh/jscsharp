export class SplitLayout {
    private container: HTMLElement;
    private leftPanel: HTMLElement;
    private rightPanel: HTMLElement;
    private separator: HTMLElement;
    private isDragging = false;

    constructor(containerId: string) {
        // Create container
        this.container = document.createElement('div');
        this.container.id = containerId;
        this.container.style.display = 'grid';
        this.container.style.gridTemplateColumns = '1fr 4px 1fr';
        this.container.style.height = '100%';
        this.container.style.width = '100%';

        // Create panels
        this.leftPanel = document.createElement('div');
        this.leftPanel.className = 'split-panel left-panel';
        
        this.separator = document.createElement('div');
        this.separator.className = 'separator';
        
        this.rightPanel = document.createElement('div');
        this.rightPanel.className = 'split-panel right-panel';

        // Add elements to container
        this.container.appendChild(this.leftPanel);
        this.container.appendChild(this.separator);
        this.container.appendChild(this.rightPanel);

        this.setupEventListeners();
    }

    private setupEventListeners() {
        this.separator.addEventListener('mousedown', () => {
            this.isDragging = true;
            document.body.style.cursor = 'col-resize';
            this.separator.classList.add('dragging');
        });

        window.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;

            const containerRect = this.container.getBoundingClientRect();
            const percentage = ((e.clientX - containerRect.left) / containerRect.width) * 100;
            
            // Ensure panels don't get too small (minimum 20%)
            if (percentage >= 20 && percentage <= 80) {
                this.container.style.gridTemplateColumns = `${percentage}% 4px calc(${100 - percentage}% - 4px)`;
            }
        });

        window.addEventListener('mouseup', () => {
            if (this.isDragging) {
                this.isDragging = false;
                document.body.style.cursor = '';
                this.separator.classList.remove('dragging');
            }
        });
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

    // Set initial split ratio (0-1)
    public setSplitRatio(ratio: number) {
        const percentage = Math.min(Math.max(ratio * 100, 20), 80);
        this.container.style.gridTemplateColumns = `${percentage}% 4px calc(${100 - percentage}% - 4px)`;
    }
}