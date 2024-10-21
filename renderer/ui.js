export class UI {
    constructor(expenseTableId, totalLabelId, categorySelectId) {
        this.expenseTable = document.getElementById(expenseTableId).getElementsByTagName('tbody')[0];
        this.totalLabel = document.getElementById(totalLabelId);
        this.categorySelect = document.getElementById(categorySelectId);
    }

    addExpenseToTable(expense) {
        const newRow = this.expenseTable.insertRow();
        const expenseCell = newRow.insertCell(0);
        const categoryCell = newRow.insertCell(1);
        const priceCell = newRow.insertCell(2);

        expenseCell.innerText = expense.name;
        categoryCell.innerText = expense.category; // Displaying the category
        priceCell.innerText = expense.price.toFixed(2); // Formatting price to two decimal places
    }

    loadExpenses(expenses) {
        this.expenseTable.innerHTML = ''; // Clear existing rows before loading
        expenses.forEach(expense => this.addExpenseToTable(expense));
    }

    updateTotal(total) {
        this.totalLabel.innerText = total.toFixed(2);
    }

    clearInputs(expenseInput, priceInput) {
        expenseInput.value = '';
        priceInput.value = '';
        this.categorySelect.selectedIndex = 0; // Reset category selection
    }

    populateCategories(transactionType) {
        this.categorySelect.innerHTML = ''; // Clear existing options
        let categories = [];

        if (transactionType === 'income') {
            categories = ['Salary', 'Freelancing', 'Investments', 'Other'];
        } else if (transactionType === 'expense') {
            categories = ['Food', 'Transport', 'Utilities', 'Rent', 'Other'];
        }

        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            this.categorySelect.appendChild(option);
        });
    }
}
