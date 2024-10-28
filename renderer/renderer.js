import { ExpenseManager } from './expenseManager.js';
import { UI } from './ui.js';





const expenseManager = new ExpenseManager();
const ui = new UI('expenseTable', 'total', 'category');

let currentPage = 1;
const itemsPerPage = 5; // Set how many items per page

document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    loadExpenses();

    document.getElementById('addExpenseBtn').addEventListener('click', () => {
        const transactionType = document.getElementById('transactionType').value;
        const name = document.getElementById('expense').value;
        const price = parseFloat(document.getElementById('price').value);
        const category = document.getElementById('category').value;
        const date = document.getElementById('date').value;

        if (validateInputs(name, price)) {
            expenseManager.addExpense(name, price, category, date, () => {
                loadExpenses();
                ui.clearInputs(document.getElementById('expense'), document.getElementById('price'));
            });
        }
    });

    document.getElementById('filterDateBtn').addEventListener('click', () => {
        const filterCategory = document.getElementById('filterCategory').value;
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;

        expenseManager.getExpenses({ startDate, endDate, filterCategory }, (expenses) => {
            updatePagination(expenses);
        });
    });

    document.getElementById('filterCategory').addEventListener('change', () => {
        loadExpenses();
    });

    // Handle pagination button clicks
    document.getElementById('prevPageBtn').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            loadExpenses();
        }
    });

    document.getElementById('nextPageBtn').addEventListener('click', () => {
        currentPage++;
        loadExpenses();
    });

    // Handle delete actions
    document.addEventListener('click', (event) => {
        if (event.target.classList.contains('deleteBtn')) {
            const expenseId = event.target.getAttribute('data-id');
            expenseManager.deleteExpense(expenseId, () => {
                ui.removeExpenseFromTable(expenseId);
                updateTotal();
            });
        }
    });
});

function validateInputs(name, price) {
    if (!name || price <= 0) {
        alert('Please enter valid transaction details.');
        return false;
    }
    return true;
}

function loadCategories() {
    const transactionType = document.getElementById('transactionType').value;
    ui.populateCategories(transactionType);
}

function loadExpenses() {
    expenseManager.getExpenses({}, (expenses) => {
        const paginatedExpenses = paginateExpenses(expenses);
        ui.loadExpenses(paginatedExpenses);
        updateTotal();
        updatePaginationInfo(expenses.length);
    });
}

function paginateExpenses(expenses) {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return expenses.slice(startIndex, startIndex + itemsPerPage);
}

function updatePaginationInfo(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    document.getElementById('pageInfo').innerText = `Page ${currentPage} of ${totalPages}`;

    // Disable buttons if at the edges of pagination
    document.getElementById('prevPageBtn').disabled = currentPage === 1;
    document.getElementById('nextPageBtn').disabled = currentPage * itemsPerPage >= totalItems;
}

function updateTotal() {
    expenseManager.calculateTotal((total) => {
        ui.updateTotal(total);
    });
}



document.getElementById('exportPdfBtn').addEventListener('click', exportToPDF);
function exportToPDF() {
    fetch('http://localhost:5000/export_pdf', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
    })
    .then(response => {
        if (response.ok) {
            return response.blob(); // Get the PDF as a blob
        } else {
            throw new Error('Failed to generate PDF');
        }
    })
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'expense_report.pdf';
        document.body.appendChild(a);
        a.click();
        a.remove();
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to export PDF.');
    });
}
