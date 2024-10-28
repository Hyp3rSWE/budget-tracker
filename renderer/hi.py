from flask import Flask, request, send_file
from fpdf import FPDF
from flask_cors import CORS
import sqlite3
import os

app = Flask(__name__)
CORS(app)
def get_expenses():
    # Replace with your actual database connection details
    connection = sqlite3.connect('budget-tracker.db')
    cursor = connection.cursor()
    
    cursor.execute("SELECT description, amount, category_id, date FROM expenses")
    expenses = cursor.fetchall()
    
    connection.close()
    return expenses

@app.route('/export_pdf', methods=['POST'])
def export_pdf():
    expenses = get_expenses()
    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()
    
    pdf.set_font("Arial", size=12)
    pdf.cell(200, 10, 'Expense Report', ln=True, align='C')
    pdf.ln(10)
    
    pdf.cell(40, 10, 'Name', 1)
    pdf.cell(40, 10, 'Price', 1)
    pdf.cell(40, 10, 'Category', 1)
    pdf.cell(40, 10, 'Date', 1)
    pdf.ln()
    
    for name, price, category, date in expenses:
        pdf.cell(40, 10, name, 1)
        pdf.cell(40, 10, str(price), 1)
        pdf.cell(40, 10, category, 1)
        pdf.cell(40, 10, date, 1)
        pdf.ln()
    
    # Save the PDF to a temporary file
    pdf_file_path = 'expense_report.pdf'
    pdf.output(pdf_file_path)

    return send_file(pdf_file_path, as_attachment=True)

if __name__ == '__main__':
    app.run(debug=True)
