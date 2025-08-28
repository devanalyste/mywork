import React, { useState, useEffect } from 'react';
import { themeManager } from '../utils/themeManager';

const ThemeToggle = ({ className = '' }) => {
    const [isDark, setIsDark] = useState(themeManager.isDark());

    useEffect(() => {
        // Synchroniser l'état avec le gestionnaire de thème
        setIsDark(themeManager.isDark());
    }, []);

    const handleToggle = () => {
        const newTheme = themeManager.toggle();
        setIsDark(newTheme === 'dark');
    };

    return (
        <button
            onClick={handleToggle}
            className={`
                relative inline-flex items-center justify-center p-2 rounded-lg
                bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600
                text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white
                transition-all duration-200 ease-in-out
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
                ${className}
            `}
            title={isDark ? 'Passer au thème clair' : 'Passer au thème sombre'}
            aria-label={`Basculer vers le thème ${isDark ? 'clair' : 'sombre'}`}
        >
            <div className="relative w-5 h-5">
                {/* Icône soleil (thème clair) */}
                <svg
                    className={`absolute inset-0 w-5 h-5 transition-all duration-300 ${isDark ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
                        }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                </svg>

                {/* Icône lune (thème sombre) */}
                <svg
                    className={`absolute inset-0 w-5 h-5 transition-all duration-300 ${isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'
                        }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                </svg>
            </div>
        </button>
    );
};

export default ThemeToggle;
