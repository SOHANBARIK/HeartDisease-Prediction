import pytesseract
import cv2
import re
import numpy as np
from fuzzywuzzy import process #
from PIL import Image

# 1. Comprehensive Regex Map (Updated for Categorical Words)
REGEX_MAP = {
    "age": r"(?:age|yr|years?|a\.ge)\s*[:\-]?\s*(\d{1,3})",
    "sex": r"(?:sex|gender|gen)\s*[:\-]?\s*(male|female|m|f|0|1)",
    "cp": r"(?:chest\s*pain|cp\s*type|angina|chest\s*pn)\s*[:\-]?\s*(\d|typical|atypical|non-anginal|asymptomatic|none)",
    "trestbps": r"(?:resting\s*bp|blood\s*pressure|systolic|trestbps|rbp|bp)\s*[:\-]?\s*(\d{2,3})",
    "chol": r"(?:cholesterol|chol|total\s*lipid|serum\s*chol)\s*[:\-]?\s*(\d{2,3})",
    "fbs": r"(?:fasting\s*blood\s*sugar|fbs|glucose|glu|sugar)\s*[:\-]?\s*(\d|true|false|>120|<120)",
    "restecg": r"(?:resting\s*ecg|electrocardiographic|restecg|ecg\s*res)\s*[:\-]?\s*(\d|normal|st-t|lv\s*hypertrophy)",
    "thalach": r"(?:max\s*heart\s*rate|thalach|mhr|peak\s*hr|max\s*hr)\s*[:\-]?\s*(\d{2,3})",
    "exang": r"(?:exercise\s*induced\s*angina|exang|eia|angina\s*ex)\s*[:\-]?\s*(\d|yes|no|y|n)",
    "oldpeak": r"(?:st\s*depression|oldpeak|st\s*seg|st\s*dep)\s*[:\-]?\s*(\d?\.?\d+)",
    "slope": r"(?:st\s*slope|slope|peak\s*st|slp)\s*[:\-]?\s*(\d|upsloping|flat|downsloping)",
    "ca": r"(?:vessels?|ca|fluoroscopy|major\s*vessels)\s*[:\-]?\s*(\d)",
    "thal": r"(?:thallium|thal|stress\s*test|thallium\s*stress)\s*[:\-]?\s*(\d|normal|fixed|reversible)"
}

# 2. Fuzzy Keywords (To find lines if Regex fails)
FUZZY_KEYS = {
    "chol": "Cholesterol",
    "trestbps": "Resting Blood Pressure",
    "thalach": "Max Heart Rate",
    "oldpeak": "ST Depression",
    "cp": "Chest Pain"
}

def normalize_value(key, val):
    """Converts text-based findings into numeric codes for the model."""
    if not val: return None
    val = val.strip().lower()

    # Categorical Mappings
    if key == "sex":
        return 1 if val in ['male', 'm', '1'] else 0
    
    if key == "cp":
        if 'typ' in val: return 0      # Typical Angina
        if 'atyp' in val: return 1     # Atypical Angina
        if 'non' in val: return 2      # Non-anginal pain
        if 'asymp' in val: return 3    # Asymptomatic
        if 'none' in val: return 3
        
    if key == "fbs":
        return 1 if val in ['1', 'true', '>120', 'high'] else 0

    if key == "exang":
        return 1 if val in ['1', 'yes', 'y', 'true'] else 0

    if key == "slope":
        if 'up' in val: return 0
        if 'flat' in val: return 1
        if 'down' in val: return 2

    if key == "thal":
        if 'norm' in val: return 1
        if 'fix' in val: return 2
        if 'rev' in val: return 3

    # Numeric Extraction
    try:
        return float(val) if "." in val else int(val)
    except:
        return None

def extract_parameters(image):
    # --- Preprocessing ---
    img_array = np.array(image)
    gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
    denoised = cv2.fastNlMeansDenoising(gray, h=10)
    thresh = cv2.threshold(denoised, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]
    
    custom_config = r'--oem 3 --psm 6'
    text = pytesseract.image_to_string(thresh, config=custom_config)
    
    # Fix common OCR typos (Letter O -> Number 0)
    text = re.sub(r'(?<=\d)O|O(?=\d)', '0', text)

    # --- Initialization (Handling Nulls) ---
    extracted_data = {
        "age": None, "sex": None, "cp": None, "trestbps": None, "chol": None,
        "fbs": None, "restecg": None, "thalach": None, "exang": None,
        "oldpeak": None, "slope": None, "ca": None, "thal": None
    }

    # --- Strategy 1: Regex Extraction ---
    for key, pattern in REGEX_MAP.items():
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            extracted_data[key] = normalize_value(key, match.group(1))

    # --- Strategy 2: Fuzzy Fallback (For missing numeric keys) ---
    lines = text.split('\n')
    for key, search_term in FUZZY_KEYS.items():
        if extracted_data[key] is None:
            # Find the best matching line for "Cholesterol", "BP", etc.
            best_line, score = process.extractOne(search_term, lines)
            if score > 80:  # If we are 80% sure we found the label
                # Look for any number in that specific line
                num_match = re.search(r"(\d+\.?\d*)", best_line)
                if num_match:
                    extracted_data[key] = normalize_value(key, num_match.group(1))

    # Debug log for Render
    print(f"DEBUG: Extracted Data: {extracted_data}")
    
    return extracted_data
