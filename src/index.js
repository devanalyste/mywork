import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/fallback.css'; // CSS de test sans Tailwind
import './styles/index.css'; // Garder le CSS Tailwind aussi
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

