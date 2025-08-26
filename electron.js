
const { app, BrowserWindow, Menu, Tray } = require('electron');
const path = require('path');
const url = require('url');

let mainWindow;

function createWindow() {
    console.log("🟢 Fenêtre Electron en cours de création...");
    let tray = null;

    mainWindow = new BrowserWindow({
        width: 900,
        height: 680,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    // En développement, chargez l'URL de développement
    const startUrl = process.env.ELECTRON_START_URL || url.format({
        pathname: path.join(__dirname, './build/index.html'),
        protocol: 'file:',
        slashes: true
    });

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
                        app.quit();
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
                click: () => app.quit()
            }
        ]));

        tray.on('double-click', () => {
            mainWindow.show();
        });
    } catch (error) {
        console.error("Erreur lors de la création de l'icône tray:", error);
    }
    // Gérer la fermeture de la fenêtre pour éviter la destruction du tray
    mainWindow.on('close', (event) => {
        event.preventDefault(); // Empêche la fermeture réelle de la fenêtre
        mainWindow.hide(); // Cache la fenêtre au lieu de la fermer
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
        if (tray) {
            tray.destroy();
        }
    });
}

app.on('ready', () => {
    console.log("⚡ App Electron prête !");
    createWindow();
});


app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});
