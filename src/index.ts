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

if (editor && preview) {
    editor.addEventListener("input", () => {
        preview.innerHTML = highlightSyntax(editor.value);
    });
}