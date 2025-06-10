#!/bin/bash

# Script to run the GRID development server accessible from iPhone
echo "🚀 Setting up GRID development server for iPhone access..."

# Get local IP address
LOCAL_IP=$(ipconfig getifaddr en0)
if [ -z "$LOCAL_IP" ]; then
    # Try Wi-Fi interface
    LOCAL_IP=$(ipconfig getifaddr en1)
fi

if [ -z "$LOCAL_IP" ]; then
    echo "❌ Could not determine local IP address. Make sure Wi-Fi is connected."
    exit 1
fi

# Display access information
echo "📱 Your GRID app will be available at: http://$LOCAL_IP:3000"
echo "📋 Steps:"
echo "  1. Make sure your iPhone is connected to the same Wi-Fi network as this Mac"
echo "  2. Open Safari on your iPhone"
echo "  3. Enter this URL: http://$LOCAL_IP:3000"
echo
echo "🔌 Available test pages:"
echo "  • Main app: http://$LOCAL_IP:3000"
echo "  • Mobile-friendly test: http://$LOCAL_IP:3000/mobile-test.html"
echo "  • Audio analyzer test: http://$LOCAL_IP:3000/audio-analyzer-test.html" 
echo "  • Grid visual test: http://$LOCAL_IP:3000/grid-visual-test.html"
echo "  • Owncast test: http://$LOCAL_IP:3000/owncast-test.html"
echo "  • Audio integration: http://$LOCAL_IP:3000/audio-integration-complete.html"
echo
echo "🚦 Starting development server..."
echo "   Press Ctrl+C to stop the server"
echo

# Run the development server
npm run dev
