import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import '../styles/simple-controls.css';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
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

// Composant Task avec @hello-pangea/dnd (structure corrigée)
const DraggableTaskItem = ({ task, onTaskClick, index, categoryName }) => {
    return (
        <Draggable
            draggableId={task.id}
            index={index}
        >
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`task-item clickable compact grid-task draggable-task ${snapshot.isDragging ? 'dragging' : ''
                        }`}
                    style={{
                        ...provided.draggableProps.style,
                        marginBottom: '8px',
                        opacity: snapshot.isDragging ? 0.8 : 1,
                        transform: snapshot.isDragging
                            ? `${provided.draggableProps.style?.transform} rotate(2deg)`
                            : provided.draggableProps.style?.transform,
                        cursor: snapshot.isDragging ? 'grabbing' : 'grab'
                    }}
                    onClick={() => onTaskClick(task)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onTaskClick(task);
                        }
                    }}
                    role="button"
                    tabIndex={0}
                    title="Glissez pour réorganiser ou cliquez pour ouvrir"
                    aria-label={`Task: ${task.name}`}
                >
                    <div className="task-content-simple">
                        <div className="task-info">
                            <span className="task-number">
                                {task.fields?.find(f => f.key === 'modelNumber')?.value}
                            </span>
                            <span className="task-name-compact">
                                {task.name}
                            </span>
                        </div>
                        <div className="drag-indicator">
                            ⋮⋮
                        </div>
                    </div>
                </div>
            )}
        </Draggable>
    );
};

DraggableTaskItem.propTypes = {
    task: PropTypes.object.isRequired,
    onTaskClick: PropTypes.func.isRequired,
    index: PropTypes.number.isRequired,
    categoryName: PropTypes.string.isRequired
};

// Composant de grille avec @hello-pangea/dnd
const CategoryDragDropGrid = ({
    category,
    tasks,
    isOpen,
    isAdminMode,
    onToggleCategory,
    onTaskClick,
    onReorderTasks,
    searchTerm,
}) => {
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
                <Droppable
                    droppableId={category}
                >
                    {(provided, snapshot) => (
                        <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className={`tasks-dragdrop-grid ${snapshot.isDraggingOver ? 'drag-over' : ''}`}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px',
                                padding: '16px',
                                backgroundColor: snapshot.isDraggingOver ? '#f0f9ff' : 'white',
                                border: '1px solid #e5e7eb',
                                borderTop: 'none',
                                borderBottomLeftRadius: '8px',
                                borderBottomRightRadius: '8px',
                                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                                maxHeight: 'calc(100vh - 300px)',
                                overflowY: 'auto',
                                zIndex: 10,
                                minHeight: '100px',
                                transition: 'background-color 0.2s ease'
                            }}
                        >
                            {filteredTasks.map((task, index) => (
                                <DraggableTaskItem
                                    key={task.id}
                                    task={task}
                                    index={index}
                                    categoryName={category}
                                    onTaskClick={onTaskClick}
                                />
                            ))}
                            {provided.placeholder}
                            {filteredTasks.length === 0 && (
                                <div className="empty-category text-center text-gray-500 py-4">
                                    Aucune tâche dans cette catégorie
                                </div>
                            )}
                        </div>
                    )}
                </Droppable>
            )}
        </div>
    );
};

CategoryDragDropGrid.propTypes = {
    category: PropTypes.string.isRequired,
    tasks: PropTypes.arrayOf(PropTypes.object).isRequired,
    isOpen: PropTypes.bool.isRequired,
    isAdminMode: PropTypes.bool,
    onToggleCategory: PropTypes.func.isRequired,
    onTaskClick: PropTypes.func.isRequired,
    onReorderTasks: PropTypes.func.isRequired,
    searchTerm: PropTypes.string
};

// Composant pour une catégorie avec @hello-pangea/dnd
const DragDropCategory = ({
    category,
    isOpen,
    isAdminMode,
    onToggleCategory,
    onTaskClick,
    onReorderTasks,
    searchTerm
}) => {
    return (
        <div className="category-wrapper">
            <CategoryDragDropGrid
                category={category.name}
                tasks={category.tasks}
                isOpen={isOpen}
                isAdminMode={isAdminMode}
                onToggleCategory={onToggleCategory}
                onTaskClick={onTaskClick}
                onReorderTasks={onReorderTasks}
                searchTerm={searchTerm}
            />
        </div>
    );
};

DragDropCategory.propTypes = {
    category: PropTypes.object.isRequired,
    isOpen: PropTypes.bool.isRequired,
    isAdminMode: PropTypes.bool,
    onToggleCategory: PropTypes.func.isRequired,
    onTaskClick: PropTypes.func.isRequired,
    onReorderTasks: PropTypes.func.isRequired,
    searchTerm: PropTypes.string
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
    const [categoryOrder, setCategoryOrder] = useState([]); // Nouvel état pour l'ordre des catégories


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

        const categoriesArray = Array.from(categories.values());

        // Appliquer l'ordre personnalisé si défini, sinon tri alphabétique
        if (categoryOrder.length > 0) {
            const orderedCategories = [];
            const remainingCategories = [...categoriesArray];

            // D'abord, ajouter les catégories dans l'ordre personnalisé
            categoryOrder.forEach(categoryName => {
                const categoryIndex = remainingCategories.findIndex(cat => cat.name === categoryName);
                if (categoryIndex !== -1) {
                    orderedCategories.push(remainingCategories.splice(categoryIndex, 1)[0]);
                }
            });

            // Ensuite, ajouter les nouvelles catégories non ordonnées
            remainingCategories.sort((a, b) => a.name.localeCompare(b.name));
            return [...orderedCategories, ...remainingCategories];
        }

        return categoriesArray.sort((a, b) => a.name.localeCompare(b.name));
    }, [appData, categoryOrder]);

    // Initialiser l'ordre des catégories au premier rendu
    React.useEffect(() => {
        if (categoryOrder.length === 0 && categoriesData.length > 0) {
            setCategoryOrder(categoriesData.map(cat => cat.name));
        }
    }, [categoriesData, categoryOrder.length, setCategoryOrder]);

    const handleTaskClick = (task) => {
        onTabChange(task.tabName);
        onTaskSelect(task);
    };

    // Fonctions pour gérer le drag & drop avec @hello-pangea/dnd
    const handleReorderTasks = (categoryName, reorderedTasks) => {
        console.log('🔄 handleReorderTasks called with:', { categoryName, reorderedTasks });

        if (onReorderTasksInCategory && reorderedTasks.length > 0) {
            // Approche directe : passer directement le nouveau tableau au parent
            onReorderTasksInCategory(categoryName, reorderedTasks);
            console.log('✅ Tasks reordered successfully');
        } else {
            console.log('❌ onReorderTasksInCategory not available or empty tasks');
        }
    };

    // Charger l'ordre des catégories depuis localStorage au démarrage
    React.useEffect(() => {
        const savedOrder = localStorage.getItem('covalen-category-order');
        if (savedOrder) {
            try {
                setCategoryOrder(JSON.parse(savedOrder));
            } catch (error) {
                console.warn('Erreur lors du chargement de l\'ordre des catégories:', error);
            }
        }
    }, []);

    const getTotalTaskCount = () => {
        return filteredCategories.reduce((total, category) => total + category.tasks.length, 0);
    };

    // Composant pour l'affichage Kanban
    const KanbanView = ({ categoriesData, searchTerm, onTaskClick, onReorderTasksInCategory }) => {
        const [sortField, setSortField] = useState('none');
        const [sortDirection, setSortDirection] = useState('asc');
        
        const sensors = useSensors(
            useSensor(PointerSensor),
            useSensor(KeyboardSensor, {
                coordinateGetter: sortableKeyboardCoordinates,
            })
        );

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

        // Filtrer et trier les tâches par catégorie selon la recherche et le tri
        const filteredCategoriesData = useMemo(() => {
            let result = categoriesData;
            
            // Filtrage par recherche
            if (searchTerm) {
                const searchLower = searchTerm.toLowerCase();
                result = categoriesData.map(category => ({
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
            }

            // Tri des tâches dans chaque catégorie
            if (sortField !== 'none') {
                result = result.map(category => ({
                    ...category,
                    tasks: [...category.tasks].sort((a, b) => {
                        let aValue, bValue;

                        switch (sortField) {
                            case 'modelNumber':
                                aValue = a.fields?.find(f => f.key === 'modelNumber')?.value || '';
                                bValue = b.fields?.find(f => f.key === 'modelNumber')?.value || '';
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
                            default:
                                return 0;
                        }

                        if (sortDirection === 'asc') {
                            return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
                        } else {
                            return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
                        }
                    })
                }));
            }

            return result;
        }, [categoriesData, searchTerm, sortField, sortDirection]);

        const handleDragEnd = (event) => {
            const { active, over } = event;
            console.log('🔄 Kanban drag end:', { active: active.id, over: over?.id });

            if (!over || active.id === over.id) {
                console.log('❌ No valid drop target or same position');
                return;
            }

            // Trouver la catégorie source et la tâche déplacée
            let sourceCategory = null;
            let sourceIndex = -1;
            let movedTask = null;

            // Chercher la tâche source
            for (const category of filteredCategoriesData) {
                const taskIndex = category.tasks.findIndex(task => task.id === active.id);
                if (taskIndex !== -1) {
                    sourceCategory = category.name;
                    sourceIndex = taskIndex;
                    movedTask = category.tasks[taskIndex];
                    console.log('✅ Found source:', { sourceCategory, sourceIndex, task: movedTask.name });
                    break;
                }
            }

            // Trouver la position cible dans la même catégorie
            let targetIndex = -1;
            const targetCategory = filteredCategoriesData.find(cat => cat.name === sourceCategory);

            if (targetCategory) {
                const overTaskIndex = targetCategory.tasks.findIndex(task => task.id === over.id);
                if (overTaskIndex !== -1) {
                    targetIndex = overTaskIndex;
                    console.log('✅ Found target position:', targetIndex);
                }
            }

            if (sourceIndex !== -1 && targetIndex !== -1 && sourceCategory && movedTask) {
                // Créer le nouveau tableau de tâches (même logique que la grille)
                const categoryTasks = targetCategory.tasks;
                const newTasks = Array.from(categoryTasks);
                newTasks.splice(sourceIndex, 1); // Retirer de l'ancienne position
                newTasks.splice(targetIndex, 0, movedTask); // Insérer à la nouvelle position

                console.log(`🎯 Moving "${movedTask.name}" from ${sourceIndex} to ${targetIndex} in ${sourceCategory}`);
                console.log('📋 New tasks order:', newTasks.map(t => t.name));

                // Utiliser la nouvelle fonction qui accepte le tableau complet
                onReorderTasksInCategory(sourceCategory, newTasks);
            } else {
                console.log('❌ Could not complete drag:', { sourceIndex, targetIndex, sourceCategory, movedTask });
            }
        };

        return (
            <div className="w-full h-full kanban-view">
                {/* Barre de tri pour Kanban */}
                <div className="p-3 mb-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-700">Trier par:</span>
                        <button
                            className={`px-3 py-1 text-xs rounded transition-colors ${
                                sortField === 'none' 
                                    ? 'bg-blue-500 text-white' 
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                            onClick={() => setSortField('none')}
                        >
                            Aucun
                        </button>
                        <button
                            className={`flex items-center gap-1 px-3 py-1 text-xs rounded transition-colors ${
                                sortField === 'modelNumber' 
                                    ? 'bg-blue-500 text-white' 
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                            onClick={() => handleSort('modelNumber')}
                        >
                            <span>Numéro</span>
                            {sortField === 'modelNumber' && getSortIcon('modelNumber')}
                        </button>
                        <button
                            className={`flex items-center gap-1 px-3 py-1 text-xs rounded transition-colors ${
                                sortField === 'name' 
                                    ? 'bg-blue-500 text-white' 
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                            onClick={() => handleSort('name')}
                        >
                            <span>Nom</span>
                            {sortField === 'name' && getSortIcon('name')}
                        </button>
                    </div>
                </div>
                
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
                className="relative p-3 transition-shadow bg-white border border-gray-200 rounded shadow-sm cursor-pointer kanban-card hover:shadow-md"
                onClick={(e) => {
                    e.stopPropagation();
                    onTaskClick(task);
                }}
            >
                {/* Zone de drag (handle) */}
                <div
                    {...listeners}
                    className="absolute flex items-center justify-center w-6 h-6 bg-gray-100 rounded cursor-move top-1 right-1 hover:bg-gray-200"
                    title="Glisser pour déplacer"
                >
                    <span className="text-xs text-gray-500">⋮⋮</span>
                </div>
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
                    <DragDropContext onDragEnd={(result) => {
                        console.log('Drag end result:', result);

                        // Vérifications de base
                        if (!result.destination) {
                            console.log('No destination - drop cancelled');
                            return;
                        }

                        if (result.source.droppableId !== result.destination.droppableId) {
                            console.log('Cross-category drop not allowed');
                            return;
                        }

                        // Extraire le nom de catégorie depuis le droppableId (maintenant directement le nom)
                        const categoryName = result.source.droppableId;
                        const category = filteredCategories.find(cat => cat.name === categoryName);
                        if (!category) {
                            console.log('Category not found:', categoryName);
                            return;
                        }

                        // Logique simple comme le test qui fonctionne
                        const tasks = category.tasks;
                        const newTasks = Array.from(tasks);
                        const [reorderedTask] = newTasks.splice(result.source.index, 1);
                        newTasks.splice(result.destination.index, 0, reorderedTask);

                        console.log(`Moving task "${reorderedTask.name}" from ${result.source.index} to ${result.destination.index}`);
                        console.log('Reordered tasks:', newTasks);

                        handleReorderTasks(categoryName, newTasks);
                    }}>
                        <div
                            className="categories-container"
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(4, 1fr)',
                                gap: '16px',
                                width: '100%',
                                height: '100%',
                                gridAutoFlow: 'row dense',
                                gridAutoRows: 'auto',
                                alignItems: 'start',
                                alignContent: 'start'
                            }}
                        >
                            {filteredCategories.map(category => (
                                <DragDropCategory
                                    key={category.name}
                                    category={category}
                                    isOpen={categoryStates[category.name] ?? false}
                                    isAdminMode={isAdminMode}
                                    onToggleCategory={handleToggleCategory}
                                    onTaskClick={handleTaskClick}
                                    onReorderTasks={handleReorderTasks}
                                    searchTerm={searchTerm}
                                />
                            ))}
                        </div>
                    </DragDropContext>
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
                            onReorderTasksInCategory={onReorderTasksInCategory}
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
    appData: PropTypes.object.isRequired,
    onTabChange: PropTypes.func.isRequired,
    onTaskSelect: PropTypes.func.isRequired,
    onAdminPanel: PropTypes.func.isRequired,
    isAdminMode: PropTypes.bool.isRequired,
    onReorderTasksInCategory: PropTypes.func.isRequired,
    viewMode: PropTypes.string,
    onViewModeChange: PropTypes.func.isRequired,
};

export default DashboardMaison;
