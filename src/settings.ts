import './styles.css';
import { initTheme, setTheme } from './modules/theme-manager';

document.addEventListener('DOMContentLoaded', () => {
    // Add settings-page class to body
    document.body.classList.add('settings-page');

    // Initialize theme
    const currentTheme = initTheme();

    // Create main settings container
    const settingsContainer = document.createElement('div');
    settingsContainer.id = 'settings-container';
    settingsContainer.innerHTML = `
        <h2>Settings</h2>
        <div class="settings-section">
            <h3>Appearance</h3>
            <div class="settings-item">
                <span class="settings-item-label">Dark Mode</span>
                <label class="toggle-switch">
                    <input type="checkbox" id="theme-toggle" ${currentTheme === 'dark' ? 'checked' : ''}>
                    <span class="toggle-slider">
                        <span class="toggle-icons">
                            <i class="material-icons">light_mode</i>
                            <i class="material-icons">dark_mode</i>
                        </span>
                    </span>
                </label>
            </div>
        </div>
        <div class="settings-section">
            <h3>Editor</h3>
            <div class="settings-item">
                <span class="settings-item-label">Auto Save</span>
                <label class="toggle-switch">
                    <input type="checkbox" id="auto-save">
                    <span class="toggle-slider"></span>
                </label>
            </div>
        </div>
        <div class="settings-section">
            <h3>Code Analysis</h3>
            <div class="settings-item">
                <span class="settings-item-label">Enable Linting</span>
                <label class="toggle-switch">
                    <input type="checkbox" id="enable-linting" checked>
                    <span class="toggle-slider"></span>
                </label>
            </div>
        </div>
    `;

    // Add settings container to page
    const container = document.getElementById('settings-content');
    if (container) {
        container.appendChild(settingsContainer);
    }

    // Add theme change listener
    const themeToggle = document.getElementById('theme-toggle') as HTMLInputElement;
    if (themeToggle) {
        themeToggle.addEventListener('change', (e) => {
            const theme = (e.target as HTMLInputElement).checked ? 'dark' : 'light';
            setTheme(theme);
        });
    }
});