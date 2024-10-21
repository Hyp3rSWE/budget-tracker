import { ExpenseManager } from './expenseManager.js';
import { UI } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    const addExpenseBtn = document.getElementById('addExpenseBtn');
    const expenseInput = document.getElementById('expense');
    const priceInput = document.getElementById('price');

    const expenseManager = new ExpenseManager();
    const ui = new UI('expenseTable', 'total');

    ui.loadExpenses(expenseManager.getExpenses());
    ui.updateTotal(expenseManager.calculateTotal());

    // Add expense event listener
    addExpenseBtn.addEventListener('click', () => {
        const expenseName = expenseInput.value.trim();
        const priceText = priceInput.value.trim();

        if (expenseName && priceText) {
            const price = parseFloat(priceText);
            
            // Add new expense to the manager and UI
            expenseManager.addExpense(expenseName, price);
            ui.addExpenseToTable({ name: expenseName, price: price });

            // Update total and clear inputs
            ui.updateTotal(expenseManager.calculateTotal());
            ui.clearInputs(expenseInput, priceInput);
        }
    });
});
