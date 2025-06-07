#!/bin/bash

echo "🚀 Starting RealtyBoost AI - Phase 1"
echo "===================================="

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Kill any existing processes on our ports
echo "🧹 Cleaning up existing processes..."
pkill -f "uvicorn.*8000" 2>/dev/null || true
pkill -f "vite.*5173" 2>/dev/null || true
sleep 2

# Start the Decor8AI API server
echo "🔧 Starting Decor8AI API Server..."
cd decor8ai-sdk
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found. Please run: python3 -m venv venv && source venv/bin/activate && pip install -r requirements-local.txt"
    exit 1
fi

source venv/bin/activate
# Load all API credentials
source ../cloudinary.env
uvicorn restyle_api:app --host 0.0.0.0 --port 8000 --reload &
API_PID=$!
cd ..

# Wait for API server to start
echo "⏳ Waiting for API server to start..."
for i in {1..10}; do
    if check_port 8000; then
        echo "✅ API server started successfully on port 8000"
        break
    fi
    if [ $i -eq 10 ]; then
        echo "❌ API server failed to start"
        kill $API_PID 2>/dev/null || true
        exit 1
    fi
    sleep 1
done

# Start the frontend development server
echo "🎨 Starting Frontend Development Server..."
npm run dev &
FRONTEND_PID=$!

# Wait for frontend server to start
echo "⏳ Waiting for frontend server to start..."
for i in {1..10}; do
    if check_port 5173; then
        echo "✅ Frontend server started successfully on port 5173"
        break
    fi
    if [ $i -eq 10 ]; then
        echo "❌ Frontend server failed to start"
        kill $API_PID $FRONTEND_PID 2>/dev/null || true
        exit 1
    fi
    sleep 1
done

echo ""
echo "🎉 All services started successfully!"
echo "📍 Frontend: http://localhost:5173"
echo "📍 API Server: http://localhost:8000"
echo "📖 API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping all services..."
    kill $API_PID $FRONTEND_PID 2>/dev/null || true
    pkill -f "uvicorn.*8000" 2>/dev/null || true
    pkill -f "vite.*5173" 2>/dev/null || true
    echo "✅ All services stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for user to stop the services
wait 