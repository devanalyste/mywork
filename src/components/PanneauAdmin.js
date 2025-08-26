import React, { useState } from 'react';
import PropTypes from 'prop-types';

const PanneauAdmin = ({ appData, onAddTab, onAddTask, onRenameTab, onDeleteTab, onDeleteCategory, onRenameTask, onSaveData, showNotification }) => {
    const [newTabName, setNewTabName] = useState('');
    const [newTaskData, setNewTaskData] = useState({
        targetTab: 'Adjointes',
        name: '',
        category: '',
        modelNumber: '',
        attachmentName: '',
        noteTemplate: '',
        procedure: '',
        adminOnlyEdit: false
    });

    // Obtenir les onglets principaux (exclure Maison et Admin)
    const mainTabs = Object.keys(appData).filter(tab => tab !== 'Maison' && tab !== 'Admin');

    // Obtenir toutes les catégories uniques de toutes les tâches
    const getAllCategories = () => {
        const categories = new Set();
        mainTabs.forEach(tabName => {
            const tasks = appData[tabName] || [];
            tasks.forEach(task => {
                if (task.category) {
                    categories.add(task.category);
                }
            });
        });
        return Array.from(categories).sort((a, b) => a.localeCompare(b));
    };

    const allCategories = getAllCategories();

    const handleAddTab = () => {
        if (newTabName.trim()) {
            onAddTab(newTabName.trim());
            setNewTabName('');
        }
    };

    const handleAddTask = () => {
        if (!newTaskData.name.trim()) {
            showNotification('Le nom de la tâche est requis.', 'error');
            return;
        }

        const newTask = {
            id: Date.now().toString(),
            name: newTaskData.name,
            category: newTaskData.category || 'Autres',
            fields: [
                {
                    key: 'modelNumber',
                    label: 'Numéro de Modèle/Lettre',
                    type: 'text',
                    value: newTaskData.modelNumber,
                    adminOnlyEdit: true
                },
                {
                    key: 'fullTemplateName',
                    label: 'Modèle de lettre',
                    type: 'text',
                    value: `${newTaskData.modelNumber} - ${newTaskData.name}`,
                    adminOnlyEdit: true,
                    copyable: true
                },
                {
                    key: 'attachmentName',
                    label: 'Nom de Pièce Jointe',
                    type: 'text',
                    value: newTaskData.attachmentName,
                    adminOnlyEdit: false,
                    copyable: true
                },
                {
                    key: 'noteTemplate',
                    label: 'Note EPIC',
                    type: 'textarea',
                    value: newTaskData.noteTemplate,
                    adminOnlyEdit: false,
                    copyable: true,
                    specialButton: 'addDate'
                },
                {
                    key: 'procedure',
                    label: 'Procédure à Suivre',
                    type: 'textarea',
                    value: newTaskData.procedure,
                    adminOnlyEdit: true,
                    hasCheckboxes: newTaskData.adminOnlyEdit
                }
            ]
        };

        onAddTask(newTaskData.targetTab, newTask);

        // Reset du formulaire
        setNewTaskData({
            targetTab: 'Adjointes',
            name: '',
            category: '',
            modelNumber: '',
            attachmentName: '',
            noteTemplate: '',
            procedure: '',
            adminOnlyEdit: false
        });
    };

    return (
        <div className="admin-panel-container">
            <div className="admin-panel-header">
                <h1 className="admin-panel-title">Panneau d'Administration</h1>
                <button onClick={onSaveData} className="btn-save-data" title="Raccourci: Ctrl+S">
                    💾 Sauvegarder
                </button>
            </div>

            {/* Gérer les Onglets Principaux */}
            <div className="admin-section">
                <h2 className="admin-section-title">Gérer les Onglets Principaux</h2>
                <div className="tabs-management">
                    {mainTabs.map(tabName => (
                        <div key={tabName} className="tab-management-item">
                            <span className="tab-name">{tabName}</span>
                            <div className="tab-actions">
                                <button
                                    className="btn-rename"
                                    onClick={() => {
                                        const newName = prompt(`Nouveau nom pour l'onglet "${tabName}":`, tabName);
                                        if (newName && newName !== tabName) {
                                            onRenameTab(tabName, newName);
                                        }
                                    }}
                                >
                                    Renommer
                                </button>
                                <button
                                    className="btn-delete"
                                    onClick={() => onDeleteTab(tabName)}
                                >
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Gérer les Catégories */}
            <div className="admin-section">
                <h2 className="admin-section-title">Gérer les Catégories</h2>
                <div className="categories-management">
                    {allCategories.length > 0 ? (
                        allCategories.map(categoryName => {
                            // Compter les tâches dans cette catégorie
                            let taskCount = 0;
                            mainTabs.forEach(tabName => {
                                const tasks = appData[tabName] || [];
                                taskCount += tasks.filter(task => task.category === categoryName).length;
                            });

                            return (
                                <div key={categoryName} className="category-management-item">
                                    <span className="category-name">{categoryName}</span>
                                    <span className="category-task-count">({taskCount} tâche{taskCount > 1 ? 's' : ''})</span>
                                    <div className="category-actions">
                                        <button
                                            className="btn-delete"
                                            onClick={() => {
                                                if (window.confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${categoryName}" ? Toutes les tâches de cette catégorie seront déplacées vers "Autres".`)) {
                                                    onDeleteCategory(categoryName);
                                                }
                                            }}
                                            title={`Supprimer la catégorie "${categoryName}"`}
                                        >
                                            Supprimer
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p className="no-categories-message">Aucune catégorie trouvée.</p>
                    )}
                </div>
            </div>

            {/* Gérer les Tâches Individuelles */}
            <div className="admin-section">
                <h2 className="admin-section-title">Gérer les Tâches Individuelles</h2>
                <div className="tasks-management">
                    {mainTabs.map(tabName => {
                        const tasks = appData[tabName] || [];
                        if (tasks.length === 0) return null;

                        return (
                            <div key={tabName} className="tab-tasks-section">
                                <h3 className="tab-tasks-title">Onglet: {tabName}</h3>
                                <div className="tasks-list">
                                    {tasks.map(task => (
                                        <div key={task.id} className="task-management-item">
                                            <div className="task-info">
                                                <span className="task-name">{task.name}</span>
                                                <span className="task-category">({task.category || 'Autres'})</span>
                                            </div>
                                            <div className="task-actions">
                                                <button
                                                    className="btn-rename"
                                                    onClick={() => {
                                                        const newName = prompt(`Nouveau nom pour la tâche "${task.name}":`, task.name);
                                                        if (newName && newName !== task.name) {
                                                            onRenameTask(task.id, newName);
                                                        }
                                                    }}
                                                    title={`Renommer "${task.name}"`}
                                                >
                                                    ✏️ Renommer
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Ajouter un Nouvel Onglet */}
            <div className="admin-section">
                <h3 className="admin-subsection-title">Ajouter un Nouvel Onglet</h3>
                <div className="add-tab-form">
                    <input
                        type="text"
                        placeholder="Nom du nouvel onglet (ex: Pricing)"
                        value={newTabName}
                        onChange={(e) => setNewTabName(e.target.value)}
                        className="add-tab-input"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddTab()}
                    />
                    <button onClick={handleAddTab} className="btn-add-tab">
                        Ajouter Onglet
                    </button>
                </div>
            </div>

            {/* Ajouter une Nouvelle Tâche */}
            <div className="admin-section">
                <h3 className="admin-subsection-title">Ajouter une Nouvelle Tâche</h3>
                <div className="add-task-form">
                    <div className="form-group">
                        <label htmlFor="targetTab">Ajouter la tâche à l'onglet:</label>
                        <select
                            id="targetTab"
                            value={newTaskData.targetTab}
                            onChange={(e) => setNewTaskData({ ...newTaskData, targetTab: e.target.value })}
                            className="form-select"
                        >
                            {mainTabs.map(tab => (
                                <option key={tab} value={tab}>{tab}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="taskCategory">Catégorie de la Tâche (pour Dashboard):</label>
                        <input
                            id="taskCategory"
                            type="text"
                            placeholder="ex: Annulations, Rappels, Tâches"
                            value={newTaskData.category}
                            onChange={(e) => setNewTaskData({ ...newTaskData, category: e.target.value })}
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="taskName">Nom de la Tâche:</label>
                        <input
                            id="taskName"
                            type="text"
                            value={newTaskData.name}
                            onChange={(e) => setNewTaskData({ ...newTaskData, name: e.target.value })}
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="modelNumber">Fonction de Modèle/Lettres:</label>
                        <input
                            id="modelNumber"
                            type="text"
                            value={newTaskData.modelNumber}
                            onChange={(e) => setNewTaskData({ ...newTaskData, modelNumber: e.target.value })}
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="attachmentName">Nom de Pièce Jointe:</label>
                        <input
                            id="attachmentName"
                            type="text"
                            value={newTaskData.attachmentName}
                            onChange={(e) => setNewTaskData({ ...newTaskData, attachmentName: e.target.value })}
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="noteTemplate">Note EPIC:</label>
                        <textarea
                            id="noteTemplate"
                            value={newTaskData.noteTemplate}
                            onChange={(e) => setNewTaskData({ ...newTaskData, noteTemplate: e.target.value })}
                            className="form-textarea"
                            rows="3"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="procedure">Procédure à Suivre:</label>
                        <textarea
                            id="procedure"
                            value={newTaskData.procedure}
                            onChange={(e) => setNewTaskData({ ...newTaskData, procedure: e.target.value })}
                            className="form-textarea"
                            rows="4"
                        />
                    </div>

                    <div className="form-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={newTaskData.adminOnlyEdit}
                                onChange={(e) => setNewTaskData({ ...newTaskData, adminOnlyEdit: e.target.checked })}
                            />
                            {' '}Activé avec coches pour procédure
                        </label>
                    </div>

                    <button onClick={handleAddTask} className="btn-add-task">
                        Ajouter Tâche
                    </button>
                </div>
            </div>
        </div>
    )
};

PanneauAdmin.propTypes = {
    appData: PropTypes.object.isRequired,
    onAddTab: PropTypes.func.isRequired,
    onAddTask: PropTypes.func.isRequired,
    onRenameTab: PropTypes.func.isRequired,
    onDeleteTab: PropTypes.func.isRequired,
    onDeleteCategory: PropTypes.func.isRequired,
    onRenameTask: PropTypes.func.isRequired,
    onSaveData: PropTypes.func.isRequired,
    showNotification: PropTypes.func.isRequired
};

export default PanneauAdmin;
