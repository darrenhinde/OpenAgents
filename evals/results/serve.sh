#!/bin/bash
# Simple HTTP server for viewing the dashboard
# Auto-opens browser and shuts down after timeout
# Usage: ./serve.sh [port] [timeout_seconds]

PORT=${1:-8000}
TIMEOUT=${2:-15}

cd "$(dirname "$0")" || exit

echo "🚀 Starting HTTP server on port $PORT..."
echo "📊 Opening dashboard in browser..."
echo "⏱️  Server will auto-shutdown in ${TIMEOUT} seconds"
echo ""

# Start server in background
python3 -m http.server $PORT > /dev/null 2>&1 &
SERVER_PID=$!

# Wait for server to start
sleep 1

# Open browser
if command -v open > /dev/null; then
    # macOS
    open "http://localhost:$PORT"
elif command -v xdg-open > /dev/null; then
    # Linux
    xdg-open "http://localhost:$PORT"
elif command -v start > /dev/null; then
    # Windows
    start "http://localhost:$PORT"
else
    echo "⚠️  Could not auto-open browser. Please visit: http://localhost:$PORT"
fi

echo "✅ Dashboard opened in browser"
echo "⏳ Waiting ${TIMEOUT} seconds for page to load..."

# Countdown
for i in $(seq $TIMEOUT -1 1); do
    printf "\r⏱️  Shutting down in %2d seconds... (Press Ctrl+C to keep running)" $i
    sleep 1
done

echo ""
echo "🛑 Stopping server..."
kill $SERVER_PID 2>/dev/null
echo "✅ Server stopped. Dashboard data is cached in your browser."
