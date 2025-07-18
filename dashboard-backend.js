// 🕊️ Chudi Nnorukam Healing Studio - Dashboard Backend System
// 🎭 BMAD Full-Stack Agent Team - Real-time Data Management

class HealingStudioDashboardBackend {
    constructor() {
        this.agents = {
            architect: {
                name: "🏗️ Architect Agent",
                status: "online",
                role: "System Design & Structure",
                tasks: [],
                performance: { completed: 12, total: 15, successRate: 80 }
            },
            dev: {
                name: "💻 Dev Agent",
                status: "online",
                role: "Technical Implementation & Optimization",
                tasks: [],
                performance: { completed: 16, total: 18, successRate: 89 }
            },
            qa: {
                name: "🔍 QA Specialist",
                status: "online",
                role: "Quality Assurance & Validation",
                tasks: [],
                performance: { completed: 11, total: 12, successRate: 92 }
            },
            aletheia: {
                name: "🕊️ Aletheia",
                status: "online",
                role: "Content Quality & Therapeutic Alignment",
                tasks: [],
                performance: { completed: 13, total: 14, successRate: 93 }
            },
            business: {
                name: "💼 Business Strategist",
                status: "online",
                role: "Strategic Planning & Growth",
                tasks: [],
                performance: { completed: 8, total: 10, successRate: 80 }
            },
            analyst: {
                name: "📊 Analyst Agent",
                status: "online",
                role: "Data Analysis & Progress Tracking",
                tasks: [],
                performance: { completed: 7, total: 8, successRate: 88 }
            },
            seo: {
                name: "📱 SEO Specialist",
                status: "online",
                role: "Digital Presence & Optimization",
                tasks: [],
                performance: { completed: 8, total: 9, successRate: 89 }
            },
            ux: {
                name: "🎨 UX Expert",
                status: "online",
                role: "User Experience & Design Excellence",
                tasks: [],
                performance: { completed: 10, total: 11, successRate: 91 }
            }
        };

        this.projects = {
            portfolio: {
                name: "Portfolio Development",
                status: "completed",
                progress: 100,
                startDate: "2025-07-17T14:00:00Z",
                endDate: "2025-07-17T15:30:00Z",
                tasks: [
                    { name: "GitHub Repository Setup", status: "completed", agent: "dev" },
                    { name: "GitHub Pages Configuration", status: "completed", agent: "dev" },
                    { name: "Profile Photo Integration", status: "completed", agent: "ux" },
                    { name: "Color Scheme Update", status: "completed", agent: "ux" }
                ]
            },
            dashboard: {
                name: "Dashboard System",
                status: "in-progress",
                progress: 85,
                startDate: "2025-07-17T15:30:00Z",
                endDate: null,
                tasks: [
                    { name: "Frontend Development", status: "completed", agent: "dev" },
                    { name: "Backend System", status: "in-progress", agent: "dev" },
                    { name: "Real-time Updates", status: "pending", agent: "dev" },
                    { name: "Data Integration", status: "pending", agent: "analyst" }
                ]
            },
            thumbnail: {
                name: "Professional Thumbnail",
                status: "pending",
                progress: 0,
                startDate: null,
                endDate: null,
                tasks: [
                    { name: "DALL-E 3 Generation", status: "pending", agent: "ux" },
                    { name: "Brand Alignment", status: "pending", agent: "aletheia" },
                    { name: "Platform Optimization", status: "pending", agent: "seo" }
                ]
            }
        };

        this.metrics = {
            daily: {
                tasksCompleted: 12,
                timeSpent: "1.5 hours",
                productivity: 85,
                goals: 3,
                goalsCompleted: 2
            },
            weekly: {
                tasksCompleted: 22,
                projects: 3,
                projectsCompleted: 1,
                clientInteractions: 0,
                revenue: 0
            },
            monthly: {
                tasksCompleted: 45,
                projects: 5,
                clients: 0,
                revenue: 0,
                growth: 0
            }
        };

        this.activities = [];
        this.goals = [];
        this.analytics = {};

        this.init();
    }

    init() {
        this.loadInitialData();
        this.startRealTimeUpdates();
        this.setupEventListeners();
    }

    loadInitialData() {
        // Load historical data
        this.loadActivities();
        this.loadGoals();
        this.loadAnalytics();
    }

    loadActivities() {
        const today = new Date();
        this.activities = [
            {
                id: 1,
                type: "task_completed",
                title: "Portfolio Deployed",
                description: "GitHub Pages deployment completed successfully",
                agent: "dev",
                timestamp: new Date(today.getTime() - 2 * 60 * 1000), // 2 minutes ago
                impact: "high"
            },
            {
                id: 2,
                type: "design_update",
                title: "Color Scheme Updated",
                description: "Warm healing palette applied to portfolio",
                agent: "ux",
                timestamp: new Date(today.getTime() - 5 * 60 * 1000), // 5 minutes ago
                impact: "medium"
            },
            {
                id: 3,
                type: "content_added",
                title: "Profile Photo Added",
                description: "Professional headshot integrated",
                agent: "ux",
                timestamp: new Date(today.getTime() - 8 * 60 * 1000), // 8 minutes ago
                impact: "medium"
            },
            {
                id: 4,
                type: "system_created",
                title: "Log System Created",
                description: "Comprehensive tracking system deployed",
                agent: "architect",
                timestamp: new Date(today.getTime() - 15 * 60 * 1000), // 15 minutes ago
                impact: "high"
            }
        ];
    }

    loadGoals() {
        this.goals = [
            {
                id: 1,
                title: "Portfolio Launch",
                description: "Professional online presence established",
                status: "completed",
                deadline: "2025-07-17",
                progress: 100,
                agent: "dev"
            },
            {
                id: 2,
                title: "Client Outreach",
                description: "Share portfolio with 5 potential clients",
                status: "pending",
                deadline: "2025-07-24",
                progress: 0,
                agent: "business"
            },
            {
                id: 3,
                title: "Content Expansion",
                description: "Add 2-3 new portfolio samples",
                status: "pending",
                deadline: "2025-07-24",
                progress: 0,
                agent: "aletheia"
            },
            {
                id: 4,
                title: "Thumbnail Creation",
                description: "Generate professional DALL-E 3 thumbnail",
                status: "pending",
                deadline: "2025-07-18",
                progress: 0,
                agent: "ux"
            }
        ];
    }

    loadAnalytics() {
        this.analytics = {
            performance: {
                portfolio: 90,
                content: 85,
                seo: 80,
                design: 95,
                analytics: 75,
                strategy: 88
            },
            trends: {
                daily: [0, 2, 4, 6, 8, 10, 12],
                weekly: [5, 8, 12, 15, 18, 20, 22],
                monthly: [15, 25, 35, 45]
            },
            goals: {
                portfolio: 100,
                clients: 0,
                revenue: 0,
                content: 60,
                skills: 75
            }
        };
    }

    startRealTimeUpdates() {
        setInterval(() => {
            this.updateMetrics();
            this.updateAgentStatus();
            this.generateNewActivity();
            this.emitUpdate();
        }, 30000); // Update every 30 seconds
    }

    updateMetrics() {
        // Simulate real-time metric updates
        this.metrics.daily.tasksCompleted += Math.floor(Math.random() * 2);
        this.metrics.daily.productivity = Math.min(100, this.metrics.daily.productivity + Math.floor(Math.random() * 5) - 2);
        
        this.metrics.weekly.tasksCompleted = this.metrics.daily.tasksCompleted;
        this.metrics.monthly.tasksCompleted = this.metrics.weekly.tasksCompleted;
    }

    updateAgentStatus() {
        // Simulate agent status changes
        Object.keys(this.agents).forEach(agentKey => {
            const agent = this.agents[agentKey];
            if (Math.random() > 0.95) { // 5% chance of status change
                agent.status = agent.status === "online" ? "busy" : "online";
            }
        });
    }

    generateNewActivity() {
        const activityTypes = [
            {
                type: "task_completed",
                title: "Task Completed",
                description: "New task completed successfully",
                icon: "✅"
            },
            {
                type: "system_update",
                title: "System Update",
                description: "Dashboard system updated",
                icon: "🔄"
            },
            {
                type: "metric_update",
                title: "Metrics Updated",
                description: "Performance metrics refreshed",
                icon: "📊"
            }
        ];

        const randomActivity = activityTypes[Math.floor(Math.random() * activityTypes.length)];
        const randomAgent = Object.keys(this.agents)[Math.floor(Math.random() * Object.keys(this.agents).length)];

        const newActivity = {
            id: this.activities.length + 1,
            type: randomActivity.type,
            title: randomActivity.title,
            description: randomActivity.description,
            agent: randomAgent,
            timestamp: new Date(),
            impact: "low"
        };

        this.activities.unshift(newActivity);

        // Keep only last 50 activities
        if (this.activities.length > 50) {
            this.activities = this.activities.slice(0, 50);
        }
    }

    emitUpdate() {
        // Emit update event for frontend
        if (typeof window !== 'undefined' && window.dashboardUpdate) {
            window.dashboardUpdate(this.getDashboardData());
        }
    }

    getDashboardData() {
        return {
            agents: this.agents,
            projects: this.projects,
            metrics: this.metrics,
            activities: this.activities.slice(0, 10), // Last 10 activities
            goals: this.goals,
            analytics: this.analytics,
            timestamp: new Date()
        };
    }

    addTask(projectId, taskName, agentId) {
        const project = this.projects[projectId];
        if (project) {
            const newTask = {
                name: taskName,
                status: "pending",
                agent: agentId,
                createdAt: new Date()
            };
            project.tasks.push(newTask);
            this.updateProjectProgress(projectId);
        }
    }

    completeTask(projectId, taskName) {
        const project = this.projects[projectId];
        if (project) {
            const task = project.tasks.find(t => t.name === taskName);
            if (task) {
                task.status = "completed";
                task.completedAt = new Date();
                this.updateProjectProgress(projectId);
                this.updateAgentPerformance(task.agent);
            }
        }
    }

    updateProjectProgress(projectId) {
        const project = this.projects[projectId];
        if (project) {
            const completedTasks = project.tasks.filter(t => t.status === "completed").length;
            const totalTasks = project.tasks.length;
            project.progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
            
            if (project.progress === 100) {
                project.status = "completed";
                project.endDate = new Date();
            }
        }
    }

    updateAgentPerformance(agentId) {
        const agent = this.agents[agentId];
        if (agent) {
            agent.performance.completed += 1;
            agent.performance.successRate = Math.round((agent.performance.completed / agent.performance.total) * 100);
        }
    }

    addGoal(title, description, deadline, agentId) {
        const newGoal = {
            id: this.goals.length + 1,
            title,
            description,
            status: "pending",
            deadline,
            progress: 0,
            agent: agentId,
            createdAt: new Date()
        };
        this.goals.push(newGoal);
    }

    updateGoalProgress(goalId, progress) {
        const goal = this.goals.find(g => g.id === goalId);
        if (goal) {
            goal.progress = progress;
            if (progress >= 100) {
                goal.status = "completed";
            }
        }
    }

    getAgentTasks(agentId) {
        const tasks = [];
        Object.values(this.projects).forEach(project => {
            project.tasks.forEach(task => {
                if (task.agent === agentId) {
                    tasks.push({
                        ...task,
                        project: project.name
                    });
                }
            });
        });
        return tasks;
    }

    getProjectAnalytics() {
        const analytics = {
            totalProjects: Object.keys(this.projects).length,
            completedProjects: Object.values(this.projects).filter(p => p.status === "completed").length,
            inProgressProjects: Object.values(this.projects).filter(p => p.status === "in-progress").length,
            pendingProjects: Object.values(this.projects).filter(p => p.status === "pending").length,
            averageProgress: Object.values(this.projects).reduce((sum, p) => sum + p.progress, 0) / Object.keys(this.projects).length
        };
        return analytics;
    }

    getPerformanceReport() {
        return {
            agents: Object.keys(this.agents).map(agentId => ({
                id: agentId,
                ...this.agents[agentId]
            })),
            projects: Object.keys(this.projects).map(projectId => ({
                id: projectId,
                ...this.projects[projectId]
            })),
            metrics: this.metrics,
            analytics: this.analytics,
            generatedAt: new Date()
        };
    }

    setupEventListeners() {
        // Listen for frontend events
        if (typeof window !== 'undefined') {
            window.addEventListener('dashboard:addTask', (event) => {
                this.addTask(event.detail.projectId, event.detail.taskName, event.detail.agentId);
            });

            window.addEventListener('dashboard:completeTask', (event) => {
                this.completeTask(event.detail.projectId, event.detail.taskName);
            });

            window.addEventListener('dashboard:addGoal', (event) => {
                this.addGoal(event.detail.title, event.detail.description, event.detail.deadline, event.detail.agentId);
            });

            window.addEventListener('dashboard:updateGoal', (event) => {
                this.updateGoalProgress(event.detail.goalId, event.detail.progress);
            });
        }
    }
}

// Export for use in different environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HealingStudioDashboardBackend;
} else if (typeof window !== 'undefined') {
    window.HealingStudioDashboardBackend = HealingStudioDashboardBackend;
}

// Auto-initialize if in browser
if (typeof window !== 'undefined') {
    window.dashboardBackend = new HealingStudioDashboardBackend();
    
    // Global update function for frontend
    window.dashboardUpdate = function(data) {
        // This will be called by the frontend to update the dashboard
        console.log('Dashboard data updated:', data);
    };
} 