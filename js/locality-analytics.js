// Locality Analytics Page
let currentCity = '';
let currentPeriod = '6M';
let marketValueChart = null;
let avgPriceChart = null;

document.addEventListener('DOMContentLoaded', () => {
    initPage();
    setupEventListeners();
});

async function initPage() {
    // Load cities
    const data = await dashboardAPI.getFilters();
    if (data && data.cities) {
        const citySelect = document.getElementById('citySelect');
        data.cities.forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            citySelect.appendChild(option);
        });
    }

    // Check URL params
    const urlParams = new URLSearchParams(window.location.search);
    const cityFromUrl = urlParams.get('city');
    if (cityFromUrl) {
        document.getElementById('citySelect').value = cityFromUrl;
        currentCity = cityFromUrl;
        loadLocalityData();
    }
}

function setupEventListeners() {
    document.getElementById('citySelect').addEventListener('change', (e) => {
        currentCity = e.target.value;
        if (currentCity) {
            loadLocalityData();
        } else {
            document.getElementById('noCityState').style.display = 'block';
            document.getElementById('cityDataSection').style.display = 'none';
        }
    });

    document.querySelectorAll('.period-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.period-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentPeriod = tab.dataset.period;
            if (currentCity) loadLocalityData();
        });
    });
}

async function loadLocalityData() {
    if (!currentCity) return;

    document.getElementById('noCityState').style.display = 'none';
    document.getElementById('cityDataSection').style.display = 'block';
    document.getElementById('selectedCityName').textContent = currentCity;

    const data = await localityAPI.getAnalytics({
        city: currentCity,
        period: currentPeriod
    });

    if (!data || !data.localities) return;

    updateKPIs(data.localities);
    updateTable(data.localities);
    updateCharts(data.localities);
}

function updateKPIs(localities) {
    const totalTrans = localities.reduce((sum, l) => sum + (l.total_transactions || 0), 0);
    const totalVal = localities.reduce((sum, l) => sum + (l.total_value || 0), 0);
    const avgPriceSum = localities.reduce((sum, l) => sum + (l.avg_price || 0), 0);
    const avgPrice = localities.length > 0 ? avgPriceSum / localities.length : 0;

    document.getElementById('totalLocalities').textContent = localities.length;
    document.getElementById('totalTransactions').textContent = formatters.shortNumber(totalTrans);
    document.getElementById('totalValue').textContent = '₹' + formatters.shortNumber(totalVal * 10000000);
    document.getElementById('avgPrice').textContent = formatters.currency(avgPrice);
}

function updateTable(localities) {
    const tbody = document.querySelector('#localityTable tbody');
    if (!tbody) return;

    if (localities.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="loading-text">No locality data available</td></tr>';
        return;
    }

    // Show only top 10 localities
    const top10 = localities.slice(0, 10);

    tbody.innerHTML = top10.map((loc, index) => `
        <tr>
            <td><strong>${index + 1}</strong></td>
            <td><strong>${loc.locality || 'Unknown'}</strong></td>
            <td>${formatters.number(loc.total_transactions)}</td>
            <td>${formatters.currency(loc.avg_price)}</td>
            <td>₹${formatters.shortNumber(loc.total_value * 10000000)}</td>
            <td>${loc.area_sold ? formatters.shortNumber(loc.area_sold) : '0'}</td>
        </tr>
    `).join('');
}

function updateCharts(localities) {
    const topLocalities = localities.slice(0, 8);
    const labels = topLocalities.map(l => {
        const name = l.locality || 'Unknown';
        return name.length > 12 ? name.substring(0, 12) + '...' : name;
    });
    const marketValues = topLocalities.map(l => l.total_value);
    const avgPrices = topLocalities.map(l => l.avg_price);

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
