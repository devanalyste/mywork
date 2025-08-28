// Gestionnaire de raccourcis clavier globaux
export class KeyboardShortcuts {
    constructor() {
        this.shortcuts = new Map();
        this.isEnabled = true;
        this.init();
    }

    init() {
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        console.log('⌨️ Raccourcis clavier activés');
    }

    // Enregistrer un raccourci
    register(combination, callback, description = '') {
        this.shortcuts.set(combination, { callback, description });
        console.log(`⌨️ Raccourci enregistré: ${combination} - ${description}`);
    }

    // Supprimer un raccourci
    unregister(combination) {
        this.shortcuts.delete(combination);
    }

    // Activer/désactiver les raccourcis
    setEnabled(enabled) {
        this.isEnabled = enabled;
    }

    // Gestionnaire principal des événements clavier
    handleKeyDown(event) {
        if (!this.isEnabled) return;

        // Ignorer si l'utilisateur tape dans un champ de texte
        const activeElement = document.activeElement;
        const isInputActive = activeElement && (
            activeElement.tagName === 'INPUT' ||
            activeElement.tagName === 'TEXTAREA' ||
            activeElement.contentEditable === 'true'
        );

        const combination = this.getCombination(event);
        const shortcut = this.shortcuts.get(combination);

        if (shortcut) {
            // Pour Ctrl+S, toujours intercepter même dans les champs
            if (combination === 'ctrl+s') {
                event.preventDefault();
                shortcut.callback(event);
                return;
            }

            // Pour les autres raccourcis, éviter l'interception dans les champs de texte
            if (!isInputActive) {
                event.preventDefault();
                shortcut.callback(event);
            }
        }
    }

    // Convertir l'événement en combinaison de touches
    getCombination(event) {
        const keys = [];

        if (event.ctrlKey) keys.push('ctrl');
        if (event.altKey) keys.push('alt');
        if (event.shiftKey) keys.push('shift');
        if (event.metaKey) keys.push('meta');

        const key = event.key.toLowerCase();
        if (!['control', 'alt', 'shift', 'meta'].includes(key)) {
            keys.push(key);
        }

        return keys.join('+');
    }

    // Obtenir la liste des raccourcis enregistrés
    getRegisteredShortcuts() {
        return Array.from(this.shortcuts.entries()).map(([combination, info]) => ({
            combination,
            description: info.description
        }));
    }

    // Formater les raccourcis pour l'affichage
    formatShortcut(combination) {
        return combination
            .split('+')
            .map(key => {
                switch (key) {
                    case 'ctrl': return 'Ctrl';
                    case 'alt': return 'Alt';
                    case 'shift': return 'Shift';
                    case 'meta': return 'Cmd';
                    default: return key.toUpperCase();
                }
            })
            .join(' + ');
    }
}

// Instance globale
export const keyboardShortcuts = new KeyboardShortcuts();

// Raccourcis prédéfinis
export const registerDefaultShortcuts = (handlers) => {
    // Ctrl+S : Sauvegarder
    keyboardShortcuts.register('ctrl+s', handlers.save, 'Sauvegarder les modifications');

    // Escape : Fermer les modales/annuler
    keyboardShortcuts.register('escape', handlers.escape, 'Fermer/Annuler');

    // Ctrl+Z : Annuler (Undo)
    keyboardShortcuts.register('ctrl+z', handlers.undo, 'Annuler la dernière action');

    // Ctrl+Y : Refaire (Redo)
    keyboardShortcuts.register('ctrl+y', handlers.redo, 'Refaire l\'action annulée');

    // Ctrl+F : Rechercher
    keyboardShortcuts.register('ctrl+f', handlers.search, 'Rechercher');

    // F1 : Aide/Raccourcis
    keyboardShortcuts.register('f1', handlers.help, 'Afficher l\'aide');

    // Ctrl+N : Nouvelle tâche
    keyboardShortcuts.register('ctrl+n', handlers.newTask, 'Nouvelle tâche');

    // Delete : Supprimer l'élément sélectionné
    keyboardShortcuts.register('delete', handlers.delete, 'Supprimer l\'élément sélectionné');
};

export default keyboardShortcuts;
