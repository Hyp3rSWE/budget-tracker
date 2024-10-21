export class UI {
    constructor(expenseTableId, totalLabelId) {
        this.expenseTable = document.getElementById(expenseTableId).getElementsByTagName('tbody')[0];
        this.totalLabel = document.getElementById(totalLabelId);
    }

    // Add an expense to the table
    addExpenseToTable(expense) {
        const newRow = this.expenseTable.insertRow();
        const expenseCell = newRow.insertCell(0);
        const priceCell = newRow.insertCell(1);

        expenseCell.innerText = expense.name;
        priceCell.innerText = expense.price.toFixed(2);
    }

    // Load multiple expenses into the table
    loadExpenses(expenses) {
        expenses.forEach(expense => this.addExpenseToTable(expense));
    }

    // Update the total label
    updateTotal(total) {
        this.totalLabel.innerText = total.toFixed(2);
    }

    // Clear input fields
    clearInputs(expenseInput, priceInput) {
        expenseInput.value = '';
        priceInput.value = '';
    }
}
