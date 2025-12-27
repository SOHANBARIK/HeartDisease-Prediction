# Use Python 3.11
FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    libtesseract-dev \
    poppler-utils \
    libgl1 \
    libglib2.0-0 \
    libgomp1 \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# 1. Set working directory to root first
WORKDIR /app

# 2. Copy requirements from the backend folder
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 3. Copy the entire project
COPY . .

# 4. CRITICAL FIX: Switch into the backend folder
# This makes main.py "see" ocr_utils.py next to it
WORKDIR /app/backend

# 5. Run the app directly (not as backend.main)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "10000"]