# Build frontend
FROM node:22-alpine AS frontend-build
WORKDIR /app/wzFrontend
COPY wzFrontend/package*.json ./
RUN npm ci
COPY wzFrontend/ ./
RUN npm run build

# Backend + serve frontend
FROM python:3.11-slim
WORKDIR /app

# Install Python dependencies
COPY wzBackend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY wzBackend/ ./wzBackend/

# Copy built frontend into the expected location
COPY --from=frontend-build /app/wzFrontend/dist ./wzFrontend/dist

WORKDIR /app/wzBackend

EXPOSE 8080

CMD ["python", "main.py"]
