const { BrowserWindow } = require('electron');
const path = require('path');

class MainWindow {
    constructor() {
        this.window = null;
    }

    createWindow() {
        console.log("Creating window");
        this.window = new BrowserWindow({
            width: 600,
            height: 400,
            webPreferences: {
                // Remove preload and allow Node.js in renderer
                nodeIntegration: true, // Allow Node.js integration
                contextIsolation: false, // Disable context isolation
                enableRemoteModule: false, // Disable remote module for better security
            },
        });

        this.window.loadFile('./renderer/index.html'); // Ensure the path is correct

        this.window.on('closed', () => {
            this.window = null;
        });
    }

    static getAllWindows() {
        return BrowserWindow.getAllWindows();
    }
}

module.exports = MainWindow;
