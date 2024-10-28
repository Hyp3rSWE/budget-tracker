export class ExpenseManager {
    constructor() {
        this.expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    }

    addExpense(name, price, category, date, callback) {
        const newExpense = {
            id: Date.now().toString(),
            name,
            price,
            category,
            date
        };

        this.expenses.push(newExpense);
        this.saveExpenses();
        callback();
    }

    deleteExpense(id, callback) {
        this.expenses = this.expenses.filter(expense => expense.id !== id);
        this.saveExpenses();
        callback();
    }

    getExpenses(filter = {}, callback) {
        callback(this.expenses);
    }

    calculateTotal(callback) {
        const total = this.expenses.reduce((sum, expense) => sum + expense.price, 0);
        callback(total);
    }

    saveExpenses() {
        localStorage.setItem('expenses', JSON.stringify(this.expenses));
    }
}
