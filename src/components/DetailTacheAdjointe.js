import React, { useState, useEffect, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';

// Constantes pour les classes CSS réutilisables
const CSS_CLASSES = {
    button: {
        primary: "bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-5 rounded-lg shadow-md flex items-center justify-center transition-all duration-300",
        secondary: "bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-5 rounded-lg shadow-md transition-all duration-300",
        admin: "bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-5 rounded-lg shadow-md transition-all duration-300",
        save: "bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-5 rounded-lg shadow-md transition-all duration-300",
        delete: "bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-5 rounded-lg shadow-md transition-all duration-300"
    },
    input: {
        base: "w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300",
        readonly: "bg-gray-100",
        editable: "bg-white"
    }
};

// Messages d'aide
const MESSAGES = {
    copy: {
        success: 'Copié dans le presse-papiers !',
        error: 'Échec de la copie. Veuillez copier manuellement.',
        fallbackError: 'Erreur de copie (fallback):'
    },
    save: {
        success: 'Modifications sauvegardées !',
        adminRequired: 'Vous devez être en Mode Admin pour sauvegarder les modifications structurelles.'
    },
    quickAdd: {
        date: 'Date ajoutée à la note !',
        facture: 'Facture ajoutée à la note !',
        releve: 'Relevé ajouté à la note !'
    }
};

const CopyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
        <path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
        <path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h8a2 2 0 00-2-2H5z" />
    </svg>
);

const ClipboardIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
        <path d="M8 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V6h1a1 1 0 100-2H7V3a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
);

// Composant pour les champs de saisie réutilisables
const InputField = ({ field, isAdminMode, onChange, onCopy }) => {
    if (!field) return null;

    const getInputClassName = () => {
        const baseClass = CSS_CLASSES.input.base;
        const stateClass = field.adminOnlyEdit && !isAdminMode ? CSS_CLASSES.input.readonly : CSS_CLASSES.input.editable;

        if (field.copyable) {
            return `flex-grow p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 ${stateClass}`;
        }

        return `${baseClass} ${stateClass}`;
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <label className="block mb-2 text-sm font-bold text-gray-700">{field.label}:</label>
            <div className="flex items-center space-x-2">
                <input
                    type="text"
                    name={field.key}
                    value={field.value}
                    onChange={(e) => onChange(field.key, e.target.value)}
                    readOnly={field.adminOnlyEdit && !isAdminMode}
                    className={getInputClassName()}
                />
                {field.copyable && (
                    <button
                        onClick={() => onCopy(field.value)}
                        className={CSS_CLASSES.button.primary}
                        title={`Copier ${field.label.toLowerCase()}`}
                    >
                        <CopyIcon />
                        Copier{field.key === 'attachmentName' ? ' PJ' : ''}
                    </button>
                )}
            </div>
        </div>
    );
};

InputField.propTypes = {
    field: PropTypes.object,
    isAdminMode: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
    onCopy: PropTypes.func.isRequired,
};

// Composant pour les zones de texte avec actions rapides
const TextAreaField = ({ field, isAdminMode, onChange, onCopy, onInsertText, showNotification }) => {
    if (!field) return null;

    const textareaClassName = `w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 resize-y ${field.adminOnlyEdit && !isAdminMode ? CSS_CLASSES.input.readonly : CSS_CLASSES.input.editable}`;

    const handleQuickAction = (text, message, prepend = false) => {
        onInsertText(text, prepend);
        showNotification(message, 'info');
    };

    return (
        <div className="w-full mb-4">
            <label className="block mb-2 text-sm font-bold text-gray-700">{field.label}:</label>
            <textarea
                name={field.key}
                value={field.value}
                onChange={(e) => onChange(field.key, e.target.value)}
                readOnly={field.adminOnlyEdit && !isAdminMode}
                rows="4"
                className={textareaClassName}
            />
            {field.copyable && (
                <div className="flex flex-wrap items-center justify-between gap-2 mt-3">
                    <button
                        onClick={() => onCopy(field.value)}
                        className="flex items-center justify-center px-5 py-2 font-bold text-white transition-all duration-300 bg-blue-600 rounded-lg shadow-md hover:bg-blue-700"
                        title="Copier la note complète"
                    >
                        <ClipboardIcon />
                        Copier Note
                    </button>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => {
                                const today = new Date().toLocaleDateString('fr-CA', { year: 'numeric', month: '2-digit', day: '2-digit' });
                                handleQuickAction(`${today}\n`, MESSAGES.quickAdd.date, true);
                            }}
                            className={CSS_CLASSES.button.secondary}
                            title="Ajouter la date actuelle à la note"
                        >
                            + Date
                        </button>
                        <button
                            onClick={() => handleQuickAction(' + Facture', MESSAGES.quickAdd.facture)}
                            className={CSS_CLASSES.button.secondary}
                            title="Ajouter ' + Facture' à la note"
                        >
                            + Facture
                        </button>
                        <button
                            onClick={() => handleQuickAction(' + Relevé', MESSAGES.quickAdd.releve)}
                            className={CSS_CLASSES.button.secondary}
                            title="Ajouter ' + Relevé' à la note"
                        >
                            + Relevé
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

TextAreaField.propTypes = {
    field: PropTypes.object,
    isAdminMode: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
    onCopy: PropTypes.func.isRequired,
    onInsertText: PropTypes.func.isRequired,
    showNotification: PropTypes.func.isRequired,
};

const DetailTacheAdjointe = ({ task = null, onUpdateTask, onAdminModeToggle, isAdminMode, onDeleteTask, showNotification }) => {
    const [editedTask, setEditedTask] = useState(task || { id: null, name: '', fields: [] });
    const [procedureCheckStates, setProcedureCheckStates] = useState({});

    useEffect(() => {
        setEditedTask(task || { id: null, name: '', fields: [] });
        setProcedureCheckStates({});
    }, [task]);

    const handleFieldChange = (key, value) => {
        setEditedTask((prev) => ({
            ...prev,
            fields: prev.fields.map((field) =>
                field.key === key ? { ...field, value: value } : field
            ),
        }));
    };

    // Fonction optimisée pour la copie avec gestion d'erreur améliorée
    const handleCopy = useCallback(async (text) => {
        if (navigator.clipboard && window.isSecureContext) {
            try {
                await navigator.clipboard.writeText(text);
                showNotification(MESSAGES.copy.success, 'success');
            } catch (err) {
                console.error('Erreur de copie:', err);
                showNotification(MESSAGES.copy.error, 'error');
            }
        } else {
            // Fallback pour les navigateurs plus anciens ou les contextes non-sécurisés
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            document.body.appendChild(textarea);
            textarea.focus();
            textarea.select();
            try {
                // Note: document.execCommand est obsolète mais nécessaire comme fallback
                document.execCommand('copy');
                showNotification(MESSAGES.copy.success, 'success');
            } catch (err) {
                console.error(MESSAGES.copy.fallbackError, err);
                showNotification(MESSAGES.copy.error, 'error');
            } finally {
                document.body.removeChild(textarea);
            }
        }
    }, [showNotification]);

    const handleSave = useCallback(() => {
        if (isAdminMode) {
            onUpdateTask(editedTask);
            showNotification(MESSAGES.save.success, 'success');
        } else {
            showNotification(MESSAGES.save.adminRequired, 'error');
        }
    }, [isAdminMode, onUpdateTask, editedTask, showNotification]);

    const insertTextIntoNote = useCallback((textToInsert, prepend = false) => {
        const noteField = editedTask.fields.find(f => f.key === 'noteTemplate');
        if (noteField) {
            const currentValue = noteField.value;
            const newValue = prepend ? `${textToInsert}${currentValue}` : `${currentValue}${textToInsert}`;
            handleFieldChange('noteTemplate', newValue);
        }
    }, [editedTask.fields]);

    const handleProcedureCheckChange = useCallback((index) => {
        setProcedureCheckStates(prevStates => ({
            ...prevStates,
            [index]: !prevStates[index]
        }));
    }, []);


    // Extraction des champs avec useMemo pour optimiser les performances
    const taskFields = useMemo(() => {
        if (!editedTask?.fields) return {};

        return {
            modelNumber: editedTask.fields.find(field => field.key === 'modelNumber'),
            fullTemplateName: editedTask.fields.find(field => field.key === 'fullTemplateName'),
            attachmentName: editedTask.fields.find(field => field.key === 'attachmentName'),
            noteTemplate: editedTask.fields.find(field => field.key === 'noteTemplate'),
            procedure: editedTask.fields.find(field => field.key === 'procedure')
        };
    }, [editedTask]);

    // Vérification de l'existence de la tâche
    if (!task) {
        return (
            <div className="flex items-center justify-center flex-1 p-8 rounded-r-lg bg-gray-50">
                <p className="text-xl text-gray-500">Sélectionnez une tâche pour voir les détails.</p>
            </div>
        );
    }

    return (
        <div className="flex-1 p-8 bg-gray-50 rounded-r-lg shadow-inner overflow-y-auto max-h-[calc(100vh-120px)] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-50">
            <div className="flex items-center justify-between pb-4 mb-6 border-b-2 border-gray-200">
                <h2 className="text-3xl font-extrabold text-blue-700">{task.name}</h2>
                <button
                    onClick={() => onAdminModeToggle(!isAdminMode)}
                    className={CSS_CLASSES.button.admin}
                    title={isAdminMode ? 'Quitter Mode Admin' : 'Activer Mode Admin (Édition)'}
                >
                    {isAdminMode ? 'Quitter Admin' : 'Mode Admin'}
                </button>
            </div>

            <div className="grid grid-cols-1 gap-8 mb-8 md:grid-cols-2">
                <InputField
                    field={taskFields.modelNumber}
                    isAdminMode={isAdminMode}
                    onChange={handleFieldChange}
                    onCopy={handleCopy}
                />
                <InputField
                    field={taskFields.fullTemplateName}
                    isAdminMode={isAdminMode}
                    onChange={handleFieldChange}
                    onCopy={handleCopy}
                />
            </div>

            <div className="p-6 mb-8 bg-white rounded-lg shadow-md">
                {taskFields.attachmentName && (
                    <div className="w-full mb-4">
                        <label className="block mb-2 text-sm font-bold text-gray-700">{taskFields.attachmentName.label}:</label>
                        <div className="flex items-center space-x-2">
                            <input
                                type="text"
                                name={taskFields.attachmentName.key}
                                value={taskFields.attachmentName.value}
                                onChange={(e) => handleFieldChange(taskFields.attachmentName.key, e.target.value)}
                                readOnly={taskFields.attachmentName.adminOnlyEdit && !isAdminMode}
                                className={`flex-grow p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 ${taskFields.attachmentName.adminOnlyEdit && !isAdminMode ? CSS_CLASSES.input.readonly : CSS_CLASSES.input.editable}`}
                            />
                            {taskFields.attachmentName.copyable && (
                                <button
                                    onClick={() => handleCopy(taskFields.attachmentName.value)}
                                    className={CSS_CLASSES.button.primary}
                                    title="Copier le nom de la pièce jointe"
                                >
                                    <CopyIcon />
                                    Copier PJ
                                </button>
                            )}
                        </div>
                    </div>
                )}
                <TextAreaField
                    field={taskFields.noteTemplate}
                    isAdminMode={isAdminMode}
                    onChange={handleFieldChange}
                    onCopy={handleCopy}
                    onInsertText={insertTextIntoNote}
                    showNotification={showNotification}
                />
            </div>

            {taskFields.procedure && (() => {
                let procedureContent;
                if (isAdminMode) {
                    procedureContent = (
                        <textarea
                            name={taskFields.procedure.key}
                            value={taskFields.procedure.value}
                            onChange={(e) => handleFieldChange(taskFields.procedure.key, e.target.value)}
                            rows="8"
                            className="w-full p-3 bg-white border rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-blue-300"
                            placeholder="Décrivez ici la procédure complète pour cette tâche (chaque ligne sera une case à cocher si l'option est activée)..."
                        ></textarea>
                    );
                } else if (taskFields.procedure.hasCheckboxes) {
                    procedureContent = (
                        <ul className="p-0 m-0 space-y-2 list-none">
                            {String(taskFields.procedure.value).split('\n').filter(line => line.trim() !== '').map((line, index) => {
                                const lineKey = `${taskFields.procedure.key}-${index}-${line.trim()}`;
                                return (
                                    <li key={lineKey} className="flex items-center text-gray-800">
                                        <input
                                            type="checkbox"
                                            checked={procedureCheckStates[index] || false}
                                            onChange={() => handleProcedureCheckChange(index)}
                                            className="w-5 h-5 mr-2 text-blue-600 rounded focus:ring-blue-500"
                                        />
                                        <span className={procedureCheckStates[index] ? 'line-through text-gray-500' : ''}>
                                            {line.trim()}
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>
                    );
                } else {
                    procedureContent = (
                        <div className="p-3 prose text-gray-800 whitespace-pre-wrap border border-gray-200 rounded-lg max-w-none bg-gray-50">
                            {taskFields.procedure.value}
                        </div>
                    );
                }
                return (
                    <div className="p-6 mb-8 bg-white rounded-lg shadow-md">
                        <label className="block mb-2 text-sm font-bold text-gray-700">{taskFields.procedure.label}:</label>
                        {procedureContent}
                    </div>
                );
            })()}

            {isAdminMode && (
                <div className="flex mt-4 space-x-3">
                    <button
                        onClick={handleSave}
                        className={CSS_CLASSES.button.save}
                    >
                        Sauvegarder les modifications
                    </button>
                    <button
                        onClick={() => onDeleteTask(task.id)}
                        className={CSS_CLASSES.button.delete}
                    >
                        Supprimer la tâche
                    </button>
                </div>
            )}
        </div>
    );
};

DetailTacheAdjointe.propTypes = {
    task: PropTypes.object,
    onUpdateTask: PropTypes.func.isRequired,
    onAdminModeToggle: PropTypes.func.isRequired,
    isAdminMode: PropTypes.bool.isRequired,
    onDeleteTask: PropTypes.func.isRequired,
    showNotification: PropTypes.func.isRequired,
};

export default DetailTacheAdjointe;
