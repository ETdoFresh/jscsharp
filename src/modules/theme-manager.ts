export function initTheme() {
    // Check local storage for saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    return savedTheme;
}

export function setTheme(theme: string) {
    // Save theme to local storage
    localStorage.setItem('theme', theme);
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme);
}