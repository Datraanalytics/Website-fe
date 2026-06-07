// Global State
let currentFilters = {
    period: '6M',
    propertyType: '',
    saleType: '',
    state: '',
    city: ''
};

let marketValueChart = null;
let transactionChart = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initFilters();
    loadDashboardData();
    setupEventListeners();
});

// Setup Event Listeners
function setupEventListeners() {
    // Period tabs
    document.querySelectorAll('.period-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.period-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentFilters.period = tab.dataset.period;
            loadDashboardData();
        });
    });

    // Filter dropdowns
    document.getElementById('filterPropertyType')?.addEventListener('change', (e) => {
        currentFilters.propertyType = e.target.value;
        loadDashboardData();
    });

    document.getElementById('filterSaleType')?.addEventListener('change', (e) => {
        currentFilters.saleType = e.target.value;
        loadDashboardData();
    });

    document.getElementById('filterState')?.addEventListener('change', (e) => {
        currentFilters.state = e.target.value;
        loadDashboardData();
    });

    document.getElementById('filterCity')?.addEventListener('change', (e) => {
        currentFilters.city = e.target.value;
        loadDashboardData();
    });

    // Search functionality
    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector('.search-btn');
    const heroCity = document.getElementById('heroCity');

    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', () => performSearch(searchInput.value, heroCity?.value));
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch(searchInput.value, heroCity?.value);
            }
        });
    }
}

// Initialize Filters
async function initFilters() {
    const data = await dashboardAPI.getFilters();
    if (!data) return;

    // Populate state dropdown
    const stateSelect = document.getElementById('filterState');
    if (stateSelect && data.states) {
        data.states.forEach(state => {
            const option = document.createElement('option');
            option.value = state;
            option.textContent = state;
            stateSelect.appendChild(option);
        });
    }

    // Populate city dropdowns
    const citySelects = [
        document.getElementById('filterCity'),
        document.getElementById('heroCity'),
        document.getElementById('citySelect')
    ];

    citySelects.forEach(select => {
        if (select && data.cities) {
            data.cities.forEach(city => {
                const option = document.createElement('option');
                option.value = city;
                option.textContent = city;
                select.appendChild(option);
            });
        }
    });
}

// Reset Filters
function resetFilters() {
    currentFilters = {
        period: '6M',
        propertyType: '',
        saleType: '',
        state: '',
        city: ''
    };

    document.querySelectorAll('.period-tab').forEach(t => t.classList.remove('active'));
    document.querySelector('.period-tab[data-period="6M"]')?.classList.add('active');

    document.getElementById('filterPropertyType').value = '';
    document.getElementById('filterSaleType').value = '';
    document.getElementById('filterState').value = '';
    document.getElementById('filterCity').value = '';

    loadDashboardData();
}

// Load Dashboard Data
async function loadDashboardData() {
    const params = {
        period: currentFilters.period,
        property_type: currentFilters.propertyType || undefined,
        sale_type: currentFilters.saleType || undefined,
        state: currentFilters.state || undefined,
        city: currentFilters.city || undefined
    };

    // Load KPI data
    loadKPIData(params);

    // Load city data for table and charts
    loadCityData(params);

    // Load summary data
    loadSummaryData({ period: currentFilters.period });
}

// Load KPI Data
async function loadKPIData(params) {
    const data = await dashboardAPI.getKPI(params);
    if (!data) return;

    document.getElementById('totalTransactions').textContent = formatters.shortNumber(data.total_transactions);
    document.getElementById('totalValue').textContent = formatters.shortNumber(data.total_market_value * 10000000);
    document.getElementById('avgPrice').textContent = formatters.currency(data.average_price);
    document.getElementById('totalArea').textContent = formatters.shortNumber(data.total_area_sold);
}

// Load City Data
async function loadCityData(params) {
    const data = await cityAPI.getAnalytics(params);
    if (!data || !data.cities) return;

    // Update table
    updateCityTable(data.cities);

    // Update charts
    updateCharts(data.cities);
}

// Update City Table
function updateCityTable(cities) {
    const tbody = document.querySelector('#topCitiesTable tbody');
    if (!tbody) return;

    if (!cities || cities.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="loading-text">No data available</td></tr>';
        return;
    }

    tbody.innerHTML = cities.slice(0, 10).map((city, index) => `
        <tr>
            <td><strong>${index + 1}</strong></td>
            <td><strong>${city.city}</strong></td>
            <td>${city.state || '-'}</td>
            <td>${formatters.number(city.total_transactions)}</td>
            <td>₹${formatters.shortNumber(city.total_value * 10000000)}</td>
            <td>${formatters.currency(city.avg_price)}</td>
            <td>
                <a href="locality-analytics.html?city=${encodeURIComponent(city.city)}" class="btn-view">
                    View Details
                </a>
            </td>
        </tr>
    `).join('');
}

// Update Charts
function updateCharts(cities) {
    const topCities = cities.slice(0, 8);
    const labels = topCities.map(c => c.city);
    const marketValues = topCities.map(c => c.total_value);
    const transactions = topCities.map(c => c.total_transactions);

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
                    borderRadius: 6,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: '#f0f0f0' }
                    },
                    x: {
                        grid: { display: false }
                    }
                }
            }
        });
    }

    // Transaction Chart
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
                    backgroundColor: '#06B6D4',
                    borderRadius: 6,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: '#f0f0f0' }
                    },
                    x: {
                        grid: { display: false }
                    }
                }
            }
        });
    }
}

// Load Summary Data
async function loadSummaryData(params) {
    const data = await dashboardAPI.getSummary(params);
    if (!data) return;

    // Residential Sale
    if (data['Residential_Sale']) {
        document.getElementById('resSaleTrans').textContent = formatters.number(data['Residential_Sale'].transactions);
        document.getElementById('resSaleValue').textContent = '₹' + formatters.shortNumber(data['Residential_Sale'].value * 10000000);
        document.getElementById('resSaleAvg').textContent = formatters.currency(data['Residential_Sale'].avg_price);
    }

    // Residential Resale
    if (data['Residential_Resale']) {
        document.getElementById('resResaleTrans').textContent = formatters.number(data['Residential_Resale'].transactions);
        document.getElementById('resResaleValue').textContent = '₹' + formatters.shortNumber(data['Residential_Resale'].value * 10000000);
        document.getElementById('resResaleAvg').textContent = formatters.currency(data['Residential_Resale'].avg_price);
    }

    // Commercial Sale
    if (data['Commercial_Sale']) {
        document.getElementById('comSaleTrans').textContent = formatters.number(data['Commercial_Sale'].transactions);
        document.getElementById('comSaleValue').textContent = '₹' + formatters.shortNumber(data['Commercial_Sale'].value * 10000000);
        document.getElementById('comSaleAvg').textContent = formatters.currency(data['Commercial_Sale'].avg_price);
    }

    // Commercial Resale
    if (data['Commercial_Resale']) {
        document.getElementById('comResaleTrans').textContent = formatters.number(data['Commercial_Resale'].transactions);
        document.getElementById('comResaleValue').textContent = '₹' + formatters.shortNumber(data['Commercial_Resale'].value * 10000000);
        document.getElementById('comResaleAvg').textContent = formatters.currency(data['Commercial_Resale'].avg_price);
    }
}

// Search functionality
async function performSearch(query, city) {
    if (!query || query.trim().length < 2) {
        alert('Please enter at least 2 characters to search');
        return;
    }

    const params = {
        q: query.trim(),
        city: city || undefined,
        period: currentFilters.period
    };

    const data = await dashboardAPI.search(params);
    if (!data) {
        alert('Search failed. Please try again.');
        return;
    }

    displaySearchResults(data, query);
}

// Display search results
function displaySearchResults(data, query) {
    // Remove existing modal if any
    const existingModal = document.getElementById('searchModal');
    if (existingModal) existingModal.remove();

    const hasLocalities = data.localities && data.localities.length > 0;
    const hasDevelopers = data.developers && data.developers.length > 0;

    if (!hasLocalities && !hasDevelopers) {
        alert(`No results found for "${query}"`);
        return;
    }

    // Create modal
    const modal = document.createElement('div');
    modal.id = 'searchModal';
    modal.className = 'search-modal';
    modal.innerHTML = `
        <div class="search-modal-content">
            <div class="search-modal-header">
                <h2>Search Results for "${query}"</h2>
                <button class="modal-close" onclick="closeSearchModal()">&times;</button>
            </div>
            <div class="search-modal-body">
                ${hasLocalities ? `
                    <div class="search-section">
                        <h3>Localities (${data.localities.length})</h3>
                        <div class="search-results-grid">
                            ${data.localities.map(loc => `
                                <div class="search-result-card">
                                    <h4>${loc.locality}</h4>
                                    <p class="location">${loc.city}, ${loc.state}</p>
                                    <div class="result-stats">
                                        <span>Transactions: ${formatters.number(loc.total_transactions)}</span>
                                        <span>Avg Price: ${formatters.currency(loc.avg_price)}</span>
                                        <span>Value: ₹${formatters.shortNumber(loc.total_value * 10000000)}</span>
                                    </div>
                                    <a href="locality-analytics.html?city=${encodeURIComponent(loc.city)}" class="btn-view">View Details</a>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                ${hasDevelopers ? `
                    <div class="search-section">
                        <h3>Developers (${data.developers.length})</h3>
                        <div class="search-results-grid">
                            ${data.developers.map(dev => `
                                <div class="search-result-card">
                                    <h4>${dev.developer}</h4>
                                    <div class="result-stats">
                                        <span>Transactions: ${formatters.number(dev.total_transactions)}</span>
                                        <span>Value: ₹${formatters.shortNumber(dev.total_value * 10000000)}</span>
                                    </div>
                                    <a href="developer-analytics.html" class="btn-view">View Developers</a>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Close on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeSearchModal();
    });
}

function closeSearchModal() {
    const modal = document.getElementById('searchModal');
    if (modal) modal.remove();
}

// Mobile Menu Toggle
function toggleMobileMenu() {
    const nav = document.querySelector('.nav');
    const mobileBtn = document.querySelector('.mobile-menu-btn');

    if (nav) {
        nav.classList.toggle('active');

        // Toggle icon between bars and X
        if (mobileBtn) {
            const icon = mobileBtn.querySelector('i');
            if (icon) {
                if (nav.classList.contains('active')) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-times');
                } else {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        }
    }
}

// Social Sharing Functions
function shareOnLinkedIn() {
    var url = encodeURIComponent(window.location.href);
    window.open('https://www.linkedin.com/sharing/share-offsite/?url=' + url, '_blank', 'width=600,height=500');
}

function shareOnTwitter() {
    var url = encodeURIComponent(window.location.href);
    var title = encodeURIComponent(document.title);
    window.open('https://twitter.com/intent/tweet?url=' + url + '&text=' + title, '_blank', 'width=600,height=400');
}

function shareOnFacebook() {
    var url = encodeURIComponent(window.location.href);
    window.open('https://www.facebook.com/sharer/sharer.php?u=' + url, '_blank', 'width=600,height=500');
}

function copyPageLink() {
    navigator.clipboard.writeText(window.location.href).then(function() {
        var btn = event.currentTarget;
        var icon = btn.querySelector('i');
        icon.classList.remove('fa-link');
        icon.classList.add('fa-check');
        setTimeout(function() {
            icon.classList.remove('fa-check');
            icon.classList.add('fa-link');
        }, 2000);
    });
}

// Close mobile menu when clicking a nav link
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            const nav = document.querySelector('.nav');
            const mobileBtn = document.querySelector('.mobile-menu-btn');
            if (nav && nav.classList.contains('active')) {
                nav.classList.remove('active');
                const icon = mobileBtn?.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });
    });
});
