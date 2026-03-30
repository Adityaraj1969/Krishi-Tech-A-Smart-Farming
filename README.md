# 🌱 KrishiTech – Smart Agriculture Platform

A comprehensive, AI-powered agriculture website for Indian farmers.

## Features
- 🌾 **50+ Crops** – Kharif, Rabi, Zaid, Cash, Horticulture, Floriculture
- 🔍 **3-Way Search** – Crop name → details | Soil type → suitable crops | Region → soil & crops
- 🤖 **Gemini AI** – Ask about ANY crop, disease, or farming practice
- 🔬 **Disease Detection** – Describe symptoms → get herbal/Ayurvedic remedies
- ⚡ **Modern Techniques** – Hydroponics, Aeroponics, Aquaponics guides
- 📍 **28 States** – Region-wise soil, climate, crop data across India
- 🌿 **Natural Alternatives** – Chemical-free fertilizers, pesticides, herbicides

## Quick Start

### 1. Install dependencies
```bash
pip install flask
```

### 2. Run the server
```bash
cd krishitech
python app.py
```

### 3. Open in browser
```
http://localhost:5000
```

### 4. Enable AI Features (Optional but recommended)
1. Get a **FREE** Gemini API key from: https://aistudio.google.com/app/apikey
2. Paste it in the yellow "AI Setup" box on the website
3. Now you can search ANY crop and get detailed AI answers!

## Setting API Key via Environment (for production)
```bash
export GEMINI_API_KEY="your_key_here"
python app.py
```

## Project Structure
```
krishitech/
├── app.py              ← Flask backend + crop database
├── requirements.txt
├── templates/
│   └── index.html      ← Main HTML template
└── static/
    ├── css/
    │   └── style.css   ← Stylesheet
    └── js/
        └── main.js     ← All JavaScript + Gemini API calls
```

## Data Coverage
- **Crops**: Rice, Wheat, Maize, Cotton, Mango, Tomato, Sugarcane, Banana, Rose, Watermelon + 40 more via AI
- **Soil Types**: Alluvial, Black, Red, Laterite, Desert, Mountain
- **States**: 23 states with soil, climate, rainfall, major crops data
- **Diseases**: 6 common diseases with herbal remedies; unlimited via AI diagnosis

## API Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Main website |
| `/api/crop-search` | POST | Search crop by name |
| `/api/soil-to-crops` | POST | Find crops by soil type |
| `/api/region-info` | POST | Get regional agricultural data |
| `/api/static-data` | GET | Load all database data |
| `/api/gemini` | POST | Proxy Gemini API (server-side key) |

## Helpline
Kisan Call Centre: **1800-180-1551** (Toll Free)
