import React, { useState } from 'react';
import PropTypes from 'prop-types';

const IconPickerModal = ({ isOpen, onClose, onSelectIcon, currentIcon, isDarkMode }) => {
    const [selectedCategory, setSelectedCategory] = useState('smileys');
    const [searchTerm, setSearchTerm] = useState('');

    // Grande collection d'emojis organisés par catégories
    const iconCategories = {
        smileys: {
            name: '😀 Visages & Émotions',
            icons: [
                '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
                '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙',
                '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔',
                '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
                '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧',
                '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐'
            ]
        },
        people: {
            name: '👥 Personnes & Corps',
            icons: [
                '👶', '🧒', '👦', '👧', '🧑', '👱', '👨', '🧔', '👩', '🧓',
                '👴', '👵', '🙍', '🙎', '🙅', '🙆', '💁', '🙋', '🧏', '🙇',
                '🤦', '🤷', '👮', '🕵️', '💂', '👷', '🤴', '👸', '👳', '👲',
                '🧕', '🤵', '👰', '🤰', '🤱', '👼', '🎅', '🤶', '🦸', '🦹',
                '🧙', '🧚', '🧛', '🧜', '🧝', '🧞', '🧟', '💆', '💇', '🚶',
                '🏃', '💃', '🕺', '👯', '🧖', '🧗', '🏇', '⛷️', '🏂', '🏌️'
            ]
        },
        animals: {
            name: '🐾 Animaux & Nature',
            icons: [
                '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
                '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒',
                '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇',
                '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜',
                '🦟', '🦗', '🕷️', '🕸️', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕',
                '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳'
            ]
        },
        food: {
            name: '🍎 Nourriture & Boissons',
            icons: [
                '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈',
                '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦',
                '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔',
                '🍠', '🥐', '🥖', '🍞', '🥨', '🥯', '🧀', '🥚', '🍳', '🧈',
                '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🌭', '🍔', '🍟', '🍕',
                '🥪', '🥙', '🧆', '🌮', '🌯', '🫔', '🥗', '🥘', '🫕', '🍝'
            ]
        },
        activities: {
            name: '⚽ Sports & Activités',
            icons: [
                '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱',
                '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳',
                '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛷', '⛸️',
                '🥌', '🎿', '⛷️', '🏂', '🪂', '🏋️', '🤼', '🤸', '⛹️', '🤺',
                '🏊', '🏄', '🚣', '🧘', '🎭', '🩰', '🎨', '🎬', '🎪', '🎫',
                '🎮', '🕹️', '🎯', '🎲', '🧩', '🃏', '🀄', '🎴', '🎊', '🎉'
            ]
        },
        travel: {
            name: '🚗 Voyage & Lieux',
            icons: [
                '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐',
                '🛻', '🚚', '🚛', '🚜', '🏍️', '🛵', '🚲', '🛴', '🛹', '🛼',
                '🚁', '🛸', '✈️', '🛩️', '🪂', '💺', '🚀', '🛰️', '🚢', '⛵',
                '🚤', '🛥️', '🛳️', '⛴️', '🚧', '⛽', '🚏', '🚥', '🚦', '🗺️',
                '🏠', '🏡', '🏘️', '🏚️', '🏗️', '🏭', '🏢', '🏬', '🏣', '🏤',
                '🏥', '🏦', '🏨', '🏪', '🏫', '🏩', '💒', '🏛️', '⛪', '🕌'
            ]
        },
        objects: {
            name: '📱 Objets',
            icons: [
                '📱', '📞', '☎️', '📟', '📠', '🔋', '🔌', '💻', '🖥️', '🖨️',
                '⌨️', '🖱️', '🖲️', '💽', '💾', '💿', '📀', '🧮', '🎥', '🎞️',
                '📸', '📷', '📹', '📼', '💳', '🪪', '📧', '📨', '📩', '📤',
                '📥', '📦', '📫', '📪', '📬', '📭', '📮', '🗳️', '✏️', '✒️',
                '🖋️', '🖊️', '🖌️', '🖍️', '📝', '💼', '📁', '📂', '🗂️', '📅',
                '📆', '🗒️', '🗓️', '📇', '📈', '📉', '📊', '📋', '📌', '📍'
            ]
        },
        symbols: {
            name: '🔴 Symboles',
            icons: [
                '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
                '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️',
                '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐',
                '⭐', '🌟', '✨', '⚡', '☄️', '💥', '🔥', '🌈', '☀️', '🌤️',
                '⛅', '🌥️', '☁️', '🌦️', '🌧️', '⛈️', '🌩️', '🌨️', '❄️', '☃️',
                '⛄', '🌬️', '💨', '💧', '💦', '☔', '🌊', '🌍', '🌎', '🌏'
            ]
        }
    };

    // Filtrer les icônes selon la recherche
    const filteredIcons = searchTerm
        ? Object.values(iconCategories).flatMap(category =>
            category.icons.filter(icon =>
                icon.includes(searchTerm) ||
                category.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
        )
        : iconCategories[selectedCategory]?.icons || [];

    const handleIconSelect = (icon) => {
        onSelectIcon(icon);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`
                max-w-4xl w-full max-h-[90vh] overflow-hidden rounded-lg shadow-2xl
                ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}
            `}>
                {/* En-tête */}
                <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold">🎨 Choisir une icône</h2>
                            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Cliquez sur une icône pour l'appliquer à votre snippet
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className={`p-2 rounded-full hover:bg-opacity-20 ${isDarkMode ? 'hover:bg-white' : 'hover:bg-black'
                                }`}
                        >
                            ✕
                        </button>
                    </div>

                    {/* Barre de recherche */}
                    <div className="mt-4">
                        <input
                            type="text"
                            placeholder="Rechercher une icône..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`w-full px-4 py-2 rounded-lg border ${isDarkMode
                                    ? 'bg-gray-700 border-gray-600 text-white'
                                    : 'bg-white border-gray-300 text-gray-900'
                                }`}
                        />
                    </div>
                </div>

                <div className="flex h-[70vh]">
                    {/* Catégories */}
                    {!searchTerm && (
                        <div className={`w-64 border-r overflow-y-auto ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            {Object.entries(iconCategories).map(([key, category]) => (
                                <button
                                    key={key}
                                    onClick={() => setSelectedCategory(key)}
                                    className={`w-full text-left px-4 py-3 transition-colors ${selectedCategory === key
                                            ? (isDarkMode ? 'bg-gray-700' : 'bg-blue-50')
                                            : (isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50')
                                        }`}
                                >
                                    {category.name}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Grille d'icônes */}
                    <div className="flex-1 p-6 overflow-y-auto">
                        <div className="grid grid-cols-10 gap-3">
                            {filteredIcons.map((icon, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleIconSelect(icon)}
                                    className={`
                                        w-14 h-14 rounded-lg flex items-center justify-center text-2xl
                                        transition-all duration-200 transform hover:scale-110
                                        ${currentIcon === icon
                                            ? 'bg-blue-500 text-white shadow-lg'
                                            : (isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100')
                                        }
                                    `}
                                    title={icon}
                                >
                                    {icon}
                                </button>
                            ))}
                        </div>

                        {filteredIcons.length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                                Aucune icône trouvée pour "{searchTerm}"
                            </div>
                        )}
                    </div>
                </div>

                {/* Pied de page */}
                <div className={`px-6 py-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                            {filteredIcons.length} icône(s) disponible(s)
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={onClose}
                                className={`px-4 py-2 rounded-lg border ${isDarkMode
                                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

IconPickerModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSelectIcon: PropTypes.func.isRequired,
    currentIcon: PropTypes.string,
    isDarkMode: PropTypes.bool.isRequired,
};

IconPickerModal.defaultProps = {
    currentIcon: '',
};

export default IconPickerModal;
