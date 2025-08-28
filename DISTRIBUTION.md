# 📦 Guide de Distribution Simple - Covalen

## 🚀 Partage de l'Application

### **Option 1 : GitHub Releases (Automatique)**
- **Repository** : https://github.com/devanalyste/mywork
- **Releases** : https://github.com/devanalyste/mywork/releases
- **Dernière version** : https://github.com/devanalyste/mywork/releases/latest

### **Option 2 : Distribution Manuelle**

Si GitHub Actions ne fonctionne pas encore, vous pouvez :

#### 1. **Builder localement**
```bash
npm run build:win     # Pour Windows
npm run build:mac     # Pour macOS (si vous êtes sur Mac)
npm run build:linux   # Pour Linux
```

#### 2. **Trouver les fichiers générés**
Les exécutables seront dans :
- `dist/` - Installateurs et packages
- `dist/win-unpacked/` - Version décompressée

#### 3. **Fichiers à partager**
- `Covalen Setup 1.0.0.exe` - Installateur Windows
- `Covalen 1.0.0.exe` - Version portable

### **Option 3 : Hébergement Cloud**

Vous pouvez uploader les fichiers sur :
- **Google Drive** avec lien public
- **Dropbox** avec lien de partage
- **OneDrive** avec lien de partage
- **WeTransfer** pour envoi temporaire

## 🛡️ Instructions pour les Utilisateurs

### **Installation Windows**
1. Télécharger `Covalen Setup 1.0.0.exe`
2. Exécuter le fichier
3. Suivre l'assistant d'installation
4. L'application se lancera automatiquement

### **Version Portable**
1. Télécharger `Covalen 1.0.0.exe`
2. Placer dans un dossier de votre choix
3. Double-cliquer pour lancer
4. Aucune installation requise

## 🔄 Mises à Jour

### **Automatiques** (si l'auto-updater fonctionne)
- L'application vérifie automatiquement les mises à jour
- Téléchargement en arrière-plan
- Installation au redémarrage

### **Manuelles**
1. Télécharger la nouvelle version
2. Installer par-dessus l'ancienne
3. Vos données seront préservées

## 📁 Données Utilisateur

Vos données sont sauvegardées dans :
- **Windows** : `%APPDATA%\Covalen\`
- **Fichiers** : tâches, snippets, préférences, historique

Ces données sont **automatiquement préservées** lors des mises à jour.

## 🆘 Dépannage

### **Erreur "Windows a protégé votre PC"**
1. Cliquer sur "Informations complémentaires"
2. Cliquer sur "Exécuter quand même"
3. (Normal pour les apps non signées)

### **Antivirus bloque l'application**
1. Ajouter une exception dans l'antivirus
2. Autoriser le fichier/dossier Covalen

### **Application ne se lance pas**
1. Vérifier Windows 10/11 64-bit
2. Installer Visual C++ Redistributable si nécessaire
3. Exécuter en tant qu'administrateur

## 📞 Support

Pour toute question :
- **Email** : devanalyste@gmail.com
- **GitHub Issues** : https://github.com/devanalyste/mywork/issues
