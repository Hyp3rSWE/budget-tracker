const sqlite3 = require('sqlite3').verbose();

export class ExpenseManager {
    constructor() {
        this.db = new sqlite3.Database('budget-tracker.db', (err) => {
            if (err) {
                console.error('Error opening database ' + err.message);
            } else {
                this.createTable();
            }
        });
    }

    createTable() {
        this.db.run(`CREATE TABLE IF NOT EXISTS expenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price REAL NOT NULL
        )`, (err) => {
            if (err) {
                console.error('Error creating table ' + err.message);
            }
        });
    }

    addExpense(expenseName, price, category) {
        this.db.run(
            `INSERT INTO expenses (name, price, category) VALUES (?, ?, ?)`,
            [expenseName, price, category],
            (err) => {
                if (err) {
                    console.error('Error inserting expense ' + err.message);
                }
            }
        );
    }
    
    getExpenses(callback) {
        this.db.all(`SELECT id, name, price, category FROM expenses`, [], (err, rows) => {
            if (err) {
                console.error('Error fetching expenses ' + err.message);
                callback([]);
            } else {
                callback(rows);
            }
        });
    }
    

    calculateTotal(callback) {
        this.db.get(`SELECT SUM(price) AS total FROM expenses`, [], (err, row) => {
            if (err) {
                console.error('Error calculating total ' + err.message);
                callback(0);
            } else {
                callback(row.total || 0);
            }
        });
    }

    deleteExpense(expenseId, callback) {
        this.db.run(`DELETE FROM expenses WHERE id = ?`, [expenseId], (err) => {
            if (err) {
                console.error('Error deleting expense ' + err.message);
            } else {
                console.log(`Deleted expense with ID ${expenseId}`);
                if (callback) callback();
            }
        });
    }
    
}
