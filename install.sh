#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

echo "Starting Reality Follow-up AI installation..."

# Check if Docker and Docker Compose are installed
if ! command -v docker &> /dev/null
then
    echo "Docker is not installed. Please install Docker first: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null
then
    echo "Docker Compose is not installed. Please install Docker Compose first: https://docs.docker.com/compose/install/"
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo "Please edit the .env file with your database, Resend, and other settings."
    echo "Then run this script again."
    exit 0
fi

echo "Building and starting Docker containers..."
docker-compose up --build -d

echo "Running database migrations..."
docker-compose exec app pnpm drizzle-kit migrate

echo "Installation complete!"
echo "The application should be running on port 3000."
echo "You can access it at http://localhost:3000 (or your server's IP/domain)."
