#!/bin/bash

# Сборка Vite-приложения
echo "Building Vite application..."
npm run build

# Сборка Docker-образа
echo "Building Docker image..."
docker build -t my-vite-app .

# Запуск Docker-контейнера
echo "Running Docker container..."
docker run -d -p 8080:80 my-vite-app

echo "Application is running at http://localhost:8080"