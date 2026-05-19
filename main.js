const { app, BrowserWindow, screen, Menu, Tray } = require('electron');
const activeWin = require('active-win');
const path = require('path');

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

        if (app.isPackaged) {
            app.setLoginItemSettings({
                openAtLogin: true,
                path: app.getPath('exe'),
                args: [] 
            });
        }

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

        const contextMenu = Menu.buildFromTemplate([
            { 
                label: 'Posición', 
                submenu: [
                    { label: 'Izquierda', click: () => { win.setPosition(0, screen.getPrimaryDisplay().workAreaSize.height - winHeight); } },
                    { label: 'Derecha', click: () => { win.setPosition(screen.getPrimaryDisplay().workAreaSize.width - winWidth, screen.getPrimaryDisplay().workAreaSize.height - winHeight); } }
                ] 
            },
            { type: 'separator' },
            { label: 'Reiniciar a Mark', click: () => { win.reload(); } },
            { type: 'separator' },
            { label: 'Salir', click: () => { app.quit(); } }
        ]);

        win.webContents.on('context-menu', () => { contextMenu.popup(); });

        win.loadFile(path.join(__dirname, 'index.html'));

        // --- DETECTOR DE YOUTUBE ---
        setInterval(async () => {
            try {
                const result = await activeWin();
                if (result && win) {
                    const isYoutube = result.title.toLowerCase().includes('youtube');
                    win.webContents.send('youtube-mode', isYoutube);
                }
            } catch (e) {
                // Error silencioso si no hay ventana activa
            }
        }, 2000);

        win.once('ready-to-show', () => {
            const h = screen.getPrimaryDisplay().workAreaSize.height;
            const w = screen.getPrimaryDisplay().workAreaSize.width;
            win.setPosition(w - winWidth, h - winHeight);
            win.show();
        });
    }

    app.whenReady().then(createWindow);
    app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
}