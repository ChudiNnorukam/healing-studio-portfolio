module.exports = {
  githubPages: {
    url: 'https://chudinnorukam.github.io/healing-studio-portfolio/',
    resources: [
      'assets/images/profile-photo.jpg',
      'assets/scripts/dashboard.js',
      'assets/css/main.css',
      'healing-studio-dashboard.html',
      'index.html'
    ]
  },
  monitoring: {
    interval: 300000, // 5 minutes
    timeout: 10000,
    retries: 3
  },
  screenshots: {
    viewports: [
      { name: 'desktop', width: 1920, height: 1080 },
      { name: 'tablet', width: 1024, height: 768 },
      { name: 'mobile', width: 375, height: 667 }
    ]
  },
  testing: {
    headless: true,
    timeout: 30000,
    waitUntil: 'networkidle0'
  }
}; 