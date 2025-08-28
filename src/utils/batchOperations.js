// Gestionnaire d'opérations par lot (batch operations)
export class BatchOperations {
    constructor() {
        this.selectedItems = new Set();
        this.callbacks = {
            onSelectionChange: null,
            onBatchOperation: null
        };
    }

    // Configurer les callbacks
    setCallbacks(callbacks) {
        this.callbacks = { ...this.callbacks, ...callbacks };
    }

    // Sélectionner/désélectionner un élément
    toggleSelection(itemId) {
        if (this.selectedItems.has(itemId)) {
            this.selectedItems.delete(itemId);
        } else {
            this.selectedItems.add(itemId);
        }

        this.notifySelectionChange();
        console.log(`⚡ Sélection: ${this.selectedItems.size} élément(s)`);
    }

    // Sélectionner tous les éléments d'une liste
    selectAll(items) {
        items.forEach(item => this.selectedItems.add(item.id));
        this.notifySelectionChange();
        console.log(`⚡ Tous sélectionnés: ${this.selectedItems.size} éléments`);
    }

    // Désélectionner tous les éléments
    clearSelection() {
        this.selectedItems.clear();
        this.notifySelectionChange();
        console.log('⚡ Sélection effacée');
    }

    // Sélectionner par critères
    selectByCriteria(items, criteria) {
        let count = 0;

        items.forEach(item => {
            if (this.matchesCriteria(item, criteria)) {
                this.selectedItems.add(item.id);
                count++;
            }
        });

        this.notifySelectionChange();
        console.log(`⚡ Sélection par critères: ${count} éléments`);
    }

    // Vérifier si un élément correspond aux critères
    matchesCriteria(item, criteria) {
        if (criteria.category && item.category !== criteria.category) return false;
        if (criteria.dateRange) {
            const itemDate = new Date(item.updatedAt || item.createdAt || 0);
            if (itemDate < criteria.dateRange.start || itemDate > criteria.dateRange.end) return false;
        }
        if (criteria.status && item.status !== criteria.status) return false;
        if (criteria.searchTerm) {
            const searchLower = criteria.searchTerm.toLowerCase();
            const itemText = `${item.name} ${JSON.stringify(item.fields)}`.toLowerCase();
            if (!itemText.includes(searchLower)) return false;
        }
        return true;
    }

    // Obtenir les éléments sélectionnés
    getSelectedItems() {
        return Array.from(this.selectedItems);
    }

    // Obtenir le nombre d'éléments sélectionnés
    getSelectionCount() {
        return this.selectedItems.size;
    }

    // Vérifier si un élément est sélectionné
    isSelected(itemId) {
        return this.selectedItems.has(itemId);
    }

    // Opérations par lot disponibles
    getAvailableOperations(selectedItems = null) {
        const items = selectedItems || this.getSelectedItems();
        const count = items.length;

        if (count === 0) return [];

        return [
            {
                id: 'move-category',
                label: `Déplacer vers une catégorie (${count})`,
                icon: '📁',
                description: 'Changer la catégorie de tous les éléments sélectionnés',
                requiresInput: true,
                inputType: 'category'
            },
            {
                id: 'bulk-edit',
                label: `Édition groupée (${count})`,
                icon: '✏️',
                description: 'Modifier certains champs de tous les éléments sélectionnés',
                requiresInput: true,
                inputType: 'fields'
            },
            {
                id: 'export',
                label: `Exporter la sélection (${count})`,
                icon: '📤',
                description: 'Exporter les éléments sélectionnés vers un fichier',
                requiresInput: false
            },
            {
                id: 'duplicate',
                label: `Dupliquer (${count})`,
                icon: '📋',
                description: 'Créer des copies des éléments sélectionnés',
                requiresInput: false
            },
            {
                id: 'delete',
                label: `Supprimer (${count})`,
                icon: '🗑️',
                description: 'Supprimer définitivement tous les éléments sélectionnés',
                requiresInput: false,
                destructive: true
            },
            {
                id: 'mark-status',
                label: `Marquer comme... (${count})`,
                icon: '🏷️',
                description: 'Changer le statut de tous les éléments sélectionnés',
                requiresInput: true,
                inputType: 'status'
            },
            {
                id: 'add-tag',
                label: `Ajouter un tag (${count})`,
                icon: '🏷️',
                description: 'Ajouter un tag à tous les éléments sélectionnés',
                requiresInput: true,
                inputType: 'tag'
            }
        ];
    }

    // Exécuter une opération par lot
    async executeBatchOperation(operationId, items, params = {}) {
        const selectedIds = items || this.getSelectedItems();

        if (selectedIds.length === 0) {
            throw new Error('Aucun élément sélectionné');
        }

        console.log(`⚡ Exécution de l'opération: ${operationId} sur ${selectedIds.length} éléments`);

        let result = null;

        switch (operationId) {
            case 'move-category':
                result = await this.moveToCategory(selectedIds, params.targetCategory);
                break;

            case 'bulk-edit':
                result = await this.bulkEdit(selectedIds, params.fieldUpdates);
                break;

            case 'export':
                result = await this.exportSelection(selectedIds, params.format);
                break;

            case 'duplicate':
                result = await this.duplicateItems(selectedIds);
                break;

            case 'delete':
                result = await this.deleteItems(selectedIds);
                break;

            case 'mark-status':
                result = await this.markStatus(selectedIds, params.status);
                break;

            case 'add-tag':
                result = await this.addTag(selectedIds, params.tag);
                break;

            default:
                throw new Error(`Opération inconnue: ${operationId}`);
        }

        // Notifier le résultat
        if (this.callbacks.onBatchOperation) {
            this.callbacks.onBatchOperation(operationId, selectedIds, result);
        }

        return result;
    }

    // Déplacer vers une catégorie
    async moveToCategory(itemIds, targetCategory) {
        return {
            operation: 'move-category',
            affected: itemIds.length,
            changes: itemIds.map(id => ({ id, oldCategory: 'current', newCategory: targetCategory }))
        };
    }

    // Édition groupée
    async bulkEdit(itemIds, fieldUpdates) {
        return {
            operation: 'bulk-edit',
            affected: itemIds.length,
            changes: itemIds.map(id => ({ id, updates: fieldUpdates }))
        };
    }

    // Exporter la sélection
    async exportSelection(itemIds, format = 'json') {
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `covalen_export_${timestamp}.${format}`;

        return {
            operation: 'export',
            affected: itemIds.length,
            filename,
            format
        };
    }

    // Dupliquer les éléments
    async duplicateItems(itemIds) {
        return {
            operation: 'duplicate',
            affected: itemIds.length,
            newItems: itemIds.map(id => ({ originalId: id, newId: `${id}_copy_${Date.now()}` }))
        };
    }

    // Supprimer les éléments
    async deleteItems(itemIds) {
        return {
            operation: 'delete',
            affected: itemIds.length,
            deletedIds: itemIds
        };
    }

    // Marquer le statut
    async markStatus(itemIds, status) {
        return {
            operation: 'mark-status',
            affected: itemIds.length,
            status,
            changes: itemIds.map(id => ({ id, newStatus: status }))
        };
    }

    // Ajouter un tag
    async addTag(itemIds, tag) {
        return {
            operation: 'add-tag',
            affected: itemIds.length,
            tag,
            changes: itemIds.map(id => ({ id, addedTag: tag }))
        };
    }

    // Notifier le changement de sélection
    notifySelectionChange() {
        if (this.callbacks.onSelectionChange) {
            this.callbacks.onSelectionChange(this.getSelectedItems(), this.getSelectionCount());
        }
    }

    // Obtenir les statistiques de sélection
    getSelectionStats(allItems) {
        const selected = this.getSelectedItems();
        const total = allItems.length;

        // Analyser les catégories sélectionnées
        const categories = {};
        selected.forEach(id => {
            const item = allItems.find(item => item.id === id);
            if (item && item.category) {
                categories[item.category] = (categories[item.category] || 0) + 1;
            }
        });

        return {
            total: total,
            selected: selected.length,
            percentage: total > 0 ? Math.round((selected.length / total) * 100) : 0,
            categories,
            isEmpty: selected.length === 0,
            isAll: selected.length === total
        };
    }

    // Sauvegarder la sélection
    saveSelection(name) {
        const selection = {
            name,
            items: this.getSelectedItems(),
            timestamp: new Date().toISOString(),
            count: this.getSelectionCount()
        };

        const savedSelections = JSON.parse(localStorage.getItem('covalenSavedSelections') || '[]');
        savedSelections.push(selection);
        localStorage.setItem('covalenSavedSelections', JSON.stringify(savedSelections));

        console.log(`⚡ Sélection sauvegardée: ${name}`);
        return selection;
    }

    // Charger une sélection sauvegardée
    loadSelection(selectionName) {
        const savedSelections = JSON.parse(localStorage.getItem('covalenSavedSelections') || '[]');
        const selection = savedSelections.find(s => s.name === selectionName);

        if (selection) {
            this.clearSelection();
            selection.items.forEach(itemId => this.selectedItems.add(itemId));
            this.notifySelectionChange();
            console.log(`⚡ Sélection chargée: ${selectionName} (${selection.count} éléments)`);
        }

        return selection;
    }
}

// Instance globale
export const batchOperations = new BatchOperations();

// Alias pour la compatibilité avec App.js
batchOperations.executeBatch = function (operation, items, criteria = {}) {
    return this.executeBatchOperation(operation, items, criteria);
};
