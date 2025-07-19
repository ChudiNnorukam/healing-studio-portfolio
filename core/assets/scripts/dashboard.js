/**
 * Healing Studio Portfolio Dashboard
 * Modern, secure, and interactive dashboard functionality
 */

// Security: Use strict mode and avoid global scope pollution
'use strict';

// Dashboard configuration
const DASHBOARD_CONFIG = {
    animationDuration: 300,
    refreshInterval: 30000, // 30 seconds
    maxRetries: 3,
    apiEndpoints: {
        analytics: '/api/analytics',
        portfolio: '/api/portfolio',
        contact: '/api/contact'
    }
};

// Dashboard state management
class DashboardState {
    constructor() {
        this.isLoading = false;
        this.currentSection = 'overview';
        this.userPreferences = this.loadPreferences();
        this.analytics = {};
        this.portfolio = [];
    }

    loadPreferences() {
        try {
            const stored = localStorage.getItem('dashboard-preferences');
            return stored ? JSON.parse(stored) : {
                theme: 'light',
                notifications: true,
                autoRefresh: true
            };
        } catch (error) {
            console.warn('Failed to load preferences:', error);
            return {
                theme: 'light',
                notifications: true,
                autoRefresh: true
            };
        }
    }

    savePreferences() {
        try {
            localStorage.setItem('dashboard-preferences', JSON.stringify(this.userPreferences));
        } catch (error) {
            console.warn('Failed to save preferences:', error);
        }
    }

    updateSection(section) {
        this.currentSection = section;
        this.updateNavigation();
        this.loadSectionContent(section);
    }

    updateNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.section === this.currentSection) {
                item.classList.add('active');
            }
        });
    }

    async loadSectionContent(section) {
        this.setLoading(true);
        try {
            switch (section) {
                case 'overview':
                    await this.loadOverview();
                    break;
                case 'portfolio':
                    await this.loadPortfolio();
                    break;
                case 'analytics':
                    await this.loadAnalytics();
                    break;
                case 'settings':
                    this.loadSettings();
                    break;
                default:
                    console.warn('Unknown section:', section);
            }
        } catch (error) {
            this.showError('Failed to load section content', error);
        } finally {
            this.setLoading(false);
        }
    }

    setLoading(loading) {
        this.isLoading = loading;
        const loader = document.getElementById('dashboard-loader');
        if (loader) {
            loader.style.display = loading ? 'block' : 'none';
        }
    }

    showError(message, error) {
        console.error(message, error);
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()" class="notification-close">&times;</button>
        `;
        
        const container = document.getElementById('notification-container') || document.body;
        container.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
}

// Analytics tracking
class AnalyticsTracker {
    constructor() {
        this.events = [];
        this.sessionId = this.generateSessionId();
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    trackEvent(eventName, properties = {}) {
        const event = {
            name: eventName,
            properties,
            timestamp: new Date().toISOString(),
            sessionId: this.sessionId
        };
        
        this.events.push(event);
        this.sendEvent(event);
    }

    async sendEvent(event) {
        try {
            // In a real implementation, this would send to your analytics service
            console.log('Analytics event:', event);
        } catch (error) {
            console.warn('Failed to send analytics event:', error);
        }
    }

    trackPageView(page) {
        this.trackEvent('page_view', { page });
    }

    trackInteraction(element, action) {
        this.trackEvent('interaction', { element, action });
    }
}

// Portfolio management
class PortfolioManager {
    constructor() {
        this.projects = [];
        this.categories = ['All', 'AI', 'Web Development', 'Content Creation', 'Automation'];
    }

    async loadProjects() {
        try {
            // Simulate API call
            const response = await fetch('/api/portfolio');
            this.projects = await response.json();
            return this.projects;
        } catch (error) {
            console.warn('Failed to load projects, using fallback data');
            return this.getFallbackProjects();
        }
    }

    getFallbackProjects() {
        return [
            {
                id: 1,
                title: 'AI-Powered Content Creation System',
                description: 'Advanced content generation with human-like quality',
                category: 'AI',
                image: '/assets/images/project-1.jpg',
                technologies: ['Python', 'OpenAI', 'React'],
                status: 'Completed',
                date: '2024-01-15'
            },
            {
                id: 2,
                title: 'Healing Studio Portfolio',
                description: 'Modern, responsive portfolio with security features',
                category: 'Web Development',
                image: '/assets/images/project-2.jpg',
                technologies: ['HTML5', 'CSS3', 'JavaScript'],
                status: 'Active',
                date: '2024-07-18'
            },
            {
                id: 3,
                title: 'Automated Social Media Management',
                description: 'AI-driven social media content scheduling and optimization',
                category: 'Automation',
                image: '/assets/images/project-3.jpg',
                technologies: ['Node.js', 'Puppeteer', 'MongoDB'],
                status: 'In Progress',
                date: '2024-06-20'
            }
        ];
    }

    filterProjects(category) {
        if (category === 'All') {
            return this.projects;
        }
        return this.projects.filter(project => project.category === category);
    }

    renderProjects(projects) {
        const container = document.getElementById('portfolio-grid');
        if (!container) return;

        container.innerHTML = projects.map(project => `
            <div class="portfolio-item" data-project-id="${project.id}">
                <img src="${project.image}" alt="${project.title}" onerror="this.src='/assets/images/placeholder.jpg'">
                <div class="portfolio-content">
                    <h3>${project.title}</h3>
                    <p>${project.description}</p>
                    <div class="project-meta">
                        <span class="category">${project.category}</span>
                        <span class="status status-${project.status.toLowerCase()}">${project.status}</span>
                    </div>
                    <div class="technologies">
                        ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                    </div>
                </div>
            </div>
        `).join('');
    }
}

// Contact form handler
class ContactFormHandler {
    constructor() {
        this.form = document.getElementById('contact-form');
        this.initializeForm();
    }

    initializeForm() {
        if (!this.form) return;

        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Real-time validation
        const inputs = this.form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        switch (field.type) {
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                isValid = emailRegex.test(value);
                errorMessage = 'Please enter a valid email address';
                break;
            case 'text':
                isValid = value.length >= 2;
                errorMessage = 'This field must be at least 2 characters long';
                break;
            case 'textarea':
                isValid = value.length >= 10;
                errorMessage = 'Message must be at least 10 characters long';
                break;
        }

        if (!isValid && value) {
            this.showFieldError(field, errorMessage);
        } else {
            this.clearFieldError(field);
        }

        return isValid;
    }

    showFieldError(field, message) {
        this.clearFieldError(field);
        const error = document.createElement('div');
        error.className = 'field-error';
        error.textContent = message;
        field.parentNode.appendChild(error);
        field.classList.add('error');
    }

    clearFieldError(field) {
        const error = field.parentNode.querySelector('.field-error');
        if (error) {
            error.remove();
        }
        field.classList.remove('error');
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData);
        
        // Validate all fields
        const fields = this.form.querySelectorAll('input, textarea');
        let isValid = true;
        
        fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        if (!isValid) {
            dashboard.showNotification('Please fix the errors in the form', 'error');
            return;
        }

        try {
            this.setSubmitting(true);
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            dashboard.showNotification('Message sent successfully!', 'success');
            this.form.reset();
            
        } catch (error) {
            dashboard.showError('Failed to send message', error);
        } finally {
            this.setSubmitting(false);
        }
    }

    setSubmitting(submitting) {
        const submitBtn = this.form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = submitting;
            submitBtn.textContent = submitting ? 'Sending...' : 'Send Message';
        }
    }
}

// Theme manager
class ThemeManager {
    constructor() {
        this.currentTheme = 'light';
        this.initializeTheme();
    }

    initializeTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.setTheme(savedTheme);
        
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }

    setTheme(theme) {
        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.textContent = theme === 'light' ? '🌙' : '☀️';
        }
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize global instances
    window.dashboard = new DashboardState();
    window.analytics = new AnalyticsTracker();
    window.portfolio = new PortfolioManager();
    window.contactForm = new ContactFormHandler();
    window.themeManager = new ThemeManager();

    // Track page view
    analytics.trackPageView('dashboard');

    // Initialize navigation
    initializeNavigation();
    
    // Load initial content
    dashboard.loadSectionContent('overview');
    
    // Set up auto-refresh if enabled
    if (dashboard.userPreferences.autoRefresh) {
        setInterval(() => {
            dashboard.loadSectionContent(dashboard.currentSection);
        }, DASHBOARD_CONFIG.refreshInterval);
    }

    // Add keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
});

// Navigation initialization
function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            dashboard.updateSection(section);
            analytics.trackInteraction('navigation', section);
        });
    });
}

// Keyboard shortcuts
function handleKeyboardShortcuts(e) {
    if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
            case '1':
                e.preventDefault();
                dashboard.updateSection('overview');
                break;
            case '2':
                e.preventDefault();
                dashboard.updateSection('portfolio');
                break;
            case '3':
                e.preventDefault();
                dashboard.updateSection('analytics');
                break;
            case '4':
                e.preventDefault();
                dashboard.updateSection('settings');
                break;
        }
    }
}

// Utility functions
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatNumber(num) {
    return new Intl.NumberFormat('en-US').format(num);
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DashboardState,
        AnalyticsTracker,
        PortfolioManager,
        ContactFormHandler,
        ThemeManager
    };
} 