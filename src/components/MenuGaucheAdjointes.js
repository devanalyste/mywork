import React from 'react';
import PropTypes from 'prop-types';

const MenuGaucheAdjointes = ({ categories, onSelectTask, selectedTask, onToggleCategory }) => {
    return (
        <div className="w-64 bg-gray-800 text-white p-4 space-y-4">
            {Object.entries(categories).map(([category, { tasks, isOpen }]) => (
                <div key={category}>
                    <button
                        type="button"
                        onClick={() => onToggleCategory(category)}
                        className="cursor-pointer font-bold text-lg mb-2 bg-transparent border-none p-0 text-left w-full focus:outline-none"
                        aria-expanded={isOpen}
                    >
                        {category}
                    </button>
                    {isOpen && (
                        <ul className="space-y-2">
                            {tasks.map(task => (
                                <li key={task.id}>
                                    <button
                                        type="button"
                                        onClick={() => onSelectTask(task)}
                                        className={`cursor-pointer p-2 rounded w-full text-left ${selectedTask && selectedTask.id === task.id ? 'bg-gray-700' : ''}`}
                                    >
                                        {task.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            ))}
        </div>
    );
};
MenuGaucheAdjointes.propTypes = {
    categories: PropTypes.object.isRequired,
    onSelectTask: PropTypes.func.isRequired,
    selectedTask: PropTypes.object,
    onToggleCategory: PropTypes.func.isRequired,
};

export default MenuGaucheAdjointes;
