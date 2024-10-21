export class ExpenseManager {
    constructor() {
        this.expenses = [
            { name: 'Veg', price: 40.0 },
            { name: 'Fruit', price: 70.0 },
            { name: 'Fuel', price: 60.0 }
        ];
    }

    addExpense(expenseName, price) {
        const newExpense = { name: expenseName, price: price };
        this.expenses.push(newExpense);
    }

    getExpenses() {
        return this.expenses;
    }

    calculateTotal() {
        return this.expenses.reduce((total, expense) => total + expense.price, 0);
    }
}
