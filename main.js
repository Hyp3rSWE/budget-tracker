const { app } = require('electron');
const MainWindow = require('./MainWindow');

let mainWindow;

app.whenReady().then(() => {
    mainWindow = new MainWindow();
    mainWindow.createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (MainWindow.getAllWindows().length === 0) {
        mainWindow.createWindow();
    }
});
