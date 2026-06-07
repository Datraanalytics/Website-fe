// Developer Analytics Page
let currentFilters = { period: '6M' };
let marketValueChart = null;
let transactionChart = null;

document.addEventListener('DOMContentLoaded', () => {
    loadDeveloperData();
    setupEventListeners();
});

function setupEventListeners() {
    document.querySelectorAll('.period-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.period-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentFilters.period = tab.dataset.period;
            loadDeveloperData();
        });
    });
}

function resetFilters() {
    currentFilters = { period: '6M' };
    document.querySelectorAll('.period-tab').forEach(t => t.classList.remove('active'));
    document.querySelector('.period-tab[data-period="6M"]')?.classList.add('active');
    loadDeveloperData();
}

async function loadDeveloperData() {
    const data = await developerAPI.getTop({
        period: currentFilters.period
    });

    if (!data || !Array.isArray(data)) {
        document.querySelector('#developerTable tbody').innerHTML =
            '<tr><td colspan="4" class="loading-text">No developer data available</td></tr>';
        return;
    }

    updateTable(data);
    updateCharts(data);
}

function updateTable(developers) {
    const tbody = document.querySelector('#developerTable tbody');
    if (!tbody) return;

    if (developers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="loading-text">No developer data available</td></tr>';
        return;
    }

    tbody.innerHTML = developers.map((dev) => `
        <tr>
            <td><strong>${dev.rank}</strong></td>
            <td><strong>${dev.developer}</strong></td>
            <td>${formatters.number(dev.total_transactions)}</td>
            <td>₹${formatters.shortNumber(dev.total_value * 10000000)}</td>
        </tr>
    `).join('');
}

function updateCharts(developers) {
    const topDevs = developers.slice(0, 8);
    const labels = topDevs.map(d => {
        const name = d.developer || 'Unknown';
        return name.length > 12 ? name.substring(0, 12) + '...' : name;
    });
    const marketValues = topDevs.map(d => d.total_value);
    const transactions = topDevs.map(d => d.total_transactions);

    const ctx1 = document.getElementById('marketValueChart');
    if (ctx1) {
        if (marketValueChart) marketValueChart.destroy();
        marketValueChart = new Chart(ctx1, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Market Value (Cr)',
                    data: marketValues,
                    backgroundColor: '#5E449B',
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { color: '#f0f0f0' } },
                    x: { grid: { display: false } }
                }
            }
        });
    }

    const ctx2 = document.getElementById('transactionChart');
    if (ctx2) {
        if (transactionChart) transactionChart.destroy();
        transactionChart = new Chart(ctx2, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Transactions',
                    data: transactions,
                    backgroundColor: '#EC4899',
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { color: '#f0f0f0' } },
                    x: { grid: { display: false } }
                }
            }
        });
    }
}
