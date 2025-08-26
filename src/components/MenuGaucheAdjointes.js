import React, { useState } from 'react';
import PropTypes from 'prop-types';

const MenuGaucheAdjointes = ({ categories, onSelectTask, selectedTask, onToggleCategory, isAdminMode, onDeleteTask, onRenameTask }) => {
    const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, task: null });
    const [renamingTask, setRenamingTask] = useState(null);
    const [tempName, setTempName] = useState('');

    const handleContextMenu = (e, task) => {
        if (!isAdminMode) return;

        e.preventDefault();
        e.stopPropagation();

        setContextMenu({
            show: true,
            x: e.clientX,
            y: e.clientY,
            task: task
        });
    };

    const handleContextMenuAction = (action) => {
        console.log('handleContextMenuAction called with:', action);
        console.log('contextMenu.task:', contextMenu.task);
        console.log('onRenameTask function exists:', !!onRenameTask);
        console.log('onDeleteTask function exists:', !!onDeleteTask);

        if (!contextMenu.task) {
            console.error('No task in context menu');
            return;
        }

        if (action === 'rename') {
            if (!onRenameTask) {
                console.error('onRenameTask function not provided');
                return;
            }

            console.log('Starting rename mode for task:', contextMenu.task.name);
            setRenamingTask(contextMenu.task);
            setTempName(contextMenu.task.name);
            setContextMenu({ show: false, x: 0, y: 0, task: null });
        } else if (action === 'delete') {
            if (!onDeleteTask) {
                console.error('onDeleteTask function not provided');
                return;
            }

            console.log('Attempting to delete task:', contextMenu.task.name);
            try {
                onDeleteTask(contextMenu.task.id);
            } catch (error) {
                console.error('Error calling onDeleteTask:', error);
            }
        }

        setContextMenu({ show: false, x: 0, y: 0, task: null });
    };

    const handleClickOutside = () => {
        setContextMenu({ show: false, x: 0, y: 0, task: null });
    };

    // Fonctions pour gérer le renommage inline
    const handleStartRename = (task) => {
        setRenamingTask(task);
        setTempName(task.name);
    };

    const handleFinishRename = () => {
        if (renamingTask && tempName.trim() && tempName.trim() !== renamingTask.name) {
            onRenameTask(renamingTask.id, tempName.trim());
        }
        setRenamingTask(null);
        setTempName('');
    };

    const handleCancelRename = () => {
        setRenamingTask(null);
        setTempName('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleFinishRename();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            handleCancelRename();
        }
    };

    // Fermer le menu contextuel quand on clique ailleurs
    React.useEffect(() => {
        if (contextMenu.show) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [contextMenu.show]);
    return (
        <div className="w-64 bg-gray-800 text-white p-4 space-y-4">
            {Object.entries(categories).map(([category, { tasks, isOpen }]) => (
                <div key={category}>
                    <button
                        type="button"
                        onClick={() => onToggleCategory(category)}
                        className="cursor-pointer font-bold text-lg mb-2 bg-transparent border-none p-0 text-left w-full focus:outline-none hover:text-blue-300 transition-colors duration-200 flex items-center justify-between"
                        aria-expanded={isOpen}
                    >
                        <span>{category}</span>
                        <svg
                            className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'transform rotate-90' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                    {isOpen && (
                        <ul className="space-y-2 ml-4 border-l-2 border-gray-600 pl-3">{tasks.map(task => (
                                <li key={task.id}>
                                {renamingTask && renamingTask.id === task.id ? (
                                    <input
                                        type="text"
                                        value={tempName}
                                        onChange={(e) => setTempName(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        onBlur={handleFinishRename}
                                        className="w-full p-2 rounded bg-yellow-100 text-gray-800 border border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                        autoFocus
                                        placeholder="Nouveau nom de la tâche"
                                    />
                                ) : (
                                        <button
                                            type="button"
                                            onClick={() => onSelectTask(task)}
                                            onContextMenu={(e) => handleContextMenu(e, task)}
                                            className={`cursor-pointer p-2 rounded w-full text-left ${selectedTask && selectedTask.id === task.id ? 'bg-gray-700' : ''} ${isAdminMode ? 'admin-task-item' : ''}`}
                                            title={isAdminMode ? 'Clic droit pour les options admin' : ''}
                                        >
                                            {task.name}
                                        </button>
                                )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            ))}

            {/* Menu contextuel */}
            {contextMenu.show && (
                <div
                    className="context-menu"
                    style={{
                        position: 'fixed',
                        top: `${contextMenu.y}px`,
                        left: `${contextMenu.x}px`,
                        zIndex: 9999,
                        backgroundColor: 'white',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                        minWidth: '150px'
                    }}
                >
                    {onRenameTask && (
                        <button
                            className="context-menu-item"
                            onClick={() => handleContextMenuAction('rename')}
                        >
                            ✏️ Renommer
                        </button>
                    )}
                    {onDeleteTask && (
                        <button
                            className="context-menu-item delete"
                            onClick={() => handleContextMenuAction('delete')}
                        >
                            🗑️ Supprimer
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};
MenuGaucheAdjointes.propTypes = {
    categories: PropTypes.object.isRequired,
    onSelectTask: PropTypes.func.isRequired,
    selectedTask: PropTypes.object,
    onToggleCategory: PropTypes.func.isRequired,
    isAdminMode: PropTypes.bool,
    onDeleteTask: PropTypes.func,
    onRenameTask: PropTypes.func,
};

export default MenuGaucheAdjointes;
