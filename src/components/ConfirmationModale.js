import React from 'react';
import PropTypes from 'prop-types';

const ConfirmationModale = ({ isOpen, message, onConfirm, onCancel }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3 className="flex items-center justify-center mb-4 text-xl font-bold text-red-600">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 mr-2">
                        <path fillRule="evenodd" d="M8.485 3.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 3.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                    ATTENTION !
                </h3>
                <p className="mb-6 text-gray-700">{message}</p>
                <div className="flex justify-center space-x-4">
                    <button onClick={onConfirm} className="px-5 py-2 font-bold text-white transition-all duration-300 bg-red-600 rounded-lg shadow-md hover:bg-red-700">
                        Oui, supprimer
                    </button>
                    <button onClick={onCancel} className="px-5 py-2 font-bold text-white transition-all duration-300 bg-gray-400 rounded-lg shadow-md hover:bg-gray-500">
                        Annuler
                    </button>
                </div>
            </div>
        </div>
    );
};

ConfirmationModale.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    message: PropTypes.string.isRequired,
    onConfirm: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
};

export default ConfirmationModale;