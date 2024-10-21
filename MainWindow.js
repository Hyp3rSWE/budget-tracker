const { BrowserWindow } = require('electron');
const path = require('path');

class MainWindow {
    constructor() {
        this.window = null;
    }

    createWindow() {
        this.window = new BrowserWindow({
            width: 600,
            height: 400,
            webPreferences: {
                preload: path.join(__dirname, 'preload.js'),
                contextIsolation: true,
                enableRemoteModule: false,
            },
        });

        this.window.loadFile('index.html');

        this.window.on('closed', () => {
            this.window = null;
        });
    }

    static getAllWindows() {
        return BrowserWindow.getAllWindows();
    }
}

module.exports = MainWindow;
