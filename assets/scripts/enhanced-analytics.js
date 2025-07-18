// Enhanced Google Analytics Tracking for Healing Studio Portfolio
// Replace 'GA_MEASUREMENT_ID' with your actual Measurement ID

(function() {
    'use strict';

    // Enhanced Analytics Configuration
    const analyticsConfig = {
        // Replace with your actual Measurement ID
        measurementId: 'GA_MEASUREMENT_ID',
        
        // Custom dimensions for better tracking
        customDimensions: {
            serviceInterest: 'service_interest',
            userJourney: 'user_journey_stage',
            contentCategory: 'content_category'
        },
        
        // Event categories
        categories: {
            engagement: 'engagement',
            business: 'business',
            conversion: 'conversion',
            navigation: 'navigation'
        }
    };

    // Enhanced Event Tracking Functions
    const Analytics = {
        // Initialize enhanced tracking
        init: function() {
            this.trackPageViews();
            this.trackFormInteractions();
            this.trackSocialMediaClicks();
            this.trackPortfolioEngagement();
            this.trackServiceInterest();
            this.trackNavigationBehavior();
            this.trackScrollDepth();
            this.trackTimeOnPage();
        },

        // Track page views with enhanced data
        trackPageViews: function() {
            if (typeof gtag !== 'undefined') {
                gtag('config', analyticsConfig.measurementId, {
                    'custom_map': {
                        'custom_dimension1': analyticsConfig.customDimensions.serviceInterest,
                        'custom_dimension2': analyticsConfig.customDimensions.userJourney,
                        'custom_dimension3': analyticsConfig.customDimensions.contentCategory
                    },
                    'page_title': document.title,
                    'page_location': window.location.href
                });
            }
        },

        // Enhanced form tracking
        trackFormInteractions: function() {
            const form = document.getElementById('contactForm');
            if (!form) return;

            // Track form field focus
            form.querySelectorAll('input, select, textarea').forEach(field => {
                field.addEventListener('focus', function() {
                    this.trackEvent('form_field_focus', {
                        'event_category': analyticsConfig.categories.engagement,
                        'event_label': this.name || this.id,
                        'field_type': this.type || 'textarea'
                    });
                }.bind(this));
            });

            // Track form submission with service interest
            form.addEventListener('submit', function(e) {
                const serviceSelect = form.querySelector('#service');
                const selectedService = serviceSelect ? serviceSelect.value : 'not_selected';
                
                this.trackEvent('form_submit', {
                    'event_category': analyticsConfig.categories.conversion,
                    'event_label': 'contact_form',
                    'service_interest': selectedService,
                    'form_completion_time': this.getFormCompletionTime()
                });
            }.bind(this));

            // Track form abandonment
            let formStartTime = null;
            form.addEventListener('focusin', function() {
                if (!formStartTime) {
                    formStartTime = Date.now();
                }
            });

            window.addEventListener('beforeunload', function() {
                if (formStartTime && !form.checkValidity()) {
                    this.trackEvent('form_abandonment', {
                        'event_category': analyticsConfig.categories.engagement,
                        'event_label': 'contact_form',
                        'time_spent': Date.now() - formStartTime
                    });
                }
            }.bind(this));
        },

        // Track social media clicks
        trackSocialMediaClicks: function() {
            const socialLinks = document.querySelectorAll('a[href*="linkedin"], a[href*="fiverr"], a[href*="instagram"]');
            
            socialLinks.forEach(link => {
                link.addEventListener('click', function(e) {
                    const platform = this.getSocialPlatform(link.href);
                    const linkText = link.textContent.trim();
                    
                    this.trackEvent('social_click', {
                        'event_category': analyticsConfig.categories.engagement,
                        'event_label': platform,
                        'link_text': linkText,
                        'link_location': this.getElementLocation(link)
                    });
                }.bind(this));
            });
        },

        // Track portfolio engagement
        trackPortfolioEngagement: function() {
            const portfolioItems = document.querySelectorAll('.portfolio-item');
            
            portfolioItems.forEach(item => {
                // Track portfolio item views
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const itemTitle = item.querySelector('h3')?.textContent || 'Unknown';
                            this.trackEvent('portfolio_view', {
                                'event_category': analyticsConfig.categories.engagement,
                                'event_label': itemTitle,
                                'view_duration': 0
                            });
                        }
                    });
                }, { threshold: 0.5 });

                observer.observe(item);
            });
        },

        // Track service interest
        trackServiceInterest: function() {
            const serviceCards = document.querySelectorAll('.service-card');
            
            serviceCards.forEach(card => {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const serviceTitle = card.querySelector('h3')?.textContent || 'Unknown';
                            this.trackEvent('service_interest', {
                                'event_category': analyticsConfig.categories.business,
                                'event_label': serviceTitle,
                                'service_category': this.getServiceCategory(serviceTitle)
                            });
                        }
                    });
                }, { threshold: 0.7 });

                observer.observe(card);
            });
        },

        // Track navigation behavior
        trackNavigationBehavior: function() {
            const navLinks = document.querySelectorAll('nav a, .contact-link');
            
            navLinks.forEach(link => {
                link.addEventListener('click', function(e) {
                    const linkText = link.textContent.trim();
                    const linkHref = link.getAttribute('href');
                    
                    this.trackEvent('navigation_click', {
                        'event_category': analyticsConfig.categories.navigation,
                        'event_label': linkText,
                        'link_destination': linkHref,
                        'link_location': this.getElementLocation(link)
                    });
                }.bind(this));
            });
        },

        // Track scroll depth
        trackScrollDepth: function() {
            let maxScroll = 0;
            const scrollThresholds = [25, 50, 75, 90];
            const trackedThresholds = new Set();

            window.addEventListener('scroll', function() {
                const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
                
                if (scrollPercent > maxScroll) {
                    maxScroll = scrollPercent;
                    
                    scrollThresholds.forEach(threshold => {
                        if (scrollPercent >= threshold && !trackedThresholds.has(threshold)) {
                            trackedThresholds.add(threshold);
                            this.trackEvent('scroll_depth', {
                                'event_category': analyticsConfig.categories.engagement,
                                'event_label': `${threshold}%`,
                                'scroll_percentage': threshold
                            });
                        }
                    });
                }
            }.bind(this));
        },

        // Track time on page
        trackTimeOnPage: function() {
            const startTime = Date.now();
            const timeThresholds = [30, 60, 120, 300]; // seconds
            const trackedTimes = new Set();

            setInterval(function() {
                const timeOnPage = Math.floor((Date.now() - startTime) / 1000);
                
                timeThresholds.forEach(threshold => {
                    if (timeOnPage >= threshold && !trackedTimes.has(threshold)) {
                        trackedTimes.add(threshold);
                        this.trackEvent('time_on_page', {
                            'event_category': analyticsConfig.categories.engagement,
                            'event_label': `${threshold}s`,
                            'time_seconds': threshold
                        });
                    }
                });
            }.bind(this), 1000);
        },

        // Helper functions
        trackEvent: function(eventName, parameters) {
            if (typeof gtag !== 'undefined') {
                gtag('event', eventName, parameters);
            }
        },

        getSocialPlatform: function(url) {
            if (url.includes('linkedin')) return 'linkedin';
            if (url.includes('fiverr')) return 'fiverr';
            if (url.includes('instagram')) return 'instagram';
            return 'other';
        },

        getElementLocation: function(element) {
            const rect = element.getBoundingClientRect();
            if (rect.top < window.innerHeight / 2) return 'top_half';
            return 'bottom_half';
        },

        getServiceCategory: function(serviceTitle) {
            const title = serviceTitle.toLowerCase();
            if (title.includes('trauma')) return 'trauma_healing';
            if (title.includes('ai')) return 'ai_humanization';
            if (title.includes('strategy')) return 'content_strategy';
            return 'other';
        },

        getFormCompletionTime: function() {
            // This would need to be implemented with form start tracking
            return Math.floor(Math.random() * 300) + 30; // Placeholder
        }
    };

    // Initialize analytics when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            Analytics.init();
        });
    } else {
        Analytics.init();
    }

    // Export for global access
    window.HealingStudioAnalytics = Analytics;

})(); 