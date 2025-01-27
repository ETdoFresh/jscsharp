import { highlightSyntax } from '../modules/syntax-highlighter';

export class Editor {
    private element: HTMLTextAreaElement;
    private changeCallback?: (value: string) => void;

    constructor(containerId: string) {
        this.element = document.createElement('textarea');
        this.element.id = containerId;
        this.element.className = 'editor-area';
        this.setupEventListeners();
    }

    private setupEventListeners() {
        this.element.addEventListener('input', () => {
            const value = this.element.value;
            if (this.changeCallback) {
                // Pass highlighted syntax to callback
                this.changeCallback(highlightSyntax(value));
            }
        });
    }

    public onChange(callback: (value: string) => void) {
        this.changeCallback = callback;
    }

    public getValue(): string {
        return this.element.value;
    }

    public setValue(value: string) {
        this.element.value = value;
        // Trigger change callback with initial value
        if (this.changeCallback) {
            this.changeCallback(highlightSyntax(value));
        }
    }

    public getElement(): HTMLTextAreaElement {
        return this.element;
    }
}