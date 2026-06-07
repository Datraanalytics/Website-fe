// Rental Analytics Page
let currentPeriod = '6M';
let rentChart = null;
let gainerChart = null;

document.addEventListener('DOMContentLoaded', () => {
    loadRentalData();
    setupEventListeners();
});

function setupEventListeners() {
    document.querySelectorAll('.period-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.period-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentPeriod = tab.dataset.period;
            loadRentalData();
        });
    });
}

function resetFilters() {
    currentPeriod = '6M';
    document.querySelectorAll('.period-tab').forEach(t => t.classList.remove('active'));
    document.querySelector('.period-tab[data-period="6M"]')?.classList.add('active');
    loadRentalData();
}

async function loadRentalData() {
    const [citiesData, gainersData] = await Promise.all([
        rentalAPI.getCities({ period: currentPeriod }),
        rentalAPI.getTopGainers({ period: currentPeriod })
    ]);

    updateRentalTable(citiesData);
    updateGainersTable(gainersData);
    updateCharts(citiesData, gainersData);
}

function updateRentalTable(data) {
    const tbody = document.querySelector('#rentalTable tbody');
    if (!tbody) return;

    if (!data || !Array.isArray(data) || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="loading-text">No rental data available</td></tr>';
        return;
    }

    tbody.innerHTML = data.map((city) => `
        <tr>
            <td><strong>${city.rank}</strong></td>
            <td><strong>${city.city}</strong></td>
            <td>${city.state || '-'}</td>
            <td>${formatters.currency(city.avg_rent)}</td>
            <td>${formatters.number(city.total_transactions)}</td>
        </tr>
    `).join('');
}

function updateGainersTable(data) {
    const tbody = document.querySelector('#gainersTable tbody');
    if (!tbody) return;

    if (!data || !Array.isArray(data) || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="loading-text">No gainer data available</td></tr>';
        return;
    }

    tbody.innerHTML = data.map((g) => `
        <tr>
            <td><strong>${g.rank}</strong></td>
            <td><strong>${g.city}</strong></td>
            <td>${g.locality || '-'}</td>
            <td>${formatters.currency(g.avg_rent)}</td>
        </tr>
    `).join('');
}

function updateCharts(citiesData, gainersData) {
    // Rent Chart
    if (Array.isArray(citiesData) && citiesData.length > 0) {
        const topCities = citiesData.slice(0, 8);
        const labels = topCities.map(c => c.city);
        const rents = topCities.map(c => c.avg_rent);

        const ctx1 = document.getElementById('rentChart');
        if (ctx1) {
            if (rentChart) rentChart.destroy();
            rentChart = new Chart(ctx1, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Avg Rent (₹/SqFt)',
                        data: rents,
                        backgroundColor: '#06B6D4',
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

    // Gainer Chart (top localities by rent)
    if (Array.isArray(gainersData) && gainersData.length > 0) {
        const topGainers = gainersData.slice(0, 8);
        const labels = topGainers.map(g => g.locality || g.city);
        const rents = topGainers.map(g => g.avg_rent);

        const ctx2 = document.getElementById('gainerChart');
        if (ctx2) {
            if (gainerChart) gainerChart.destroy();
            gainerChart = new Chart(ctx2, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Avg Rent (₹/SqFt)',
                        data: rents,
                        backgroundColor: '#84CC16',
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
}
