import React, { useState, useEffect, useMemo, useCallback } from 'react';
import MenuHaut from './components/MenuHaut';
import MenuGaucheAdjointes from './components/MenuGaucheAdjointes';
import DetailTacheAdjointe from './components/DetailTacheAdjointe';
import PanneauAdmin from './components/PanneauAdmin';
import DashboardMaison from './components/DashboardMaison';
import Notification from './components/Notification';
import ConfirmationModale from './components/ConfirmationModale';
import { loadAppDataFromLocalStorage, saveAppDataToLocalStorage } from './utils/localStorage';
import { massiveTestAppData } from './data/massiveTestData'; // Données de test MASSIVES pour stress-test du layout


// Composant principal de l'application
const App = () => {
    const LOCAL_STORAGE_KEY = 'covalenAppData';

    // --- États de l'application ---
    const [appData, setAppData] = useState(() => loadAppDataFromLocalStorage(LOCAL_STORAGE_KEY, massiveTestAppData)); // Utilisation des données massives pour le test
    const [activeTab, setActiveTab] = useState('Maison');
    const [activeTask, setActiveTask] = useState(null);
    const [isAdminMode, setIsAdminMode] = useState(false);
    const [notification, setNotification] = useState(null);
    const [categoryStates, setCategoryStates] = useState({});
    const [modalState, setModalState] = useState({ isOpen: false, message: '', onConfirm: () => { } });
    const [viewMode, setViewMode] = useState('grid'); // Mode de vue par défaut

    // --- Effets ---
    // Sauvegarde les données dans localStorage à chaque modification
    useEffect(() => {
        saveAppDataToLocalStorage(LOCAL_STORAGE_KEY, appData);
    }, [appData]);

    // Gère la sélection de la tâche active lors du changement d'onglet
    useEffect(() => {
        if (activeTab !== 'Maison' && activeTab !== 'Admin') {
            const tasks = appData[activeTab] || [];
            if (tasks.length > 0) {
                // Si la tâche active n'est plus dans la liste, on sélectionne la première
                if (!activeTask || !tasks.some(t => t.id === activeTask.id)) {
                    setActiveTask(tasks[0]);
                }
            } else {
                setActiveTask(null);
            }
        } else {
            setActiveTask(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, appData]);

    // --- Fonctions utilitaires ---
    const showNotification = useCallback((message, type = 'info') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    }, []);

    // --- Gestion des catégories (menu de gauche) ---
    const handleToggleCategory = useCallback((category) => {
        setCategoryStates(prev => ({
            ...prev,
            [category]: { ...prev[category], isOpen: !prev[category]?.isOpen }
        }));
    }, []);

    const categorizedTasks = useMemo(() => {
        const tasks = appData[activeTab] || [];
        if (!Array.isArray(tasks)) return {};

        return tasks.reduce((acc, task) => {
            const category = task.category || 'Autres';
            if (!acc[category]) {
                acc[category] = { tasks: [], isOpen: categoryStates[category]?.isOpen ?? false };
            }
            acc[category].tasks.push(task);
            return acc;
        }, {});
    }, [appData, activeTab, categoryStates]);


    // --- Gestion des onglets ---
    const handleTabChange = (tabName) => {
        setActiveTab(tabName);
        if (tabName !== 'Admin') {
            setIsAdminMode(false); // Quitter le mode admin en changeant d'onglet
        }

        // Fermer toutes les catégories quand on quitte l'onglet "Adjointes"
        if (tabName !== 'Adjointes') {
            setCategoryStates(prev => {
                const newState = {};
                Object.keys(prev).forEach(category => {
                    newState[category] = { ...prev[category], isOpen: false };
                });
                return newState;
            });
        }
    };

    const handleAdminPanel = () => {
        setActiveTab('Admin');
        setIsAdminMode(true);
    };

    // Fonction pour sélectionner une tâche depuis le dashboard et ouvrir sa catégorie
    const handleTaskSelectFromDashboard = (task) => {
        // Changer vers l'onglet de la tâche
        if (task.tabName) {
            setActiveTab(task.tabName);
        }

        // Sélectionner la tâche
        setActiveTask(task);

        // S'assurer que le mode admin est désactivé
        setIsAdminMode(false);

        // Ouvrir la catégorie correspondante dans le menu gauche avec un petit délai
        if (task.category) {
            setTimeout(() => {
                setCategoryStates(prev => ({
                    ...prev,
                    [task.category]: { ...prev[task.category], isOpen: true }
                }));
            }, 100);
        }
    };

    const handleExitAdmin = useCallback(() => {
        setActiveTab('Maison');
        setIsAdminMode(false);
    }, []);

    const handleSaveData = useCallback(() => {
        try {
            saveAppDataToLocalStorage(LOCAL_STORAGE_KEY, appData);
            showNotification('Données sauvegardées avec succès !', 'success');
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            showNotification('Erreur lors de la sauvegarde.', 'error');
        }
    }, [appData, showNotification]);

    const handleAddTab = (newTabName) => {
        if (!newTabName.trim()) {
            showNotification('Le nom de l\'onglet ne peut pas être vide.', 'error');
            return;
        }
        setAppData(prev => {
            if (prev[newTabName]) {
                showNotification(`L'onglet '${newTabName}' existe déjà.`, 'error');
                return prev;
            }
            showNotification(`Onglet '${newTabName}' ajouté.`, 'success');
            return { ...prev, [newTabName]: [] };
        });
    };

    const handleRenameTab = (oldTabName, newTabName) => {
        if (!newTabName.trim()) {
            showNotification('Le nouveau nom de l\'onglet ne peut pas être vide.', 'error');
            return;
        }
        setAppData(prev => {
            if (prev[newTabName] && newTabName !== oldTabName) {
                showNotification(`Le nom '${newTabName}' est déjà pris.`, 'error');
                return prev;
            }
            const { [oldTabName]: tabContent, ...rest } = prev;
            const newAppData = { ...rest, [newTabName]: tabContent };

            if (activeTab === oldTabName) {
                setActiveTab(newTabName);
            }
            showNotification(`Onglet '${oldTabName}' renommé en '${newTabName}'.`, 'success');
            return newAppData;
        });
    };

    const confirmDeleteTab = (tabNameToDelete) => {
        setAppData(prev => {
            const newData = { ...prev };
            delete newData[tabNameToDelete];
            return newData;
        });
        if (activeTab === tabNameToDelete) {
            setActiveTab('Maison');
        }
        showNotification(`Onglet '${tabNameToDelete}' supprimé.`, 'success');
        setModalState({ isOpen: false });
    };

    const handleDeleteTab = (tabNameToDelete) => {
        setModalState({
            isOpen: true,
            message: `Êtes-vous sûr de vouloir supprimer l'onglet "${tabNameToDelete}" et toutes ses tâches ?`,
            onConfirm: () => confirmDeleteTab(tabNameToDelete)
        });
    };

    const handleDeleteCategory = (categoryToDelete) => {
        setAppData(prev => {
            const updatedData = { ...prev };
            let tasksAffected = 0;

            // Parcourir tous les onglets et modifier les tâches de cette catégorie
            Object.keys(updatedData).forEach(tabName => {
                if (tabName !== 'Maison' && tabName !== 'Admin') {
                    const tasks = updatedData[tabName] || [];
                    updatedData[tabName] = tasks.map(task => {
                        if (task.category === categoryToDelete) {
                            tasksAffected++;
                            return { ...task, category: 'Autres' };
                        }
                        return task;
                    });
                }
            });

            showNotification(
                `Catégorie "${categoryToDelete}" supprimée. ${tasksAffected} tâche${tasksAffected > 1 ? 's' : ''} déplacée${tasksAffected > 1 ? 's' : ''} vers "Autres".`,
                'success'
            );

            return updatedData;
        });
    };

    const handleRenameTask = (taskId, newName) => {
        console.log('handleRenameTask called with:', taskId, newName);

        if (!newName || !newName.trim()) {
            showNotification('Le nom de la tâche ne peut pas être vide.', 'error');
            return;
        }

        let taskFound = false;

        setAppData(prev => {
            const updatedData = { ...prev };
            console.log('Current appData:', updatedData);

            // Chercher la tâche dans tous les onglets
            Object.keys(updatedData).forEach(tabName => {
                if (tabName !== 'Maison' && tabName !== 'Admin') {
                    const tasks = updatedData[tabName] || [];
                    const taskIndex = tasks.findIndex(task => task.id === taskId);
                    console.log(`Checking tab ${tabName}, taskIndex:`, taskIndex);
                    if (taskIndex !== -1) {
                        console.log('Task found! Updating name from', updatedData[tabName][taskIndex].name, 'to', newName.trim());
                        updatedData[tabName][taskIndex] = {
                            ...updatedData[tabName][taskIndex],
                            name: newName.trim()
                        };
                        taskFound = true;
                    }
                }
            });

            // Sauvegarder immédiatement dans localStorage avec les nouvelles données
            if (taskFound) {
                saveAppDataToLocalStorage(LOCAL_STORAGE_KEY, updatedData);
            }

            return updatedData;
        });

        if (taskFound) {
            // Mettre à jour la tâche active si c'est celle qui a été renommée
            if (activeTask && activeTask.id === taskId) {
                setActiveTask(prev => ({ ...prev, name: newName.trim() }));
            }
            showNotification(`Tâche renommée en "${newName.trim()}"`, 'success');
        } else {
            showNotification('Tâche non trouvée.', 'error');
        }
    };

    // --- Gestion des tâches ---
    const handleUpdateTask = (updatedTask) => {
        setAppData(prev => ({
            ...prev,
            [activeTab]: (prev[activeTab] || []).map(task =>
                task.id === updatedTask.id ? updatedTask : task
            )
        }));
    };

    // Fonction pour mettre à jour un label de champ dans toutes les tâches
    const handleUpdateFieldLabel = (fieldKey, newLabel) => {
        setAppData(prev => {
            const updatedData = { ...prev };

            // Parcourir tous les onglets
            Object.keys(updatedData).forEach(tabName => {
                if (tabName !== 'Maison' && tabName !== 'Admin') {
                    const tasks = updatedData[tabName] || [];
                    updatedData[tabName] = tasks.map(task => ({
                        ...task,
                        fields: task.fields.map(field =>
                            field.key === fieldKey ? { ...field, label: newLabel } : field
                        )
                    }));
                }
            });

            // Sauvegarder immédiatement dans localStorage
            saveAppDataToLocalStorage(LOCAL_STORAGE_KEY, updatedData);

            return updatedData;
        });

        // Mettre à jour la tâche active si elle contient ce champ
        if (activeTask && activeTask.fields) {
            setActiveTask(prev => ({
                ...prev,
                fields: prev.fields.map(field =>
                    field.key === fieldKey ? { ...field, label: newLabel } : field
                )
            }));
        }

        showNotification(`Label mis à jour dans toutes les tâches: "${newLabel}"`, 'success');
    };

    const handleAddTask = (targetTab, newTask) => {
        setAppData(prev => ({
            ...prev,
            [targetTab]: [...(prev[targetTab] || []), newTask]
        }));
        setActiveTask(newTask);
        setActiveTab(targetTab);
        showNotification('Nouvelle tâche ajoutée !', 'success');
    };

    const confirmDeleteTask = (taskId) => {
        let nextTask = null;
        setAppData(prev => {
            const tasks = prev[activeTab] || [];
            const taskIndex = tasks.findIndex(t => t.id === taskId);
            const updatedTasks = tasks.filter(t => t.id !== taskId);

            if (updatedTasks.length > 0) {
                // Sélectionne la tâche suivante, ou la précédente si c'était la dernière
                nextTask = updatedTasks[taskIndex] || updatedTasks[taskIndex - 1] || updatedTasks[0];
            }

            return { ...prev, [activeTab]: updatedTasks };
        });
        setActiveTask(nextTask);
        showNotification('Tâche supprimée.', 'success');
        setModalState({ isOpen: false });
    };

    const handleDeleteTask = (taskId) => {
        const taskToDelete = (appData[activeTab] || []).find(t => t.id === taskId);
        if (taskToDelete) {
            setModalState({
                isOpen: true,
                message: `Êtes-vous sûr de vouloir supprimer la tâche "${taskToDelete.name}" ?`,
                onConfirm: () => confirmDeleteTask(taskId)
            });
        }
    };

    const handleReorderTasksInCategory = (category, sourceIndex, targetIndex) => {
        // Fonction pour réorganiser l'ordre des tâches dans une catégorie
        const reorderTasksInTab = (tasks, targetCategory, sIndex, tIndex) => {
            const categoryTasks = tasks.filter(t => (t.category || 'Autres') === targetCategory);

            if (categoryTasks.length <= 1 || sIndex === tIndex) {
                return tasks; // Pas de changement nécessaire
            }

            // Réorganiser les tâches de cette catégorie
            const reorderedTasks = [...categoryTasks];
            const [removed] = reorderedTasks.splice(sIndex, 1);
            reorderedTasks.splice(tIndex, 0, removed);

            // Remettre les tâches réorganisées dans l'onglet
            const otherTasks = tasks.filter(t => (t.category || 'Autres') !== targetCategory);
            return [...otherTasks, ...reorderedTasks];
        };

        setAppData(prev => {
            const updatedData = { ...prev };

            // Appliquer la réorganisation à tous les onglets concernés
            Object.keys(updatedData).forEach(tabName => {
                if (tabName !== 'Maison' && tabName !== 'Admin') {
                    updatedData[tabName] = reorderTasksInTab(
                        updatedData[tabName] || [],
                        category,
                        sourceIndex,
                        targetIndex
                    );
                }
            });

            return updatedData;
        });

        showNotification(`Tâches réorganisées dans la catégorie "${category}"`, 'success');
    };

    // --- Raccourcis clavier ---
    useEffect(() => {
        const handleKeyPress = (e) => {
            // Ctrl+S pour sauvegarder
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                if (isAdminMode) {
                    handleSaveData();
                }
            }

            // Ctrl+/ pour focus sur la recherche (dashboard)
            if (e.ctrlKey && e.key === '/') {
                e.preventDefault();
                if (activeTab === 'Maison') {
                    const searchInput = document.querySelector('.search-input');
                    if (searchInput) {
                        searchInput.focus();
                        showNotification('Focus sur la recherche', 'info');
                    }
                }
            }

            // Échap pour sortir du mode admin
            if (e.key === 'Escape' && isAdminMode) {
                handleExitAdmin();
                showNotification('Mode admin quitté', 'info');
            }
        };

        document.addEventListener('keydown', handleKeyPress);
        return () => document.removeEventListener('keydown', handleKeyPress);
    }, [isAdminMode, activeTab, handleSaveData, handleExitAdmin, showNotification]);

    return (
        <div className="flex flex-col min-h-screen font-sans antialiased bg-gray-100">
            <MenuHaut
                tabs={Object.keys(appData)}
                activeTab={activeTab}
                onTabClick={handleTabChange}
                onAdminPanel={handleAdminPanel}
                onExitAdmin={handleExitAdmin}
                isAdminMode={isAdminMode}
                onLogout={() => showNotification('Fonction de déconnexion à implémenter.', 'info')}
            />

            <main className="flex flex-1 w-full p-6 mx-auto overflow-hidden max-w-screen-2xl">
                {activeTab === 'Maison' && (
                    <DashboardMaison
                        appData={appData}
                        onTabChange={handleTabChange}
                        onTaskSelect={handleTaskSelectFromDashboard}
                        onAdminPanel={handleAdminPanel}
                        isAdminMode={isAdminMode}
                        onReorderTasksInCategory={handleReorderTasksInCategory}
                        viewMode={viewMode}
                        onViewModeChange={setViewMode}
                    />
                )}

                {activeTab === 'Admin' && (
                    <PanneauAdmin
                        appData={appData}
                        onAddTab={handleAddTab}
                        onAddTask={handleAddTask}
                        onRenameTab={handleRenameTab}
                        onDeleteTab={handleDeleteTab}
                        onDeleteCategory={handleDeleteCategory}
                        onRenameTask={handleRenameTask}
                        onSaveData={handleSaveData}
                        showNotification={showNotification}
                    />
                )}

                {activeTab !== 'Admin' && activeTab !== 'Maison' && (
                    <>
                        <MenuGaucheAdjointes
                            categories={categorizedTasks}
                            onSelectTask={setActiveTask}
                            selectedTask={activeTask}
                            onToggleCategory={handleToggleCategory}
                            isAdminMode={isAdminMode}
                            onDeleteTask={handleDeleteTask}
                            onRenameTask={handleRenameTask}
                        />
                        <DetailTacheAdjointe
                            task={activeTask}
                            onUpdateTask={handleUpdateTask}
                            onUpdateFieldLabel={handleUpdateFieldLabel}
                            onAdminModeToggle={setIsAdminMode}
                            isAdminMode={isAdminMode}
                            onDeleteTask={handleDeleteTask}
                            showNotification={showNotification}
                        />
                    </>
                )}
            </main>

            <Notification
                message={notification?.message}
                type={notification?.type}
                onClose={() => setNotification(null)}
            />

            <ConfirmationModale
                isOpen={modalState.isOpen}
                message={modalState.message}
                onConfirm={modalState.onConfirm}
                onCancel={() => setModalState({ isOpen: false })}
            />
        </div>
    );
};

export default App;
