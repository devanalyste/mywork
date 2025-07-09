import React from 'react';
import PropTypes from 'prop-types';

const MenuHaut = ({ tabs, activeTab, onTabClick, onLogout, onAdminPanel, isAdminMode, onExitAdmin }) => {
    return (
        <div className="navbar">
            <div style={{ display: 'flex' }}>
                {tabs.map(tab => (
                    <button
                        key={tab}
                        onClick={() => onTabClick(tab)}
                        className={activeTab === tab ? 'active' : ''}
                        style={{ marginRight: '0.5rem' }}
                    >
                        {tab}
                    </button>
                ))}
            </div>
            <div>
                {isAdminMode ? (
                    <button onClick={onExitAdmin} style={{ backgroundColor: '#059669' }}>
                        Quitter Mode Admin
                    </button>
                ) : (
                    <button onClick={onAdminPanel}>Admin</button>
                )}
                <button onClick={onLogout} style={{ backgroundColor: '#dc2626' }}>Déconnexion</button>
            </div>
        </div>
    );
};
MenuHaut.propTypes = {
    tabs: PropTypes.arrayOf(PropTypes.string).isRequired,
    activeTab: PropTypes.string.isRequired,
    onTabClick: PropTypes.func.isRequired,
    onLogout: PropTypes.func.isRequired,
    onAdminPanel: PropTypes.func.isRequired,
    isAdminMode: PropTypes.bool,
    onExitAdmin: PropTypes.func,
};

export default MenuHaut;
