# 🚀 Guide de Release - Covalen App

## Processus de Release Automatique

### 1. Créer un Tag de Version
```bash
# Créer et pousser un tag de version
git tag v1.0.0
git push origin v1.0.0
```

### 2. GitHub Actions va automatiquement :
- ✅ Builder l'application pour Windows, macOS et Linux
- ✅ Créer les installateurs
- ✅ Publier la release sur GitHub
- ✅ Activer les mises à jour automatiques

## Types de Builds

### **Windows**
- `Covalen-1.0.0-x64.exe` - Installateur NSIS
- `Covalen-1.0.0-portable.exe` - Version portable

### **macOS**
- `Covalen-1.0.0.dmg` - Image disque
- `Covalen-1.0.0-mac.zip` - Archive

### **Linux**
- `covalen-app_1.0.0_amd64.deb` - Package Debian/Ubuntu
- `Covalen-1.0.0.AppImage` - AppImage universel

## Manuel de Release Local

Si vous voulez builder manuellement :

### Build pour votre plateforme actuelle
```bash
npm run build:electron
```

### Build pour toutes les plateformes
```bash
npm run build:all
```

### Publier directement
```bash
npm run publish
```

## Gestion des Versions

### Incrémenter la version
```bash
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0
```

### Créer une pre-release
```bash
git tag v1.0.0-beta.1
git push origin v1.0.0-beta.1
```

## Checklist avant Release

- [ ] Tests passent : `npm test`
- [ ] Build local fonctionne : `npm run build:electron`
- [ ] Version mise à jour dans package.json
- [ ] CHANGELOG.md mis à jour
- [ ] Documentation à jour
- [ ] Commit et push des changements
- [ ] Créer et pousser le tag

## Configuration Auto-Update

Les utilisateurs recevront automatiquement les mises à jour grâce à :

- **electron-updater** intégré dans l'application
- **Vérification au démarrage** de l'application
- **Téléchargement en arrière-plan** des nouvelles versions
- **Installation automatique** au redémarrage

## Rollback en cas de problème

```bash
# Supprimer un tag problématique
git tag -d v1.0.0
git push origin :refs/tags/v1.0.0

# Supprimer la release sur GitHub
# Aller sur https://github.com/devanalyste/covalen-app/releases
# Supprimer manuellement la release
```
