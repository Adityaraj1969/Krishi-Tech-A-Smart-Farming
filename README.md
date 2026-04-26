# 🌿 KrishiTech — India's Smart Agriculture Portal

> **From Seed to Harvest, Guided by Science**
> A comprehensive AI-powered agricultural knowledge platform built for Indian farmers, covering every crop, every region, and every season — with traditional wisdom and modern agronomy.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [AI Models](#ai-models)
- [Text-to-Speech (TTS) System](#text-to-speech-tts-system)
- [API Routes](#api-routes)
- [Supported Languages](#supported-languages)
- [Crop Data Coverage](#crop-data-coverage)
- [Known Limitations](#known-limitations)
- [License](#license)

---

## Overview

KrishiTech is a Flask-based web application that combines multiple large language models (LLMs) with a rich agricultural knowledge base to serve Indian farmers. It provides cultivation guides, disease detection, soil advice, regional recommendations, and community features — all in multiple Indian languages with voice readback support.

The backend routes AI requests through a smart proxy chain:
- **Groq** (Llama models) as the primary recommended engine — fast, free, no daily limits
- **Gemini** (Google) as an alternative — deeper research quality, subject to free-tier quotas
- **Browser Web Speech API** as the offline fallback for text-to-speech

---

## Features

### 🌾 Crop Knowledge Base
- **Kharif crops** — Rice, Maize, Jowar, Bajra, Groundnut, Soybean, and more (June–October)
- **Rabi crops** — Wheat, Barley, Chickpea, Mustard, Lentil, and more (November–April)
- **Zaid crops** — Watermelon, Cucumber, Pumpkin, and other short-duration crops
- **Cash crops** — Cotton, Jute
- **Flowers** — Rose, Marigold, Tulip, Lily, Rajanigandha, and more
- **Horticulture** — Mango, Banana, Apple, Guava, Papaya, Kiwi, Pineapple, Orange
- **Plantation** — Tea, Coffee
- **Modern farming** — Hydroponics, Aeroponics, Aquaponics

### 🤖 AI-Powered Search (3 Modes)
1. **Crop Search** — Full cultivation guide: sowing time, soil requirements, irrigation, fertilizers, harvesting
2. **Soil Search** — Crop recommendations based on soil type, pH, and nutrient profile
3. **Region Search** — Best crops and farming practices for any Indian state and district (all 36 states & UTs, 700+ districts)

### 🔬 Disease Detection & Prevention
- Fungal, bacterial, viral disease identification
- Pest attack diagnosis
- Nutritional deficiency detection
- Emphasis on **organic and Ayurvedic remedies** (neem, Panchagavya, Jeevamrutha, Beejamrutha, Agnihastra)
- Alternatives to chemical fertilizers, pesticides, and weedicides

### 🧪 Modern Agriculture Section
- Hydroponics, Aeroponics, Aquaponics setup guides
- Soil management: testing, pH balancing, organic amendments
- Government schemes: PM-KISAN, PMFBY, Soil Health Card

### 🔊 Text-to-Speech (3-Layer System)
- **Layer 1**: Gemini 3.1 Flash TTS (`gemini-3.1-flash-tts-preview`) — highest quality neural voice
- **Layer 2**: Gemini 2.5 Flash TTS (`gemini-2.5-flash-preview-tts`) — fallback neural voice
- **Layer 3**: Browser Web Speech API — always-available offline fallback
- Automatic failover between layers; first 300 characters spoken in Gemini voice, remainder via Web Speech API

### 🌐 Multilingual Support
Response language selector with 12 languages:

| Code | Language  | Code | Language  |
|------|-----------|------|-----------|
| `en` | English   | `kn` | Kannada   |
| `hi` | Hindi     | `pa` | Punjabi   |
| `bn` | Bengali   | `ml` | Malayalam |
| `te` | Telugu    | `or` | Odia      |
| `mr` | Marathi   | `ur` | Urdu      |
| `ta` | Tamil     | `gu` | Gujarati  |

Translation is powered by Groq (primary) with Gemini as fallback, preserving all markdown formatting.

### 👨‍🌾 Kisan Community Forum
- User registration and login (session-based auth)
- Create posts with tags, like posts, reply to posts
- Filterable by tag
- Author avatar, state, and district displayed with each post
- In-memory storage (resets on server restart)

### 🎤 Voice Search
- Web Speech Recognition API for hands-free crop search
- Works in Chrome and Edge browsers

### 🔐 User Authentication
- Signup / Login / Logout
- Password hashing (SHA-256)
- Session-based authentication
- Profile stores name, state, district

---

## Tech Stack

| Layer       | Technology                                         |
|-------------|---------------------------------------------------|
| Backend     | Python 3.10+, Flask 3.0.3                         |
| AI — Groq   | `requests` → Groq REST API (OpenAI-compatible)    |
| AI — Gemini | `google-genai` SDK → Gemini API (v1beta)          |
| TTS         | Gemini TTS API + Browser Web Speech API           |
| Frontend    | Vanilla HTML5, CSS3, JavaScript (no frameworks)   |
| Fonts       | Google Fonts (Playfair Display, DM Sans, Space Mono) |
| Auth        | Flask `session` + SHA-256 password hashing        |
| Config      | `python-dotenv` (.env file)                       |

---

## Project Structure

```
Capstone-KrishiTech/
│
├── app.py                  # Flask backend — all routes, AI proxies, TTS
├── requirements.txt        # Python dependencies
├── .env                    # API keys (not committed to git)
├── .env.example            # Template for .env
│
├── templates/
│   └── index.html          # Single-page application (Jinja2 template)
│
└── static/
    ├── css/
    │   └── style.css       # All styles — responsive, dark/light sections
    └── js/
        └── main.js         # All frontend logic — AI calls, TTS, community, auth
```

---

## Installation & Setup

### Prerequisites
- Python 3.10 or higher
- `pip` package manager
- A Gemini API key (free at [aistudio.google.com](https://aistudio.google.com))
- A Groq API key (free at [console.groq.com](https://console.groq.com))

### Steps

**1. Clone the repository**
```bash
git clone https://github.com/your-username/Capstone-KrishiTech.git
cd Capstone-KrishiTech
```

**2. Create and activate a virtual environment**
```bash
# Windows
python -m venv venv
venv\Scripts\activate.bat

# macOS / Linux
python3 -m venv venv
source venv/bin/activate
```

**3. Install dependencies**
```bash
pip install -r requirements.txt
```

**4. Create your `.env` file**
```bash
cp .env.example .env
# Then edit .env and add your API keys
```

**5. Run the development server**
```bash
python app.py
```

**6. Open in browser**
```
http://localhost:5000
```

> **Important:** Always use `localhost` (not `127.0.0.1`). `localhost` is treated as a secure context by all browsers, which is required for the Web Speech API (voice search and TTS fallback) to work without HTTPS.

---

## Environment Variables

Create a `.env` file in the project root:

```env
# Required — Google Gemini API key
# Get free key at: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here

# Required — Groq API key (recommended primary model)
# Get free key at: https://console.groq.com
GROQ_API_KEY=your_groq_api_key_here

# Optional — Flask session secret key (change in production)
SECRET_KEY=KrishiTech-dev-secret

# Optional — set to False to disable debug mode
FLASK_DEBUG=True

# Optional — change port (default: 5000)
PORT=5000
```

---

## AI Models

### Groq Models (Recommended — No Daily Limit)

| Model | Selector Value | Best For |
|-------|---------------|----------|
| Llama 3.3 70B | `llama-3.3-70b-versatile` | Default, best balance of speed and quality |
| Llama 3.1 8B | `llama-3.1-8b-instant` | Fastest responses |
| Llama 4 Scout 17B | `meta-llama/llama-4-scout-17b-16e-instruct` | Multimodal, latest |
| Compound Beta | `compound-beta` | Web-augmented search |

### Gemini Models (Subject to Free-Tier Quotas)

| Model | Selector Value | Notes |
|-------|---------------|-------|
| Gemini 2.5 Flash | `gemini-2.5-flash` | Best quality; 10 RPM / 500 RPD free tier |
| Gemini 2.0 Flash | `gemini-2.0-flash` | Fast, reliable fallback |
| Gemini 2.0 Flash Lite | `gemini-2.0-flash-lite` | Lightest Gemini model |

> **Quota note:** The free tier for `gemini-2.5-flash` allows **500 requests/day** and **10 requests/minute (RPM)**. Hitting RPM triggers a 429 error — wait 60 seconds. Hitting the daily limit — wait until midnight UTC, or switch to a Groq model.

### Model Fallback Logic (Gemini)
1. Try the requested Gemini model up to **3 times** with exponential backoff (2s, 4s, 8s) on 503 overload errors
2. On true quota exhaustion (429), return a clear error with instructions
3. Fall back to `gemini-2.0-flash` → `gemini-2.0-flash-lite` on persistent 503s
4. Show a `fallback_notice` in the UI when a different model was used

### Deprecated Model Remapping (Groq)
Old model names are automatically remapped to current equivalents:

| Old Name | Remapped To |
|----------|-------------|
| `mixtral-8x7b-32768` | `llama-3.3-70b-versatile` |
| `llama2-70b-4096` | `llama-3.3-70b-versatile` |
| `llama3-8b-8192` | `llama-3.1-8b-instant` |
| `gemma2-9b-it` | `llama-3.1-8b-instant` |
| `gemma-7b-it` | `llama-3.1-8b-instant` |

---

## Text-to-Speech (TTS) System

The TTS system uses a **3-layer priority chain** with automatic failover:

```
User clicks "Read Aloud"
        │
        ▼
┌─────────────────────────────┐
│  Layer 1: Gemini 3.1 Flash  │  gemini-3.1-flash-tts-preview
│  (highest quality neural)   │  Voice: Kore (default)
└────────────┬────────────────┘
             │ fails (timeout / quota / preview access)
             ▼
┌─────────────────────────────┐
│  Layer 2: Gemini 2.5 Flash  │  gemini-2.5-flash-preview-tts
│  (fallback neural voice)    │  Voice: Kore (default)
└────────────┬────────────────┘
             │ fails
             ▼
┌─────────────────────────────┐
│  Layer 3: Web Speech API    │  Browser built-in
│  (offline, always works)    │  Language-matched voice
└─────────────────────────────┘
```

### TTS Design Decisions
- Only the **first 300 characters** are sent to Gemini TTS — keeps response time under 8 seconds
- The remaining text is read by **Web Speech API** immediately after the Gemini audio finishes
- Backend SDK timeout is set to **15 seconds** (Gemini API enforces a minimum of 10s)
- Frontend fetch timeout is **16 seconds** — just above the SDK timeout so the backend always resolves first
- The Stop button uses `AbortController` to cancel an in-flight TTS request instantly
- PCM audio returned by Gemini (raw `audio/L16`, 24kHz mono) is converted to WAV on the backend before sending to the browser

### TTS Voice Map by Language

| Language | Gemini Voice |
|----------|-------------|
| Hindi, Tamil, Kannada, Urdu | Kore |
| Bengali, Telugu, Gujarati, Punjabi, Malayalam, Odia | Aoede |
| English | Kore |

---

## API Routes

### Public Routes

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/` | Main single-page application |
| `GET` | `/api/states` | List of all Indian states & UTs |
| `GET` | `/api/districts/<state>` | Districts for a given state |
| `GET` | `/api/crops` | Full crop data dictionary |

### Auth Routes

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/auth/signup` | Register new user |
| `POST` | `/auth/login` | Login |
| `POST` | `/auth/logout` | Logout |
| `GET` | `/auth/me` | Get current user session info |

### Community Routes

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/community/posts` | List posts (paginated, filterable by tag) |
| `POST` | `/api/community/posts` | Create new post (auth required) |
| `POST` | `/api/community/posts/<id>/like` | Like a post |
| `POST` | `/api/community/posts/<id>/reply` | Reply to a post (auth required) |

### AI Proxy Routes

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/ai_proxy` | Gemini AI query with retry + fallback chain |
| `POST` | `/groq_proxy` | Groq AI query (Llama models) |
| `POST` | `/translate_proxy` | Translate AI response to selected language |
| `POST` | `/tts_proxy` | Gemini TTS — returns base64 WAV audio |

---

## Supported Languages

The `/translate_proxy` route and the TTS voice selector support all 12 languages listed in [Multilingual Support](#multilingual-support) above. Translation preserves all markdown formatting including tables, headers, bold/italic, and emojis.

---

## Crop Data Coverage

- **36 States & Union Territories** with 700+ district names
- **Kharif**: 9 crops | **Rabi**: 8 crops | **Zaid**: 6 crops
- **Cash Crops**: 2 | **Flowers**: 7 | **Horticulture**: 8 | **Plantation**: 2
- **Modern Techniques**: Hydroponics, Aeroponics, Aquaponics
- The AI assistant (KrishiTech system prompt) additionally covers:
  - Agro-climatic zones of India
  - Organic/Ayurvedic farming (Panchagavya, Jeevamrutha, Beejamrutha, Agnihastra)
  - Plant disease identification with herbal remedies
  - Government schemes: **PM-KISAN**, **PMFBY**, Soil Health Card Scheme

---

## Known Limitations

| Issue | Detail |
|-------|--------|
| **In-memory data** | Users, community posts, and session data are stored in memory and reset when the server restarts. For production, replace with SQLite/PostgreSQL. |
| **TTS preview access** | Gemini TTS models (`-preview`) may require API key enrollment. If both TTS layers fail, Layer 3 (Web Speech API) activates automatically. |
| **Gemini free-tier quotas** | `gemini-2.5-flash` allows 10 RPM and 500 RPD on the free tier. Rapid repeated requests can hit RPM limits. |
| **Voice search browser support** | Web Speech Recognition only works reliably in Chrome and Edge. |
| **No HTTPS in development** | Use `localhost` (not `127.0.0.1`) to enable secure-context APIs (TTS, microphone) without a certificate. |
| **Single-file frontend** | All UI logic is in `main.js` and `style.css`. For larger teams, consider splitting into modules. |

---

## License

This project was developed as a Capstone project. All rights reserved by the author.

---

<div align="center">
  <strong>🌱 KrishiTech — Empowering India's 140 million farming families with AI</strong><br>
  Built with ❤️ for Indian farmers
</div>
