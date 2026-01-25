#!/bin/bash

# Function to kill background processes (backend) when script is stopped
cleanup() {
    echo "Stopping servers..."
    kill $(jobs -p)
    exit
}

# Trap Ctrl+C (SIGINT)
trap cleanup SIGINT

echo "Starting Backend..."
cd backend
npm start &

# Wait a moment for backend to initialize
sleep 3

echo "Starting Frontend..."
cd ../frontend
npm run dev
