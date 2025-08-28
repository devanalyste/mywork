import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import IconPickerModal from './IconPickerModal';

const RightSidePanel = ({ onAction, isDarkMode }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false); // Nouvel état pour l'expansion
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState('');
    const [snippets, setSnippets] = useState([]);

    // États pour le sélecteur d'icônes
    const [showIconPicker, setShowIconPicker] = useState(false);
    const [editingIconId, setEditingIconId] = useState(null);

    // Charger les snippets depuis localStorage
    useEffect(() => {
        const defaultSnippets = [
            {
                id: 'snippet-1',
                text: 'Merci pour votre message, je reviens vers vous rapidement.',
                icon: '📧',
                className: 'bg-blue-600 hover:bg-blue-700 text-white'
            },
            {
                id: 'snippet-2',
                text: 'Cordialement,\\n[Votre nom]',
                icon: '✍️',
                className: 'bg-green-600 hover:bg-green-700 text-white'
            },
            {
                id: 'snippet-3',
                text: 'Pouvez-vous confirmer cette information ?',
                icon: '❓',
                className: 'bg-orange-600 hover:bg-orange-700 text-white'
            },
            {
                id: 'snippet-4',
                text: 'Document en pièce jointe.',
                icon: '📎',
                className: 'bg-purple-600 hover:bg-purple-700 text-white'
            }
        ];

        const savedSnippets = localStorage.getItem('textSnippets');
        if (savedSnippets) {
            setSnippets(JSON.parse(savedSnippets));
        } else {
            setSnippets(defaultSnippets);
        }
    }, []);

    // Sauvegarder les snippets dans localStorage
    const saveSnippets = (newSnippets) => {
        setSnippets(newSnippets);
        localStorage.setItem('textSnippets', JSON.stringify(newSnippets));
    };

    // Copier le texte dans le presse-papiers
    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            // Notification de succès (vous pouvez adapter selon votre système de notification)
            console.log('Texte copié:', text);
        } catch (err) {
            console.error('Erreur lors de la copie:', err);
            // Fallback pour les navigateurs plus anciens
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        }
    };

    // Démarrer l'édition d'un snippet
    const startEditing = (snippet) => {
        setEditingId(snippet.id);
        setEditText(snippet.text);
    };

    // Sauvegarder l'édition
    const saveEdit = () => {
        const newSnippets = snippets.map(snippet =>
            snippet.id === editingId
                ? { ...snippet, text: editText }
                : snippet
        );
        saveSnippets(newSnippets);
        setEditingId(null);
        setEditText('');
    };

    // Annuler l'édition
    const cancelEdit = () => {
        setEditingId(null);
        setEditText('');
    };

    // Ajouter un nouveau snippet
    const addNewSnippet = () => {
        const newSnippet = {
            id: `snippet-${Date.now()}`,
            text: 'Nouveau texte à éditer...',
            icon: '💬',
            className: 'bg-gray-600 hover:bg-gray-700 text-white'
        };
        const newSnippets = [...snippets, newSnippet];
        saveSnippets(newSnippets);
        startEditing(newSnippet);
    };

    // Supprimer un snippet
    const deleteSnippet = (id) => {
        const newSnippets = snippets.filter(snippet => snippet.id !== id);
        saveSnippets(newSnippets);
    };

    // Fonction pour gérer la réorganisation des snippets par drag & drop
    const handleSnippetDragEnd = (result) => {
        console.log('🔄 Snippet drag end:', result);

        if (!result.destination) {
            console.log('❌ No destination - snippet drop cancelled');
            return;
        }

        const sourceIndex = result.source.index;
        const destinationIndex = result.destination.index;

        if (sourceIndex === destinationIndex) {
            console.log('Same position - no change needed');
            return;
        }

        // Réorganiser les snippets (même logique que les tâches)
        const newSnippets = Array.from(snippets);
        const [movedSnippet] = newSnippets.splice(sourceIndex, 1);
        newSnippets.splice(destinationIndex, 0, movedSnippet);

        console.log(`Moving snippet "${movedSnippet.text.substring(0, 30)}..." from ${sourceIndex} to ${destinationIndex}`);
        console.log('Reordered snippets:', newSnippets.map(s => s.text.substring(0, 30)));

        saveSnippets(newSnippets);
    };

    // Fonctions pour la gestion des icônes
    const openIconPicker = (snippetId) => {
        setEditingIconId(snippetId);
        setShowIconPicker(true);
    };

    const closeIconPicker = () => {
        setShowIconPicker(false);
        setEditingIconId(null);
    };

    const handleIconSelect = (newIcon) => {
        if (editingIconId) {
            const newSnippets = snippets.map(snippet =>
                snippet.id === editingIconId
                    ? { ...snippet, icon: newIcon }
                    : snippet
            );
            saveSnippets(newSnippets);
        }
    };

    return (
        <>


            {/* Panneau principal */}
            <div className={`fixed right-0 top-1/2 transform -translate-y-1/2 z-30 transition-all duration-300 ${isCollapsed ? 'translate-x-full' : 'translate-x-0'
                } ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
                } border-l border-t border-b rounded-l-lg shadow-lg`}
                style={{ width: isExpanded ? '320px' : '180px' }} // Largeur dynamique
            >
                {/* Bouton de collapse/expand - Position fixe centrée */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={`fixed right-0  transform h-full z-40
                    px-2 rounded-l-md ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-100 text-gray-700 border-gray-300'
                        } border-l border-t border-b shadow-md `}
                    title={isCollapsed ? 'Développer le panneau' : 'Réduire le panneau'}
                    style={{
                        right: isCollapsed ? '190px' : (isExpanded ? '320px' : '180px'),
                        height: 'full', // Hauteur fixe pour correspondre approximativement au panneau
                        transition: 'right 0.3s ease-in-out'
                    }}
                >
                    <svg
                        className={`w-4  transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                {!isCollapsed && (
                    <>
                        {/* Titre du panneau avec bouton d'expansion */}
                        <div className={`px-3 py-2 border-b text-sm font-medium flex items-center justify-between ${isDarkMode ? 'border-gray-600 text-gray-200' : 'border-gray-200 text-gray-700'
                            }`}>
                            <span>Snippets de Texte</span>
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className={`p-1 rounded hover:bg-opacity-20 transition-all ${isDarkMode ? 'hover:bg-white' : 'hover:bg-black'
                                    }`}
                                title={isExpanded ? 'Réduire la largeur' : 'Agrandir pour voir les textes longs'}
                            >
                                <svg
                                    className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                                </svg>
                            </button>
                        </div>

                        {/* Boutons de snippets avec drag & drop */}
                        <DragDropContext onDragEnd={handleSnippetDragEnd}>
                            <Droppable droppableId="snippets-list">
                                {(provided, snapshot) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className={`p-3 space-y-2 ${snapshot.isDraggingOver ? 'bg-blue-50 rounded' : ''
                                            }`}
                                    >
                                        {snippets.map((snippet, index) => (
                                            <Draggable key={snippet.id} draggableId={snippet.id} index={index}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        className={`relative group ${snapshot.isDragging ? 'z-50 shadow-lg' : ''
                                                            }`}
                                                        style={{
                                                            ...provided.draggableProps.style,
                                                            transform: snapshot.isDragging
                                                                ? `${provided.draggableProps.style?.transform} rotate(2deg)`
                                                                : provided.draggableProps.style?.transform,
                                                        }}
                                                    >
                                                        {editingId === snippet.id ? (
                                                            // Mode édition (sans drag handle pendant l'édition)
                                                            <div className="space-y-2">
                                                                <textarea
                                                                    value={editText}
                                                                    onChange={(e) => setEditText(e.target.value)}
                                                                    className={`w-full p-2 text-xs rounded border resize-none ${isDarkMode
                                                                        ? 'bg-gray-700 border-gray-600 text-white'
                                                                        : 'bg-white border-gray-300 text-gray-900'
                                                                        }`}
                                                                    rows={3}
                                                                    autoFocus
                                                                />
                                                                <div className="flex gap-1">
                                                                    <button
                                                                        onClick={saveEdit}
                                                                        className="px-2 py-1 text-xs text-white bg-green-600 rounded hover:bg-green-700"
                                                                    >
                                                                        ✓
                                                                    </button>
                                                                    <button
                                                                        onClick={cancelEdit}
                                                                        className="px-2 py-1 text-xs text-white bg-gray-600 rounded hover:bg-gray-700"
                                                                    >
                                                                        ✕
                                                                    </button>
                                                                    <button
                                                                        onClick={() => deleteSnippet(snippet.id)}
                                                                        className="px-2 py-1 ml-auto text-xs text-white bg-red-600 rounded hover:bg-red-700"
                                                                    >
                                                                        🗑️
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            // Mode normal avec drag handle
                                                            <div className="flex items-stretch gap-1">
                                                                {/* Drag handle */}
                                                                <div
                                                                    {...provided.dragHandleProps}
                                                                    className={`flex items-center justify-center px-1 rounded-l cursor-grab active:cursor-grabbing ${isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'
                                                                        } ${snapshot.isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                                                                    title="Glisser pour réorganiser"
                                                                >
                                                                    <span className="text-xs">⋮⋮</span>
                                                                </div>

                                                                {/* Bouton snippet */}
                                                                <button
                                                                    onClick={() => copyToClipboard(snippet.text)}
                                                                    onContextMenu={(e) => {
                                                                        e.preventDefault();
                                                                        startEditing(snippet);
                                                                    }}
                                                                    className={`
                                                                        flex-1 flex items-start gap-2 px-3 py-2 rounded-r-md text-xs
                                                                        transition-all duration-200 
                                                                        ${snippet.className}
                                                                        shadow-sm hover:shadow-md ${isExpanded ? 'min-h-[50px]' : 'min-h-[40px]'} text-left
                                                                        ${snapshot.isDragging ? 'opacity-80' : ''}
                                                                    `}
                                                                    title={`Clic gauche: Copier | Clic droit: Éditer le texte\n${snippet.text}`}
                                                                >
                                                                    {/* Icône cliquable pour changer l'icône */}
                                                                    <span
                                                                        className={`
                                                                            text-lg flex-shrink-0 mt-0.5 cursor-pointer 
                                                                            hover:scale-125 transition-all duration-200 
                                                                            rounded p-1 hover:bg-white hover:bg-opacity-20
                                                                        `}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation(); // Empêcher le clic sur le bouton parent
                                                                            openIconPicker(snippet.id);
                                                                        }}
                                                                        title="🎨 Cliquer pour changer l'icône"
                                                                    >
                                                                        {snippet.icon}
                                                                    </span>
                                                                    <span className="leading-tight line-clamp-3">
                                                                        {isExpanded
                                                                            ? snippet.text // Afficher le texte complet quand étendu
                                                                            : (snippet.text.length > 42
                                                                                ? `${snippet.text.substring(0, 39)}...`
                                                                                : snippet.text
                                                                            )
                                                                        }
                                                                    </span>
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}

                                        {/* Bouton pour ajouter un nouveau snippet */}
                                        <button
                                            onClick={addNewSnippet}
                                            className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-medium
                                                transition-all duration-200 border-2 border-dashed
                                                ${isDarkMode
                                                    ? 'border-gray-600 text-gray-400 hover:border-gray-500 hover:text-gray-300'
                                                    : 'border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-600'
                                                }`}
                                        >
                                            <span>➕</span>
                                            <span>Ajouter snippet</span>
                                        </button>
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>

                        {/* Instructions améliorées */}
                        <div className={`px-3 py-3 border-t ${isDarkMode ? 'border-gray-600 bg-gray-750' : 'border-gray-200 bg-gray-50'
                            }`}>
                            <div className="mb-2 text-xs font-medium text-center">
                                <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                    💡 Guide d'utilisation
                                </span>
                            </div>
                            <div className="space-y-1">
                                <div className={`flex items-center text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    <span className="mr-2">📋</span>
                                    <span className="mr-1 font-medium">Clic gauche :</span>
                                    <span>Copier le texte</span>
                                </div>
                                <div className={`flex items-center text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    <span className="mr-2">✏️</span>
                                    <span className="mr-1 font-medium">Clic droit :</span>
                                    <span>Éditer le texte</span>
                                </div>
                                <div className={`flex items-center text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    <span className="mr-2">🎨</span>
                                    <span className="mr-1 font-medium">Clic sur icône :</span>
                                    <span>Changer l'icône</span>
                                </div>
                                <div className={`flex items-center text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    <span className="mr-2">⋮⋮</span>
                                    <span className="mr-1 font-medium">Glisser-déposer :</span>
                                    <span>Réorganiser</span>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Mode réduit - icônes seulement */}
                {isCollapsed && (
                    <div className="p-2 space-y-1">
                        {snippets.slice(0, 4).map((snippet) => (
                            <button
                                key={snippet.id}
                                onClick={() => copyToClipboard(snippet.text)}
                                onContextMenu={(e) => {
                                    e.preventDefault();
                                    startEditing(snippet);
                                }}
                                className={`
                                    w-full flex items-center justify-center p-2 rounded-md text-sm
                                    transition-all duration-200 transform hover:scale-105
                                    ${snippet.className}
                                    shadow-sm hover:shadow-md
                                `}
                                title={`${snippet.text.substring(0, 30)}...`}
                            >
                                {snippet.icon}
                            </button>
                        ))}

                        {/* Bouton d'ajout en mode réduit */}
                        <button
                            onClick={addNewSnippet}
                            className={`w-full flex items-center justify-center p-2 rounded-md text-sm
                                transition-all duration-200 transform hover:scale-105 border-2 border-dashed
                                ${isDarkMode
                                    ? 'border-gray-600 text-gray-400 hover:border-gray-500'
                                    : 'border-gray-300 text-gray-500 hover:border-gray-400'
                                }`}
                            title="Ajouter un nouveau snippet"
                        >
                            ➕
                        </button>
                    </div>
                )}

            </div>

            {/* Modal de sélection d'icônes */}
            <IconPickerModal
                isOpen={showIconPicker}
                onClose={closeIconPicker}
                onSelectIcon={handleIconSelect}
                currentIcon={editingIconId ? snippets.find(s => s.id === editingIconId)?.icon : ''}
                isDarkMode={isDarkMode}
            />

        </>
    );
};

export default RightSidePanel;
