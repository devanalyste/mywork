import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors
} from '@dnd-kit/core';
import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
    sortableKeyboardCoordinates
} from '@dnd-kit/sortable';
import {
    CSS
} from '@dnd-kit/utilities';

// Utility function for array move (needed for drag and drop)
const arrayMove = (array, from, to) => {
    const newArray = [...array];
    const item = newArray.splice(from, 1)[0];
    newArray.splice(to, 0, item);
    return newArray;
};

// Composant pour le sélecteur de vue
const ViewSelector = ({ viewMode, onViewModeChange }) => {
    const viewOptions = [
        { mode: 'grid', icon: '⊞', label: 'Grille' },
        { mode: 'list', icon: '☰', label: 'Liste' },
        { mode: 'kanban', icon: '⚏', label: 'Kanban' }
    ];

    return (
        <div className="flex items-center gap-2 mb-4 view-selector">
            <span className="text-sm font-medium text-gray-600">Affichage :</span>
            <div className="flex overflow-hidden border border-gray-300 rounded-lg">
                {viewOptions.map(option => (
                    <button
                        key={option.mode}
                        onClick={() => onViewModeChange(option.mode)}
                        className={`px-3 py-2 text-sm font-medium transition-colors duration-200 ${viewMode === option.mode
                            ? 'bg-blue-500 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                        title={option.label}
                    >
                        <span className="mr-1">{option.icon}</span>
                        {option.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

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

CategoryFreeGrid.propTypes = {
    category: PropTypes.string.isRequired,
    tasks: PropTypes.arrayOf(PropTypes.object).isRequired,
    isOpen: PropTypes.bool.isRequired,
    isAdminMode: PropTypes.bool,
    onToggleCategory: PropTypes.func.isRequired,
    onTaskClick: PropTypes.func.isRequired,
    onReorderTasks: PropTypes.func.isRequired,
    searchTerm: PropTypes.string,
    gridColumns: PropTypes.number
};




const DashboardMaison = ({
    appData,
    onTabChange,
    onTaskSelect,
    onAdminPanel,
    isAdminMode,
    onReorderTasksInCategory,
    viewMode = 'grid',
    onViewModeChange
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

    // Composant pour l'affichage Kanban
    const KanbanView = ({ categoriesData, searchTerm, onTaskClick, onReorderTasksInCategory }) => {
        const sensors = useSensors(
            useSensor(PointerSensor),
            useSensor(KeyboardSensor, {
                coordinateGetter: sortableKeyboardCoordinates,
            })
        );

        // Filtrer les tâches par catégorie selon la recherche
        const filteredCategoriesData = useMemo(() => {
            if (!searchTerm) return categoriesData;

            const searchLower = searchTerm.toLowerCase();
            return categoriesData.map(category => ({
                ...category,
                tasks: category.tasks.filter(task => {
                    const modelNumber = task.fields?.find(f => f.key === 'modelNumber')?.value || '';
                    return (
                        task.name.toLowerCase().includes(searchLower) ||
                        modelNumber.toLowerCase().includes(searchLower) ||
                        category.name.toLowerCase().includes(searchLower)
                    );
                })
            })).filter(category => category.tasks.length > 0);
        }, [categoriesData, searchTerm]);

        const handleDragEnd = (event) => {
            const { active, over } = event;

            if (!over || active.id === over.id) return;

            // Trouver la catégorie source et destination
            let sourceCategory = null;
            let sourceIndex = -1;
            let targetIndex = -1;

            // Chercher la tâche source
            for (const category of filteredCategoriesData) {
                const taskIndex = category.tasks.findIndex(task => task.id === active.id);
                if (taskIndex !== -1) {
                    sourceCategory = category.name;
                    sourceIndex = taskIndex;
                    break;
                }
            }

            // Chercher la position cible
            for (const category of filteredCategoriesData) {
                const taskIndex = category.tasks.findIndex(task => task.id === over.id);
                if (taskIndex !== -1 && category.name === sourceCategory) {
                    targetIndex = taskIndex;
                    break;
                }
            }

            if (sourceIndex !== -1 && targetIndex !== -1 && sourceCategory) {
                onReorderTasksInCategory(sourceCategory, sourceIndex, targetIndex);
            }
        };

        return (
            <div className="w-full h-full kanban-view">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <div className="flex h-full gap-4 pb-4 overflow-x-auto kanban-board">
                        {filteredCategoriesData.map(category => (
                            <KanbanColumn
                                key={category.name}
                                category={category}
                                onTaskClick={onTaskClick}
                            />
                        ))}
                    </div>
                </DndContext>
            </div>
        );
    };

    // Composant pour une colonne Kanban
    const KanbanColumn = ({ category, onTaskClick }) => {
        return (
            <div className="kanban-column bg-gray-100 rounded-lg p-3 min-w-[280px] max-w-[320px] flex-shrink-0">
                {/* En-tête de colonne */}
                <div className="mb-3 column-header">
                    <h3 className="mb-1 text-sm font-semibold text-gray-800">{category.name}</h3>
                    <div className="text-xs text-gray-500">{category.tasks.length} tâche(s)</div>
                </div>

                {/* Liste des tâches */}
                <SortableContext
                    items={category.tasks.map(task => task.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="tasks-container space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
                        {category.tasks.map(task => (
                            <KanbanTaskCard
                                key={task.id}
                                task={task}
                                onTaskClick={onTaskClick}
                            />
                        ))}
                    </div>
                </SortableContext>
            </div>
        );
    };


    // Composant pour une carte de tâche Kanban
    const KanbanTaskCard = ({ task, onTaskClick }) => {
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
            opacity: isDragging ? 0.5 : 1,
        };

        const modelNumber = task.fields?.find(f => f.key === 'modelNumber')?.value || '';

        return (
            <div
                ref={setNodeRef}
                style={style}
                {...attributes}
                {...listeners}
                className="p-3 transition-shadow bg-white border border-gray-200 rounded shadow-sm cursor-pointer kanban-card hover:shadow-md"
                onClick={(e) => {
                    e.stopPropagation();
                    onTaskClick(task);
                }}
            >
                {/* Numéro de tâche */}
                {modelNumber && (
                    <div className="mb-1 font-mono text-xs text-blue-600 task-number">
                        #{modelNumber}
                    </div>
                )}

                {/* Nom de la tâche */}
                <div className="mb-2 text-sm font-medium text-gray-800 task-name line-clamp-2">
                    {task.name}
                </div>

                {/* Bouton d'action */}
                <div className="task-action">
                    <button className="text-xs text-blue-500 hover:text-blue-700">
                        → Ouvrir
                    </button>
                </div>
            </div>
        );
    };

    // Composant pour l'affichage en liste
    const ListView = ({ categoriesData, searchTerm, onTaskClick }) => {
        const [sortField, setSortField] = useState('categoryName');
        const [sortDirection, setSortDirection] = useState('asc');

        // Fonction pour gérer le tri
        const handleSort = (field) => {
            if (sortField === field) {
                setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
            } else {
                setSortField(field);
                setSortDirection('asc');
            }
        };

        // Icône de tri
        const getSortIcon = (field) => {
            if (sortField !== field) {
                return <span className="text-gray-400">⇕</span>;
            }
            return sortDirection === 'asc' ?
                <span className="font-bold text-blue-600">▲</span> :
                <span className="font-bold text-blue-600">▼</span>;
        };

        // Aplati toutes les tâches avec leur catégorie et tri
        // Aplati toutes les tâches avec leur catégorie et tri
        const allTasks = useMemo(() => {
            const tasks = [];
            categoriesData.forEach(category => {
                const searchLower = searchTerm.toLowerCase();
                const filteredTasks = searchTerm ?
                    category.tasks.filter(task => {
                        const modelNumber = task.fields?.find(f => f.key === 'modelNumber')?.value || '';
                        return (
                            task.name.toLowerCase().includes(searchLower) ||
                            modelNumber.toLowerCase().includes(searchLower) ||
                            category.name.toLowerCase().includes(searchLower)
                        );
                    }) : category.tasks;

                filteredTasks.forEach(task => {
                    tasks.push({
                        ...task,
                        categoryName: category.name,
                        modelNumber: task.fields?.find(f => f.key === 'modelNumber')?.value || ''
                    });
                });
            });

            // Tri des tâches
            return tasks.sort((a, b) => {
                let aValue, bValue;

                switch (sortField) {
                    case 'modelNumber':
                        aValue = a.modelNumber || '';
                        bValue = b.modelNumber || '';
                        // Tri numérique si possible, sinon alphabétique
                        const aNum = parseInt(aValue);
                        const bNum = parseInt(bValue);
                        if (!isNaN(aNum) && !isNaN(bNum)) {
                            return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
                        }
                        break;
                    case 'name':
                        aValue = a.name.toLowerCase();
                        bValue = b.name.toLowerCase();
                        break;
                    case 'categoryName':
                    default:
                        aValue = a.categoryName.toLowerCase();
                        bValue = b.categoryName.toLowerCase();
                        break;
                }

                if (sortDirection === 'asc') {
                    return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
                } else {
                    return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
                }
            });
        }, [categoriesData, searchTerm, sortField, sortDirection]);
        return (

            <div className="w-full h-full list-view">
                <div className="p-2 border border-gray-200 rounded-t-lg list-header bg-gray-50">
                    <div className="grid grid-cols-12 gap-3 text-sm font-semibold text-gray-700">
                        <div
                            className="flex items-center col-span-2 gap-1 cursor-pointer select-none hover:text-blue-600"
                            onClick={() => handleSort('modelNumber')}
                        >
                            <span>Numéro</span>
                            {getSortIcon('modelNumber')}
                        </div>
                        <div
                            className="flex items-center col-span-6 gap-1 cursor-pointer select-none hover:text-blue-600"
                            onClick={() => handleSort('name')}
                        >
                            <span>Nom de la tâche</span>
                            {getSortIcon('name')}
                        </div>
                        <div
                            className="flex items-center col-span-2 gap-1 cursor-pointer select-none hover:text-blue-600"
                            onClick={() => handleSort('categoryName')}
                        >
                            <span>Catégorie</span>
                            {getSortIcon('categoryName')}
                        </div>
                        <div className="col-span-2">Actions</div>
                    </div>
                </div>
                <div className="list-body border-l border-r border-b border-gray-200 rounded-b-lg h-[calc(100%-45px)] overflow-y-auto">
                    {allTasks.map((task, index) => (
                        <div
                            key={task.id}
                            className={`grid grid-cols-12 gap-3 p-2 cursor-pointer transition-colors hover:bg-blue-50 text-sm ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                }`}
                            onClick={() => onTaskClick(task)}
                        >
                            <div className="col-span-2 font-mono text-blue-600">
                                {task.modelNumber || '-'}
                            </div>
                            <div className="col-span-6 font-medium truncate" title={task.name}>
                                {task.name}
                            </div>
                            <div className="col-span-2 text-gray-600">
                                {task.categoryName}
                            </div>
                            <div className="col-span-2">
                                <button className="text-xs text-blue-500 hover:text-blue-700">
                                    → Ouvrir
                                </button>
                            </div>
                        </div>
                    ))}
                    {allTasks.length === 0 && (
                        <div className="p-8 text-center text-gray-500">
                            {searchTerm ? `Aucun résultat pour "${searchTerm}"` : 'Aucune tâche disponible'}
                        </div>
                    )}
                </div>
            </div>
        );
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

    return (
        <div className="w-full min-h-screen bg-gray-50">
            {/* Barre principale avec sélecteur, recherche et compteur */}
            <div className="w-full py-3 bg-white border-b border-gray-200">
                <div className="flex items-center justify-between px-4">
                    {/* Sélecteur de vue à gauche */}
                    <div className="flex items-center">
                        <ViewSelector viewMode={viewMode} onViewModeChange={onViewModeChange} />
                    </div>

                    {/* Barre de recherche au centre */}
                    <div className="flex justify-center flex-1 px-8">
                        <div className="relative w-full max-w-md">
                        <input
                            type="text"
                                placeholder="🔍 Rechercher..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                        />
                        {searchTerm && (
                            <button
                                    className="absolute text-xs text-gray-400 transform -translate-y-1/2 right-3 top-1/2 hover:text-gray-600"
                                    onClick={() => setSearchTerm('')}
                            >
                                ✕
                            </button>
                            )}
                        </div>
                    </div>

                    {/* Compteur à droite */}
                    <div className="text-sm text-gray-600">
                        Vue d'overview des Tâches - {getTotalTaskCount()} tâche(s)
                    </div>
                </div>

                {/* Résultats de recherche */}
                {searchTerm && (
                    <div className="px-4 mt-2 text-xs text-center text-gray-600">
                        {filteredCategories.length === 0
                            ? `Aucun résultat pour "${searchTerm}"`
                            : `${getTotalTaskCount()} résultat(s) dans ${filteredCategories.length} catégorie(s)`
                        }
                    </div>
                )}
            </div>

            {/* Contenu principal - TABLEAU MAXIMUM */}
            <div className="w-full px-4 py-2 h-[calc(100vh-120px)]">
                {isAdminMode && (
                    <div className="p-2 mb-2 text-sm border border-red-200 rounded bg-red-50">
                        <div className="flex items-center justify-between">
                            <span className="text-red-700">Mode Admin Actif</span>
                            <button
                                className="px-3 py-1 text-xs text-white bg-red-500 rounded hover:bg-red-600"
                                onClick={onAdminPanel}
                            >
                                Gérer
                            </button>
                        </div>
                    </div>
                )}

                {/* Affichage conditionnel selon le mode */}
                {viewMode === 'grid' && (
                <div
                    className="categories-container"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: '16px',
                        width: '100%',
                        gridAutoFlow: 'row dense',
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
                )}

                {viewMode === 'list' && (
                    <div className="w-full h-[calc(100vh-140px)]">
                        <ListView
                            categoriesData={filteredCategories}
                            searchTerm={searchTerm}
                            onTaskClick={handleTaskClick}
                        />
                    </div>
                )}

                {viewMode === 'kanban' && (
                    <div className="w-full h-[calc(100vh-140px)]">
                        <KanbanView
                            categoriesData={filteredCategories}
                            searchTerm={searchTerm}
                            onTaskClick={handleTaskClick}
                            onReorderTasksInCategory={handleReorderTasks}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

ViewSelector.propTypes = {
    viewMode: PropTypes.string.isRequired,
    onViewModeChange: PropTypes.func.isRequired,
};

DashboardMaison.propTypes = {
    categoriesData: PropTypes.array.isRequired,
    isAdminMode: PropTypes.bool.isRequired,
    onTaskClick: PropTypes.func.isRequired,
    onAdminPanel: PropTypes.func.isRequired,
    onReorderTasksInCategory: PropTypes.func.isRequired,
    categoryStates: PropTypes.object.isRequired,
    onToggleCategory: PropTypes.func.isRequired,
};

export default DashboardMaison;
