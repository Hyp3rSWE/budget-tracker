const { app, ipcMain } = require('electron');
const MainWindow = require('./MainWindow');
const sqlite3 = require('sqlite3').verbose();

let mainWindow;
let db;

app.whenReady().then(() => {
    db = new sqlite3.Database('renderer/budget-tracker.db', (err) => {
        if (err) {
            console.error('Error opening database ' + err.message);
        } else {
            mainWindow = new MainWindow();
            mainWindow.createWindow();
        }
    });
});

// IPC handlers
ipcMain.on('add-expense', (event, expense) => {
    db.run(`INSERT INTO expenses (name, price) VALUES (?, ?)`, [expense.name, expense.price], (err) => {
        if (err) {
            console.error('Error inserting expense ' + err.message);
        }
    });
});

ipcMain.handle('get-expenses', async () => {
    return new Promise((resolve, reject) => {
        db.all(`SELECT name, price FROM expenses`, [], (err, rows) => {
            if (err) {
                reject('Error fetching expenses ' + err.message);
            } else {
                resolve(rows);
            }
        });
    });
});

ipcMain.handle('calculate-total', async () => {
    return new Promise((resolve, reject) => {
        db.get(`SELECT SUM(price) AS total FROM expenses`, [], (err, row) => {
            if (err) {
                reject('Error calculating total ' + err.message);
            } else {
                resolve(row.total || 0);
            }
        });
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (MainWindow.getAllWindows().length === 0) {
        mainWindow.createWindow();
    }
});
