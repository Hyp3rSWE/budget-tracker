export class ExpenseManager {
    constructor() {
        // change the name of the database if it is not correct 
        database = "expenses-tracker";
    }

    
    addExpense(description, amount , date) {
        const insertQuery = `INSERT INTO expenses (description , amount , date) VALUES (?, ? , ?)`;
        this.database.run(insertQuery, [description, amount ,date], function(err) {
            if (err) {
                console.error('Error adding expense:', err.message);
            } else {
                console.log(`Expense added with ID: ${this.lastID}`);
            }
        });
    }

    getExpenses(callback) {
        const selectQuery = `SELECT * FROM expenses`;
        this.database.all(selectQuery, [], (err, rows) => {
            if (err) {
                console.error('Error retrieving expenses:', err.message);
                callback(err, null);
            } else {
                callback(null, rows);
            }
        });
    }

    deleteExpense(id) {
        const deleteQuery = `DELETE FROM expenses WHERE id = ?`;
        this.database.run(deleteQuery, [id], function(err) {
            if (err) {
                console.error('Error deleting expense:', err.message);
            } else if (this.changes === 0) {
                console.log(`No expense found with ID: ${id}`);
            } else {
                console.log(`Expense deleted with ID: ${id}`);
            }
        });
    }

    calculateTotal() {
        return this.expenses.reduce((total, expense) => total + expense.price, 0);
    }
}
