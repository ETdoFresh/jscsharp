import './styles.css';

function highlightSyntax(text: string): string {
    // C# keywords
    const keywords = [
        "public", "private", "protected", "internal",
        "class", "interface", "struct", "enum",
        "void", "int", "string", "bool", "double", "float",
        "if", "else", "for", "foreach", "while", "do",
        "return", "break", "continue", "new",
        "using", "namespace", "static", "readonly"
    ];

    let highlightedText = text;

    // Handle strings (must come before keywords to prevent highlighting within strings)
    highlightedText = highlightedText.replace(
        /"([^"\\]*(\\.[^"\\]*)*)"/g,
        '<span style="color: #a31515;">$&</span>'
    );

    // Handle numbers
    highlightedText = highlightedText.replace(
        /\b\d+\b/g,
        '<span style="color: #098658;">$&</span>'
    );

    // Handle keywords
    keywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, "g");
        highlightedText = highlightedText.replace(
            regex,
            `<span style="color: #0000ff;">${keyword}</span>`
        );
    });

    // Handle comments
    highlightedText = highlightedText.replace(
        /\/\/.*/g,
        '<span style="color: #008000;">$&</span>'
    );

    return highlightedText.replace(/\n/g, '<br>');
}

const editor = document.getElementById("editor-area") as HTMLTextAreaElement;
const preview = document.getElementById("preview-area") as HTMLDivElement;
const leftSeparator = document.getElementById("left-separator") as HTMLDivElement;
const rightSeparator = document.getElementById("right-separator") as HTMLDivElement;
const explorerToggle = document.getElementById("explorer-toggle") as HTMLButtonElement;
const sidebar = document.getElementById("sidebar") as HTMLDivElement;

let isDragging = false;
let currentSeparator: HTMLElement | null = null;

if (editor && preview) {
    editor.addEventListener("input", () => {
        preview.innerHTML = highlightSyntax(editor.value);
    });
}

// Handle separator dragging
const startDragging = (e: MouseEvent, separator: HTMLElement) => {
    isDragging = true;
    currentSeparator = separator;
    separator.classList.add('dragging');
    document.body.style.cursor = 'col-resize';
};

const stopDragging = () => {
    if (isDragging && currentSeparator) {
        isDragging = false;
        currentSeparator.classList.remove('dragging');
        currentSeparator = null;
        document.body.style.cursor = '';
    }
};

const handleDrag = (e: MouseEvent) => {
    if (!isDragging || !currentSeparator) return;

    const gridColumns = getComputedStyle(document.body).gridTemplateColumns.split(' ');
    
    const totalWidth = document.body.clientWidth;
    let newWidth;
    
    if (currentSeparator.id === 'left-separator') {
        newWidth = Math.max(0, e.clientX); // Ensure width is not negative
        gridColumns[0] = newWidth + 'px';
    } else if (currentSeparator.id === 'right-separator') {
        newWidth = Math.max(0, totalWidth - e.clientX); // Ensure width is not negative
        gridColumns[4] = newWidth + 'px';
    }
    gridColumns[2] = '1fr'; // Ensure middle column takes remaining space
    document.body.style.gridTemplateColumns = gridColumns.join(' ');
};

if (explorerToggle && sidebar) {
    explorerToggle.addEventListener("click", () => {
        sidebar.classList.toggle("expanded");
        document.body.classList.toggle("sidebar-expanded");

        // Update icon
        const icon = explorerToggle.querySelector(".icon");
        if (icon) {
            icon.textContent = sidebar.classList.contains("expanded") ? "⬅️" : "📁";
        }
    });
}

if (leftSeparator) {
    leftSeparator.addEventListener('mousedown', (e) => startDragging(e, leftSeparator));
}

if (rightSeparator) {
    rightSeparator.addEventListener('mousedown', (e) => startDragging(e, rightSeparator));
}

window.addEventListener('mouseup', stopDragging);
window.addEventListener('mousemove', handleDrag);

// Handle orientation changes
const orientationMediaQuery = window.matchMedia("(orientation: landscape)");

function handleOrientationChange(e: MediaQueryListEvent | MediaQueryList) {
    if (!sidebar) return;
    
    if (e.matches) {
        // Landscape mode - show explorer
        if (!sidebar.classList.contains("expanded")) {
            sidebar.classList.add("expanded");
            document.body.classList.add("sidebar-expanded");
        }
    } else {
        // Portrait mode - hide explorer
        sidebar.classList.remove("expanded");
        document.body.classList.remove("sidebar-expanded");
    }
}

// Initial check
handleOrientationChange(orientationMediaQuery);
orientationMediaQuery.addEventListener("change", handleOrientationChange);