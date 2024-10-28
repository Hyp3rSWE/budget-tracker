// Assuming you're using sqlite3 in your ExpenseManager class
import { ExpenseManager } from './expenseManager.js';
import { UI } from './ui.js';

console.log("hi 2");

document.addEventListener('DOMContentLoaded', () => {
    const addExpenseBtn = document.getElementById('addExpenseBtn');
    const expenseInput = document.getElementById('expense');
    const priceInput = document.getElementById('price');
    const transactionTypeSelect = document.getElementById('transactionType');
    const categorySelect = document.getElementById('category');

    const expenseManager = new ExpenseManager();
    const ui = new UI('expenseTable', 'total', 'category');

    // Load existing expenses from the database
    expenseManager.getExpenses((expenses) => {
        ui.loadExpenses(expenses);
        expenseManager.calculateTotal((total) => {
            ui.updateTotal(total);
        });
    });

    // Populate categories based on transaction type
    transactionTypeSelect.addEventListener('change', (event) => {
        const selectedType = event.target.value;
        ui.populateCategories(selectedType);
    });

    console.log("hi 1");

    // Trigger category population on page load
    ui.populateCategories(transactionTypeSelect.value);

    addExpenseBtn.addEventListener('click', () => {
        const expenseName = expenseInput.value.trim();
        const priceText = priceInput.value.trim();
        const category = categorySelect.value;

        if (expenseName && priceText) {
            const price = parseFloat(priceText);

            // Add new expense to the manager and UI
            expenseManager.addExpense(expenseName, price,category);
            ui.addExpenseToTable({ name: expenseName, category: category, price: price });

            // Update total and clear inputs
            expenseManager.calculateTotal((total) => {
                ui.updateTotal(total);
            });
            ui.clearInputs(expenseInput, priceInput);
        }
    });

    document.getElementById('expenseTable').addEventListener('click', (event) => {
        if (event.target.classList.contains('deleteBtn')) {
            const expenseId = event.target.getAttribute('data-id');
            expenseManager.deleteExpense(expenseId, () => {
                ui.removeExpenseFromTable(expenseId);
    
                expenseManager.calculateTotal((total) => {
                    ui.updateTotal(total);
                });
            });
        }
    });
    
    
});
