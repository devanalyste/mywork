import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { versionManager } from '../utils/versionManager';

const VersionHistory = ({ isOpen, onClose, onRestore }) => {
    const [versions, setVersions] = useState([]);
    const [selectedVersion, setSelectedVersion] = useState(null);

    useEffect(() => {
        if (isOpen) {
            refreshVersions();
        }
    }, [isOpen]);

    const refreshVersions = () => {
        const recentVersions = versionManager.getRecentActivity(30);
        setVersions(recentVersions);
    };

    const handleRestore = (versionId) => {
        if (window.confirm('Êtes-vous sûr de vouloir restaurer cette version ? Cette action ne peut pas être annulée.')) {
            console.log(`📝 VersionHistory: Tentative de restauration de la version ${versionId}`);
            // Passer l'ID à App.js qui gèrera la restauration
            onRestore(versionId);
            onClose();
        }
    };

    const formatDateTime = (timestamp) => {
        return new Date(timestamp).toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getActionIcon = (action) => {
        switch (action) {
            case 'création':
                return '➕';
            case 'modification':
                return '✏️';
            case 'suppression':
                return '🗑️';
            case 'sauvegarde':
                return '💾';
            default:
                return '📝';
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-11/12 max-w-4xl max-h-5/6 flex flex-col">
                {/* En-tête */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-600">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                        📜 Historique des versions
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
                        aria-label="Fermer"
                    >
                        ×
                    </button>
                </div>

                {/* Corps */}
                <div className="flex-1 overflow-hidden flex">
                    {/* Liste des versions */}
                    <div className="w-1/2 border-r border-gray-200 dark:border-gray-600 overflow-y-auto">
                        <div className="p-4">
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                                Dernières modifications ({versions.length})
                            </h3>

                            {versions.length === 0 ? (
                                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                                    Aucun historique disponible
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {versions.map((version) => (
                                        <div
                                            key={version.id}
                                            onClick={() => setSelectedVersion(version)}
                                            className={`
                                                p-3 rounded-lg border cursor-pointer transition-all
                                                ${selectedVersion?.id === version.id
                                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                                                }
                                            `}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-lg">{getActionIcon(version.action)}</span>
                                                    <div>
                                                        <div className="font-medium text-sm text-gray-900 dark:text-white">
                                                            {version.action}
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            {version.timeAgo}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            {version.details && (
                                                <div className="mt-1 text-xs text-gray-600 dark:text-gray-300 truncate">
                                                    {version.details}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Détails de la version sélectionnée */}
                    <div className="w-1/2 overflow-y-auto">
                        <div className="p-4">
                            {selectedVersion ? (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                                        Détails de la version
                                    </h3>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">
                                                Date et heure
                                            </label>
                                            <div className="text-sm text-gray-900 dark:text-white">
                                                {formatDateTime(selectedVersion.timestamp)}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">
                                                Action
                                            </label>
                                            <div className="text-sm text-gray-900 dark:text-white flex items-center">
                                                <span className="mr-2">{getActionIcon(selectedVersion.action)}</span>
                                                {selectedVersion.action}
                                            </div>
                                        </div>

                                        {selectedVersion.details && (
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">
                                                    Détails
                                                </label>
                                                <div className="text-sm text-gray-900 dark:text-white">
                                                    {selectedVersion.details}
                                                </div>
                                            </div>
                                        )}

                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">
                                                ID Version
                                            </label>
                                            <div className="text-xs font-mono text-gray-600 dark:text-gray-400">
                                                {selectedVersion.id}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                                        <button
                                            onClick={() => handleRestore(selectedVersion.id)}
                                            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                                        >
                                            🔄 Restaurer cette version
                                        </button>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                                            Cette action remplacera toutes les données actuelles
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                                    Sélectionnez une version pour voir les détails
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Pied */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
                    <div className="flex justify-between items-center">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            Les versions sont automatiquement sauvegardées à chaque modification
                        </div>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

VersionHistory.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onRestore: PropTypes.func.isRequired,
};

export default VersionHistory;
