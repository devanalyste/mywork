# Guide de Test - Restauration de Versions

## Problème Identifié
L'utilisateur obtient "Erreur lors de la restauration" lors de l'utilisation de la fonctionnalité de versioning.

## Tests à Effectuer

### 1. Création de Versions
1. Ouvrir l'application sur http://localhost:3000
2. Aller dans un onglet (ex: "Financiers")
3. Créer ou modifier une tâche
4. Utiliser Ctrl+S pour sauvegarder et créer une version
5. Modifier encore la tâche
6. Sauvegarder à nouveau (Ctrl+S)
7. Répéter 2-3 fois pour avoir plusieurs versions

### 2. Test de Restauration
1. Cliquer sur l'icône "📚" (Historique des versions)
2. Vérifier que les versions apparaissent dans la liste
3. Cliquer sur "Restaurer" pour une version
4. Observer si l'erreur "Erreur lors de la restauration" apparaît

### 3. Debug dans la Console
Ouvrir les outils de développement (F12) et regarder :
- Messages d'erreur dans la console
- Appels réseau
- Erreurs JavaScript

## Corrections Déjà Apportées

### 1. Cohérence VersionHistory/App.js
- Le composant VersionHistory appelait `versionManager.rollback()` et passait les données
- L'App.js s'attendait à recevoir un versionId
- **Corrigé** : VersionHistory passe maintenant le versionId à onRestore

### 2. Gestion des Erreurs
- Ajout de logs dans handleVersionRestore
- Vérification que les données restaurées ne sont pas null
- Messages d'erreur plus explicites

### 3. Alias de Compatibilité
- versionManager.initialize() -> versionManager.init()
- versionManager.createSnapshot() -> versionManager.save()
- versionManager.restoreVersion() -> versionManager.rollback()

## Structure des Fichiers Impliqués

```
src/
├── App.js (handleVersionRestore)
├── components/
│   └── VersionHistory.js (interface de restauration)
└── utils/
    └── versionManager.js (logique de versioning)
```

## Commandes de Test
```bash
npm run start:react  # Démarrer en mode développement
npm run build        # Construire pour production
npm run dev          # Mode développement avec Electron
```

## Fonctionnalités Confirmées Fonctionnelles
✅ **Mode sombre** - Bouton toggle fonctionne
✅ **Actions rapides** - Panneau ⚡ accessible 
✅ **Raccourcis clavier** - Ctrl+S, Ctrl+D, etc.
✅ **Sauvegarde manuelle** - Ctrl+S crée des versions

❓ **Versioning/Restauration** - À tester selon ce guide
