import React from 'react';
import PropTypes from 'prop-types';

const Notification = ({ message, onClose }) => {
    if (!message) return null;

    return (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded shadow-lg">
            <span>{message}</span>
            <button onClick={onClose} className="ml-4 font-bold">X</button>
        </div>
    );
};
Notification.propTypes = {
    message: PropTypes.string,
    onClose: PropTypes.func.isRequired,
};

export default Notification;
