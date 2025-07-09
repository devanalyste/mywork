import React, { useState } from 'react';

const PanneauAdmin = ({ appData, onAddTab, onAddTask, onRenameTab, onDeleteTab, onSaveData, showNotification }) => {
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
                        <label>Ajouter la tâche à l'onglet:</label>
                        <select
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
                        <label>Catégorie de la Tâche (pour Dashboard):</label>
                        <input
                            type="text"
                            placeholder="ex: Annulations, Rappels, Tâches"
                            value={newTaskData.category}
                            onChange={(e) => setNewTaskData({ ...newTaskData, category: e.target.value })}
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label>Nom de la Tâche:</label>
                        <input
                            type="text"
                            value={newTaskData.name}
                            onChange={(e) => setNewTaskData({ ...newTaskData, name: e.target.value })}
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label>Fonction de Modèle/Lettres:</label>
                        <input
                            type="text"
                            value={newTaskData.modelNumber}
                            onChange={(e) => setNewTaskData({ ...newTaskData, modelNumber: e.target.value })}
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label>Nom de Pièce Jointe:</label>
                        <input
                            type="text"
                            value={newTaskData.attachmentName}
                            onChange={(e) => setNewTaskData({ ...newTaskData, attachmentName: e.target.value })}
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label>Note EPIC:</label>
                        <textarea
                            value={newTaskData.noteTemplate}
                            onChange={(e) => setNewTaskData({ ...newTaskData, noteTemplate: e.target.value })}
                            className="form-textarea"
                            rows="3"
                        />
                    </div>

                    <div className="form-group">
                        <label>Procédure à Suivre:</label>
                        <textarea
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
                            Activé avec coches pour procédure
                        </label>
                    </div>

                    <button onClick={handleAddTask} className="btn-add-task">
                        Ajouter Tâche
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PanneauAdmin;