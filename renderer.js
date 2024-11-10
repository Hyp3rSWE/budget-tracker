const { ipcRenderer } = require('electron');
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, 'budget.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
        createTables();
    }
});

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

    db.run(createTransactionsTableSQL, handleError);
    db.run(createExpensesTableSQL, handleError);
    db.run(createIncomesTableSQL, handleError);
}

function handleError(err) {
    if (err) {
        console.error('Database error:', err.message);
    }
}

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
                const insertSQL = type === 'expense' ? insertExpenseSQL : insertIncomeSQL;
                db.run(insertSQL, [name, price, category, date], function (err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(this.lastID);
                    }
                });
            }
        });
    });
}

function getAllExpenses() {
    return fetchDataFromTable('expenses');
}

function getAllIncomes() {
    return fetchDataFromTable('incomes');
}

function fetchDataFromTable(table) {
    return new Promise((resolve, reject) => {
        const selectSQL = `SELECT * FROM ${table}`;
        db.all(selectSQL, [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

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
    const rowsPerPage = 10; 


    loadData();

    const transactionTypeSelect = document.getElementById('transactionType');
    transactionTypeSelect.addEventListener('change', () => {
        populateCategories(transactionTypeSelect.value);
    });
    populateCategories(transactionTypeSelect.value);

    addExpenseBtn.addEventListener('click', () => {
        const expenseName = expenseInput.value.trim();
        const price = parseFloat(priceInput.value.trim());
        const category = categorySelect.value;
        const date = dateInput.value;
        const transactionType = transactionTypeSelect.value;

        if (expenseName && !isNaN(price)) {
            const transaction = { name: expenseName, price, category, date, type: transactionType };

            addTransaction(transaction)
                .then(() => {
                    if (transactionType === 'expense') {
                        expenses.push(transaction);
                        loadExpensesTable(expenses);
                    } else {
                        incomes.push(transaction);
                        loadIncomesTable(incomes);
                    }
                    updateTotal();
                    expenseForm.reset();
                })
                .catch(err => {
                    console.error('Error adding transaction:', err);
                });
        }
    });

    filterDateBtn.addEventListener('click', () => {
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;

        const filteredExpenses = filterByDate(expenses, startDate, endDate);
        const filteredIncomes = filterByDate(incomes, startDate, endDate);

        loadExpensesTable(filteredExpenses);
        loadIncomesTable(filteredIncomes);
        updateTotal();
    });

    function filterByDate(data, startDate, endDate) {
        return data.filter(item => {
            const itemDate = new Date(item.date);
            return (!startDate || itemDate >= new Date(startDate)) && (!endDate || itemDate <= new Date(endDate));
        });
    }

    function loadExpensesTable(expenses) {
        const tableBody = document.getElementById('expenseTable').querySelector('tbody');
        tableBody.innerHTML = '';
    
        if (expenses.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center;">No expenses recorded.</td></tr>`;
        } else {
            const startIndex = (currentPage - 1) * rowsPerPage;
            const endIndex = startIndex + rowsPerPage;
            const paginatedExpenses = expenses.slice(startIndex, endIndex);
    
            paginatedExpenses.forEach(expense => {
                const row = createTableRow(expense, 'expense');
                tableBody.appendChild(row);
            });
    
            updatePaginationControls(expenses.length);
        }
    
        addDeleteListeners('expense');
    }

    function updatePaginationControls(totalRows) {
        const totalPages = Math.ceil(totalRows / rowsPerPage);
        const prevButton = document.getElementById('prevPageBtn');
        const nextButton = document.getElementById('nextPageBtn');
        const pageInfo = document.getElementById('pageInfo');
    
        pageInfo.innerText = `Page ${currentPage} of ${totalPages}`;
    
        // Disable "Previous" button if on first page
        prevButton.disabled = currentPage === 1;
    
        // Disable "Next" button if on the last page
        nextButton.disabled = currentPage === totalPages;
    
        // Enable/disable buttons when user clicks
        prevButton.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                loadExpensesTable(expenses);
                loadIncomesTable(incomes);
            }
        });
    
        nextButton.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                loadExpensesTable(expenses);
                loadIncomesTable(incomes);
            }
        });
    }
    
    
    function loadIncomesTable(incomes) {
        const tableBody = document.getElementById('incomeTable').querySelector('tbody');
        tableBody.innerHTML = '';
    
        if (incomes.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center;">No incomes recorded.</td></tr>`;
        } else {
            const startIndex = (currentPage - 1) * rowsPerPage;
            const endIndex = startIndex + rowsPerPage;
            const paginatedIncomes = incomes.slice(startIndex, endIndex);
    
            paginatedIncomes.forEach(income => {
                const row = createTableRow(income, 'income');
                tableBody.appendChild(row);
            });
    
            updatePaginationControls(incomes.length);
        }
    
        addDeleteListeners('income');
    }
    

    function createTableRow(item, type) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.category}</td>
            <td>${item.price.toFixed(2)}</td>
            <td>${item.date}</td>
            <td><button class="deleteBtn" data-id="${item.id}" data-type="${type}">Delete</button></td>
        `;
        return row;
    }

    function addDeleteListeners(type) {
        const deleteButtons = document.querySelectorAll('.deleteBtn');
        deleteButtons.forEach(button => {
            button.addEventListener('click', () => {
                const id = button.getAttribute('data-id');
                deleteTransaction(id, button.getAttribute('data-type'));
            });
        });
    }

    function deleteTransaction(id, type) {
        const deleteTransactionSQL = `DELETE FROM transactions WHERE id = ?`;
        const deleteExpenseSQL = `DELETE FROM expenses WHERE id = ?`;
        const deleteIncomeSQL = `DELETE FROM incomes WHERE id = ?`;

        const deleteSQL = type === 'expense' ? deleteExpenseSQL : deleteIncomeSQL;

        db.run(deleteSQL, [id], (err) => {
            if (err) {
                console.error('Error deleting transaction:', err.message);
            } else {
                if (type === 'expense') {
                    getAllExpenses().then(data => {
                        expenses = data;
                        loadExpensesTable(expenses);
                        updateTotal();
                    }).catch(handleError);
                } else {
                    getAllIncomes().then(data => {
                        incomes = data;
                        loadIncomesTable(incomes);
                        updateTotal();
                    }).catch(handleError);
                }
            }
        });
    }

    function updateTotal() {
        const totalExpenses = expenses.reduce((sum, expense) => sum + expense.price, 0);
        const totalIncomes = incomes.reduce((sum, income) => sum + income.price, 0);
        const balance = totalIncomes - totalExpenses;
        document.getElementById('total').innerText = balance.toFixed(2);
    }

    exportPdfBtn.addEventListener('click', () => {
        const doc = new PDFDocument();
        const fileName = 'transactions_report.pdf';
        const filePath = path.join(__dirname, fileName);

        doc.pipe(fs.createWriteStream(filePath));
        doc.fontSize(24).text('Transactions Report', { align: 'center' });
        doc.moveDown(1);

        doc.lineWidth(1)
           .strokeColor('black')
           .moveTo(50, doc.y)
           .lineTo(550, doc.y)
           .stroke();
        doc.moveDown(1);

        generateTable(doc, 'Expenses', expenses);
        
        doc.moveDown(2);  
        
        generateTable(doc, 'Incomes', incomes);

        doc.end();
        alert('PDF generated successfully!');
    });

    function generateTable(doc, title, data) {
        doc.fontSize(16).font('Helvetica-Bold').text(title, { underline: true });
        doc.fontSize(12).font('Helvetica');
        doc.moveDown(1); // Increased the space between the title and table headers
    
        // Horizontal line for table separation
        doc.lineWidth(1)
           .strokeColor('black')
           .moveTo(50, doc.y)
           .lineTo(550, doc.y)
           .stroke();
        doc.moveDown(0.5);
    
        const headers = ['Name', 'Category', 'Price', 'Date'];
        const rowHeight = 25;
        const columnWidths = [120, 140, 120, 130];
        let startX = 50;
        let startY = doc.y;
    
        doc.font('Helvetica-Bold');
        headers.forEach((header, index) => {
            const x = startX + columnWidths.slice(0, index).reduce((sum, w) => sum + w, 0);
            doc.text(header, x, startY, { width: columnWidths[index], align: 'center' });
        });
        startY += rowHeight;
    
        doc.lineWidth(1)
           .moveTo(50, startY)
           .lineTo(550, startY)
           .stroke();
        startY += 5;
    
        doc.font('Helvetica');
        if (data.length === 0) {
            doc.text('No data available', 50, startY);
            startY += rowHeight;
        } else {
            data.forEach(item => {
                const row = [
                    item.name,
                    item.category,
                    `$${item.price.toFixed(2)}`,
                    item.date
                ];
    
                row.forEach((cell, index) => {
                    const x = startX + columnWidths.slice(0, index).reduce((sum, w) => sum + w, 0);
                    doc.text(cell, x, startY, { width: columnWidths[index], align: 'center' });
                });
    
                startY += rowHeight;
    
                if (startY > 750) {
                    doc.addPage();
                    startY = 50;
                }
            });
        }
    
        doc.lineWidth(1)
           .moveTo(50, startY)
           .lineTo(550, startY)
           .stroke();
        startY += 10;
    }
    

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

        filterCategorySelect.innerHTML = '<option value="all">All</option>';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            filterCategorySelect.appendChild(option);
        });
    }

    function loadData() {
        getAllExpenses().then(data => {
            expenses = data;
            loadExpensesTable(expenses);
            updateTotal();
        }).catch(handleError);
    
        getAllIncomes().then(data => {
            incomes = data;
            loadIncomesTable(incomes);
            updateTotal();
        }).catch(handleError);
    }
    
});
