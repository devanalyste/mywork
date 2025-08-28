// Gestionnaire de thème sombre/clair
export class ThemeManager {
    constructor() {
        this.storageKey = 'covalenAppTheme';
        this.currentTheme = this.loadTheme();
        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);
        console.log(`🌙 Thème initialisé: ${this.currentTheme}`);
    }

    // Charger le thème depuis localStorage
    loadTheme() {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) return saved;

        // Détecter la préférence système
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    }

    // Sauvegarder le thème
    saveTheme(theme) {
        localStorage.setItem(this.storageKey, theme);
        this.currentTheme = theme;
    }

    // Appliquer le thème
    applyTheme(theme) {
        const root = document.documentElement;

        if (theme === 'dark') {
            root.classList.add('dark');
            this.setDarkVariables();
        } else {
            root.classList.remove('dark');
            this.setLightVariables();
        }

        this.currentTheme = theme;
    }

    // Variables CSS pour le thème sombre
    setDarkVariables() {
        const root = document.documentElement;
        root.style.setProperty('--bg-primary', '#1a1a1a');
        root.style.setProperty('--bg-secondary', '#2d2d2d');
        root.style.setProperty('--bg-tertiary', '#404040');
        root.style.setProperty('--text-primary', '#ffffff');
        root.style.setProperty('--text-secondary', '#b3b3b3');
        root.style.setProperty('--text-muted', '#808080');
        root.style.setProperty('--border-color', '#404040');
        root.style.setProperty('--accent-color', '#3b82f6');
        root.style.setProperty('--success-color', '#10b981');
        root.style.setProperty('--error-color', '#ef4444');
        root.style.setProperty('--warning-color', '#f59e0b');
        root.style.setProperty('--shadow', '0 4px 6px -1px rgba(0, 0, 0, 0.5)');
    }

    // Variables CSS pour le thème clair
    setLightVariables() {
        const root = document.documentElement;
        root.style.setProperty('--bg-primary', '#ffffff');
        root.style.setProperty('--bg-secondary', '#f8fafc');
        root.style.setProperty('--bg-tertiary', '#e2e8f0');
        root.style.setProperty('--text-primary', '#1a202c');
        root.style.setProperty('--text-secondary', '#4a5568');
        root.style.setProperty('--text-muted', '#718096');
        root.style.setProperty('--border-color', '#e2e8f0');
        root.style.setProperty('--accent-color', '#3b82f6');
        root.style.setProperty('--success-color', '#10b981');
        root.style.setProperty('--error-color', '#ef4444');
        root.style.setProperty('--warning-color', '#f59e0b');
        root.style.setProperty('--shadow', '0 4px 6px -1px rgba(0, 0, 0, 0.1)');
    }

    // Basculer entre les thèmes
    toggle() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(newTheme);
        this.saveTheme(newTheme);
        this.notifySubscribers();
        console.log(`🌙 Thème changé vers: ${newTheme}`);
        return newTheme;
    }

    // Obtenir le thème actuel
    getCurrentTheme() {
        return this.currentTheme;
    }

    // Vérifier si le mode sombre est actif
    isDark() {
        return this.currentTheme === 'dark';
    }

    // Écouter les changements de préférence système
    watchSystemPreference(callback) {
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addEventListener('change', (e) => {
                if (callback) {
                    callback(e.matches ? 'dark' : 'light');
                }
            });
        }
    }

    // Alias pour la compatibilité
    toggleTheme() {
        return this.toggle();
    }

    // Système d'abonnement pour les changements de thème
    subscribe(callback) {
        if (!this.subscribers) {
            this.subscribers = [];
        }
        this.subscribers.push(callback);

        // Retourner une fonction de désabonnement
        return () => {
            if (this.subscribers) {
                const index = this.subscribers.indexOf(callback);
                if (index > -1) {
                    this.subscribers.splice(index, 1);
                }
            }
        };
    }

    // Notifier les abonnés des changements
    notifySubscribers() {
        if (this.subscribers) {
            this.subscribers.forEach(callback => callback(this.currentTheme));
        }
    }
}

// Instance globale
export const themeManager = new ThemeManager();

// Classes CSS utilitaires pour les thèmes
export const themeClasses = {
    // Arrière-plans
    bgPrimary: 'bg-white dark:bg-gray-900',
    bgSecondary: 'bg-gray-50 dark:bg-gray-800',
    bgTertiary: 'bg-gray-100 dark:bg-gray-700',

    // Textes
    textPrimary: 'text-gray-900 dark:text-white',
    textSecondary: 'text-gray-600 dark:text-gray-300',
    textMuted: 'text-gray-500 dark:text-gray-400',

    // Bordures
    border: 'border-gray-200 dark:border-gray-600',
    borderFocus: 'border-blue-500 dark:border-blue-400',

    // Boutons
    btnPrimary: 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white',
    btnSecondary: 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white',

    // Cartes
    card: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 shadow-sm dark:shadow-gray-900/20',

    // Inputs
    input: 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400',
};

export default themeManager;
