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

    // --- Effets ---
    // Sauvegarde les données dans localStorage à chaque modification
    // useEffect(() => {
    //     saveAppDataToLocalStorage(LOCAL_STORAGE_KEY, appData);
    // }, [appData]);

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
                acc[category] = { tasks: [], isOpen: categoryStates[category]?.isOpen ?? true };
            }
            acc[category].tasks.push(task);
            return acc;
        }, {});
    }, [appData, activeTab, categoryStates]);


    // --- Gestion des onglets ---
    const handleTabChange = (tabName) => {
        setActiveTab(tabName);
        if (tabName !== 'Admin') {
            setIsAdminMode(true); // Quitter le mode admin en changeant d'onglet
        }
    };

    const handleAdminPanel = () => {
        setActiveTab('Admin');
        setIsAdminMode(true);
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

    // --- Gestion des tâches ---
    const handleUpdateTask = (updatedTask) => {
        setAppData(prev => ({
            ...prev,
            [activeTab]: (prev[activeTab] || []).map(task =>
                task.id === updatedTask.id ? updatedTask : task
            )
        }));
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
                        onTaskSelect={setActiveTask}
                        onAdminPanel={handleAdminPanel}
                        isAdminMode={isAdminMode}
                        onReorderTasksInCategory={handleReorderTasksInCategory}
                    />
                )}

                {activeTab === 'Admin' && (
                    <PanneauAdmin
                        appData={appData}
                        onAddTab={handleAddTab}
                        onAddTask={handleAddTask}
                        onRenameTab={handleRenameTab}
                        onDeleteTab={handleDeleteTab}
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
                        />
                        <DetailTacheAdjointe
                            task={activeTask}
                            onUpdateTask={handleUpdateTask}
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
