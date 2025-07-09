// Données de test avec BEAUCOUP de tâches pour stress-test le layout grille 4 colonnes
export const massiveTestAppData = {
    Maison: {}, // L'onglet Maison n'aura pas de tâches directement
    Adjointes: []
};

// Fonction pour générer des tâches aléatoirement
const generateRandomTasks = () => {
    const categories = [
        'Annulations',
        'Réclamations',
        'Validations',
        'Correspondances',
        'Expertises',
        'Sinistres',
        'Contrats',
        'Clients',
        'Facturations',
        'Juridique',
        'Techniques',
        'Archives'
    ];

    const taskPrefixes = [
        'Traitement', 'Validation', 'Vérification', 'Contrôle', 'Analyse',
        'Suivi', 'Gestion', 'Révision', 'Expertise', 'Inspection',
        'Évaluation', 'Approbation', 'Archivage', 'Transmission', 'Notification'
    ];

    const taskSuffixes = [
        'urgent', 'standard', 'prioritaire', 'différé', 'spécial',
        'mensuel', 'hebdomadaire', 'quotidien', 'annuel', 'trimestriel',
        'automatique', 'manuel', 'numérique', 'papier', 'électronique'
    ];

    const tasks = [];
    let taskId = 1;

    // Générer 15-25 tâches par catégorie (total: ~240 tâches)
    categories.forEach(category => {
        const tasksInCategory = Math.floor(Math.random() * 11) + 15; // 15-25 tâches

        for (let i = 0; i < tasksInCategory; i++) {
            const prefix = taskPrefixes[Math.floor(Math.random() * taskPrefixes.length)];
            const suffix = taskSuffixes[Math.floor(Math.random() * taskSuffixes.length)];
            const modelNumber = Math.floor(Math.random() * 900) + 100; // 100-999

            const task = {
                id: taskId.toString(),
                name: `${prefix} ${suffix} ${category.toLowerCase()}`,
                category: category,
                fields: [
                    {
                        key: 'modelNumber',
                        label: 'Numéro de Modèle/Lettre',
                        type: 'text',
                        value: modelNumber.toString(),
                        adminOnlyEdit: true
                    },
                    {
                        key: 'fullTemplateName',
                        label: 'Modèle de lettre',
                        type: 'text',
                        value: `${prefix} ${suffix} - Modèle ${modelNumber}`,
                        adminOnlyEdit: true,
                        copyable: true
                    },
                    {
                        key: 'attachmentName',
                        label: 'Nom de Pièce Jointe',
                        type: 'text',
                        value: `2025-06-26 ${category} - ${prefix} ${modelNumber}`,
                        adminOnlyEdit: false,
                        copyable: true
                    }
                ]
            };

            // Ajouter des champs supplémentaires aléatoirement
            if (Math.random() > 0.5) {
                task.fields.push({
                    key: 'noteTemplate',
                    label: 'Note EPIC',
                    type: 'textarea',
                    value: `${category} - ${prefix} ${modelNumber} + documentation`,
                    adminOnlyEdit: false,
                    copyable: true,
                    specialButton: 'addDate'
                });
            }

            if (Math.random() > 0.7) {
                task.fields.push({
                    key: 'procedure',
                    label: 'Procédure à Suivre',
                    type: 'textarea',
                    value: `1. Analyser le dossier ${category.toLowerCase()}.\\n2. Appliquer la procédure ${modelNumber}.\\n3. Archiver le résultat.`,
                    adminOnlyEdit: true,
                    hasCheckboxes: Math.random() > 0.5
                });
            }

            tasks.push(task);
            taskId++;
        }
    });

    return tasks;
};

// Générer les tâches
massiveTestAppData.Adjointes = generateRandomTasks();

console.log(`🧪 Données de test générées: ${massiveTestAppData.Adjointes.length} tâches réparties sur ${new Set(massiveTestAppData.Adjointes.map(t => t.category)).size} catégories`);

// Stats par catégorie
const categoryStats = {};
massiveTestAppData.Adjointes.forEach(task => {
    categoryStats[task.category] = (categoryStats[task.category] || 0) + 1;
});

console.log('📊 Répartition par catégorie:', categoryStats);
