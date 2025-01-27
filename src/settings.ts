import './styles.css';
import { Sidebar } from './modules/sidebar';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize sidebar with settings-specific content
    const sidebar = new Sidebar('sidebar');
    sidebar.setContent('settings', document.createElement('div'));

    // Create main settings container
    const settingsContainer = document.createElement('div');
    settingsContainer.id = 'settings-container';
    settingsContainer.innerHTML = `
        <h2>Settings</h2>
        <div class="settings-section">
            <h3>Editor</h3>
            <label>
                Theme:
                <select id="editor-theme">
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                </select>
            </label>
        </div>
        <div class="settings-section">
            <h3>Code Analysis</h3>
            <label>
                <input type="checkbox" id="enable-linting" checked>
                Enable Linting
            </label>
        </div>
    `;

    // Add settings container to page
    const container = document.getElementById('settings-content');
    if (container) {
        container.appendChild(settingsContainer);
    }
});