# Multi-stage build for production optimization
FROM python:3.11-slim as base

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Development stage
FROM base as development

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p data media logs

# Make scripts executable
RUN chmod +x scripts/*.py

# Expose port
EXPOSE 4036

# Default command for development
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "4036", "--reload"]

# Production stage
FROM base as production

# Copy application code
COPY . .

# Create necessary directories with proper permissions
RUN mkdir -p data media logs && \
    chown -R nobody:nogroup /app

# Switch to non-root user
USER nobody

# Expose port
EXPOSE 4036

# Production command with Gunicorn
CMD ["gunicorn", "app.main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:4036"]