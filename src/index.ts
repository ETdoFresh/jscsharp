console.log("Hello from TypeScript!");

function highlightSyntax(text: string): string {
    const keywords = ["public", "class", "void", "int", "string", "if", "else", "for", "while", "return"];
    let highlightedText = text;
    keywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, "g");
        highlightedText = highlightedText.replace(regex, `<span style="color: blue;">${keyword}</span>`);
    });
    return highlightedText;
}

const editor = document.getElementById("editor-area") as HTMLTextAreaElement;
if (editor) {
    editor.addEventListener("input", () => {
        editor.innerHTML = highlightSyntax(editor.value);
    });
}