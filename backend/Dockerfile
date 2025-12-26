# Use Python 3.11 for ML stability
FROM python:3.11-slim

# Install system dependencies
# Added libgomp1 for LightGBM and ensured OCR/Image tools are present
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    libtesseract-dev \
    poppler-utils \
    libgl1 \
    libglib2.0-0 \
    libgomp1 \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements and install
# Ensure requirements.txt includes lightgbm, pandas, and scikit-learn
COPY backend/requirements.txt . 
RUN pip install --no-cache-dir -r requirements.txt

# Copy all project files
COPY . .

# Start the application
# Using backend.main:app because your file structure has main.py inside the backend folder
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "10000"]
