# Use official Python runtime as base image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Create non-root user for security
RUN useradd --create-home --shell /bin/bash aiuser && \
    chown -R aiuser:aiuser /app

USER aiuser

# Expose port
EXPOSE 5003

# Start the application
CMD ["python", "flask_app.py"]
