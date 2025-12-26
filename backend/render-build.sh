#!/usr/bin/env bash
# exit on error
set -o errexit

# Install Python dependencies
pip install -r requirements.txt

# Install Tesseract OCR and system dependencies for OpenCV
# Render allows 'apt-get' in certain environments; if this fails, Docker is required.
apt-get update && apt-get install -y tesseract-ocr libtesseract-dev poppler-utils libgl1-mesa-glx
