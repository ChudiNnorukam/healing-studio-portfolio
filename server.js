const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware (Context7 recommendations)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || [
    'https://chudinnorukam.github.io',
    'http://localhost:3000',
    'http://localhost:8080'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting (Context7 security best practice)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving - serve files from root directory
app.use(express.static(__dirname, {
  maxAge: '1d',
  etag: true,
  lastModified: true
}));

// API Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Dashboard data endpoint
app.get('/api/dashboard-data', (req, res) => {
  try {
    // Simulate dashboard data
    const dashboardData = {
      agents: [
        { name: 'Aletheia', status: 'online', role: 'Content Strategy' },
        { name: 'Kairos', status: 'busy', role: 'Timing Analysis' },
        { name: 'Serena', status: 'online', role: 'Client Relations' },
        { name: 'Aluma', status: 'offline', role: 'Visual Design' }
      ],
      metrics: {
        projects: 12,
        clients: 8,
        contentPieces: 45,
        healingSessions: 23
      },
      recentActivity: [
        { type: 'content_created', title: 'Trauma Healing Guide', timestamp: new Date().toISOString() },
        { type: 'client_session', title: 'Inner Child Work', timestamp: new Date(Date.now() - 3600000).toISOString() },
        { type: 'project_completed', title: 'Resilience Workshop', timestamp: new Date(Date.now() - 7200000).toISOString() }
      ]
    };
    
    res.json(dashboardData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Portfolio data endpoint
app.get('/api/portfolio', (req, res) => {
  try {
    const portfolioData = {
      profile: {
        name: 'Chudi Nnorukam',
        title: 'Trauma Healing Content Creator',
        description: 'Specializing in trauma-informed content creation and healing studio management',
        image: '/Chudi%20Profile%20Photo.JPG'
      },
      services: [
        {
          name: 'Content Strategy',
          description: 'Trauma-informed content planning and execution',
          icon: '📝'
        },
        {
          name: 'Healing Workshops',
          description: 'Interactive sessions for trauma recovery',
          icon: '🕊️'
        },
        {
          name: 'Portfolio Management',
          description: 'Comprehensive project tracking and optimization',
          icon: '📊'
        }
      ],
      projects: [
        {
          title: 'Inner Child Healing Series',
          description: 'Multi-part content series for inner child work',
          status: 'completed',
          impact: '500+ participants'
        },
        {
          title: 'Resilience Building Workshop',
          description: 'Interactive workshop for building emotional resilience',
          status: 'active',
          impact: '200+ attendees'
        }
      ]
    };
    
    res.json(portfolioData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch portfolio data' });
  }
});

// Serve main HTML files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'healing-studio-dashboard.html'));
});

// Also serve dashboard at the direct HTML path for convenience
app.get('/healing-studio-dashboard.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'healing-studio-dashboard.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found',
    path: req.path
  });
});

// Global error handler (Context7 best practice)
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Don't leak error details in production
  const errorMessage = process.env.NODE_ENV === 'production' 
    ? 'Internal Server Error' 
    : err.message;
  
  res.status(err.status || 500).json({
    error: errorMessage,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`🕊️ Healing Studio Portfolio server running on port ${PORT}`);
  console.log(`📊 Dashboard available at: http://localhost:${PORT}/dashboard`);
  console.log(`🏠 Portfolio available at: http://localhost:${PORT}/`);
  console.log(`🔒 Security features: Helmet, Rate Limiting, CORS enabled`);
});

module.exports = app; 