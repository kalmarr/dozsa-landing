#!/bin/bash

# Dózsa Apartman Docker Stop Script
# Usage: ./docker-stop.sh

echo "🛑 Stopping Dózsa Apartman Docker containers..."

docker-compose down

echo "✅ Containers stopped!"
