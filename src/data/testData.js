// Données de test avec beaucoup plus de tâches pour visualiser le layout 4 colonnes
export const testAppData = {
    Maison: {}, // L'onglet Maison n'aura pas de tâches directement
    Adjointes: [
        // === CATÉGORIE ANNULATIONS (8 tâches) ===
        {
            id: '1',
            name: 'Annulation non-paiement',
            category: 'Annulations',
            fields: [
                { key: 'modelNumber', label: 'Numéro de Modèle/Lettre', type: 'text', value: '405', adminOnlyEdit: true },
                { key: 'fullTemplateName', label: 'Modèle de lettre', type: 'text', value: 'Lettre de non-paiement type 405', adminOnlyEdit: true, copyable: true },
                { key: 'attachmentName', label: 'Nom de Pièce Jointe', type: 'text', value: '2025-06-26 CSC - FDM non-paiement 405', adminOnlyEdit: false, copyable: true },
                { key: 'noteTemplate', label: 'Note EPIC', type: 'textarea', value: 'CSC - FDM non-paiement 405 + doc', adminOnlyEdit: false, copyable: true, specialButton: 'addDate' },
                { key: 'procedure', label: 'Procédure à Suivre', type: 'textarea', value: '1. Vérifier le dossier client.\\n2. Envoyer le courriel de non-paiement.\\n3. Archiver la communication.', adminOnlyEdit: true, hasCheckboxes: true },
            ],
        },
        {
            id: '2',
            name: 'Avis d\'annulation + FDM',
            category: 'Annulations',
            fields: [
                { key: 'modelNumber', label: 'Numéro de Modèle/Lettre', type: 'text', value: '406', adminOnlyEdit: true },
                { key: 'fullTemplateName', label: 'Modèle de lettre', type: 'text', value: 'Avis d\'annulation et Fin de Mandat', adminOnlyEdit: true, copyable: true },
                { key: 'attachmentName', label: 'Nom de Pièce Jointe', type: 'text', value: '2025-06-26 CSC - Annulation + FDM', adminOnlyEdit: false, copyable: true },
            ],
        },
        {
            id: '3',
            name: 'Annulation immédiate',
            category: 'Annulations',
            fields: [
                { key: 'modelNumber', label: 'Numéro de Modèle/Lettre', type: 'text', value: '407', adminOnlyEdit: true },
                { key: 'attachmentName', label: 'Nom de Pièce Jointe', type: 'text', value: 'Annulation urgente 407', adminOnlyEdit: false, copyable: true },
            ],
        },
        {
            id: '4',
            name: 'Annulation pour fraude',
            category: 'Annulations',
            fields: [
                { key: 'modelNumber', label: 'Numéro de Modèle/Lettre', type: 'text', value: '408', adminOnlyEdit: true },
                { key: 'attachmentName', label: 'Nom de Pièce Jointe', type: 'text', value: 'Dossier fraude 408', adminOnlyEdit: false, copyable: true },
            ],
        },
        {
            id: '5',
            name: 'Annulation sur demande',
            category: 'Annulations',
            fields: [
                { key: 'modelNumber', label: 'Numéro de Modèle/Lettre', type: 'text', value: '409', adminOnlyEdit: true },
                { key: 'attachmentName', label: 'Nom de Pièce Jointe', type: 'text', value: 'Demande client 409', adminOnlyEdit: false, copyable: true },
            ],
        },
        {
            id: '6',
            name: 'Annulation temporaire',
            category: 'Annulations',
            fields: [
                { key: 'modelNumber', label: 'Numéro de Modèle/Lettre', type: 'text', value: '410', adminOnlyEdit: true },
                { key: 'attachmentName', label: 'Nom de Pièce Jointe', type: 'text', value: 'Suspension temporaire 410', adminOnlyEdit: false, copyable: true },
            ],
        },
        {
            id: '7',
            name: 'Résiliation anticipée',
            category: 'Annulations',
            fields: [
                { key: 'modelNumber', label: 'Numéro de Modèle/Lettre', type: 'text', value: '411', adminOnlyEdit: true },
                { key: 'attachmentName', label: 'Nom de Pièce Jointe', type: 'text', value: 'Résiliation 411', adminOnlyEdit: false, copyable: true },
            ],
        },
        {
            id: '8',
            name: 'Annulation mutuelle',
            category: 'Annulations',
            fields: [
                { key: 'modelNumber', label: 'Numéro de Modèle/Lettre', type: 'text', value: '412', adminOnlyEdit: true },
                { key: 'attachmentName', label: 'Nom de Pièce Jointe', type: 'text', value: 'Accord mutuel 412', adminOnlyEdit: false, copyable: true },
            ],
        },

        // === CATÉGORIE RAPPELS (10 tâches) ===
        {
            id: '10',
            name: 'Premier rappel',
            category: 'Rappels',
            fields: [
                { key: 'modelNumber', label: 'Numéro de Modèle/Lettre', type: 'text', value: '001', adminOnlyEdit: true },
                { key: 'attachmentName', label: 'Nom de Pièce Jointe', type: 'text', value: 'Premier rappel 001', adminOnlyEdit: false, copyable: true },
            ],
        },
        {
            id: '11',
            name: 'Deuxième rappel',
            category: 'Rappels',
            fields: [
                { key: 'modelNumber', label: 'Numéro de Modèle/Lettre', type: 'text', value: '002', adminOnlyEdit: true },
                { key: 'attachmentName', label: 'Nom de Pièce Jointe', type: 'text', value: 'Deuxième rappel 002', adminOnlyEdit: false, copyable: true },
            ],
        },
        {
            id: '12',
            name: 'Dernier rappel',
            category: 'Rappels',
            fields: [
                { key: 'modelNumber', label: 'Numéro de Modèle/Lettre', type: 'text', value: '003', adminOnlyEdit: true },
                { key: 'attachmentName', label: 'Nom de Pièce Jointe', type: 'text', value: 'Dernier rappel 003', adminOnlyEdit: false, copyable: true },
            ],
        },
        {
            id: '13',
            name: 'Rappel urgent',
            category: 'Rappels',
            fields: [
                { key: 'modelNumber', label: 'Numéro de Modèle/Lettre', type: 'text', value: '004', adminOnlyEdit: true },
                { key: 'attachmentName', label: 'Nom de Pièce Jointe', type: 'text', value: 'Urgence 004', adminOnlyEdit: false, copyable: true },
            ],
        },
        {
            id: '14',
            name: 'Mise en demeure',
            category: 'Rappels',
            fields: [
                { key: 'modelNumber', label: 'Numéro de Modèle/Lettre', type: 'text', value: '005', adminOnlyEdit: true },
                { key: 'attachmentName', label: 'Nom de Pièce Jointe', type: 'text', value: 'Mise en demeure 005', adminOnlyEdit: false, copyable: true },
            ],
        },
        {
            id: '15',
            name: 'Rappel amiable',
            category: 'Rappels',
            fields: [
                { key: 'modelNumber', label: 'Numéro de Modèle/Lettre', type: 'text', value: '006', adminOnlyEdit: true },
                { key: 'attachmentName', label: 'Nom de Pièce Jointe', type: 'text', value: 'Amiable 006', adminOnlyEdit: false, copyable: true },
            ],
        },
        {
            id: '16',
            name: 'Rappel SMS',
            category: 'Rappels',
            fields: [
                { key: 'modelNumber', label: 'Numéro de Modèle/Lettre', type: 'text', value: '007', adminOnlyEdit: true },
                { key: 'attachmentName', label: 'Nom de Pièce Jointe', type: 'text', value: 'SMS automatique 007', adminOnlyEdit: false, copyable: true },
            ],
        },
        {
            id: '17',
            name: 'Rappel téléphonique',
            category: 'Rappels',
            fields: [
                { key: 'modelNumber', label: 'Numéro de Modèle/Lettre', type: 'text', value: '008', adminOnlyEdit: true },
                { key: 'attachmentName', label: 'Nom de Pièce Jointe', type: 'text', value: 'Appel client 008', adminOnlyEdit: false, copyable: true },
            ],
        },
        {
            id: '18',
            name: 'Rappel par email',
            category: 'Rappels',
            fields: [
                { key: 'modelNumber', label: 'Numéro de Modèle/Lettre', type: 'text', value: '009', adminOnlyEdit: true },
                { key: 'attachmentName', label: 'Nom de Pièce Jointe', type: 'text', value: 'Email 009', adminOnlyEdit: false, copyable: true },
            ],
        },
        {
            id: '19',
            name: 'Rappel recommandé',
            category: 'Rappels',
            fields: [
                { key: 'modelNumber', label: 'Numéro de Modèle/Lettre', type: 'text', value: '010', adminOnlyEdit: true },
                { key: 'attachmentName', label: 'Nom de Pièce Jointe', type: 'text', value: 'Courrier recommandé 010', adminOnlyEdit: false, copyable: true },
            ],
        },

        // === CATÉGORIE TÂCHES ADMINISTRATIVES (12 tâches) ===
        {
            id: '20',
            name: 'Validation des documents',
            category: 'Tâches',
            fields: [
                { key: 'modelNumber', label: 'Numéro de Modèle/Lettre', type: 'text', value: 'T001', adminOnlyEdit: true },
                { key: 'attachmentName', label: 'Nom de Pièce Jointe', type: 'text', value: 'Validation docs T001', adminOnlyEdit: false, copyable: true },
            ],
        },
        {
            id: '21',
            name: 'Vérification identité',
            category: 'Tâches',
            fields: [
                { key: 'modelNumber', label: 'Numéro de Modèle/Lettre', type: 'text', value: 'T002', adminOnlyEdit: true },
                { key: 'attachmentName', label: 'Nom de Pièce Jointe', type: 'text', value: 'ID Check T002', adminOnlyEdit: false, copyable: true },
            ],
        },
        {
            id: '22',
            name: 'Mise à jour dossier',
            category: 'Tâches',
            fields: [
                { key: 'modelNumber', label: 'Numéro de Modèle/Lettre', type: 'text', value: 'T003', adminOnlyEdit: true },
                { key: 'attachmentName', label: 'Nom de Pièce Jointe', type: 'text', value: 'Update T003', adminOnlyEdit: false, copyable: true },
            ],
        },
        {
            id: '23',
            name: 'Archivage',
            category: 'Tâches',
            fields: [
                { key: 'modelNumber', label: 'Numéro de Modèle/Lettre', type: 'text', value: 'T004', adminOnlyEdit: true },
                { key: 'attachmentName', label: 'Nom de Pièce Jointe', type: 'text', value: 'Archive T004', adminOnlyEdit: false, copyable: true },
            ],
        },
        {
            id: '24',
            name: 'Suivi qualité',
            category: 'Tâches',
            fields: [
                { key: 'modelNumber', label: 'Numéro de Modèle/Lettre', type: 'text', value: 'T005', adminOnlyEdit: true },
                { key: 'attachmentName', label: 'Nom de Pièce Jointe', type: 'text', value: 'Qualité T005', adminOnlyEdit: false, copyable: true },
            ],
        },
        {
            id: '25',
            name: 'Rapport mensuel',
            category: 'Tâches',
            fields: [
                { key: 'modelNumber', label: 'Numéro de Modèle/Lettre', type: 'text', value: 'T006', adminOnlyEdit: true },
                { key: 'attachmentName', label: 'Nom de Pièce Jointe', type: 'text', value: 'Rapport T006', adminOnlyEdit: false, copyable: true },
            ],
        },
        {
            id: '26',
            name: 'Audit interne',
            category: 'Tâches',
            fields: [
                { key: 'modelNumber', label: 'Numéro de Modèle/Lettre', type: 'text', value: 'T007', adminOnlyEdit: true },
                { key: 'attachmentName', label: 'Nom de Pièce Jointe', type: 'text', value: 'Audit T007', adminOnlyEdit: false, copyable: true },
            ],
        },
        {
            id: '27',
            name: 'Formation équipe',
            category: 'Tâches',
            fields: [
                { key: 'modelNumber', label: 'Numéro de Modèle/Lettre', type: 'text', value: 'T008', adminOnlyEdit: true },
                { key: 'attachmentName', label: 'Nom de Pièce Jointe', type: 'text', value: 'Formation T008', adminOnlyEdit: false, copyable: true },
            ],
        },
        {
            id: '28',
            name: 'Contrôle conformité',
            category: 'Tâches',
            fields: [
                { key: 'modelNumber', label: 'Numéro de Modèle/Lettre', type: 'text', value: 'T009', adminOnlyEdit: true },
                { key: 'attachmentName', label: 'Nom de Pièce Jointe', type: 'text', value: 'Conformité T009', adminOnlyEdit: false, copyable: true },
            ],
        },
        {
            id: '29',
            name: 'Backup données',
            category: 'Tâches',
            fields: [
                { key: 'modelNumber', label: 'Numéro de Modèle/Lettre', type: 'text', value: 'T010', adminOnlyEdit: true },
                { key: 'attachmentName', label: 'Nom de Pièce Jointe', type: 'text', value: 'Sauvegarde T010', adminOnlyEdit: false, copyable: true },
            ],
        },
        {
            id: '30',
            name: 'Maintenance système',
            category: 'Tâches',
            fields: [
                { key: 'modelNumber', label: 'Numéro de Modèle/Lettre', type: 'text', value: 'T011', adminOnlyEdit: true },
                { key: 'attachmentName', label: 'Nom de Pièce Jointe', type: 'text', value: 'Maintenance T011', adminOnlyEdit: false, copyable: true },
            ],
        },
        {
            id: '31',
            name: 'Support client',
            category: 'Tâches',
            fields: [
                { key: 'modelNumber', label: 'Numéro de Modèle/Lettre', type: 'text', value: 'T012', adminOnlyEdit: true },
                { key: 'attachmentName', label: 'Nom de Pièce Jointe', type: 'text', value: 'Support T012', adminOnlyEdit: false, copyable: true },
            ],
        },

        // === CATÉGORIE URGENCES (6 tâches) ===
        {
            id: '40',
            name: 'Urgence médicale',
            category: 'Urgences',
            fields: [
                { key: 'modelNumber', label: 'Numéro de Modèle/Lettre', type: 'text', value: 'URG001', adminOnlyEdit: true },
                { key: 'attachmentName', label: 'Nom de Pièce Jointe', type: 'text', value: 'Urgence médicale', adminOnlyEdit: false, copyable: true },
            ],
        },
        {
            id: '41',
            name: 'Panne système',
            category: 'Urgences',
            fields: [
                { key: 'modelNumber', label: 'Numéro de Modèle/Lettre', type: 'text', value: 'URG002', adminOnlyEdit: true },
                { key: 'attachmentName', label: 'Nom de Pièce Jointe', type: 'text', value: 'Panne critique', adminOnlyEdit: false, copyable: true },
            ],
        },
        {
            id: '42',
            name: 'Sécurité breach',
            category: 'Urgences',
            fields: [
                { key: 'modelNumber', label: 'Numéro de Modèle/Lettre', type: 'text', value: 'URG003', adminOnlyEdit: true },
                { key: 'attachmentName', label: 'Nom de Pièce Jointe', type: 'text', value: 'Alerte sécurité', adminOnlyEdit: false, copyable: true },
            ],
        },
        {
            id: '43',
            name: 'Incendie',
            category: 'Urgences',
            fields: [
                { key: 'modelNumber', label: 'Numéro de Modèle/Lettre', type: 'text', value: 'URG004', adminOnlyEdit: true },
                { key: 'attachmentName', label: 'Nom de Pièce Jointe', type: 'text', value: 'Évacuation', adminOnlyEdit: false, copyable: true },
            ],
        },
        {
            id: '44',
            name: 'Client VIP',
            category: 'Urgences',
            fields: [
                { key: 'modelNumber', label: 'Numéro de Modèle/Lettre', type: 'text', value: 'URG005', adminOnlyEdit: true },
                { key: 'attachmentName', label: 'Nom de Pièce Jointe', type: 'text', value: 'Priorité absolue', adminOnlyEdit: false, copyable: true },
            ],
        },
        {
            id: '45',
            name: 'Deadline légal',
            category: 'Urgences',
            fields: [
                { key: 'modelNumber', label: 'Numéro de Modèle/Lettre', type: 'text', value: 'URG006', adminOnlyEdit: true },
                { key: 'attachmentName', label: 'Nom de Pièce Jointe', type: 'text', value: 'Délai légal', adminOnlyEdit: false, copyable: true },
            ],
        }
    ],

    // Ajouter quelques tâches à un autre onglet pour la diversité
    Pricing: [
        {
            id: 'p1',
            name: 'Révision tarifs',
            category: 'Tâches',
            fields: [
                { key: 'modelNumber', label: 'Numéro de Modèle/Lettre', type: 'text', value: 'P001', adminOnlyEdit: true },
                { key: 'attachmentName', label: 'Nom de Pièce Jointe', type: 'text', value: 'Grille tarifaire', adminOnlyEdit: false, copyable: true },
            ],
        },
        {
            id: 'p2',
            name: 'Calcul remises',
            category: 'Tâches',
            fields: [
                { key: 'modelNumber', label: 'Numéro de Modèle/Lettre', type: 'text', value: 'P002', adminOnlyEdit: true },
                { key: 'attachmentName', label: 'Nom de Pièce Jointe', type: 'text', value: 'Remises clients', adminOnlyEdit: false, copyable: true },
            ],
        },
        {
            id: 'p3',
            name: 'Analyse concurrence',
            category: 'Analyses',
            fields: [
                { key: 'modelNumber', label: 'Numéro de Modèle/Lettre', type: 'text', value: 'P003', adminOnlyEdit: true },
                { key: 'attachmentName', label: 'Nom de Pièce Jointe', type: 'text', value: 'Étude marché', adminOnlyEdit: false, copyable: true },
            ],
        }
    ],

    Admin: {} // Onglet admin vide
};
