// Gestionnaire de templates avec variables dynamiques
export class TemplateManager {
    constructor() {
        this.storageKey = 'covalenTemplates';
        this.templates = this.loadTemplates();
        this.variables = this.getAvailableVariables();
    }

    // Variables disponibles pour les templates
    getAvailableVariables() {
        return {
            // Variables de date
            'date.today': () => new Date().toISOString().split('T')[0],
            'date.today.fr': () => new Date().toLocaleDateString('fr-FR'),
            'date.tomorrow': () => {
                const date = new Date();
                date.setDate(date.getDate() + 1);
                return date.toISOString().split('T')[0];
            },
            'date.next.week': () => {
                const date = new Date();
                date.setDate(date.getDate() + 7);
                return date.toISOString().split('T')[0];
            },
            'date.next.month': () => {
                const date = new Date();
                date.setMonth(date.getMonth() + 1);
                return date.toISOString().split('T')[0];
            },

            // Variables de temps
            'time.now': () => new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            'timestamp': () => new Date().toISOString(),

            // Variables utilisateur (peuvent être personnalisées)
            'user.name': () => 'Utilisateur',
            'user.initials': () => 'USR',
            'company.name': () => 'Covalen',
            'company.short': () => 'CSC',

            // Variables de numérotation
            'number.random': () => Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
            'year.current': () => new Date().getFullYear().toString(),
            'month.current': () => (new Date().getMonth() + 1).toString().padStart(2, '0'),
            'day.current': () => new Date().getDate().toString().padStart(2, '0'),

            // Variables conditionnelles
            'weekday.name': () => new Date().toLocaleDateString('fr-FR', { weekday: 'long' }),
            'month.name': () => new Date().toLocaleDateString('fr-FR', { month: 'long' }),

            // Variables calculées
            'deadline.30days': () => {
                const date = new Date();
                date.setDate(date.getDate() + 30);
                return date.toLocaleDateString('fr-FR');
            },
            'deadline.15days': () => {
                const date = new Date();
                date.setDate(date.getDate() + 15);
                return date.toLocaleDateString('fr-FR');
            }
        };
    }

    // Charger les templates
    loadTemplates() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : this.getDefaultTemplates();
        } catch (error) {
            console.error('Erreur lors du chargement des templates:', error);
            return this.getDefaultTemplates();
        }
    }

    // Templates par défaut
    getDefaultTemplates() {
        return {
            'annulation-fdm': {
                name: 'Annulation FDM Standard',
                description: 'Template pour les annulations avec fin de mandat',
                category: 'Annulations',
                fields: {
                    modelNumber: '{{number.model}}',
                    letterTemplate: '{{number.model}}/CO Lettre FDM - {{type.annulation}}',
                    epicNote: 'CSC - FDM {{type.desc}} {{number.model}} + doc',
                    emailName: '{{date.today}} CSC Assurance - {{action.type}} FDM'
                },
                variables: {
                    'number.model': { type: 'input', label: 'Numéro de modèle' },
                    'type.annulation': { type: 'select', options: ['Non-requis', 'Non-paiement', 'Court terme'], label: 'Type d\'annulation' },
                    'type.desc': { type: 'auto', source: 'type.annulation', transform: 'lowercase' },
                    'action.type': { type: 'auto', value: 'Annulation' }
                }
            },

            'rappel-paiement': {
                name: 'Rappel de Paiement',
                description: 'Template pour les rappels de paiement',
                category: 'Rappels',
                fields: {
                    modelNumber: '{{number.sequence}}',
                    letterTemplate: '{{number.sequence}}/CO {{type.rappel}} ({{method.delivery}})',
                    epicNote: 'CSC - {{type.action}} {{number.sequence}} + doc',
                    emailName: '{{date.today}} CSC Assurance - {{type.action}}'
                },
                variables: {
                    'number.sequence': { type: 'select', options: ['001', '002', '003'], label: 'Numéro de séquence' },
                    'type.rappel': { type: 'select', options: ['Dernier avis de paiement', 'Avis de rappel de paiement'], label: 'Type de rappel' },
                    'method.delivery': { type: 'select', options: ['Direct', 'Recommandé'], label: 'Méthode de livraison' },
                    'type.action': { type: 'auto', source: 'type.rappel', transform: 'simple' }
                }
            },

            'cime-replacement': {
                name: 'Assurance de Remplacement CIME',
                description: 'Template pour les assurances de remplacement CIME',
                category: 'Annulations',
                fields: {
                    modelNumber: '408',
                    letterTemplate: '408/CO Lettre FDM – CIME',
                    epicNote: 'CSC - lettre FDM Cime',
                    emailName: '{{date.today}} CSC Assurance de remplacement - FDM Cime'
                },
                variables: {}
            }
        };
    }

    // Sauvegarder les templates
    saveTemplates() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.templates));
        } catch (error) {
            console.error('Erreur lors de la sauvegarde des templates:', error);
        }
    }

    // Obtenir tous les templates pour une catégorie
    getTemplatesForCategory(category) {
        return Object.entries(this.templates)
            .filter(([id, template]) => !category || template.category === category)
            .map(([id, template]) => ({ id, ...template }));
    }

    // Générer les données à partir d'un template
    generateFromTemplate(templateId, userInputs = {}) {
        const template = this.templates[templateId];
        if (!template) {
            throw new Error(`Template non trouvé: ${templateId}`);
        }

        const resolvedFields = {};

        // Résoudre chaque champ du template
        Object.entries(template.fields).forEach(([fieldName, fieldTemplate]) => {
            resolvedFields[fieldName] = this.resolveTemplate(fieldTemplate, template.variables, userInputs);
        });

        console.log(`📋 Template généré: ${template.name}`, resolvedFields);
        return resolvedFields;
    }

    // Résoudre un template avec des variables
    resolveTemplate(templateString, templateVariables = {}, userInputs = {}) {
        let resolved = templateString;

        // Trouver toutes les variables dans le template
        const variableMatches = templateString.match(/\{\{([^}]+)\}\}/g) || [];

        variableMatches.forEach(match => {
            const variableName = match.slice(2, -2); // Enlever {{ et }}
            let value = '';

            // 1. Chercher dans les inputs utilisateur
            if (userInputs[variableName] !== undefined) {
                value = userInputs[variableName];
            }
            // 2. Chercher dans les variables du template
            else if (templateVariables[variableName]) {
                const varConfig = templateVariables[variableName];

                if (varConfig.type === 'auto') {
                    if (varConfig.value) {
                        value = varConfig.value;
                    } else if (varConfig.source && userInputs[varConfig.source]) {
                        value = this.transformValue(userInputs[varConfig.source], varConfig.transform);
                    }
                }
            }
            // 3. Chercher dans les variables système
            else if (this.variables[variableName]) {
                value = this.variables[variableName]();
            }

            resolved = resolved.replace(match, value);
        });

        return resolved;
    }

    // Transformer une valeur selon une règle
    transformValue(value, transform) {
        switch (transform) {
            case 'lowercase':
                return value.toLowerCase();
            case 'uppercase':
                return value.toUpperCase();
            case 'simple':
                // Simplifier le texte (enlever articles, etc.)
                return value.replace(/^(Dernier |Avis de )/i, '').replace(' de paiement', '');
            default:
                return value;
        }
    }

    // Créer un nouveau template
    createTemplate(templateData) {
        const id = this.generateTemplateId(templateData.name);
        this.templates[id] = {
            ...templateData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        this.saveTemplates();
        console.log(`📋 Nouveau template créé: ${templateData.name}`);
        return id;
    }

    // Modifier un template existant
    updateTemplate(templateId, updates) {
        if (!this.templates[templateId]) {
            throw new Error(`Template non trouvé: ${templateId}`);
        }

        this.templates[templateId] = {
            ...this.templates[templateId],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        this.saveTemplates();
        console.log(`📋 Template mis à jour: ${templateId}`);
    }

    // Supprimer un template
    deleteTemplate(templateId) {
        if (this.templates[templateId]) {
            delete this.templates[templateId];
            this.saveTemplates();
            console.log(`📋 Template supprimé: ${templateId}`);
        }
    }

    // Générer un ID pour un template
    generateTemplateId(name) {
        return name.toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    }

    // Obtenir les variables requises pour un template
    getRequiredVariables(templateId) {
        const template = this.templates[templateId];
        if (!template) return [];

        const required = [];

        Object.entries(template.variables || {}).forEach(([varName, config]) => {
            if (config.type === 'input' || config.type === 'select') {
                required.push({
                    name: varName,
                    label: config.label || varName,
                    type: config.type,
                    options: config.options || null,
                    required: true
                });
            }
        });

        return required;
    }

    // Prévisualiser un template avec des inputs
    previewTemplate(templateId, userInputs = {}) {
        try {
            return this.generateFromTemplate(templateId, userInputs);
        } catch (error) {
            console.error('Erreur lors de la prévisualisation:', error);
            return null;
        }
    }

    // Obtenir des suggestions de templates basées sur des mots-clés
    suggestTemplates(keywords, category = null) {
        const keywordLower = keywords.toLowerCase();

        return Object.entries(this.templates)
            .filter(([id, template]) => {
                const matchesCategory = !category || template.category === category;
                const matchesKeywords = template.name.toLowerCase().includes(keywordLower) ||
                    template.description.toLowerCase().includes(keywordLower);
                return matchesCategory && matchesKeywords;
            })
            .map(([id, template]) => ({ id, ...template }))
            .slice(0, 5);
    }
}

// Instance globale
export const templateManager = new TemplateManager();

// Alias pour la compatibilité avec App.js
templateManager.getAvailableTemplates = function () {
    return Object.entries(this.templates).map(([id, template]) => ({
        id,
        ...template
    }));
};

templateManager.createFromTemplate = function (templateId, customData = {}) {
    return this.generateFromTemplate(templateId, customData);
};
