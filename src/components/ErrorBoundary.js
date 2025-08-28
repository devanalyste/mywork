import React from 'react';

/**
 * ErrorBoundary pour capturer et filtrer les erreurs React
 * Spécialement conçu pour filtrer les erreurs ResizeObserver bénines
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        // Filtrer les erreurs ResizeObserver
        if (error && error.message &&
            (error.message.includes('ResizeObserver loop completed') ||
                error.message.includes('ResizeObserver loop limit') ||
                error.message.includes('ResizeObserver'))) {
            // Ne pas considérer cela comme une erreur
            return { hasError: false, error: null };
        }

        // Pour les autres erreurs, afficher l'état d'erreur
        return { hasError: true, error: error };
    }

    componentDidCatch(error, errorInfo) {
        // Filtrer les erreurs ResizeObserver
        if (error && error.message &&
            (error.message.includes('ResizeObserver loop completed') ||
                error.message.includes('ResizeObserver loop limit') ||
                error.message.includes('ResizeObserver'))) {
            // Ne rien faire pour ces erreurs bénines
            return;
        }

        // Pour les vraies erreurs, les logger
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // Interface de fallback pour les vraies erreurs
            return (
                <div className="min-h-screen flex items-center justify-center bg-red-50">
                    <div className="text-center p-8">
                        <h1 className="text-2xl font-bold text-red-600 mb-4">
                            Oops! Une erreur s'est produite
                        </h1>
                        <p className="text-gray-600 mb-4">
                            L'application a rencontré une erreur inattendue.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        >
                            Recharger l'application
                        </button>
                        {this.state.error && (
                            <details className="mt-4 text-left">
                                <summary className="cursor-pointer text-sm text-gray-500">
                                    Détails de l'erreur
                                </summary>
                                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                                    {this.state.error.toString()}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
