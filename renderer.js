document.addEventListener('DOMContentLoaded', () => {
    const addExpenseBtn = document.getElementById('addExpenseBtn');
    const expenseInput = document.getElementById('expense');
    const priceInput = document.getElementById('price');
    const expenseTable = document.getElementById('expenseTable').getElementsByTagName('tbody')[0];
    const totalLabel = document.getElementById('total');

    // Initial expenses data
    const initialExpenses = [
        { name: 'Veg', price: 40.0 },
        { name: 'Fruit', price: 70.0 },
        { name: 'Fuel', price: 60.0 }
    ];

    // Function to update total
    function updateTotal() {
        let total = 0;
        const rows = expenseTable.getElementsByTagName('tr');
        for (let i = 0; i < rows.length; i++) {
            const priceCell = rows[i].getElementsByTagName('td')[1];
            if (priceCell) {
                total += parseFloat(priceCell.innerText);
            }
        }
        totalLabel.innerText = total.toFixed(2);
    }

    // Function to add an expense to the table
    function addExpenseToTable(expenseName, price) {
        const newRow = expenseTable.insertRow();
        const expenseCell = newRow.insertCell(0);
        const priceCell = newRow.insertCell(1);

        expenseCell.innerText = expenseName;
        priceCell.innerText = price.toFixed(2);
    }

    // Load initial expenses into the table
    function loadInitialExpenses() {
        initialExpenses.forEach(expense => {
            addExpenseToTable(expense.name, expense.price);
        });
        updateTotal();
    }

    // Add expense event listener
    addExpenseBtn.addEventListener('click', () => {
        const expenseName = expenseInput.value.trim();
        const priceText = priceInput.value.trim();

        if (expenseName && priceText) {
            const price = parseFloat(priceText);
            addExpenseToTable(expenseName, price);

            // Clear input fields
            expenseInput.value = '';
            priceInput.value = '';

            updateTotal();
        }
    });

    // Initialize total and load the expenses on page load
    loadInitialExpenses();
});
