const { ipcRenderer } = require('electron');
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

// Initialize SQLite database
const dbPath = path.join(__dirname, 'budget.db'); // Specify path for database file
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
        // Create the transactions, expenses, and incomes tables if they don't exist
        createTables();
    }
});

// Create the transactions, expenses, and incomes tables if they don't exist
function createTables() {
    const createTransactionsTableSQL = `
    CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        price REAL,
        category TEXT,
        date TEXT,
        type TEXT
    )`;

    const createExpensesTableSQL = `
    CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        price REAL,
        category TEXT,
        date TEXT
    )`;

    const createIncomesTableSQL = `
    CREATE TABLE IF NOT EXISTS incomes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        price REAL,
        category TEXT,
        date TEXT
    )`;

    db.run(createTransactionsTableSQL, (err) => {
        if (err) {
            console.error('Error creating transactions table:', err.message);
        }
    });
    db.run(createExpensesTableSQL, (err) => {
        if (err) {
            console.error('Error creating expenses table:', err.message);
        }
    });
    db.run(createIncomesTableSQL, (err) => {
        if (err) {
            console.error('Error creating incomes table:', err.message);
        }
    });
}

// Add transaction (expense or income) to the database
function addTransaction(transaction) {
    const { name, price, category, date, type } = transaction;

    const insertTransactionSQL = `INSERT INTO transactions (name, price, category, date, type) VALUES (?, ?, ?, ?, ?)`;
    const insertExpenseSQL = `INSERT INTO expenses (name, price, category, date) VALUES (?, ?, ?, ?)`;
    const insertIncomeSQL = `INSERT INTO incomes (name, price, category, date) VALUES (?, ?, ?, ?)`;

    return new Promise((resolve, reject) => {
        db.run(insertTransactionSQL, [name, price, category, date, type], function (err) {
            if (err) {
                reject(err);
            } else {
                // Insert into the respective table based on the type
                const insertSQL = type === 'expense' ? insertExpenseSQL : insertIncomeSQL;
                db.run(insertSQL, [name, price, category, date], function (err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(this.lastID); // Return the inserted row's ID
                    }
                });
            }
        });
    });
}

// Fetch all transactions from the database
function getAllTransactions() {
    return new Promise((resolve, reject) => {
        const selectSQL = 'SELECT * FROM transactions';
        db.all(selectSQL, [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows); // Return all rows
            }
        });
    });
}

// Fetch all expenses from the database
function getAllExpenses() {
    return new Promise((resolve, reject) => {
        const selectSQL = 'SELECT * FROM expenses';
        db.all(selectSQL, [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows); // Return all rows
            }
        });
    });
}

// Fetch all incomes from the database
function getAllIncomes() {
    return new Promise((resolve, reject) => {
        const selectSQL = 'SELECT * FROM incomes';
        db.all(selectSQL, [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows); // Return all rows
            }
        });
    });
}

// Handle the page's DOM elements
document.addEventListener('DOMContentLoaded', () => {
    const addExpenseBtn = document.getElementById('addExpenseBtn');
    const expenseInput = document.getElementById('expense');
    const priceInput = document.getElementById('price');
    const categorySelect = document.getElementById('category');
    const dateInput = document.getElementById('date');
    const exportPdfBtn = document.getElementById('exportPdfBtn');
    const expenseForm = document.getElementById('expenseForm');
    const filterCategorySelect = document.getElementById('filterCategory');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const filterDateBtn = document.getElementById('filterDateBtn');
    let expenses = [];
    let incomes = [];
    let currentPage = 1;
    const perPage = 10;

    // Load expenses and incomes from the database on start
    getAllExpenses().then(data => {
        expenses = data;
        loadExpensesTable(expenses);
        updateTotal();
    }).catch(err => {
        console.error('Error fetching expenses:', err);
    });

    getAllIncomes().then(data => {
        incomes = data;
        loadIncomesTable(incomes);
        updateTotal();
    }).catch(err => {
        console.error('Error fetching incomes:', err);
    });

    // Dynamically populate categories based on transaction type
    const transactionTypeSelect = document.getElementById('transactionType');
    transactionTypeSelect.addEventListener('change', () => {
        populateCategories(transactionTypeSelect.value);
    });
    populateCategories(transactionTypeSelect.value);

    // Add new expense or income
    addExpenseBtn.addEventListener('click', () => {
        const expenseName = expenseInput.value.trim();
        const price = parseFloat(priceInput.value.trim());
        const category = categorySelect.value;
        const date = dateInput.value;
        const transactionType = transactionTypeSelect.value;

        if (expenseName && !isNaN(price)) {
            const transaction = { name: expenseName, price, category, date, type: transactionType };

            // Add to DB
            addTransaction(transaction).then(() => {
                if (transactionType === 'expense') {
                    expenses.push(transaction);
                    loadExpensesTable(expenses);
                } else {
                    incomes.push(transaction);
                    loadIncomesTable(incomes);
                }

                updateTotal();
                expenseForm.reset();
            }).catch(err => {
                console.error('Error adding transaction:', err);
            });
        }
    });

    // Filter transactions by date
    filterDateBtn.addEventListener('click', () => {
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;

        const filteredExpenses = expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            return (!startDate || expenseDate >= new Date(startDate)) && (!endDate || expenseDate <= new Date(endDate));
        });

        const filteredIncomes = incomes.filter(income => {
            const incomeDate = new Date(income.date);
            return (!startDate || incomeDate >= new Date(startDate)) && (!endDate || incomeDate <= new Date(endDate));
        });

        loadExpensesTable(filteredExpenses);
        loadIncomesTable(filteredIncomes);
        updateTotal();
    });

    // Load expenses into the table
// Load expenses into the table
function loadExpensesTable(expenses) {
    const tableBody = document.getElementById('expenseTable').querySelector('tbody');
    tableBody.innerHTML = '';

    if (expenses.length === 0) {
        const row = document.createElement('tr');
        row.classList.add('no-expenses');
        row.innerHTML = `<td colspan="5" style="text-align: center;">No expenses recorded.</td>`;
        tableBody.appendChild(row);
    }

    expenses.forEach(expense => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${expense.name}</td>
            <td>${expense.category}</td>
            <td>${expense.price.toFixed(2)}</td>
            <td>${expense.date}</td>
            <td><button class="deleteBtn" data-id="${expense.id}">Delete</button></td>
        `;
        tableBody.appendChild(row);
    });

    // Add event listeners for delete buttons
    const deleteButtons = tableBody.querySelectorAll('.deleteBtn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', () => {
            const id = button.getAttribute('data-id');
            deleteTransaction(id, 'expense'); // Pass the type ('expense')
        });
    });
}

// Load incomes into the table
function loadIncomesTable(incomes) {
    const tableBody = document.getElementById('incomeTable').querySelector('tbody');
    tableBody.innerHTML = '';

    if (incomes.length === 0) {
        const row = document.createElement('tr');
        row.classList.add('no-incomes');
        row.innerHTML = `<td colspan="5" style="text-align: center;">No incomes recorded.</td>`;
        tableBody.appendChild(row);
    }

    incomes.forEach(income => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${income.name}</td>
            <td>${income.category}</td>
            <td>${income.price.toFixed(2)}</td>
            <td>${income.date}</td>
            <td><button class="deleteBtn" data-id="${income.id}">Delete</button></td>
        `;
        tableBody.appendChild(row);
    });

    // Add event listeners for delete buttons
    const deleteButtons = tableBody.querySelectorAll('.deleteBtn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', () => {
            const id = button.getAttribute('data-id');
            deleteTransaction(id, 'income'); // Pass the type ('income')
        });
    });
}

// Delete transaction (expense or income) from the database
// Delete transaction (expense or income) from the database
function deleteTransaction(id, type) {
    const deleteTransactionSQL = `DELETE FROM transactions WHERE id = ?`;
    const deleteExpenseSQL = `DELETE FROM expenses WHERE id = ?`;
    const deleteIncomeSQL = `DELETE FROM incomes WHERE id = ?`;

    // Determine the appropriate SQL query based on the type of transaction
    const deleteSQL = type === 'expense' ? deleteExpenseSQL : deleteIncomeSQL;

    db.run(deleteSQL, [id], (err) => {
        if (err) {
            console.error('Error deleting transaction:', err.message);
        } else {
            // Refetch expenses and incomes to reload the tables
            if (type === 'expense') {
                getAllExpenses().then(data => {
                    expenses = data;
                    loadExpensesTable(expenses);
                    updateTotal();
                }).catch(err => {
                    console.error('Error fetching expenses after deletion:', err);
                });
            } else {
                getAllIncomes().then(data => {
                    incomes = data;
                    loadIncomesTable(incomes);
                    updateTotal();
                }).catch(err => {
                    console.error('Error fetching incomes after deletion:', err);
                });
            }
        }
    });
}


    // Update total balance
    function updateTotal() {
        const totalExpenses = expenses.reduce((sum, expense) => sum + expense.price, 0);
        const totalIncomes = incomes.reduce((sum, income) => sum + income.price, 0);
        const balance = totalIncomes - totalExpenses;
        document.getElementById('total').innerText = balance.toFixed(2);
    }

    // Export to PDF
    exportPdfBtn.addEventListener('click', () => {
        const doc = new PDFDocument();
        const fileName = 'transactions_report.pdf';
        const filePath = path.join(__dirname, fileName);

        doc.pipe(fs.createWriteStream(filePath));
        doc.fontSize(20).text('Transactions Report', { align: 'center' });
        doc.moveDown(2);

        // Expenses
        doc.text('Expenses');
        expenses.forEach(expense => {
            doc.text(`${expense.name} - ${expense.category} - $${expense.price.toFixed(2)} - ${expense.date}`);
        });

        doc.moveDown(1);

        // Incomes
        doc.text('Incomes');
        incomes.forEach(income => {
            doc.text(`${income.name} - ${income.category} - $${income.price.toFixed(2)} - ${income.date}`);
        });

        doc.end();
        alert('PDF generated successfully!');
    });

    // Populate categories dynamically
    function populateCategories(transactionType) {
        const categories = transactionType === 'income'
            ? ['Salary', 'Business', 'Investment']
            : ['Food', 'Transport', 'Utilities', 'Entertainment'];

        categorySelect.innerHTML = '';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });

        // Also populate filter categories
        filterCategorySelect.innerHTML = '<option value="all">All</option>';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            filterCategorySelect.appendChild(option);
        });
    }
});
