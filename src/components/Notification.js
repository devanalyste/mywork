import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

const Notification = ({ message, type = 'success', onClose, isDarkMode = false }) => {
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                onClose();
            }, 3000); // Auto-fermeture après 3 secondes

            return () => clearTimeout(timer);
        }
    }, [message, onClose]);

    if (!message) return null;

    const getNotificationStyle = () => {
        const baseStyle = 'fixed bottom-4 right-4 text-white p-4 rounded-lg shadow-lg transition-all duration-300 z-50';

        switch (type) {
            case 'error':
                return `${baseStyle} bg-red-500 hover:bg-red-600`;
            case 'info':
                return `${baseStyle} ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'}`;
            case 'success':
            default:
                return `${baseStyle} bg-green-500 hover:bg-green-600`;
        }
    };

    return (
        <div
            className={getNotificationStyle()}
            style={{
                maxWidth: '300px',
                minHeight: '60px',
                // Éviter les redimensionnements excessifs
                contain: 'layout style paint'
            }}
        >
            <span className="block pr-8">{message}</span>
            <button
                onClick={onClose}
                className="absolute top-2 right-2 font-bold hover:opacity-75 w-6 h-6 flex items-center justify-center transition-opacity"
                aria-label="Fermer la notification"
            >
                ×
            </button>
        </div>
    );
};

Notification.propTypes = {
    message: PropTypes.string,
    type: PropTypes.oneOf(['success', 'error', 'info']),
    onClose: PropTypes.func.isRequired,
    isDarkMode: PropTypes.bool,
};

export default Notification;
