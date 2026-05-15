const { app, BrowserWindow, screen, Menu, Tray } = require('electron');
const path = require('path');

// Control de instancia única para evitar que Mark se duplique
const isFirstInstance = app.requestSingleInstanceLock();

if (!isFirstInstance) {
    app.quit();
} else {
    app.on('second-instance', () => {
        if (win) {
            if (win.isMinimized()) win.restore();
            win.focus();
            win.show();
        }
    });

    let win;
    let tray = null;

    function createWindow() {
        const { width, height } = screen.getPrimaryDisplay().workAreaSize;

        const winWidth = 512;
        const winHeight = 512;

        win = new BrowserWindow({
            width: winWidth,
            height: winHeight,
            icon: path.join(__dirname, 'Icon.ico'),
            x: width - winWidth,
            y: height - winHeight,
            transparent: true,
            frame: false,
            alwaysOnTop: true,
            show: false,
            resizable: false,
            skipTaskbar: true,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            }
        });

        // --- CONFIGURACIÓN DE AUTO-INICIO ---
        // Se ejecuta solo cuando el programa está empaquetado como .exe
        if (app.isPackaged) {
            app.setLoginItemSettings({
                openAtLogin: true,
                path: app.getPath('exe'),
                args: [] 
            });
        }

        // --- CONFIGURACIÓN DEL TRAY (Icono en la barra de tareas/reloj) ---
        tray = new Tray(path.join(__dirname, 'Icon.ico'));
        const trayMenu = Menu.buildFromTemplate([
            { label: 'Mostrar a Mark', click: () => { win.show(); } },
            { label: 'Ocultar a Mark', click: () => { win.hide(); } },
            { type: 'separator' },
            { label: 'Salir', click: () => { app.quit(); } }
        ]);
        tray.setToolTip('Mascota de escritorio Mark');
        tray.setContextMenu(trayMenu);

        tray.on('double-click', () => {
            win.isVisible() ? win.hide() : win.show();
        });

        // --- MENÚ CONTEXTUAL (Click derecho directo sobre Mark) ---
        const contextMenu = Menu.buildFromTemplate([
            { 
                label: 'Posición', 
                submenu: [
                    { 
                        label: 'Izquierda', 
                        click: () => {
                            const { height } = screen.getPrimaryDisplay().workAreaSize;
                            win.setPosition(0, height - winHeight); 
                        } 
                    },
                    { 
                        label: 'Derecha', 
                        click: () => {
                            const { width, height } = screen.getPrimaryDisplay().workAreaSize;
                            win.setPosition(width - winWidth, height - winHeight); 
                        } 
                    }
                ] 
            },
            { type: 'separator' },
            { label: 'Reiniciar a Mark', click: () => { win.reload(); } },
            { type: 'separator' },
            { label: 'Salir', click: () => { app.quit(); } }
        ]);

        win.webContents.on('context-menu', () => {
            contextMenu.popup();
        });

        win.loadFile(path.join(__dirname, 'index.html'));

        // --- POSICIONAMIENTO INICIAL ---
        win.once('ready-to-show', () => {
            const h = screen.getPrimaryDisplay().workAreaSize.height;
            const w = screen.getPrimaryDisplay().workAreaSize.width;
            win.setPosition(w - winWidth, h - winHeight);
            win.show();
        });
    }

    app.whenReady().then(createWindow);

    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') app.quit();
    });
}