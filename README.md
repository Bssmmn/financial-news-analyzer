# Financial News Analysis System

## Setup

### 1. Fix the NumPy/PyTorch conflict (your main error)
```bash
pip install "numpy<2.0" --upgrade
pip install -r requirements.txt
```

### 2. Set your HuggingFace token (never hardcode it!)
```bash
export HF_TOKEN="hf_your_token_here"
```

### 3. Run the backend (from the project root folder)
```bash
uvicorn backend.main:app --reload
```
⚠️ Run from the **root** of the project (the folder containing the `backend/` folder),
not from inside the `backend/` folder.

### 4. Open the frontend
Open `frontend/index.html` directly in your browser.

---

## Bugs Fixed

| File | Bug | Fix |
|------|-----|-----|
| `requirements.txt` | Missing `numpy<2.0` caused NumPy/PyTorch crash | Added `numpy<2.0` |
| `main.py` | Duplicate imports | Removed duplicates |
| `main.py` | `/compare` endpoint missing `return` | Added `return` |
| `main.py` | `preprocess`/`postprocess` imported but never used | Wired into `/analyze` |
| `main.py` | No CORS middleware (frontend couldn't call API) | Added CORS |
| `models.py` | `parse_output` defined after functions that call it | Moved above callers |
| `models.py` | Double `.json()` call crashed on API error | Fixed error handling |
| `models.py` | HF token hardcoded in source | Moved to env variable |
| `frontend/script.js` | `analyze()` function completely missing | Implemented |
| `frontend/script.js` | `getRandom()` function completely missing | Implemented with sample news |
| `frontend/script.js` | Cursor div had no JS to move it | Added `mousemove` handler |
| `frontend/index.html` | Comparison section outside `.container` | Moved inside |
