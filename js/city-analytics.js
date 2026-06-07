// City Analytics Page
let currentFilters = {
    period: '6M',
    propertyType: '',
    state: ''
};

let marketValueChart = null;
let avgPriceChart = null;

document.addEventListener('DOMContentLoaded', () => {
    initFilters();
    loadCityData();
    setupEventListeners();
});

function setupEventListeners() {
    document.querySelectorAll('.period-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.period-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentFilters.period = tab.dataset.period;
            loadCityData();
        });
    });

    document.getElementById('filterPropertyType')?.addEventListener('change', (e) => {
        currentFilters.propertyType = e.target.value;
        loadCityData();
    });

    document.getElementById('filterState')?.addEventListener('change', (e) => {
        currentFilters.state = e.target.value;
        loadCityData();
    });
}

async function initFilters() {
    const data = await dashboardAPI.getFilters();
    if (!data) return;

    const stateSelect = document.getElementById('filterState');
    if (stateSelect && data.states) {
        data.states.forEach(state => {
            const option = document.createElement('option');
            option.value = state;
            option.textContent = state;
            stateSelect.appendChild(option);
        });
    }
}

function resetFilters() {
    currentFilters = { period: '6M', propertyType: '', state: '' };
    document.querySelectorAll('.period-tab').forEach(t => t.classList.remove('active'));
    document.querySelector('.period-tab[data-period="6M"]')?.classList.add('active');
    document.getElementById('filterPropertyType').value = '';
    document.getElementById('filterState').value = '';
    loadCityData();
}

async function loadCityData() {
    const params = {
        period: currentFilters.period,
        transaction_type: currentFilters.propertyType || undefined,
        state: currentFilters.state || undefined
    };

    const data = await cityAPI.getAnalytics(params);
    if (!data) return;

    updateKPIs(data.cities);
    updateCityTable(data.cities);
    updateGainersTable(data.top_gainers);
    updateCharts(data.cities);
}

function updateKPIs(cities) {
    if (!cities) return;

    const totalTrans = cities.reduce((sum, c) => sum + (c.total_transactions || 0), 0);
    const totalVal = cities.reduce((sum, c) => sum + (c.total_value || 0), 0);
    const avgPriceSum = cities.reduce((sum, c) => sum + (c.avg_price || 0), 0);
    const avgPrice = cities.length > 0 ? avgPriceSum / cities.length : 0;

    document.getElementById('totalCities').textContent = cities.length;
    document.getElementById('totalTransactions').textContent = formatters.shortNumber(totalTrans);
    document.getElementById('totalValue').textContent = '₹' + formatters.shortNumber(totalVal * 10000000);
    document.getElementById('avgPrice').textContent = formatters.currency(avgPrice);
}

function updateCityTable(cities) {
    const tbody = document.querySelector('#cityTable tbody');
    if (!tbody) return;

    if (!cities || cities.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="loading-text">No data available</td></tr>';
        return;
    }

    tbody.innerHTML = cities.map((city, index) => `
        <tr onclick="window.location.href='locality-analytics.html?city=${encodeURIComponent(city.city)}'" style="cursor: pointer;">
            <td><strong>${index + 1}</strong></td>
            <td><strong>${city.city}</strong></td>
            <td>${city.state || '-'}</td>
            <td>${formatters.number(city.total_transactions)}</td>
            <td>₹${formatters.shortNumber(city.total_value * 10000000)}</td>
            <td>${formatters.currency(city.avg_price)}</td>
            <td>${city.area_sold ? formatters.shortNumber(city.area_sold) : '0'}</td>
            <td><button class="btn-view">View</button></td>
        </tr>
    `).join('');
}

function updateGainersTable(gainers) {
    const tbody = document.querySelector('#gainersTable tbody');
    if (!tbody) return;

    if (!gainers || gainers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="loading-text">No data available</td></tr>';
        return;
    }

    tbody.innerHTML = gainers.map((g, index) => `
        <tr>
            <td><strong>${index + 1}</strong></td>
            <td><strong>${g.city}</strong></td>
            <td>${formatters.currency(g.price_change)}</td>
        </tr>
    `).join('');
}

function updateCharts(cities) {
    const topCities = cities.slice(0, 10);
    const labels = topCities.map(c => c.city);
    const marketValues = topCities.map(c => c.total_value);
    const avgPrices = topCities.map(c => c.avg_price);

    // Market Value Chart
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
                    backgroundColor: '#2563EB',
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

    // Avg Price Chart
    const ctx2 = document.getElementById('avgPriceChart');
    if (ctx2) {
        if (avgPriceChart) avgPriceChart.destroy();
        avgPriceChart = new Chart(ctx2, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Avg Price (₹/SqFt)',
                    data: avgPrices,
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
