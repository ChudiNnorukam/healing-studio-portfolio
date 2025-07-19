class DashboardManager {
    constructor() {
        this.chart = null;
        this.updateInterval = null;
        this.init();
    }

    async init() {
        await this.loadData();
        this.setupChart();
        this.startAutoRefresh();
    }

    async loadData() {
        try {
            const [agents, results, metrics] = await Promise.all([
                fetch('/api/agents').then(r => r.json()),
                fetch('/api/results').then(r => r.json()),
                fetch('/api/metrics').then(r => r.json())
            ]);

            this.updateOverview(agents, results, metrics);
            this.updateAgentList(agents);
            this.updateAuditResults(results);
            this.updateChart(metrics);
            this.updateLastUpdate();
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        }
    }

    updateOverview(agents, results, metrics) {
        const activeAgents = Object.keys(agents).length;
        const totalAudits = results.length;
        
        let totalDuration = 0;
        let successfulAudits = 0;
        
        results.forEach(result => {
            if (result.duration) totalDuration += result.duration;
            if (result.result && (result.result.score > 0 || result.result.overall > 0)) {
                successfulAudits++;
            }
        });

        const avgDuration = totalAudits > 0 ? Math.round(totalDuration / totalAudits) : 0;
        const successRate = totalAudits > 0 ? Math.round((successfulAudits / totalAudits) * 100) : 0;

        document.getElementById('activeAgents').textContent = activeAgents;
        document.getElementById('totalAudits').textContent = totalAudits;
        document.getElementById('avgDuration').textContent = `${avgDuration}ms`;
        document.getElementById('successRate').textContent = `${successRate}%`;
    }

    updateAgentList(agents) {
        const agentList = document.getElementById('agentList');
        agentList.innerHTML = '';

        Object.entries(agents).forEach(([agentId, summary]) => {
            if (summary.error) {
                agentList.innerHTML += `
                    <div class="p-4 border border-red-200 rounded-lg bg-red-50">
                        <div class="flex items-center justify-between">
                            <div>
                                <h3 class="font-medium text-red-900">${agentId}</h3>
                                <p class="text-sm text-red-600">${summary.error}</p>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                const statusClass = summary.performance.successRate > 80 ? 'status-active' : 
                                  summary.performance.successRate > 60 ? 'status-optimizing' : 'status-inactive';
                
                agentList.innerHTML += `
                    <div class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div class="flex items-center justify-between">
                            <div class="flex-1">
                                <h3 class="font-medium text-gray-900">${agentId}</h3>
                                <div class="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                                    <span>Audits: ${summary.performance.totalAudits}</span>
                                    <span>Score: ${summary.performance.averageScore}</span>
                                    <span>Success: ${summary.performance.successRate}%</span>
                                </div>
                            </div>
                            <div class="flex items-center space-x-2">
                                <div class="w-3 h-3 rounded-full ${statusClass}"></div>
                                <button onclick="optimizeAgent('${agentId}')" class="text-blue-600 hover:text-blue-800 text-sm">
                                    Optimize
                                </button>
                                <button onclick="toggleAgent('${agentId}')" class="text-gray-600 hover:text-gray-800 text-sm">
                                    Toggle
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }
        });
    }

    updateAuditResults(results) {
        const resultsContainer = document.getElementById('auditResults');
        resultsContainer.innerHTML = '';

        results.slice(-10).reverse().forEach(result => {
            const score = result.result.score || result.result.overall || 'N/A';
            const scoreColor = score > 80 ? 'text-green-600' : score > 60 ? 'text-yellow-600' : 'text-red-600';
            
            resultsContainer.innerHTML += `
                <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div class="flex-1">
                        <div class="flex items-center space-x-4">
                            <span class="font-medium text-gray-900">${result.type}</span>
                            <span class="text-sm text-gray-500">${result.agentId}</span>
                            <span class="text-sm text-gray-500">Depth: ${result.depth}</span>
                        </div>
                        <div class="mt-1 text-sm text-gray-600">
                            ${new Date(result.timestamp).toLocaleString()}
                        </div>
                    </div>
                    <div class="flex items-center space-x-4 text-sm">
                        <span class="text-gray-500">${result.duration}ms</span>
                        <span class="font-medium ${scoreColor}">${score}</span>
                    </div>
                </div>
            `;
        });
    }

    setupChart() {
        const ctx = document.getElementById('performanceChart').getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Average Score',
                    data: [],
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.1
                }, {
                    label: 'Success Rate',
                    data: [],
                    borderColor: 'rgb(34, 197, 94)',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }

    updateChart(metrics) {
        if (!this.chart) return;

        const labels = [];
        const scores = [];
        const successRates = [];

        Object.entries(metrics).forEach(([agentId, agentMetrics]) => {
            if (agentMetrics.length > 0) {
                const recentMetrics = agentMetrics.slice(-10);
                recentMetrics.forEach((metric, index) => {
                    const label = `${agentId.slice(-8)} - ${index + 1}`;
                    labels.push(label);
                    scores.push(metric.score);
                    successRates.push(metric.score > 0 ? 100 : 0);
                });
            }
        });

        this.chart.data.labels = labels;
        this.chart.data.datasets[0].data = scores;
        this.chart.data.datasets[1].data = successRates;
        this.chart.update();
    }

    updateLastUpdate() {
        document.getElementById('lastUpdate').textContent = 
            `Last updated: ${new Date().toLocaleTimeString()}`;
    }

    startAutoRefresh() {
        this.updateInterval = setInterval(() => {
            this.loadData();
        }, 30000); // Refresh every 30 seconds
    }

    stopAutoRefresh() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }
}

// Global functions for button interactions
async function refreshData() {
    await dashboard.loadData();
}

async function createAgent() {
    const agentType = document.getElementById('agentType').value;
    const config = {
        auditInterval: 300000,
        maxConcurrentAudits: 3,
        auditDepth: 3,
        maxRetries: 2
    };

    try {
        const response = await fetch('/api/agents/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ agentType, config })
        });

        if (response.ok) {
            await refreshData();
        } else {
            console.error('Failed to create agent');
        }
    } catch (error) {
        console.error('Error creating agent:', error);
    }
}

async function optimizeAgent(agentId) {
    try {
        const response = await fetch(`/api/agents/${agentId}/optimize`, {
            method: 'POST'
        });

        if (response.ok) {
            await refreshData();
        } else {
            console.error('Failed to optimize agent');
        }
    } catch (error) {
        console.error('Error optimizing agent:', error);
    }
}

async function toggleAgent(agentId) {
    try {
        const response = await fetch(`/api/agents/${agentId}/stop`, {
            method: 'POST'
        });

        if (response.ok) {
            await refreshData();
        } else {
            console.error('Failed to toggle agent');
        }
    } catch (error) {
        console.error('Error toggling agent:', error);
    }
}

// Initialize dashboard
const dashboard = new DashboardManager();

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    dashboard.stopAutoRefresh();
}); 