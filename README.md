# Covalen App

Une application de gestion de tâches développée en React avec interface Electron pour le bureau.

## 📋 Description

Covalen App est une application de gestion de tâches organisées par onglets et catégories. Elle offre plusieurs modes d'affichage (Grille, Liste, Kanban) avec fonctionnalités de drag & drop et recherche en temps réel.

### Fonctionnalités principales

- ✅ **Gestion multi-onglets** : Organisation des tâches par domaines
- ✅ **3 modes d'affichage** : Grille, Liste, Kanban  
- ✅ **Drag & Drop** : Réorganisation intuitive des tâches
- ✅ **Recherche en temps réel** : Filtrage par nom, catégorie, numéro
- ✅ **Mode Admin** : Création/modification de tâches et onglets
- ✅ **Persistance automatique** : Sauvegarde localStorage
- ✅ **Interface responsive** : Adaptée desktop et mobile

## 🚀 Installation et Démarrage

### Prérequis

- **Node.js** (version 14.x ou supérieure)
- **npm** (inclus avec Node.js)
- **Git** pour cloner le repository

### 1. Cloner le repository

```bash
git clone https://github.com/devanalyste/mywork.git
cd covalen-app
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Démarrer l'application en mode développement

```bash
npm start
```

L'application s'ouvrira automatiquement dans votre navigateur à l'adresse `http://localhost:3000`

## 🖥️ Version Desktop (Electron)

### Démarrage en mode développement Electron

```bash
npm run electron-dev
```

### Build pour la production

```bash
# Build React
npm run build

# Créer l'exécutable Electron
npm run app:dist
```

## 📂 Structure du Projet

```
src/
├── components/           # Composants React
│   ├── DashboardMaison.js       # Dashboard principal
│   ├── MenuHaut.js              # Navigation supérieure
│   ├── MenuGaucheAdjointes.js   # Menu latéral
│   ├── DetailTacheAdjointe.js   # Édition des tâches
│   └── PanneauAdmin.js          # Interface d'administration
├── data/                # Données initiales et de test
├── utils/               # Utilitaires (localStorage, etc.)
└── styles/              # Feuilles de style CSS
```

## ⚙️ Commandes Disponibles

| Commande | Description |
|----------|-------------|
| `npm start` | Démarre le serveur de développement React |
| `npm run build` | Build pour la production |
| `npm test` | Lance les tests |
| `npm run electron-dev` | Démarre l'application Electron en dev |
| `npm run electron` | Démarre l'application Electron en prod |
| `npm run app:dist` | Créer l'exécutable Electron |

## 🔧 Technologies Utilisées

- **React 18** - Interface utilisateur
- **@dnd-kit** - Drag and drop
- **PropTypes** - Validation des props
- **Tailwind CSS** - Styling
- **Electron** - Application desktop
- **localStorage** - Persistance des données

## 📱 Utilisation

### Navigation
- **Onglet "Maison"** : Vue d'ensemble de toutes les tâches
- **Autres onglets** : Tâches spécifiques par domaine
- **Mode Admin** : Gestion des tâches et structure

### Modes d'affichage
- **🔷 Grille** : Affichage compact en colonnes
- **📋 Liste** : Vue tabulaire avec tri
- **📊 Kanban** : Colonnes par catégorie

### Raccourcis clavier
- `Ctrl + S` : Sauvegarder (en mode admin)
- `Ctrl + /` : Focus sur la recherche
- `Échap` : Quitter le mode admin

## 🛠️ Développement

### Installation pour le développement

```bash
# Cloner et installer
git clone https://github.com/devanalyste/mywork.git
cd covalen-app
npm install

# Démarrer en mode dev
npm start
```

### Données de test

L'application est livrée avec des données de test massives pour tester les performances. Les données sont automatiquement chargées au premier démarrage.

## 📄 Licence

Ce projet est à des fins de développement personnel.

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou soumettre une pull request.

## 📞 Support

Pour toute question ou problème, ouvrez une issue sur GitHub.