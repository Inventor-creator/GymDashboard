#!/bin/bash
set -e

echo "Building frontend..."
cd wzFrontend
npm ci
npm run build
cd ..

echo "Starting backend..."
cd wzBackend
python main.py
