// Gestionnaire de suggestions intelligentes basées sur l'historique
export class SmartSuggestions {
    constructor() {
        this.storageKey = 'covalenSmartSuggestions';
        this.suggestions = this.loadSuggestions();
        this.maxSuggestions = 100;
        this.minOccurrences = 2;
    }

    // Charger les suggestions depuis localStorage
    loadSuggestions() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : {
                modelNumbers: {},
                letterTemplates: {},
                epicNotes: {},
                emailNames: {},
                taskNames: {},
                procedures: {},
                combinations: {} // Suggestions basées sur des combinaisons de champs
            };
        } catch (error) {
            console.error('Erreur lors du chargement des suggestions:', error);
            return {};
        }
    }

    // Sauvegarder les suggestions
    saveSuggestions() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.suggestions));
        } catch (error) {
            console.error('Erreur lors de la sauvegarde des suggestions:', error);
        }
    }

    // Enregistrer une nouvelle valeur pour apprentissage
    learn(fieldType, value, context = {}) {
        if (!value || value.trim().length < 2) return;

        const normalizedValue = value.trim();

        // Incrémenter le compteur pour ce champ
        if (!this.suggestions[fieldType]) {
            this.suggestions[fieldType] = {};
        }

        if (!this.suggestions[fieldType][normalizedValue]) {
            this.suggestions[fieldType][normalizedValue] = {
                count: 0,
                lastUsed: null,
                contexts: []
            };
        }

        this.suggestions[fieldType][normalizedValue].count++;
        this.suggestions[fieldType][normalizedValue].lastUsed = new Date().toISOString();

        // Enregistrer le contexte si fourni
        if (Object.keys(context).length > 0) {
            this.suggestions[fieldType][normalizedValue].contexts.push({
                ...context,
                timestamp: new Date().toISOString()
            });

            // Limiter le nombre de contextes stockés
            if (this.suggestions[fieldType][normalizedValue].contexts.length > 5) {
                this.suggestions[fieldType][normalizedValue].contexts.shift();
            }
        }

        // Apprendre les combinaisons de champs
        this.learnCombinations(fieldType, normalizedValue, context);

        this.saveSuggestions();
        console.log(`🧠 Apprentissage: ${fieldType} = "${normalizedValue}" (${this.suggestions[fieldType][normalizedValue].count} fois)`);
    }

    // Apprendre les combinaisons de champs
    learnCombinations(fieldType, value, context) {
        if (!this.suggestions.combinations) {
            this.suggestions.combinations = {};
        }

        // Créer des associations entre les champs
        Object.keys(context).forEach(contextField => {
            if (contextField !== fieldType && context[contextField]) {
                const combinationKey = `${contextField}->${fieldType}`;
                const contextValue = context[contextField];

                if (!this.suggestions.combinations[combinationKey]) {
                    this.suggestions.combinations[combinationKey] = {};
                }

                if (!this.suggestions.combinations[combinationKey][contextValue]) {
                    this.suggestions.combinations[combinationKey][contextValue] = {};
                }

                if (!this.suggestions.combinations[combinationKey][contextValue][value]) {
                    this.suggestions.combinations[combinationKey][contextValue][value] = 0;
                }

                this.suggestions.combinations[combinationKey][contextValue][value]++;
            }
        });
    }

    // Obtenir des suggestions pour un champ
    getSuggestions(fieldType, query = '', context = {}, limit = 5) {
        const suggestions = [];

        // Suggestions directes basées sur l'historique
        const directSuggestions = this.getDirectSuggestions(fieldType, query, limit);
        suggestions.push(...directSuggestions);

        // Suggestions basées sur le contexte/combinaisons
        const contextSuggestions = this.getContextSuggestions(fieldType, context, query, limit - suggestions.length);
        suggestions.push(...contextSuggestions);

        // Éliminer les doublons et trier par pertinence
        const uniqueSuggestions = suggestions
            .filter((item, index, self) => self.findIndex(s => s.value === item.value) === index)
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);

        return uniqueSuggestions;
    }

    // Suggestions directes basées sur l'historique du champ
    getDirectSuggestions(fieldType, query, limit) {
        if (!this.suggestions[fieldType]) return [];

        const queryLower = query.toLowerCase();

        return Object.entries(this.suggestions[fieldType])
            .filter(([value, data]) => {
                // Filtrer par fréquence minimale et correspondance de texte
                return data.count >= this.minOccurrences &&
                    value.toLowerCase().includes(queryLower);
            })
            .map(([value, data]) => ({
                value,
                score: this.calculateScore(data, query),
                type: 'direct',
                frequency: data.count,
                lastUsed: data.lastUsed,
                confidence: Math.min(data.count / 10, 1) // Confiance basée sur la fréquence
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
    }

    // Suggestions basées sur le contexte
    getContextSuggestions(fieldType, context, query, limit) {
        if (!this.suggestions.combinations || limit <= 0) return [];

        const suggestions = [];
        const queryLower = query.toLowerCase();

        // Chercher dans les combinaisons
        Object.keys(context).forEach(contextField => {
            const contextValue = context[contextField];
            if (!contextValue) return;

            const combinationKey = `${contextField}->${fieldType}`;
            const combinations = this.suggestions.combinations[combinationKey];

            if (combinations && combinations[contextValue]) {
                Object.entries(combinations[contextValue])
                    .filter(([value]) => value.toLowerCase().includes(queryLower))
                    .forEach(([value, count]) => {
                        suggestions.push({
                            value,
                            score: count * 1.5, // Bonus pour les suggestions contextuelles
                            type: 'contextual',
                            frequency: count,
                            context: `Basé sur ${contextField}: ${contextValue}`,
                            confidence: Math.min(count / 5, 1)
                        });
                    });
            }
        });

        return suggestions
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
    }

    // Calculer le score de pertinence
    calculateScore(data, query) {
        let score = data.count; // Score de base = fréquence

        // Bonus pour utilisation récente
        if (data.lastUsed) {
            const daysSinceLastUse = (new Date() - new Date(data.lastUsed)) / (1000 * 60 * 60 * 24);
            const recencyBonus = Math.max(0, 10 - daysSinceLastUse);
            score += recencyBonus;
        }

        // Bonus pour correspondance exacte ou début de mot
        if (query) {
            const value = data.value || '';
            const queryLower = query.toLowerCase();
            const valueLower = value.toLowerCase();

            if (valueLower.startsWith(queryLower)) {
                score += 5; // Bonus pour correspondance au début
            }

            if (valueLower === queryLower) {
                score += 10; // Bonus pour correspondance exacte
            }
        }

        return score;
    }

    // Obtenir des suggestions de templates complets
    getTemplateSuggestions(partialData) {
        const templates = [];

        // Chercher des patterns récurrents dans l'historique
        if (partialData.modelNumber) {
            const relatedTemplates = this.findRelatedTemplates(partialData.modelNumber);
            templates.push(...relatedTemplates);
        }

        return templates.slice(0, 3);
    }

    // Trouver des templates liés à un numéro de modèle
    findRelatedTemplates(modelNumber) {
        const templates = [];

        // Logique pour identifier des patterns basés sur le numéro de modèle
        // Par exemple, si le numéro commence par "40X", suggérer des templates d'annulation

        if (modelNumber.startsWith('40')) {
            templates.push({
                name: 'Template Annulation FDM',
                suggestion: {
                    letterTemplate: `${modelNumber}/CO Lettre FDM - Type déterminé`,
                    epicNote: `CSC - FDM ${modelNumber} + doc`,
                    emailName: `${new Date().toISOString().split('T')[0]} CSC Assurance - Annulation FDM`
                },
                confidence: 0.8
            });
        }

        return templates;
    }

    // Nettoyer les suggestions anciennes ou peu utilisées
    cleanup() {
        const cutoffDate = new Date();
        cutoffDate.setMonth(cutoffDate.getMonth() - 6); // 6 mois

        Object.keys(this.suggestions).forEach(fieldType => {
            if (typeof this.suggestions[fieldType] === 'object') {
                Object.keys(this.suggestions[fieldType]).forEach(value => {
                    const data = this.suggestions[fieldType][value];

                    // Supprimer si peu utilisé et ancien
                    if (data.count < this.minOccurrences &&
                        (!data.lastUsed || new Date(data.lastUsed) < cutoffDate)) {
                        delete this.suggestions[fieldType][value];
                    }
                });
            }
        });

        this.saveSuggestions();
        console.log('🧹 Nettoyage des suggestions terminé');
    }

    // Exporter les suggestions pour analyse
    exportSuggestions() {
        return {
            ...this.suggestions,
            metadata: {
                totalEntries: Object.keys(this.suggestions).reduce((total, field) =>
                    total + Object.keys(this.suggestions[field] || {}).length, 0),
                exportDate: new Date().toISOString()
            }
        };
    }

    // Importer des suggestions
    importSuggestions(data) {
        if (data && typeof data === 'object') {
            this.suggestions = { ...this.suggestions, ...data };
            this.saveSuggestions();
            console.log('📥 Suggestions importées avec succès');
        }
    }
}

// Instance globale
export const smartSuggestions = new SmartSuggestions();

// Alias pour la compatibilité avec App.js
smartSuggestions.generateSuggestions = function (query, currentTasks = [], allData = {}) {
    // Génération de suggestions basées sur la recherche
    const suggestions = [];

    // Recherche dans les tâches actuelles
    if (currentTasks && Array.isArray(currentTasks)) {
        currentTasks.forEach(task => {
            if (task.nom && task.nom.toLowerCase().includes(query.toLowerCase())) {
                suggestions.push({
                    title: task.nom,
                    description: `Tâche dans ${task.category || 'Autres'}`,
                    action: 'select_task',
                    data: task,
                    confidence: 0.9
                });
            }
        });
    }

    // Suggestions de champs fréquents
    const fieldSuggestions = this.getSuggestions('general', query, {}, 3);
    fieldSuggestions.forEach(suggestion => {
        suggestions.push({
            title: suggestion.value,
            description: `Suggestion basée sur l'historique`,
            action: 'fill_field',
            data: { value: suggestion.value },
            confidence: suggestion.confidence
        });
    });

    return suggestions.slice(0, 5); // Limiter à 5 suggestions
};
