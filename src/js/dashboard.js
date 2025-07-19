/**
 * 🕊️ Healing Studio Dashboard - Modern JavaScript
 * Context7 Chart.js Performance & Accessibility Recommendations
 */

// Modern ES6+ imports and async loading
class HealingStudioDashboard {
    constructor() {
        this.charts = new Map();
        this.currentTab = 'overview';
        this.updateInterval = null;
        this.isInitialized = false;
        
        // Performance optimization: Lazy load Chart.js
        this.chartLibrary = null;
        this.chartLibraryLoading = null; // Track loading state to prevent race conditions
        
        this.init();
    }

    async init() {
        try {
            // Lazy load Chart.js for better performance
            await this.loadChartLibrary();
            
            this.setupEventListeners();
            this.initializeCharts();
            this.startRealTimeUpdates();
            this.updateTimeDisplay();
            
            this.isInitialized = true;
            console.log('🕊️ Healing Studio Dashboard initialized successfully');
        } catch (error) {
            console.error('Failed to initialize dashboard:', error);
            this.showErrorMessage('Dashboard initialization failed. Please refresh the page.');
        }
    }

    async loadChartLibrary() {
        // Prevent multiple simultaneous loading attempts (race condition fix)
        if (this.chartLibrary) {
            return this.chartLibrary; // Already loaded
        }
        
        if (this.chartLibraryLoading) {
            return this.chartLibraryLoading; // Loading in progress, return the promise
        }
        
        // Start loading process
        this.chartLibraryLoading = this._loadChartLibraryInternal();
        
        try {
            const result = await this.chartLibraryLoading;
            this.chartLibraryLoading = null; // Clear loading state
            return result;
        } catch (error) {
            this.chartLibraryLoading = null; // Clear loading state on error
            throw error;
        }
    }

    async _loadChartLibraryInternal() {
        try {
            // Dynamic import for better performance
            const { Chart, registerables } = await import('https://cdn.jsdelivr.net/npm/chart.js@4.4.0/+esm');
            
            // Register all Chart.js components
            Chart.register(...registerables);
            
            // Context7 recommended Chart.js configuration
            Chart.defaults.responsive = true;
            Chart.defaults.maintainAspectRatio = false;
            Chart.defaults.plugins.tooltip.enabled = true;
            Chart.defaults.plugins.legend.position = 'bottom';
            
            // Accessibility improvements
            Chart.defaults.plugins.tooltip.callbacks.label = function(context) {
                return `${context.dataset.label}: ${context.parsed.y}`;
            };
            
            this.chartLibrary = Chart;
            return Chart;
        } catch (error) {
            console.error('Failed to load Chart.js:', error);
            throw new Error('Chart library could not be loaded');
        }
    }

    setupEventListeners() {
        // Tab navigation
        const tabElements = document.querySelectorAll('.nav-tab');
        tabElements.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchTab(tab.dataset.tab);
            });
        });

        // Keyboard navigation support
        tabElements.forEach(tab => {
            tab.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.switchTab(tab.dataset.tab);
                }
            });
        });

        // Responsive chart resizing
        window.addEventListener('resize', this.debounce(() => {
            this.resizeCharts();
        }, 250));
    }

    switchTab(tabName) {
        // Update active tab
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Show/hide content sections
        document.querySelectorAll('.tab-content').forEach(content => {
            content.style.display = 'none';
        });
        document.getElementById(`${tabName}-content`).style.display = 'block';

        this.currentTab = tabName;
        this.resizeCharts();
    }

    async initializeCharts() {
        try {
            // Clear existing charts to prevent memory leaks
            this.destroyExistingCharts();
            
            await this.createProgressChart();
            await this.createAgentActivityChart();
            await this.createMetricsChart();
        } catch (error) {
            console.error('Failed to initialize charts:', error);
        }
    }

    destroyExistingCharts() {
        // Properly destroy existing charts to prevent memory leaks
        this.charts.forEach((chart, key) => {
            if (chart && typeof chart.destroy === 'function') {
                try {
                    chart.destroy();
                } catch (error) {
                    console.warn(`Failed to destroy chart ${key}:`, error);
                }
            }
        });
        this.charts.clear();
    }

    async createProgressChart() {
        const ctx = document.getElementById('progressChart');
        if (!ctx) return;

        // Ensure chart library is loaded before creating chart
        if (!this.chartLibrary) {
            await this.loadChartLibrary();
        }

        const data = {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [{
                label: 'Content Creation',
                data: [65, 78, 85, 92],
                borderColor: '#9CAF88',
                backgroundColor: 'rgba(156, 175, 136, 0.1)',
                tension: 0.4,
                fill: true
            }, {
                label: 'Client Sessions',
                data: [45, 62, 71, 88],
                borderColor: '#8B7355',
                backgroundColor: 'rgba(139, 115, 85, 0.1)',
                tension: 0.4,
                fill: true
            }]
        };

        const config = {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Weekly Progress Overview',
                        color: '#5D4E37',
                        font: {
                            size: 16,
                            weight: '600'
                        }
                    },
                    legend: {
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            padding: 20
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        titleColor: '#5D4E37',
                        bodyColor: '#5D4E37',
                        borderColor: '#9CAF88',
                        borderWidth: 1
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            color: '#666666'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            color: '#666666'
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        };

        this.charts.set('progress', new this.chartLibrary(ctx, config));
    }

    async createAgentActivityChart() {
        const ctx = document.getElementById('agentActivityChart');
        if (!ctx) return;

        // Ensure chart library is loaded before creating chart
        if (!this.chartLibrary) {
            await this.loadChartLibrary();
        }

        const data = {
            labels: ['Aletheia', 'Kairos', 'Serena', 'Aluma'],
            datasets: [{
                label: 'Active Tasks',
                data: [12, 8, 15, 6],
                backgroundColor: [
                    'rgba(156, 175, 136, 0.8)',
                    'rgba(139, 115, 85, 0.8)',
                    'rgba(184, 201, 168, 0.8)',
                    'rgba(212, 196, 183, 0.8)'
                ],
                borderColor: [
                    '#9CAF88',
                    '#8B7355',
                    '#B8C9A8',
                    '#D4C4B7'
                ],
                borderWidth: 2
            }]
        };

        const config = {
            type: 'doughnut',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Agent Activity Distribution',
                        color: '#5D4E37',
                        font: {
                            size: 16,
                            weight: '600'
                        }
                    },
                    legend: {
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            padding: 20
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        titleColor: '#5D4E37',
                        bodyColor: '#5D4E37',
                        borderColor: '#9CAF88',
                        borderWidth: 1
                    }
                },
                cutout: '60%'
            }
        };

        this.charts.set('agentActivity', new this.chartLibrary(ctx, config));
    }

    async createMetricsChart() {
        const ctx = document.getElementById('metricsChart');
        if (!ctx) return;

        // Ensure chart library is loaded before creating chart
        if (!this.chartLibrary) {
            await this.loadChartLibrary();
        }

        const data = {
            labels: ['Projects', 'Clients', 'Content', 'Sessions'],
            datasets: [{
                label: 'Current Month',
                data: [12, 8, 45, 23],
                backgroundColor: 'rgba(156, 175, 136, 0.8)',
                borderColor: '#9CAF88',
                borderWidth: 2
            }, {
                label: 'Previous Month',
                data: [10, 6, 38, 18],
                backgroundColor: 'rgba(139, 115, 85, 0.8)',
                borderColor: '#8B7355',
                borderWidth: 2
            }]
        };

        const config = {
            type: 'bar',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Monthly Metrics Comparison',
                        color: '#5D4E37',
                        font: {
                            size: 16,
                            weight: '600'
                        }
                    },
                    legend: {
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            padding: 20
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        titleColor: '#5D4E37',
                        bodyColor: '#5D4E37',
                        borderColor: '#9CAF88',
                        borderWidth: 1
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            color: '#666666'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            color: '#666666'
                        }
                    }
                }
            }
        };

        this.charts.set('metrics', new this.chartLibrary(ctx, config));
    }

    startRealTimeUpdates() {
        // Update dashboard data every 30 seconds
        this.updateInterval = setInterval(() => {
            this.updateDashboardData();
        }, 30000);

        // Initial update
        this.updateDashboardData();
    }

    async updateDashboardData() {
        try {
            const response = await fetch('/api/dashboard-data');
            if (!response.ok) throw new Error('Failed to fetch dashboard data');
            
            const data = await response.json();
            this.updateAgentStatus(data.agents);
            this.updateMetrics(data.metrics);
            this.updateRecentActivity(data.recentActivity);
            
            // Update last updated time
            this.updateLastUpdated();
        } catch (error) {
            console.error('Failed to update dashboard data:', error);
        }
    }

    updateAgentStatus(agents) {
        const agentContainer = document.querySelector('.agent-grid');
        if (!agentContainer) return;

        agentContainer.innerHTML = agents.map(agent => `
            <div class="agent-card">
                <div class="agent-name">${agent.name}</div>
                <div class="agent-status status ${agent.status}">${agent.status}</div>
                <div class="agent-role">${agent.role}</div>
            </div>
        `).join('');
    }

    updateMetrics(metrics) {
        // Update metric cards
        Object.entries(metrics).forEach(([key, value]) => {
            const element = document.querySelector(`[data-metric="${key}"]`);
            if (element) {
                element.textContent = value;
            }
        });
    }

    updateRecentActivity(activities) {
        const activityContainer = document.querySelector('.recent-activity');
        if (!activityContainer) return;

        activityContainer.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">${this.getActivityIcon(activity.type)}</div>
                <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-time">${this.formatTime(activity.timestamp)}</div>
                </div>
            </div>
        `).join('');
    }

    getActivityIcon(type) {
        const icons = {
            'content_created': '📝',
            'client_session': '🕊️',
            'project_completed': '✅'
        };
        return icons[type] || '📊';
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return date.toLocaleDateString();
    }

    updateTimeDisplay() {
        const timeElement = document.querySelector('.current-time');
        if (!timeElement) return;

        const updateTime = () => {
            const now = new Date();
            timeElement.textContent = now.toLocaleTimeString('en-US', {
                hour12: true,
                hour: 'numeric',
                minute: '2-digit',
                second: '2-digit'
            });
        };

        updateTime();
        setInterval(updateTime, 1000);
    }

    updateLastUpdated() {
        const element = document.querySelector('.last-updated');
        if (!element) return;

        element.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
    }

    resizeCharts() {
        this.charts.forEach(chart => {
            if (chart && typeof chart.resize === 'function') {
                chart.resize();
            }
        });
    }

    showErrorMessage(message) {
        // Create error notification
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-notification';
        errorDiv.innerHTML = `
            <div class="error-content">
                <span class="error-icon">⚠️</span>
                <span class="error-message">${message}</span>
                <button class="error-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        document.body.appendChild(errorDiv);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentElement) {
                errorDiv.remove();
            }
        }, 5000);
    }

    // Utility function for debouncing
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Cleanup method
    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        this.charts.forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        
        this.charts.clear();
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.documentElement.style.setProperty('--transition-normal', '0ms');
        document.documentElement.style.setProperty('--transition-fast', '0ms');
    }
    
    // Initialize dashboard
    window.healingStudioDashboard = new HealingStudioDashboard();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.healingStudioDashboard) {
        window.healingStudioDashboard.destroy();
    }
}); 