# Multi-stage Dockerfile for InsurIntel HK
FROM node:22-slim

# Install Python & build dependencies for Pillow / NumPy
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-venv \
    cron \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Set up Python virtual environment
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip install --no-cache-dir pillow numpy

WORKDIR /app

# Install Node dependencies
COPY package*.json ./
RUN npm install --no-audit --no-fund

# Copy source code and templates
COPY tsconfig.json ./
COPY src/ ./src/
COPY templates/ ./templates/

# Build TypeScript
RUN npm run build

# Add cron job to run daily at 06:30 AM HKT (22:30 UTC)
RUN echo "30 22 * * * cd /app && /usr/local/bin/npm run start:search >> /var/log/insurintel.log 2>&1" > /etc/cron.d/insurintel-cron && \
    chmod 0644 /etc/cron.d/insurintel-cron && \
    crontab /etc/cron.d/insurintel-cron

# Startup script to run initial generation and start cron daemon
CMD sh -c "npm run start:search && cron -f"
