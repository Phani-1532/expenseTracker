let expenses = [];
let totalAmount = 0;

// DOM Elements
const categorySelect = document.getElementById('category-select');
const amountInput = document.getElementById('amount-input');
const dateInput = document.getElementById('date-input');
const addBtn = document.getElementById('add-btn');
const expenseTableBody = document.getElementById('expense-table-body');
const totalAmountCell = document.getElementById('total-amount');
const filterCategory = document.getElementById('filter-category');
const exportBtn = document.getElementById('export-btn');
const importFile = document.getElementById('import-file');
const chartCanvas = document.getElementById('expense-chart');

let editingExpense = null;

// Save expenses to localStorage
const saveToLocalStorage = () => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
};

// Load expenses from localStorage
const loadFromLocalStorage = () => {
    const storedExpenses = localStorage.getItem('expenses');
    if (storedExpenses) {
        expenses = JSON.parse(storedExpenses);
        expenses.forEach(addExpenseToTable);
        updateTotalAmount();
        updateChart();
    }
};

// Initialize Chart
let expenseChart = null;

const updateChart = () => {
    const categories = [...new Set(expenses.map(e => e.category))];
    const data = categories.map(cat =>
        expenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0)
    );

    if (expenseChart) expenseChart.destroy();

    expenseChart = new Chart(chartCanvas, {
        type: 'pie',
        data: {
            labels: categories,
            datasets: [{
                data,
                backgroundColor: ['#ff6384', '#36a2eb', '#cc65fe', '#ffce56', '#34eb77'],
                hoverBackgroundColor: ['#ff4d72', '#309ade', '#a855f7', '#ffbe3b', '#28c970'],
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'right', // Places the legend below the chart
                    labels: {
                        font: {
                            size: 17 // Increases font size for readability
                        },
                        color: '#ffffff', // Ensures the text is visible
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            return `${label}: $${value.toFixed(2)}`;
                        }
                    }
                }
            }
        }
    });
};


// Update Total Amount
const updateTotalAmount = () => {
    totalAmountCell.textContent = expenses.reduce((sum, e) => sum + e.amount, 0).toFixed(2);
};

// Add Expense to Table
const addExpenseToTable = (expense) => {
    const row = expenseTableBody.insertRow();

    row.insertCell().textContent = expense.category;
    row.insertCell().textContent = expense.amount.toFixed(2);
    row.insertCell().textContent = expense.date;

    const actionsCell = row.insertCell();

    // Create Delete Button
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.classList.add('delete-btn');
    deleteBtn.addEventListener('click', () => {
        expenses = expenses.filter(e => e !== expense);
        updateTotalAmount();
        updateChart();
        saveToLocalStorage(); // Save updated data
        row.remove();
    });

    // Create Edit Button
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.classList.add('btn');
    editBtn.addEventListener('click', () => {
        categorySelect.value = expense.category;
        amountInput.value = expense.amount;
        dateInput.value = expense.date;
        editingExpense = expense;
    });

    // Append buttons side by side
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.gap = '10px'; // Space between buttons
    buttonContainer.appendChild(editBtn);
    buttonContainer.appendChild(deleteBtn);

    actionsCell.appendChild(buttonContainer);
};

// Add or Update Expense
addBtn.addEventListener('click', () => {
    const category = categorySelect.value;
    const amount = parseFloat(amountInput.value);
    const date = dateInput.value;

    if (!category || isNaN(amount) || !date) {
        alert('Please fill all fields correctly.');
        return;
    }

    if (editingExpense) {
        // Update existing expense
        editingExpense.category = category;
        editingExpense.amount = amount;
        editingExpense.date = date;
        editingExpense = null;
        expenseTableBody.innerHTML = '';
        expenses.forEach(addExpenseToTable);
    } else {
        // Add new expense
        const expense = { category, amount, date };
        expenses.push(expense);
        addExpenseToTable(expense);
    }

    updateTotalAmount();
    updateChart();
    saveToLocalStorage(); // Save updated data
    categorySelect.value = '';
    amountInput.value = '';
    dateInput.value = '';
});

// Filter Transactions
filterCategory.addEventListener('change', () => {
    const filter = filterCategory.value;
    expenseTableBody.innerHTML = '';
    const filteredExpenses = filter ? expenses.filter(e => e.category === filter) : expenses;
    filteredExpenses.forEach(addExpenseToTable);

    const filteredTotal = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    totalAmountCell.textContent = filteredTotal.toFixed(2);
});

// Export Data
exportBtn.addEventListener('click', () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(expenses));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'expenses.json');
    downloadAnchor.click();
});

// Import Data
importFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const importedExpenses = JSON.parse(event.target.result);
            expenses = [...expenses, ...importedExpenses];
            expenseTableBody.innerHTML = '';
            expenses.forEach(addExpenseToTable);
            updateTotalAmount();
            updateChart();
            saveToLocalStorage(); // Save imported data
        } catch (err) {
            alert('Invalid file format.');
        }
    };
    reader.readAsText(file);
});

// Load data from localStorage on page load
document.addEventListener('DOMContentLoaded', loadFromLocalStorage);
