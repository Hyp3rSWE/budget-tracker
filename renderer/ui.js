export class UI {
    constructor(expenseTableId, totalLabelId) {
        this.expenseTable = document.getElementById(expenseTableId).getElementsByTagName('tbody')[0];
        this.totalLabel = document.getElementById(totalLabelId);
    }

    addExpenseToTable(expense) {
        const newRow = this.expenseTable.insertRow();
        const expenseCell = newRow.insertCell(0);
        const priceCell = newRow.insertCell(1);

        expenseCell.innerText = expense.name;
        priceCell.innerText = expense.price.toFixed(2);
    }

    loadExpenses(expenses) {
        expenses.forEach(expense => this.addExpenseToTable(expense));
    }

    updateTotal(total) {
        this.totalLabel.innerText = total.toFixed(2);
    }

    clearInputs(expenseInput, priceInput) {
        expenseInput.value = '';
        priceInput.value = '';
    }
}
