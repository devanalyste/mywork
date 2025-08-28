import React, { useState, useEffect, useMemo, useCallback } from 'react';
import MenuHaut from './components/MenuHaut';
import MenuGaucheAdjointes from './components/MenuGaucheAdjointes';
import DetailTacheAdjointe from './components/DetailTacheAdjointe';
import PanneauAdmin from './components/PanneauAdmin';
import DashboardMaison from './components/DashboardMaison';
import Notification from './components/Notification';
import ConfirmationModale from './components/ConfirmationModale';
import ThemeToggle from './components/ThemeToggle';
import VersionHistory from './components/VersionHistory';
import QuickActions from './components/QuickActions';
import RightSidePanel from './components/RightSidePanel';
import { loadAppDataFromLocalStorage, saveAppDataToLocalStorage, resetToInitialData } from './utils/localStorage';
import { initialAppData } from './data/initialData'; // Vraies données de production
import { versionManager } from './utils/versionManager';
import { themeManager } from './utils/themeManager';
import { templateManager } from './utils/templateManager';

// Gestionnaire d'erreur global pour supprimer les warnings ResizeObserver bénins
const suppressResizeObserverErrors = () => {
    // Supprimer les erreurs ResizeObserver dans les événements error
    window.addEventListener('error', e => {
        if (e.message && (
            e.message.includes('ResizeObserver loop completed') ||
            e.message.includes('ResizeObserver loop limit') ||
            e.message.includes('ResizeObserver')
        )) {
            e.stopImmediatePropagation();
            e.preventDefault();
            return false;
        }
    }, true);

    // Supprimer les erreurs ResizeObserver dans les promesses rejetées
    window.addEventListener('unhandledrejection', e => {
        if (e.reason && e.reason.message && e.reason.message.includes('ResizeObserver')) {
            e.preventDefault();
            return false;
        }
    }, true);

    // Surcharger console.error pour filtrer les erreurs ResizeObserver
    const originalConsoleError = console.error;
    console.error = (...args) => {
        const message = args[0];
        if (typeof message === 'string' && (
            message.includes('ResizeObserver') ||
            message.includes('Warning: ResizeObserver')
        )) {
            return; // Ne pas afficher l'erreur
        }
        originalConsoleError.apply(console, args);
    };

    // Intercepter les erreurs au niveau du gestionnaire d'erreur React
    const originalErrorHandler = window.onerror;
    window.onerror = (message, source, lineno, colno, error) => {
        if (typeof message === 'string' && message.includes('ResizeObserver')) {
            return true; // Marquer comme gérée
        }
        if (originalErrorHandler) {
            return originalErrorHandler.call(window, message, source, lineno, colno, error);
        }
        return false;
    };
};

// Initialiser la suppression des erreurs
suppressResizeObserverErrors();

// Composant principal de l'application
const App = () => {
    const LOCAL_STORAGE_KEY = 'covalenAppData';

    // --- États de l'application ---
    const [appData, setAppData] = useState(() => loadAppDataFromLocalStorage(LOCAL_STORAGE_KEY, initialAppData));
    const [activeTab, setActiveTab] = useState('Maison');
    const [activeTask, setActiveTask] = useState(null);
    const [isAdminMode, setIsAdminMode] = useState(false);
    const [notification, setNotification] = useState(null);
    const [categoryStates, setCategoryStates] = useState({});
    const [modalState, setModalState] = useState({ isOpen: false, message: '', onConfirm: () => { } });
    const [viewMode, setViewMode] = useState('grid'); // Mode de vue par défaut

    // --- Nouveaux états pour les fonctionnalités avancées ---
    const [isDarkMode, setIsDarkMode] = useState(() => themeManager.getCurrentTheme() === 'dark');
    const [showVersionHistory, setShowVersionHistory] = useState(false);
    const [showQuickActions, setShowQuickActions] = useState(false);
    const [availableTemplates, setAvailableTemplates] = useState([]);

    // --- Effets ---
    // Gestion des erreurs ResizeObserver au niveau du composant
    useEffect(() => {
        const handleError = (event) => {
            if (event.error && event.error.message &&
                event.error.message.includes('ResizeObserver')) {
                event.preventDefault();
                event.stopPropagation();
                return false;
            }
        };

        window.addEventListener('error', handleError, true);

        return () => {
            window.removeEventListener('error', handleError, true);
        };
    }, []);

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

    // --- Nouveaux effets pour les fonctionnalités avancées ---
    // Initialisation du gestionnaire de versions
    useEffect(() => {
        versionManager.initialize(appData);
    }, [appData]);

    // Gestion du thème
    useEffect(() => {
        const unsubscribe = themeManager.subscribe((theme) => {
            setIsDarkMode(theme === 'dark');
        });
        return unsubscribe;
    }, []);

    // Chargement des modèles disponibles
    useEffect(() => {
        const templates = templateManager.getAvailableTemplates();
        setAvailableTemplates(templates);
    }, []);

    // Sauvegarde automatique de version lors des modifications importantes
    useEffect(() => {
        const saveVersion = () => {
            versionManager.createSnapshot(appData, 'Sauvegarde automatique');
        };

        const timer = setTimeout(saveVersion, 30000); // Sauvegarde toutes les 30 secondes
        return () => clearTimeout(timer);
    }, [appData]);

    // --- Fonctions utilitaires ---
    const showNotification = useCallback((message, type = 'info') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    }, []);

    // --- Nouvelles fonctions pour les fonctionnalités avancées ---
    const handleThemeToggle = useCallback(() => {
        const newTheme = themeManager.toggleTheme();
        showNotification(`Thème ${newTheme === 'dark' ? 'sombre' : 'clair'} activé`, 'info');
    }, [showNotification]);

    const handleVersionRestore = useCallback((versionId) => {
        console.log(`🔄 App.js: Tentative de restauration de la version ${versionId} (type: ${typeof versionId})`);
        try {
            const restoredData = versionManager.restoreVersion(versionId);
            if (restoredData) {
                console.log('✅ App.js: Données restaurées avec succès', restoredData);
                setAppData(restoredData);
                showNotification('Version restaurée avec succès', 'success');
                setShowVersionHistory(false);
            } else {
                console.error('❌ App.js: Aucune donnée retournée par restoreVersion');
                showNotification('Erreur lors de la restauration', 'error');
            }
        } catch (error) {
            console.error('❌ App.js: Exception lors de la restauration:', error);
            showNotification('Erreur lors de la restauration: ' + error.message, 'error');
        }
    }, [showNotification]);

    const handleQuickAction = useCallback((action, data) => {
        switch (action) {
            case 'create_from_template':
                const newTask = templateManager.createFromTemplate(data.templateId, data.customData);
                if (newTask && activeTab !== 'Maison' && activeTab !== 'Admin') {
                    const currentTasks = appData[activeTab] || [];
                    const updatedTasks = [...currentTasks, newTask];
                    const newAppData = { ...appData, [activeTab]: updatedTasks };
                    setAppData(newAppData);
                    versionManager.createSnapshot(newAppData, 'Création depuis modèle');
                    showNotification('Tâche créée depuis le modèle', 'success');
                }
                break;
            case 'export_data':
                const exportType = data?.type || 'all';
                showNotification(`Export ${exportType} en cours...`, 'info');
                // TODO: Implémenter la logique d'export
                break;
            case 'import_data':
                showNotification('Fonctionnalité d\'import en développement', 'info');
                // TODO: Implémenter la logique d'import
                break;
            case 'show_templates':
                showNotification('Gestionnaire de templates en développement', 'info');
                // TODO: Ouvrir le gestionnaire de templates
                break;
            case 'show_statistics':
                showNotification('Statistiques en développement', 'info');
                // TODO: Ouvrir les statistiques
                break;
            default:
                break;
        }
        setShowQuickActions(false);
    }, [appData, activeTab, showNotification]);

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

    // Fonction pour réinitialiser les données aux valeurs initiales
    const handleResetData = () => {
        const confirmation = window.confirm(
            '⚠️ Attention ! Cette action va supprimer toutes vos données sauvegardées et rétablir les données de base.\n\n' +
            'Êtes-vous sûr(e) de vouloir continuer ?'
        );
        
        if (confirmation) {
            const resetData = resetToInitialData(LOCAL_STORAGE_KEY, initialAppData);
            setAppData(resetData);
            showNotification('✅ Données réinitialisées aux valeurs de base', 'success');
        }
    };

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

    const handleReorderTasksInCategory = (category, newTasksOrder) => {
        console.log('🔄 App.js handleReorderTasksInCategory called with:', { category, newTasksOrder });

        // Si newTasksOrder est un nombre (ancien système), on ignore
        if (typeof newTasksOrder === 'number') {
            console.log('⚠️ Old index-based system detected, ignoring');
            return;
        }

        // Fonction pour mettre à jour les tâches avec le nouvel ordre
        const updateTasksWithNewOrder = (tasks, targetCategory, newOrder) => {
            console.log('📝 Updating tasks for category:', targetCategory);

            // Séparer les tâches de cette catégorie et les autres
            const otherTasks = tasks.filter(t => (t.category || 'Autres') !== targetCategory);

            // Utiliser directement le nouvel ordre fourni
            const updatedTasks = [...otherTasks, ...newOrder];

            console.log('✅ Tasks updated:', updatedTasks);
            return updatedTasks;
        };

        setAppData(prev => {
            const updatedData = { ...prev };

            // Appliquer la réorganisation à tous les onglets concernés
            Object.keys(updatedData).forEach(tabName => {
                if (tabName !== 'Maison' && tabName !== 'Admin') {
                    updatedData[tabName] = updateTasksWithNewOrder(
                        updatedData[tabName] || [],
                        category,
                        newTasksOrder
                    );
                }
            });

            console.log('🎉 App data updated successfully');
            return updatedData;
        });

        showNotification(`Tâches réorganisées dans la catégorie "${category}"`, 'success');
        console.log('✅ Reorder completed and notification shown');
    };

    // --- Raccourcis clavier ---
    useEffect(() => {
        const handleKeyPress = (e) => {
            // Ctrl+S pour sauvegarder
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                if (isAdminMode) {
                    handleSaveData();
                } else {
                    // Sauvegarde de version manuelle
                    versionManager.createSnapshot(appData, 'Sauvegarde manuelle');
                    showNotification('Version sauvegardée', 'success');
                }
            }

            // Ctrl+T pour changer de thème
            if (e.ctrlKey && e.key === 't') {
                e.preventDefault();
                handleThemeToggle();
            }

            // Ctrl+Q pour ouvrir les actions rapides
            if (e.ctrlKey && e.key === 'q') {
                e.preventDefault();
                setShowQuickActions(prev => !prev);
            }

            // Ctrl+H pour ouvrir l'historique des versions
            if (e.ctrlKey && e.key === 'h') {
                e.preventDefault();
                setShowVersionHistory(prev => !prev);
            }

            // Échap pour fermer les modales et quitter les modes
            if (e.key === 'Escape') {
                // Fermer les modales et panneaux
                setModalState({ isOpen: false, message: '', onConfirm: () => { } });
                setShowVersionHistory(false);
                setShowQuickActions(false);

                // Quitter le mode admin
                if (isAdminMode) {
                    handleExitAdmin();
                    showNotification('Mode admin quitté', 'info');
                }
            }
        };

        document.addEventListener('keydown', handleKeyPress);
        return () => document.removeEventListener('keydown', handleKeyPress);
    }, [isAdminMode, activeTab, handleSaveData, handleExitAdmin, showNotification, appData, handleThemeToggle]);

    return (
        <div className={`flex flex-col min-h-screen font-sans antialiased transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'
            }`}>
            {/* Bouton de toggle du thème */}
            <ThemeToggle
                isDarkMode={isDarkMode}
                onToggle={handleThemeToggle}
            />

            {/* Raccourci Quick Actions */}
            <div className="fixed z-50 top-4 right-4">
                <button
                    onClick={() => setShowQuickActions(true)}
                    className={`p-2 rounded-full transition-colors ${isDarkMode
                        ? 'bg-gray-800 hover:bg-gray-700 text-white'
                        : 'bg-white hover:bg-gray-50 text-gray-900'
                        } shadow-lg`}
                    title="Actions rapides (Ctrl+Q)"
                >
                    ⚡
                </button>
            </div>

            <MenuHaut
                tabs={Object.keys(appData)}
                activeTab={activeTab}
                onTabClick={handleTabChange}
                onAdminPanel={handleAdminPanel}
                onExitAdmin={handleExitAdmin}
                isAdminMode={isAdminMode}
                onResetData={handleResetData}
                onLogout={() => showNotification('Fonction de déconnexion à implémenter.', 'info')}
                isDarkMode={isDarkMode}
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
                        isDarkMode={isDarkMode}
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
                        isDarkMode={isDarkMode}
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
                            isDarkMode={isDarkMode}
                        />
                        <DetailTacheAdjointe
                            task={activeTask}
                            onUpdateTask={handleUpdateTask}
                            onUpdateFieldLabel={handleUpdateFieldLabel}
                            onAdminModeToggle={setIsAdminMode}
                            isAdminMode={isAdminMode}
                            onDeleteTask={handleDeleteTask}
                            showNotification={showNotification}
                            isDarkMode={isDarkMode}
                            availableTemplates={availableTemplates}
                            onCreateFromTemplate={(templateId) => handleQuickAction('create_from_template', { templateId })}
                        />
                    </>
                )}
            </main>

            <Notification
                message={notification?.message}
                type={notification?.type}
                onClose={() => setNotification(null)}
                isDarkMode={isDarkMode}
            />

            <ConfirmationModale
                isOpen={modalState.isOpen}
                message={modalState.message}
                onConfirm={modalState.onConfirm}
                onCancel={() => setModalState({ isOpen: false })}
                isDarkMode={isDarkMode}
            />

            {/* Fenêtre de l'historique des versions */}
            {showVersionHistory && (
                <VersionHistory
                    isOpen={showVersionHistory}
                    onClose={() => setShowVersionHistory(false)}
                    onRestore={handleVersionRestore}
                    isDarkMode={isDarkMode}
                />
            )}

            {/* Panneau latéral droit avec les actions */}
            <RightSidePanel
                onAction={handleQuickAction}
                isDarkMode={isDarkMode}
            />

            {/* Panneau des actions rapides */}
            {showQuickActions && (
                <QuickActions
                    isOpen={showQuickActions}
                    onClose={() => setShowQuickActions(false)}
                    onAction={handleQuickAction}
                    templates={availableTemplates}
                    isDarkMode={isDarkMode}
                />
            )}

            {/* Bouton d'accès à l'historique des versions */}
            <div className="fixed z-40 bottom-4 right-4">
                <button
                    onClick={() => setShowVersionHistory(true)}
                    className={`p-3 rounded-full transition-colors ${isDarkMode
                        ? 'bg-gray-800 hover:bg-gray-700 text-white'
                        : 'bg-white hover:bg-gray-50 text-gray-900'
                        } shadow-lg border`}
                    title="Historique des versions (Ctrl+H)"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default App;
