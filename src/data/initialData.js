export const initialAppData = {
    Maison: {}, // L'onglet Maison n'aura pas de tâches directement, mais une vue agrégée
    Adjointes: [
        {
            id: '1',
            name: 'Annulation non-paiement',
            category: 'Annulations', // Nouvelle catégorie
            fields: [
                { key: 'modelNumber', label: 'Numéro de Modèle/Lettre', type: 'text', value: '405', adminOnlyEdit: true },
                { key: 'fullTemplateName', label: 'Modèle de lettre', type: 'text', value: 'Lettre de non-paiement type 405', adminOnlyEdit: true, copyable: true }, // Nouveau champ
                { key: 'attachmentName', label: 'Nom de Pièce Jointe', type: 'text', value: '2025-06-26 CSC - FDM non-paiement 405', adminOnlyEdit: false, copyable: true },
                { key: 'noteTemplate', label: 'Note EPIC', type: 'textarea', value: 'CSC - FDM non-paiement 405 + doc', adminOnlyEdit: false, copyable: true, specialButton: 'addDate' },
                { key: 'procedure', label: 'Procédure à Suivre', type: 'textarea', value: '1. Vérifier le dossier client.\\n2. Envoyer le courriel de non-paiement.\\n3. Archiver la communication.\\n4. Mettre à jour le statut dans le système.', adminOnlyEdit: true, hasCheckboxes: true },
            ],
        },
        {
            id: '2',
            name: 'Avis d\\\'annulation + FDM',
            category: 'Annulations', // Nouvelle catégorie
            fields: [
                { key: 'modelNumber', label: 'Numéro de Modèle/Lettre', type: 'text', value: '405+FDM', adminOnlyEdit: true },
                { key: 'fullTemplateName', label: 'Modèle de lettre', type: 'text', value: 'Avis d\\\'annulation et Fin de Mandat', adminOnlyEdit: true, copyable: true }, // Nouveau champ
                { key: 'attachmentName', label: 'Nom de Pièce Jointe', type: 'text', value: '2025-06-26 CSC - Annulation non-paiement + FDM', adminOnlyEdit: false, copyable: true },
                { key: 'noteTemplate', label: 'Note EPIC', type: 'textarea', value: 'CSC - Annulation non-paiement + FDM + Doc', adminOnlyEdit: false, copyable: true, specialButton: 'addDate' },
                { key: 'procedure', label: 'Procédure à Suivre', type: 'textarea', value: 'Procédure spécifique pour l\\\'avis d\\\'annulation avec fin de mandat.', adminOnlyEdit: true, hasCheckboxes: true },
            ],
        },
        {
            id: '3',
            name: 'Dernier rappel de paiement',
            category: 'Rappels', // Nouvelle catégorie
            fields: [
                { key: 'modelNumber', label: 'Numéro de Modèle/Lettre', type: 'text', value: '001', adminOnlyEdit: true },
                { key: 'fullTemplateName', label: 'Modèle de lettre', type: 'text', value: 'Lettre de dernier rappel 001', adminOnlyEdit: true, copyable: true }, // Nouveau champ
                { key: 'attachmentName', label: 'Nom de Pièce Jointe', type: 'text', value: '2025-06-26 CSC Assurance - Dernier rappel de paiement', adminOnlyEdit: false, copyable: true },
                { key: 'noteTemplate', label: 'Note EPIC', type: 'textarea', value: 'CSC - Dernier rappel de paiement 001 + doc', adminOnlyEdit: false, copyable: true, specialButton: 'addDate' },
                { key: 'procedure', label: 'Procédure à Suivre', type: 'textarea', value: 'Procédure pour le dernier rappel de paiement.', adminOnlyEdit: true, hasCheckboxes: true },
            ],
        },
        {
            id: '4',
            name: 'Rappel de paiement',
            category: 'Rappels', // Nouvelle catégorie
            fields: [
                { key: 'modelNumber', label: 'Numéro de Modèle/Lettre', type: 'text', value: '002', adminOnlyEdit: true },
                { key: 'fullTemplateName', label: 'Modèle de lettre', type: 'text', value: 'Lettre de rappel 002', adminOnlyEdit: true, copyable: true }, // Nouveau champ
                { key: 'attachmentName', label: 'Nom de Pièce Jointe', type: 'text', value: '2025-06-26 CSC - Rappel de paiement 002', adminOnlyEdit: false, copyable: true },
                { key: 'noteTemplate', label: 'Note EPIC', type: 'textarea', value: 'CSC - Rappel de paiement 002 + doc', adminOnlyEdit: false, copyable: true, specialButton: 'addDate' },
                { key: 'procedure', label: 'Procédure à Suivre', type: 'textarea', value: 'Procédure pour le rappel de paiement.', adminOnlyEdit: true, hasCheckboxes: true },
            ],
        },
        {
            id: '5',
            name: 'Avis d\\\'provision insuffisante',
            category: 'Provisions', // Nouvelle catégorie
            fields: [
                { key: 'modelNumber', label: 'Numéro de Modèle/Lettre', type: 'text', value: '003', adminOnlyEdit: true },
                { key: 'fullTemplateName', label: 'Modèle de lettre', type: 'text', value: 'Avis d\\\'provision insuffisante 003', adminOnlyEdit: true, copyable: true }, // Nouveau champ
                { key: 'attachmentName', label: 'Nom de Pièce Jointe', type: 'text', value: '2025-06-09 CSC Assurance - Avis d\\\'provision insuffisante', adminOnlyEdit: false, copyable: true },
                { key: 'noteTemplate', label: 'Note EPIC', type: 'textarea', value: 'CSC - Avis de provision insuffisante 003 + doc', adminOnlyEdit: false, copyable: true, specialButton: 'addDate' },
            ],
        },
    ],
};
