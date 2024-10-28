const sqlite3 = require('sqlite3').verbose();
const PDFDocument = require('pdfkit');
const blobStream = require('blob-stream');

class ExpenseTracker {
    constructor() {
        this.expenses = []; 
    }

    
    async getExpensesList() {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database('./expenses.db', (err) => {
                if (err) {
                    console.error('Could not connect to database', err);
                    reject(err);
                }
            });

            db.all('SELECT date, description, amount FROM expenses', (err, rows) => {
                if (err) {
                    console.error('Error retrieving expenses', err);
                    reject(err);
                }

                const expenses = rows.map(row => ({
                    date: row.date,
                    description: row.description,
                    amount: row.amount,
                    category: this.category 
                }));

                db.close((err) => {
                    if (err) console.error('Error closing database', err);
                });

                resolve(expenses);
            });
        });
    }

    
    async generatePDF() {
        // Fetch expenses and assign them to the class instance
        this.expenses = await this.getExpensesList();

        const doc = new PDFDocument();
        const stream = doc.pipe(blobStream());

        // Title and formatting
        const title = ` Expenses Report `;
        doc.fontSize(20).text(title, { align: 'center' }).moveDown(1.5);

        // Table Header
        doc.fontSize(14).font('Helvetica-Bold').fillColor('#333333');
        doc.text('Transaction', 50, doc.y, { width: 150, align: 'left' });
        doc.text('Category', 200, doc.y, { width: 150, align: 'left' });
        doc.text('Price', 350, doc.y, { width: 100, align: 'right' });
        doc.text('Date', 450, doc.y, { width: 100, align: 'right' });
        doc.moveDown(0.5).lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();

        // Reset font for table entries and add expenses
        doc.font('Helvetica').fontSize(12).fillColor('#555555');
        this.expenses.forEach((expense, index) => {
            doc.moveDown(0.5);
            doc.text(expense.description, 50, doc.y, { width: 150, align: 'left' });
            doc.text(expense.category, 200, doc.y, { width: 150, align: 'left' });
            doc.text(`$${expense.amount.toFixed(2)}`, 350, doc.y, { width: 100, align: 'right' });
            doc.text(expense.date, 450, doc.y, { width: 100, align: 'right' });

            if (index < this.expenses.length - 1) {
                doc.lineWidth(0.5).moveTo(50, doc.y + 10).lineTo(550, doc.y + 10).dash(2, { space: 4 }).stroke();
            }
        });

        // Finish and download PDF
        doc.end();
        stream.on('finish', () => {
            const blob = stream.toBlob('application/pdf');
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `expenses.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        });
    }
}


document.getElementById('exportPdfBtn').addEventListener('click', async () => {

    const expenseTracker = new ExpenseTracker();
    await expenseTracker.generatePDF();
});
