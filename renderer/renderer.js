import { ExpenseManager } from './expenseManager.js';
import { UI } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    const addExpenseBtn = document.getElementById('addExpenseBtn');
    const expenseInput = document.getElementById('expense');
    const priceInput = document.getElementById('price');
    const categorySelect = document.getElementById('category');
    const transactionTypeSelect = document.getElementById('transactionType');

    const expenseManager = new ExpenseManager();
    const ui = new UI('expenseTable', 'total');

    // Load initial expenses or incomes
    ui.loadExpenses(expenseManager.getExpenses());
    ui.updateTotal(expenseManager.calculateTotal());

    // Define categories for income and expense
    const categories = {
        income: ['Salary', 'Freelancing', 'Investments', 'Other'],
        expense: ['Food', 'Transport', 'Utilities', 'Rent', 'Other']
    };

    // Function to update categories based on the selected transaction type
    function updateCategories() {
        const selectedType = transactionTypeSelect.value;
        categorySelect.innerHTML = ''; // Clear existing options
        categories[selectedType].forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });
    }

    // Initial population of categories
    updateCategories();

    // Update categories when transaction type changes
    transactionTypeSelect.addEventListener('change', updateCategories);

    // Event listener for adding a transaction
    addExpenseBtn.addEventListener('click', () => {
        const transactionName = expenseInput.value.trim();
        const priceText = priceInput.value.trim();
        const selectedCategory = categorySelect.value;
        const transactionType = transactionTypeSelect.value; // Get the transaction type

        if (transactionName && priceText) {
            const price = parseFloat(priceText);

            // Add new transaction to the manager and UI
            expenseManager.addExpense(transactionName, price, selectedCategory, transactionType);
            ui.addExpenseToTable({ name: transactionName, category: selectedCategory, price: price });

            // Update total and clear inputs
            ui.updateTotal(expenseManager.calculateTotal());
            ui.clearInputs(expenseInput, priceInput);
        }
    });
});
