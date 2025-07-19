#!/bin/bash

# Start n8n with environment configuration
echo "🚀 Starting n8n server..."
echo "📊 Web Interface: http://localhost:5678"
echo "🔐 Username: admin"
echo "🔑 Password: admin123"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Load environment variables and start n8n
export $(cat n8n-config.env | xargs)
n8n start 