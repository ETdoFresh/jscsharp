interface Tab {
    id: string;
    label: string;
    content: HTMLElement;
}

export class TabbedView {
    private container: HTMLElement;
    private tabBar: HTMLElement;
    private contentArea: HTMLElement;
    private tabs: Tab[] = [];
    private activeTabId: string | null = null;

    constructor(containerId: string) {
        // Create container
        this.container = document.createElement('div');
        this.container.id = containerId;
        this.container.style.display = 'flex';
        this.container.style.flexDirection = 'column';
        this.container.style.height = '100%';

        // Create tab bar
        this.tabBar = document.createElement('div');
        this.tabBar.className = 'tabbed-view-bar';
        this.tabBar.style.display = 'flex';
        this.tabBar.style.borderBottom = '1px solid #ccc';
        this.tabBar.style.backgroundColor = '#f5f5f5';

        // Create content area
        this.contentArea = document.createElement('div');
        this.contentArea.className = 'tabbed-view-content';
        this.contentArea.style.flex = '1';
        this.contentArea.style.overflow = 'auto';
        this.contentArea.style.padding = '10px';

        this.container.appendChild(this.tabBar);
        this.container.appendChild(this.contentArea);
    }

    public addTab(tab: Tab): void {
        this.tabs.push(tab);

        const tabButton = document.createElement('button');
        tabButton.className = 'tab-button';
        tabButton.textContent = tab.label;
        tabButton.style.padding = '8px 16px';
        tabButton.style.border = 'none';
        tabButton.style.borderBottom = '2px solid transparent';
        tabButton.style.backgroundColor = 'transparent';
        tabButton.style.cursor = 'pointer';

        tabButton.addEventListener('click', () => {
            this.activateTab(tab.id);
        });

        this.tabBar.appendChild(tabButton);

        // Hide content initially
        tab.content.style.display = 'none';
        this.contentArea.appendChild(tab.content);

        // If this is the first tab, activate it
        if (this.tabs.length === 1) {
            this.activateTab(tab.id);
        }
    }

    public activateTab(tabId: string): void {
        const tab = this.tabs.find(t => t.id === tabId);
        if (!tab) return;

        // Update tab buttons
        const buttons = Array.from(this.tabBar.getElementsByClassName('tab-button')) as HTMLElement[];
        buttons.forEach(button => {
            if (button.textContent === tab.label) {
                button.style.borderBottom = '2px solid #0078d4';
                button.style.backgroundColor = '#fff';
            } else {
                button.style.borderBottom = '2px solid transparent';
                button.style.backgroundColor = 'transparent';
            }
        });

        // Update content visibility
        this.tabs.forEach(t => {
            t.content.style.display = t.id === tabId ? 'block' : 'none';
        });

        this.activeTabId = tabId;
    }

    public getContainer(): HTMLElement {
        return this.container;
    }

    public getActiveTabId(): string | null {
        return this.activeTabId;
    }
}