import React, { useState } from 'react';
import PropTypes from 'prop-types';

const QuickActions = ({
    onNewTask,
    onBulkEdit,
    onExport,
    onImport,
    onSearch,
    selectedCount = 0,
    className = ''
}) => {
    const [showMore, setShowMore] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Actions principales (toujours visibles)
    const primaryActions = [
        {
            id: 'new-task',
            label: 'Nouvelle tâche',
            icon: '➕',
            onClick: onNewTask,
            shortcut: 'Ctrl+N',
            className: 'bg-blue-600 hover:bg-blue-700 text-white'
        },
        {
            id: 'search',
            label: 'Rechercher',
            icon: '🔍',
            onClick: () => onSearch && onSearch(searchTerm),
            shortcut: 'Ctrl+F',
            className: 'bg-gray-600 hover:bg-gray-700 text-white',
            hasInput: true
        }
    ];

    // Actions conditionnelles (si des éléments sont sélectionnés)
    const selectionActions = selectedCount > 0 ? [
        {
            id: 'bulk-edit',
            label: `Éditer (${selectedCount})`,
            icon: '✏️',
            onClick: onBulkEdit,
            className: 'bg-green-600 hover:bg-green-700 text-white'
        },
        {
            id: 'export-selected',
            label: `Exporter (${selectedCount})`,
            icon: '📤',
            onClick: () => onExport && onExport('selected'),
            className: 'bg-purple-600 hover:bg-purple-700 text-white'
        }
    ] : [];

    // Actions secondaires (masquées par défaut)
    const secondaryActions = [
        {
            id: 'export-all',
            label: 'Exporter tout',
            icon: '📋',
            onClick: () => onExport && onExport('all'),
            className: 'bg-indigo-600 hover:bg-indigo-700 text-white'
        },
        {
            id: 'import',
            label: 'Importer',
            icon: '📥',
            onClick: onImport,
            className: 'bg-orange-600 hover:bg-orange-700 text-white'
        },
        {
            id: 'templates',
            label: 'Templates',
            icon: '📋',
            onClick: () => console.log('Templates'),
            className: 'bg-teal-600 hover:bg-teal-700 text-white'
        },
        {
            id: 'statistics',
            label: 'Statistiques',
            icon: '📊',
            onClick: () => console.log('Statistiques'),
            className: 'bg-pink-600 hover:bg-pink-700 text-white'
        }
    ];

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (onSearch) {
            onSearch(searchTerm);
        }
    };

    const renderAction = (action) => {
        if (action.hasInput) {
            return (
                <form onSubmit={handleSearchSubmit} className="flex items-center gap-1">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Rechercher..."
                        className="px-3 py-2 text-sm border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        style={{ width: '150px' }}
                    />
                    <button
                        type="submit"
                        className={`px-3 py-2 text-sm font-medium rounded-r-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${action.className}`}
                        title={`${action.label} (${action.shortcut})`}
                    >
                        <span className="text-lg">{action.icon}</span>
                    </button>
                </form>
            );
        }

        return (
            <button
                onClick={action.onClick}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2 ${action.className}`}
                title={action.shortcut ? `${action.label} (${action.shortcut})` : action.label}
            >
                <span className="text-lg">{action.icon}</span>
                <span className="hidden sm:inline">{action.label}</span>
            </button>
        );
    };

    return (
        <div className={`bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-600 ${className}`}>
            <div className="px-4 py-3">
                {/* Barre d'actions principale */}
                <div className="flex items-center justify-between">
                    {/* Actions principales */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {primaryActions.map(action => (
                            <div key={action.id}>
                                {renderAction(action)}
                            </div>
                        ))}

                        {/* Actions de sélection */}
                        {selectionActions.map(action => (
                            <div key={action.id}>
                                {renderAction(action)}
                            </div>
                        ))}
                    </div>

                    {/* Bouton pour plus d'actions */}
                    <div className="flex items-center gap-2">
                        {selectedCount > 0 && (
                            <span className="text-sm text-gray-600 dark:text-gray-400 bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded-full">
                                {selectedCount} sélectionné{selectedCount > 1 ? 's' : ''}
                            </span>
                        )}

                        <button
                            onClick={() => setShowMore(!showMore)}
                            className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            title="Plus d'actions"
                        >
                            <span className="text-lg">{showMore ? '⬆️' : '⬇️'}</span>
                            <span className="hidden sm:inline ml-1">Plus</span>
                        </button>
                    </div>
                </div>

                {/* Actions secondaires (pliables) */}
                {showMore && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                        <div className="flex items-center gap-2 flex-wrap">
                            {secondaryActions.map(action => (
                                <div key={action.id}>
                                    {renderAction(action)}
                                </div>
                            ))}
                        </div>

                        {/* Raccourcis clavier */}
                        <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                            <span className="font-medium">Raccourcis:</span>
                            <span className="ml-2">Ctrl+N: Nouvelle tâche</span>
                            <span className="ml-2">Ctrl+F: Rechercher</span>
                            <span className="ml-2">Ctrl+S: Sauvegarder</span>
                            <span className="ml-2">Escape: Fermer</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Indicateur d'état global */}
            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <span>🟢 Application prête</span>
                        <span>💾 Sauvegarde automatique active</span>
                        {selectedCount > 0 && (
                            <span>⚡ Mode sélection: {selectedCount} élément{selectedCount > 1 ? 's' : ''}</span>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <span>Dernière mise à jour: {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

QuickActions.propTypes = {
    onNewTask: PropTypes.func,
    onBulkEdit: PropTypes.func,
    onExport: PropTypes.func,
    onImport: PropTypes.func,
    onSearch: PropTypes.func,
    selectedCount: PropTypes.number,
    className: PropTypes.string,
};

export default QuickActions;
