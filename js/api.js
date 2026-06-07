// API Configuration
// Use relative URL in production (nginx proxies /api to backend)
// Use localhost:8000 for local development
const API_BASE_URL = window.location.hostname === 'localhost' && window.location.port === '3000'
    ? 'http://localhost:8000'
    : window.location.origin;

// API Helper Functions
const api = {
    async get(endpoint, params = {}) {
        const url = new URL(`${API_BASE_URL}${endpoint}`);
        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== '') {
                url.searchParams.append(key, params[key]);
            }
        });

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('API Error');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return null;
        }
    }
};

// Dashboard API
const dashboardAPI = {
    getKPI: (params) => api.get('/api/dashboard/kpi', params),
    getFilters: () => api.get('/api/dashboard/filters'),
    getTrends: (params) => api.get('/api/dashboard/trends', params),
    getSummary: (params) => api.get('/api/dashboard/summary', params),
    search: (params) => api.get('/api/dashboard/search', params)
};

// City API
const cityAPI = {
    getAnalytics: (params) => api.get('/api/city-analytics', params),
    getRanking: (params) => api.get('/api/city-analytics/ranking', params)
};

// Locality API
const localityAPI = {
    getAnalytics: (params) => api.get('/api/locality', params),
    getTop: (params) => api.get('/api/locality/top', params)
};

// Developer API
const developerAPI = {
    getTop: (params) => api.get('/api/developers/top', params)
};

// Project API
const projectAPI = {
    getTopGainers: (params) => api.get('/api/projects/top-gainers', params)
};

// Rental API
const rentalAPI = {
    getCities: (params) => api.get('/api/rental/cities', params),
    getTopGainers: (params) => api.get('/api/rental/top-gainers', params)
};

// Format Helpers
const formatters = {
    number: (num) => {
        if (!num) return '0';
        return num.toLocaleString('en-IN');
    },

    currency: (num) => {
        if (!num) return '₹0';
        if (num >= 10000000) return '₹' + (num / 10000000).toFixed(2) + ' Cr';
        if (num >= 100000) return '₹' + (num / 100000).toFixed(2) + ' L';
        if (num >= 1000) return '₹' + (num / 1000).toFixed(2) + ' K';
        return '₹' + num.toLocaleString('en-IN');
    },

    shortNumber: (num) => {
        if (!num) return '0';
        if (num >= 10000000) return (num / 10000000).toFixed(2) + ' Cr';
        if (num >= 100000) return (num / 100000).toFixed(2) + ' L';
        if (num >= 1000) return (num / 1000).toFixed(1) + ' K';
        return num.toLocaleString('en-IN');
    },

    percent: (num) => {
        if (!num) return '0%';
        const sign = num >= 0 ? '+' : '';
        return sign + num.toFixed(2) + '%';
    },

    area: (num) => {
        if (!num) return '0';
        return num.toFixed(2);
    }
};
