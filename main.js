const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,  // Allow `require` in renderer process
            contextIsolation: false,  // Allow direct communication between main and renderer
        },
    });

    mainWindow.loadFile(path.join(__dirname, 'index.html'));

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// Register the 'get-expenses' IPC handler
ipcMain.handle('get-expenses', async () => {
    try {
        // Send a message to renderer to fetch expenses from the database
        const expenses = await mainWindow.webContents.executeJavaScript('window.getExpenses()');
        return expenses; // Respond with the data
    } catch (err) {
        console.error('Error fetching expenses:', err);
        throw err;  // Propagate the error
    }
});

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
