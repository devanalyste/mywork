// Gestionnaire de versions pour l'historique des modifications
export class VersionManager {
    constructor(maxVersions = 50) {
        this.maxVersions = maxVersions;
        this.storageKey = 'covalenAppVersions';
    }

    // Sauvegarder une nouvelle version
    saveVersion(data, action = 'modification', details = '') {
        const versions = this.getVersions();
        const newVersion = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            action,
            details,
            data: JSON.parse(JSON.stringify(data)), // Deep copy
            user: 'Utilisateur', // Peut être étendu plus tard
        };

        versions.unshift(newVersion);

        // Limiter le nombre de versions
        if (versions.length > this.maxVersions) {
            versions.splice(this.maxVersions);
        }

        localStorage.setItem(this.storageKey, JSON.stringify(versions));
        console.log(`📝 Version sauvegardée: ${action} - ${details}`);
        return newVersion.id;
    }

    // Récupérer toutes les versions
    getVersions() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Erreur lors du chargement des versions:', error);
            return [];
        }
    }

    // Récupérer une version spécifique
    getVersion(versionId) {
        const versions = this.getVersions();
        console.log(`🔍 Recherche de la version ${versionId} parmi ${versions.length} versions`);
        console.log('Versions disponibles:', versions.map(v => ({ id: v.id, action: v.action })));
        // Convertir les deux en string pour comparaison
        const found = versions.find(v => String(v.id) === String(versionId));
        console.log(`Version trouvée:`, found ? 'OUI' : 'NON');
        return found;
    }

    // Restaurer une version (rollback)
    rollback(versionId) {
        console.log(`🔄 Tentative de rollback vers la version ${versionId}`);
        const version = this.getVersion(versionId);
        if (version) {
            console.log(`✅ Rollback réussi vers la version ${versionId}: ${version.action}`);
            return version.data;
        }
        console.error(`❌ Version ${versionId} introuvable pour le rollback`);
        throw new Error('Version introuvable');
    }

    // Supprimer les anciennes versions
    cleanup(daysToKeep = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

        const versions = this.getVersions();
        const filteredVersions = versions.filter(v =>
            new Date(v.timestamp) > cutoffDate
        );

        localStorage.setItem(this.storageKey, JSON.stringify(filteredVersions));
        console.log(`🧹 Nettoyage: ${versions.length - filteredVersions.length} versions supprimées`);
    }

    // Obtenir un résumé des dernières modifications
    getRecentActivity(limit = 10) {
        return this.getVersions().slice(0, limit).map(v => ({
            id: v.id,
            timestamp: v.timestamp,
            action: v.action,
            details: v.details,
            timeAgo: this.getTimeAgo(v.timestamp)
        }));
    }

    // Calculer le temps écoulé depuis une action
    getTimeAgo(timestamp) {
        const now = new Date();
        const past = new Date(timestamp);
        const diffMs = now - past;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 1) return 'À l\'instant';
        if (diffMins < 60) return `Il y a ${diffMins} min`;
        if (diffHours < 24) return `Il y a ${diffHours}h`;
        return `Il y a ${diffDays} jour(s)`;
    }
}

// Instance globale
export const versionManager = new VersionManager();

// Ajouter des alias pour la compatibilité avec App.js
versionManager.initialize = function (initialData) {
    // Initialiser avec les données initiales si aucune version n'existe
    const versions = this.getVersions();
    if (versions.length === 0) {
        this.saveVersion(initialData, 'initialisation', 'Données initiales');
    }
    console.log('✅ VersionManager initialisé');
};

versionManager.createSnapshot = function (data, description = 'Snapshot') {
    return this.saveVersion(data, 'snapshot', description);
};

versionManager.restoreVersion = function (versionId) {
    try {
        return this.rollback(versionId);
    } catch (error) {
        console.error('Erreur lors de la restauration:', error);
        return null;
    }
};

versionManager.getVersionHistory = function () {
    return this.getVersions();
};
