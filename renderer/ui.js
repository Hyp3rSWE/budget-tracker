export class UI {
    constructor(tableId, totalId, categoryId) {
        this.tableId = tableId;
        this.totalId = totalId;
        this.categoryId = categoryId;
    }

    loadExpenses(expenses) {
        const table = document.getElementById(this.tableId);
        table.innerHTML = '';

        expenses.forEach(expense => {
            const row = table.insertRow();
            row.innerHTML = `
                <td>${expense.name}</td>
                <td>${expense.price}</td>
                <td>${expense.category}</td>
                <td>${expense.date}</td>
                <td><button class="deleteBtn" data-id="${expense.id}">Delete</button></td>
            `;
        });
    }

    updateTotal(total) {
        document.getElementById(this.totalId).innerText = `Total: $${total.toFixed(2)}`;
    }

    clearInputs(...inputs) {
        inputs.forEach(input => input.value = '');
    }

    populateCategories(transactionType) {
        const categorySelect = document.getElementById(this.categoryId);
        categorySelect.innerHTML = ''; // Clear previous categories

        // Example categories, you can replace with your own logic
        const categories = ['Food', 'Transport', 'Utilities', 'Entertainment'];
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.innerText = category;
            categorySelect.appendChild(option);
        });
    }

    removeExpenseFromTable(expenseId) {
        const table = document.getElementById(this.tableId);
        const row = Array.from(table.rows).find(row => row.querySelector(`.deleteBtn[data-id="${expenseId}"]`));
        if (row) {
            table.deleteRow(row.rowIndex);
        }
    }
}
