#!/bin/bash

# Bridge to Brilliance - Network Access Startup Script
# This starts the production server accessible from other machines via IP

echo "🚀 Starting Bridge to Brilliance in production mode..."
echo "The app will be accessible from other machines on your network"
echo ""

# Get the local IP address
if command -v hostname &> /dev/null; then
    LOCAL_IP=$(hostname -I | awk '{print $1}')
else
    LOCAL_IP="localhost"
fi

echo "📍 Access the app at:"
echo "   Local: http://localhost:3000"
echo "   Network: http://$LOCAL_IP:3000"
echo ""
echo "Share this IP with your friends: http://$LOCAL_IP:3000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the production server on all interfaces
PORT=3000 npm start
