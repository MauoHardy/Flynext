#!/bin/bash

# Exit on error
set -e

echo "===== FlyNext Startup Script ====="
echo "Starting environment setup..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js before running this script."
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed. Please install Python 3 before running this script."
    exit 1
fi

# Make script directory executable
chmod +x flynext/scripts/fetch_afs_data.py

# Navigate to the project directory
cd flynext

echo "Installing Node.js dependencies..."
npm install

echo "Setting up Python environment..."
# Check if pip is installed
if command -v pip3 &> /dev/null; then
    pip3 install requests
elif command -v pip &> /dev/null; then
    pip install requests
else
    echo "Warning: pip is not installed. Attempting to continue, but the Python script may fail."
fi

echo "Running Prisma migrations..."
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

echo "Fetching cities and airports data from AFS API..."
# Run the Python script to fetch and save data
python3 scripts/fetch_afs_data.py

echo "Starting the application..."
npm run dev &

echo "===== Setup Complete ====="
echo "The application is now running at http://localhost:3000"
echo "You can access the API documentation at http://localhost:3000/swagger-ui.html"
echo "Press Ctrl+C to stop the application"

# Wait for the application to be stopped
wait 