// main.js
const { app, BrowserWindow, screen } = require('electron');
const path = require('path');

function createWindow() {
    // Obtenemos el tamaño completo de la pantalla
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;

    // Supongamos que tu dibujo es de 256x256 px.
    // Ajustaremos la ventana para que sea ancha pero corta,
    // así dará la sensación de "sobresalir" del suelo.
    const winWidth = 300; 
    const winHeight = 300; 

    const win = new BrowserWindow({
        width: winWidth,
        height: winHeight,
        // x: ancho de pantalla menos ancho de ventana (pegado a la derecha)
        x: width - winWidth,
        // y: alto de pantalla menos alto de ventana (pegado abajo)
        // NOTA: Si usas Windows, prueba restar unos 5-10px extra 
        // para que no choque con la barra de tareas.
        y: height - winHeight,
        transparent: true, // Fondo transparente
        frame: false,      // Sin bordes de ventana
        alwaysOnTop: true, // Siempre visible
        resizable: false,
        skipTaskbar: true, // No aparece en la barra de tareas
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    win.loadFile('index.html');
}

app.whenReady().then(createWindow);

// Cerrar cuando todas las ventanas estén cerradas (común en Electron)
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});