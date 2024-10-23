export class UI {
    constructor(expenseTableId, totalId, categorySelectId) {
        this.expenseTableId = expenseTableId;
        this.totalId = totalId;
        this.categorySelectId = categorySelectId;
    }

    loadExpenses(expenses) {
        const tableBody = document.getElementById(this.expenseTableId).querySelector('tbody');
        tableBody.innerHTML = '';

        expenses.forEach(expense => {
            this.addExpenseToTable(expense);
        });
    }

    addExpenseToTable(expense) {
        const tableBody = document.getElementById(this.expenseTableId).querySelector('tbody');
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${expense.name}</td>
            <td>${expense.category || 'N/A'}</td>
            <td>${expense.price.toFixed(2)}</td>
        `;
        tableBody.appendChild(row);
    }

    updateTotal(total) {
        document.getElementById(this.totalId).innerText = total.toFixed(2);
    }

    clearInputs(...inputs) {
        inputs.forEach(input => {
            input.value = '';
        });
    }

    populateCategories(transactionType) {
        const categorySelect = document.getElementById(this.categorySelectId);
        categorySelect.innerHTML = ''; 

        const categories = transactionType === 'income' 
            ? ['Salary', 'Business', 'Investment'] 
            : ['Food', 'Transport', 'Utilities', 'Entertainment'];

            console.log('categories from ui.js');
            console.log(categories)

        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });
    }
}
