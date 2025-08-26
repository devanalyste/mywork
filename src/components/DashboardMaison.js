import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Composant Task draggable avec dnd-kit
const SortableTaskItem = ({ task, onTaskClick }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`task-item clickable compact grid-task ${isDragging ? 'dragging' : ''}`}
            onClick={() => onTaskClick(task)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onTaskClick(task);
                }
            }}
            role="button"
            tabIndex={0}
            title="Glissez pour réorganiser"
            aria-label={`Task: ${task.name}`}
        >
            <div className="task-content-compact">
                <span
                    className="drag-handle enhanced-handle compact-handle"
                    title="Réorganiser"
                    {...attributes}
                    {...listeners}
                >
                    ⋮⋮
                </span>
                <div className="task-info">
                    <span className="task-number">
                        {task.fields?.find(f => f.key === 'modelNumber')?.value}
                    </span>
                    <span className="task-name-compact">
                        {task.name}
    return (
        <div
            className="task-item clickable compact grid-task"
            onClick={() => onTaskClick(task)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    onTaskClick(task);
                                }
                            }}
                            role="button"
                            tabIndex={0}
            title="Cliquez pour voir les détails"
                            aria-label={`Task: ${task.name}`}
        >
            <div className="task-content-compact">
                <div className="task-info">
                    <span className="task-number">
                        {task.fields?.find(f => f.key === 'modelNumber')?.value}
                    </span>
                    <span className="task-name-compact">
                        {task.name}
                    </span>
                </div>
            </div>
        </div>
    );
                        {task.fields?.find(f => f.key === 'modelNumber')?.value}
                    </span>
                    <span className="task-name-compact">
                        {task.name}
                    </span>
                </div>
            </div>
        </div>
    );
};

// Composant de grille libre pour une catégorie
const CategoryFreeGrid = ({
    category,
    tasks,
    isOpen,
    isAdminMode,
    onToggleCategory,
    onTaskClick,
    onReorderTasks,
    searchTerm,
    gridColumns: _gridColumns = 1 // on capture la prop mais on ne l'utilise pas
}) => {
    const gridColumns = 1; // on force la valeur ici
    // Filtrer les tâches localement
    const filteredTasks = useMemo(() => {
        if (!searchTerm) return tasks;

        const searchLower = searchTerm.toLowerCase();
        return tasks.filter(task => {
            const modelNumber = task.fields?.find(f => f.key === 'modelNumber')?.value || '';
            return (
                task.name.toLowerCase().includes(searchLower) ||
                modelNumber.toLowerCase().includes(searchLower) ||
                category.toLowerCase().includes(searchLower)
            );
        });
    }, [tasks, searchTerm, category]);

    // Configuration des sensors pour dnd-kit
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Gestion du drag end
    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            const oldIndex = filteredTasks.findIndex(task => task.id === active.id);
            const newIndex = filteredTasks.findIndex(task => task.id === over.id);

            if (oldIndex !== -1 && newIndex !== -1) {
                const reorderedTasks = arrayMove(filteredTasks, oldIndex, newIndex);
                onReorderTasks(category, reorderedTasks);
            }
        }
    };

    // Créer une grille simple
    const createGrid = useMemo(() => {
        // Calculer le nombre de lignes nécessaires
        const taskCount = filteredTasks.length;
        const rows = Math.ceil(taskCount / gridColumns);
        const totalCells = rows * gridColumns;

        // Créer un array pour la grille
        const grid = Array(totalCells).fill(null);

        // Placer les tâches dans la grille séquentiellement
        filteredTasks.forEach((task, index) => {
            if (index < totalCells) {
                grid[index] = task;
            }
        });

        return { grid, rows, totalCells };
    }, [filteredTasks, gridColumns]);

    return (
        <div className="category-section" style={{ height: 'fit-content' }}>
            <div
                className={`category-header ${isAdminMode ? 'admin-mode' : ''}`}
                onClick={(e) => onToggleCategory(category, e)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onToggleCategory(category, e);
                    }
                }}
                role="button"
                tabIndex={0}
                aria-expanded={isOpen}
                aria-label={`Toggle ${category} category`}
            >
                <div className="category-left">
                    <span className="category-toggle">
                        {isOpen ? '▼' : '▶'}
                    </span>
                    <span className="category-name">{category}</span>
                    {isAdminMode && (
                        <span className="task-count">({filteredTasks.length})</span>
                    )}
                </div>
                <span className="category-goto">→</span>
            </div>

            {isOpen && (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={filteredTasks.map(task => task.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div
                            className="tasks-free-grid"
                            style={{
                                display: 'grid',
                                gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
                                gap: '8px',
                                padding: '16px',
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderTop: 'none',
                                borderBottomLeftRadius: '8px',
                                borderBottomRightRadius: '8px',
                                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                                maxHeight: '400px',
                                overflowY: 'auto',
                                zIndex: 10
                            }}
                        >
                            {createGrid.grid.map((task, gridPosition) => (
                                <div key={`grid-cell-${gridPosition}`} className="grid-cell">
                                    {task ? (
                                        <SortableTaskItem
                                            task={task}
                                            onTaskClick={onTaskClick}
                                        />
                                    ) : (
                                        <div className="empty-grid-cell">
                                            {/* Cellule vide */}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}
        </div>
    );
};




const DashboardMaison = ({
    appData,
    onTabChange,
    onTaskSelect,
    onAdminPanel,
    isAdminMode,
    onReorderTasksInCategory
}) => {
    const [categoryStates, setCategoryStates] = useState({});
    const [searchTerm, setSearchTerm] = useState('');


    // Données organisées par catégorie
    const categoriesData = useMemo(() => {
        const categories = new Map();

        Object.keys(appData).forEach(tabName => {
            if (tabName !== 'Maison' && tabName !== 'Admin') {
                const tasks = appData[tabName] || [];
                tasks.forEach(task => {
                    const categoryName = task.category || 'Autres';

                    if (!categories.has(categoryName)) {
                        categories.set(categoryName, {
                            name: categoryName,
                            tasks: []
                        });
                    }

                    categories.get(categoryName).tasks.push({
                        ...task,
                        tabName
                    });
                });
            }
        });

        return Array.from(categories.values())
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [appData]);
    DashboardMaison.propTypes = {
        appData: PropTypes.object.isRequired,
        onTabChange: PropTypes.func.isRequired,
        onTaskSelect: PropTypes.func.isRequired,
        onAdminPanel: PropTypes.func.isRequired,
        isAdminMode: PropTypes.bool.isRequired,
        onReorderTasksInCategory: PropTypes.func.isRequired,
    };

    SortableTaskItem.propTypes = {
        task: PropTypes.object.isRequired,
        onTaskClick: PropTypes.func.isRequired,
    };

    CategoryFreeGrid.propTypes = {
        category: PropTypes.string.isRequired,
        tasks: PropTypes.array.isRequired,
        isOpen: PropTypes.bool.isRequired,
        isAdminMode: PropTypes.bool.isRequired,
        onToggleCategory: PropTypes.func.isRequired,
        onTaskClick: PropTypes.func.isRequired,
        onReorderTasks: PropTypes.func.isRequired,
        searchTerm: PropTypes.string,
        gridColumns: PropTypes.number,
    };
    // Filtrage des catégories
    const filteredCategories = useMemo(() => {
        if (!searchTerm) return categoriesData;

        const searchLower = searchTerm.toLowerCase();

        return categoriesData.filter(category => {
            const categoryMatches = category.name.toLowerCase().includes(searchLower);
            const hasMatchingTasks = category.tasks.some(task => {
                const modelNumber = task.fields?.find(f => f.key === 'modelNumber')?.value || '';
                return (
                    task.name.toLowerCase().includes(searchLower) ||
                    modelNumber.toLowerCase().includes(searchLower)
                );
            });

            return categoryMatches || hasMatchingTasks;
        });
    }, [categoriesData, searchTerm]);

    const handleToggleCategory = (categoryName, event) => {
        event.stopPropagation();
        setCategoryStates(prev => ({
            ...prev,
            [categoryName]: !prev[categoryName]
        }));
    };

    const handleTaskClick = (task) => {
        onTabChange(task.tabName);
        onTaskSelect(task);
    };

    const handleReorderTasks = (categoryName, reorderedTasks) => {
        if (onReorderTasksInCategory) {
            // Trouver les indices des tâches dans le tableau d'origine
            const originalTasks = categoriesData.find(cat => cat.name === categoryName)?.tasks || [];
            const sourceIndex = originalTasks.findIndex(task => task.id === reorderedTasks[0].id);
            const targetIndex = reorderedTasks.findIndex(task => task.id === originalTasks[sourceIndex].id);

            onReorderTasksInCategory(categoryName, sourceIndex, targetIndex);
        }
    };

    const getTotalTaskCount = () => {
        return filteredCategories.reduce((total, category) => total + category.tasks.length, 0);
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1 className="dashboard-title">Covalen</h1>
            </div>

            <p className="welcome-message">
                Bienvenue sur votre tableau de bord centralisé.
            </p>

            {isAdminMode && (
                <div className="admin-dashboard-section">
                    <div className="admin-banner">
                        <p className="admin-banner-text">Mode Admin Actif sur le Dashboard.</p>
                        <button className="admin-manage-btn" onClick={onAdminPanel}>
                            Gérer les Onglets
                        </button>
                    </div>
                </div>
            )}

            <div className="overview-section">
                <h2 className="overview-title">Vue d'overview des Tâches</h2>

                <div className="search-container">
                    <div className="search-bar">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Rechercher une tâche, catégorie ou numéro..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                        {searchTerm && (
                            <button
                                className="search-clear"
                                onClick={() => setSearchTerm('')}
                                title="Effacer la recherche"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                    <div className="search-hints">
                        <span className="search-hint">💡 Affichage en grille simple</span>
                    </div>
                    {searchTerm && (
                        <div className="search-results-info">
                            {filteredCategories.length === 0
                                ? `Aucun résultat pour "${searchTerm}"`
                                : `${getTotalTaskCount()} tâche(s) trouvée(s) dans ${filteredCategories.length} catégorie(s)`
                            }
                        </div>
                    )}
                </div>

                <div
                    className="categories-container"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: '16px',
                        width: '100%',
                        gridAutoFlow: 'row dense', // Permet un meilleur placement des éléments
                        gridAutoRows: 'auto',
                        alignItems: 'start'
                    }}
                >
                    {filteredCategories.map(category => (
                        <CategoryFreeGrid
                            key={category.name}
                            category={category.name}
                            tasks={category.tasks}
                            isOpen={categoryStates[category.name] ?? false}
                            isAdminMode={isAdminMode}
                            onToggleCategory={handleToggleCategory}
                            onTaskClick={handleTaskClick}
                            onReorderTasks={handleReorderTasks}
                            searchTerm={searchTerm}
                            gridColumns={1}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DashboardMaison;
