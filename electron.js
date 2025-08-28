
const { app, BrowserWindow, Menu, Tray } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const url = require('url');
const { exec } = require('child_process');

let mainWindow;

// Configuration Auto-Updater
autoUpdater.checkForUpdatesAndNotify();

// Gestionnaire d'événements pour les mises à jour
autoUpdater.on('checking-for-update', () => {
    console.log('🔍 Vérification des mises à jour...');
});

autoUpdater.on('update-available', (info) => {
    console.log('✅ Mise à jour disponible:', info.version);
});

autoUpdater.on('update-not-available', (info) => {
    console.log('ℹ️ Pas de mise à jour disponible');
});

autoUpdater.on('error', (err) => {
    console.log('❌ Erreur lors de la mise à jour:', err);
});

autoUpdater.on('download-progress', (progressObj) => {
    let log_message = "⬇️ Téléchargement en cours " + progressObj.percent + "%";
    log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
    console.log(log_message);
});

autoUpdater.on('update-downloaded', (info) => {
    console.log('✅ Mise à jour téléchargée. Installation au redémarrage.');
    // L'installation se fera automatiquement au redémarrage
});

// Fonction pour forcer l'arrêt de tous les processus Node.js
function forceKillNodeProcesses() {
    console.log("🔴 Arrêt forcé des processus Node.js...");

    if (process.platform === 'win32') {
        // Sur Windows
        exec('taskkill /f /im "node.exe"', (error) => {
            if (error && !error.message.includes('not found')) {
                console.error('Erreur lors de l\'arrêt des processus Node:', error);
            }
        });
        exec('taskkill /f /im "Covalen.exe"', (error) => {
            if (error && !error.message.includes('not found')) {
                console.error('Erreur lors de l\'arrêt de Covalen:', error);
            }
        });
    } else {
        // Sur macOS/Linux
        exec('pkill -f node', (error) => {
            if (error && !error.message.includes('no matching processes')) {
                console.error('Erreur lors de l\'arrêt des processus Node:', error);
            }
        });
    }

    // Forcer l'arrêt du processus actuel après un petit délai
    setTimeout(() => {
        process.exit(0);
    }, 500);
}

// Fonction pour quitter proprement l'application
function quitApplication() {
    console.log("🔴 Fermeture de l'application Covalen...");

    if (mainWindow) {
        mainWindow.destroy();
        mainWindow = null;
    }

    app.quit();

    // Forcer l'arrêt après un délai
    setTimeout(() => {
        forceKillNodeProcesses();
    }, 1000);
}

function createWindow() {
    console.log("🟢 Fenêtre Electron en cours de création...");
    let tray = null;

    mainWindow = new BrowserWindow({
        width: 900,
        height: 680,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
            webSecurity: false // Permet l'accès au localStorage en mode file://
        }
    });

    // Détection automatique développement vs production
    const isDev = process.env.ELECTRON_START_URL || process.env.NODE_ENV === 'development';

    let startUrl;
    if (isDev) {
        // Mode développement : utiliser le serveur React
        startUrl = process.env.ELECTRON_START_URL || 'http://localhost:3000';
        console.log("🟡 Mode DÉVELOPPEMENT - Chargement depuis:", startUrl);
    } else {
        // Mode production : utiliser les fichiers de build
        startUrl = url.format({
            pathname: path.join(__dirname, './build/index.html'),
            protocol: 'file:',
            slashes: true
        });
        console.log("🟢 Mode PRODUCTION - Chargement depuis:", startUrl);
    }

    mainWindow.loadURL(startUrl);

    // Option pour rester au premier plan
    mainWindow.setAlwaysOnTop(false); // Par défaut désactivé

    // Menu avec option pour mettre en premier plan
    const menu = Menu.buildFromTemplate([
        {
            label: 'Options',
            submenu: [
                {
                    label: 'Toujours au premier plan',
                    type: 'checkbox',
                    id: 'alwaysOnTop',
                    checked: false,
                    click: (menuItem) => {
                        mainWindow.setAlwaysOnTop(menuItem.checked);
                    }
                },
                { type: 'separator' },
                {
                    label: 'Quitter',
                    click: () => {
                        quitApplication();
                    }
                }
            ]
        }
    ]);

    Menu.setApplicationMenu(menu);

    // Créer une icône dans la barre des tâches
    try {
        tray = new Tray(path.join(__dirname, './public/favicon.ico'));
        tray.setToolTip('Covalen');
        tray.setContextMenu(Menu.buildFromTemplate([
            {
                label: 'Afficher',
                click: () => mainWindow.show()
            },
            {
                label: 'Toujours au premier plan',
                type: 'checkbox',
                checked: false,
                click: (menuItem) => {
                    mainWindow.setAlwaysOnTop(menuItem.checked);
                    // Mettre à jour le menu principal aussi
                    const mainMenu = Menu.getApplicationMenu();
                    if (mainMenu) {
                        const alwaysOnTopItem = mainMenu.getMenuItemById('alwaysOnTop');
                        if (alwaysOnTopItem) {
                            alwaysOnTopItem.checked = menuItem.checked;
                        }
                    }
                }
            },
            { type: 'separator' },
            {
                label: 'Quitter',
                click: () => quitApplication()
            }
        ]));

        tray.on('double-click', () => {
            mainWindow.show();
        });
    } catch (error) {
        console.error("Erreur lors de la création de l'icône tray:", error);
    }
    // Gérer la fermeture de la fenêtre normalement
    mainWindow.on('closed', () => {
        console.log("🔴 Fenêtre fermée par l'utilisateur");
        quitApplication();
    });

    // Gérer la fermeture par le bouton X
    mainWindow.on('close', (event) => {
        console.log("🔴 Tentative de fermeture de la fenêtre");
        event.preventDefault();
        quitApplication();
    });
}

app.on('ready', () => {
    console.log("⚡ App Electron prête !");
    createWindow();
});


app.on('window-all-closed', () => {
    console.log("🔴 Toutes les fenêtres fermées");
    quitApplication();
});

app.on('before-quit', () => {
    console.log("🔴 Application sur le point de se fermer");
});

app.on('will-quit', (event) => {
    console.log("🔴 Application va se fermer");
    event.preventDefault();
    quitApplication();
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

// Gestionnaires pour les signaux système
process.on('SIGINT', () => {
    console.log("🔴 Signal SIGINT reçu - Fermeture forcée");
    quitApplication();
});

process.on('SIGTERM', () => {
    console.log("🔴 Signal SIGTERM reçu - Fermeture forcée");
    quitApplication();
});

process.on('exit', () => {
    console.log("🔴 Processus en cours d'arrêt");
    forceKillNodeProcesses();
});

// Gestionnaire pour les erreurs non capturées
process.on('uncaughtException', (error) => {
    console.error("🔴 Erreur non capturée:", error);
    quitApplication();
});
