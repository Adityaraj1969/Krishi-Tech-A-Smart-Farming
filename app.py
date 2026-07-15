"""
KrishiTech — India's Smart Agriculture Portal
Flask Backend — Fixed: google-genai SDK, requests for Groq, correct model names
"""

import os
import json
import hashlib
import datetime

# ── New Google GenAI SDK (replaces deprecated google.generativeai) ────────────
from google import genai
from google.genai import types

import requests as http_requests   # renamed to avoid shadowing Flask's 'request'
from flask import Flask, render_template, request, jsonify, session
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "KrishiTech-dev-secret")

# ── API Keys ──────────────────────────────────────────────────────────────────
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
GROQ_API_KEY   = os.environ.get("GROQ_API_KEY", "")

# Initialise Gemini client once
gemini_client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None

# ── Gemini model fallback chain (verified working on new SDK) ─────────────────
GEMINI_FALLBACKS = [
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-2.5-flash",
]

# ── Groq deprecated model remap ───────────────────────────────────────────────
GROQ_MODEL_REMAP = {
    "mixtral-8x7b-32768": "llama-3.3-70b-versatile",
    "llama2-70b-4096":    "llama-3.3-70b-versatile",
    "llama3-8b-8192":     "llama-3.1-8b-instant",
    "gemma2-9b-it":       "llama-3.1-8b-instant",   # gemma2 decommissioned → fast llama
    "gemma-7b-it":        "llama-3.1-8b-instant",
}

# ── In-memory stores ──────────────────────────────────────────────────────────
USERS_DB     = {}
COMMUNITY_DB = []
POST_ID_CTR  = [0]

# ── System prompt ──────────────────────────────────────────────────────────────
KRISHI_SYSTEM = (
    "You are KrishiTech, an expert agricultural assistant specialising in Indian farming. "
    "You have deep knowledge of all Indian crops, soil science, agro-climatic zones of India, "
    "modern farming techniques (Hydroponics, Aeroponics, Aquaponics), organic and Ayurvedic "
    "farming practices (Panchagavya, Jeevamrutha, Beejamrutha), plant diseases and traditional "
    "herbal remedies, and government schemes like PM-KISAN and PMFBY. "
    "Always prioritise natural and organic solutions. "
    "Use Markdown formatting with tables where appropriate. "
    "Be comprehensive yet practical for Indian farmers."
)

# ── Crop / States data ────────────────────────────────────────────────────────
from data import CROP_DATA, STATES_DATA

# ── Helpers ───────────────────────────────────────────────────────────────────
def _hash(pw):
    return hashlib.sha256(pw.encode()).hexdigest()

def _current_user():
    return session.get("username")

def _is_quota_error(err_str):
    """Returns True for any transient/capacity error that warrants trying the next model."""
    s = err_str.lower()
    return (
        "429" in s or
        "quota" in s or
        "resource_exhausted" in s or
        "503" in s or
        "unavailable" in s or
        "overloaded" in s or
        "high demand" in s or
        "try again later" in s or
        "service_unavailable" in s
    )

def _is_overload_error(err_str):
    """Returns True specifically for server-side 503/overload errors (not quota exhaustion)."""
    s = err_str.lower()
    return (
        "503" in s or
        "overloaded" in s or
        "high demand" in s or
        "service_unavailable" in s or
        "unavailable" in s
    ) and "quota" not in s and "resource_exhausted" not in s and "429" not in s

def _gemini_generate(model_id, prompt):
    response = gemini_client.models.generate_content(
        model=model_id,
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=KRISHI_SYSTEM,
            max_output_tokens=8192,
            temperature=0.7,
        ),
    )
    return response.text

# ── Routes ─────────────────────────────────────────────────────────────────────
@app.route("/")
def index():
    return render_template(
        "index.html",
        crop_data=CROP_DATA,
        states_data=STATES_DATA,
        api_key=GEMINI_API_KEY,
        groq_api_key=GROQ_API_KEY,
        current_user=_current_user(),
    )

@app.route("/api/states")
def get_states():
    return jsonify(list(STATES_DATA.keys()))

@app.route("/api/districts/<state>")
def get_districts(state):
    return jsonify(STATES_DATA.get(state, []))

@app.route("/api/crops")
def get_all_crops():
    return jsonify(CROP_DATA)

# ── Auth ───────────────────────────────────────────────────────────────────────
@app.route("/auth/signup", methods=["POST"])
def signup():
    data     = request.get_json(force=True)
    username = data.get("username", "").strip().lower()
    password = data.get("password", "")
    name     = data.get("name", "").strip()
    state    = data.get("state", "")
    district = data.get("district", "")
    if not username or not password or not name:
        return jsonify({"error": "Username, password and name are required."}), 400
    if len(username) < 3:
        return jsonify({"error": "Username must be at least 3 characters."}), 400
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters."}), 400
    if username in USERS_DB:
        return jsonify({"error": "Username already taken."}), 409
    USERS_DB[username] = {
        "password_hash": _hash(password), "name": name,
        "state": state, "district": district,
        "joined": datetime.datetime.utcnow().isoformat(),
        "avatar": name[0].upper(),
    }
    session["username"] = username
    return jsonify({"success": True, "name": name, "username": username})

@app.route("/auth/login", methods=["POST"])
def login():
    data     = request.get_json(force=True)
    username = data.get("username", "").strip().lower()
    password = data.get("password", "")
    user     = USERS_DB.get(username)
    if not user or user["password_hash"] != _hash(password):
        return jsonify({"error": "Invalid username or password."}), 401
    session["username"] = username
    return jsonify({"success": True, "name": user["name"], "username": username})

@app.route("/auth/logout", methods=["POST"])
def logout():
    session.pop("username", None)
    return jsonify({"success": True})

@app.route("/auth/me")
def me():
    u = _current_user()
    if not u:
        return jsonify({"logged_in": False})
    user = USERS_DB.get(u, {})
    return jsonify({
        "logged_in": True, "username": u, "name": user.get("name",""),
        "avatar": user.get("avatar","?"), "state": user.get("state",""),
        "district": user.get("district",""),
    })

# ── Community ──────────────────────────────────────────────────────────────────
@app.route("/api/community/posts", methods=["GET"])
def get_posts():
    page  = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 20))
    tag   = request.args.get("tag", "")
    posts = COMMUNITY_DB[::-1]
    if tag:
        posts = [p for p in posts if tag.lower() in [t.lower() for t in p.get("tags",[])]]
    start = (page-1)*limit
    return jsonify({"posts": posts[start:start+limit], "total": len(posts)})

@app.route("/api/community/posts", methods=["POST"])
def create_post():
    u = _current_user()
    if not u:
        return jsonify({"error": "Please log in to post."}), 401
    data  = request.get_json(force=True)
    title = data.get("title","").strip()
    body  = data.get("body","").strip()
    tags  = data.get("tags",[])
    if not title or not body:
        return jsonify({"error": "Title and body are required."}), 400
    POST_ID_CTR[0] += 1
    user = USERS_DB.get(u, {})
    post = {
        "id": POST_ID_CTR[0], "title": title, "body": body, "tags": tags[:5],
        "author": u, "author_name": user.get("name", u),
        "avatar": user.get("avatar","?"), "state": user.get("state",""),
        "district": user.get("district",""),
        "created_at": datetime.datetime.utcnow().isoformat(),
        "likes": 0, "replies": [],
    }
    COMMUNITY_DB.append(post)
    return jsonify({"success": True, "post": post})

@app.route("/api/community/posts/<int:pid>/like", methods=["POST"])
def like_post(pid):
    for p in COMMUNITY_DB:
        if p["id"] == pid:
            p["likes"] += 1
            return jsonify({"likes": p["likes"]})
    return jsonify({"error": "Post not found"}), 404

@app.route("/api/community/posts/<int:pid>/reply", methods=["POST"])
def reply_post(pid):
    u = _current_user()
    if not u:
        return jsonify({"error": "Please log in to reply."}), 401
    data  = request.get_json(force=True)
    body  = data.get("body","").strip()
    if not body:
        return jsonify({"error": "Reply cannot be empty."}), 400
    user  = USERS_DB.get(u, {})
    reply = {
        "author": u, "author_name": user.get("name", u),
        "avatar": user.get("avatar","?"), "body": body,
        "created_at": datetime.datetime.utcnow().isoformat(),
    }
    for p in COMMUNITY_DB:
        if p["id"] == pid:
            p["replies"].append(reply)
            return jsonify({"success": True, "reply": reply})
    return jsonify({"error": "Post not found"}), 404

# ── Gemini AI Proxy (new google-genai SDK) ─────────────────────────────────────
@app.route("/ai_proxy", methods=["POST"])
def ai_proxy():
    if not gemini_client:
        return jsonify({"error": "GEMINI_API_KEY not configured in .env"}), 500

    import time

    body         = request.get_json(force=True)
    messages     = body.get("messages", [])
    req_model    = body.get("model", "gemini-2.5-flash")
    user_message = messages[-1]["content"] if messages else ""

    # gemini-2.5-flash is preferred for deep research — we retry it aggressively
    # before ever falling back, because 503s are transient (usually < 10 seconds).
    explicit_25 = "2.5" in req_model

    # 2.5-flash: disable thinking budget → faster, less quota burn, still best quality
    def make_config(model_id):
        cfg = dict(
            system_instruction=KRISHI_SYSTEM,
            max_output_tokens=8192,
            temperature=0.7,
        )
        if "2.5" in model_id:
            cfg["thinking_config"] = types.ThinkingConfig(thinking_budget=0)
        return types.GenerateContentConfig(**cfg)

    def _generate(model_id):
        response = gemini_client.models.generate_content(
            model=model_id,
            contents=user_message,
            config=make_config(model_id),
        )
        return response.text

    # ── Step 1: Retry the preferred model (2.5-flash) up to 3 times on overload ──
    # 503 overloads are almost always transient — a short wait usually resolves them.
    MAX_RETRIES   = 3
    RETRY_DELAYS  = [2, 4, 8]   # seconds between retries (exponential backoff)

    last_err     = ""
    last_is_quota = False

    for attempt in range(MAX_RETRIES):
        try:
            text = _generate(req_model)
            print(f"  Gemini OK ({req_model}) attempt={attempt+1}")
            return jsonify({"text": text, "model_used": req_model})
        except Exception as e:
            last_err = str(e)
            print(f"  Gemini attempt {attempt+1}/{MAX_RETRIES} ({req_model}): {last_err[:100]}")

            if not _is_quota_error(last_err):
                # Auth / bad-request / network error — no point retrying
                return jsonify({"error": last_err}), 500

            last_is_quota = not _is_overload_error(last_err)

            if last_is_quota:
                # True quota exhaustion (429 / RESOURCE_EXHAUSTED) — retrying won't help
                break

            # Overload (503) — wait and retry
            if attempt < MAX_RETRIES - 1:
                time.sleep(RETRY_DELAYS[attempt])

    # ── Step 2: If it was a true quota exhaustion on 2.5-flash, stop here ────────
    if explicit_25 and last_is_quota:
        # Distinguish RPM (per-minute) from daily quota — both return 429
        # Free tier limits: 10 RPM + 500 RPD (requests/day) for gemini-2.5-flash
        is_rpm = "per_minute" in last_err.lower() or "rpm" in last_err.lower() or (
            "minute" in last_err.lower() and "quota" in last_err.lower()
        )
        if is_rpm:
            err_msg = (
                "gemini-2.5-flash rate limit hit (10 requests/minute on free tier). "
                "Wait 60 seconds and try again, or switch to Llama 3.3 70B (Groq) — "
                "free with much higher rate limits."
            )
        else:
            err_msg = (
                "gemini-2.5-flash daily quota exceeded (500 requests/day on free tier). "
                "Wait until midnight (UTC) for quota reset, or switch to "
                "Llama 3.3 70B (Groq) — free with no daily limits."
            )
        return jsonify({
            "error": err_msg,
            "quota_exceeded": True,
            "is_rpm_limit": is_rpm,
        }), 429

    # ── Step 3: All retries failed on overload — try 2.0-flash as last resort ────
    fallback_chain = ["gemini-2.0-flash", "gemini-2.0-flash-lite"]
    for fallback in fallback_chain:
        if fallback == req_model:
            continue
        try:
            text = _generate(fallback)
            print(f"  Gemini OK via fallback ({fallback})")
            # Notify frontend which model was actually used
            return jsonify({
                "text": text,
                "model_used": fallback,
                "fallback_notice": (
                    f"gemini-2.5-flash was overloaded — response generated by {fallback}. "
                    f"It will auto-retry 2.5-flash on your next message."
                ),
            })
        except Exception as ef:
            print(f"  Fallback {fallback} also failed: {str(ef)[:80]}")
            continue

    # ── Step 4: Everything failed ────────────────────────────────────────────────
    is_503 = _is_overload_error(last_err)
    if is_503:
        msg = (
            "gemini-2.5-flash is overloaded (503) and fallback models also failed. "
            "This is a temporary Google server issue. "
            "Switch to Llama 3.3 70B (Groq) using the dropdown — always free and available."
        )
    else:
        msg = (
            "All Gemini models quota exceeded. "
            "Switch to Llama 3.3 70B (Groq) using the dropdown — free with no daily limits."
        )
    return jsonify({"error": msg, "quota_exceeded": True}), 429

# ── Groq Proxy (requests library — avoids Cloudflare 1010 block) ──────────────
@app.route("/groq_proxy", methods=["POST"])
def groq_proxy():
    if not GROQ_API_KEY:
        return jsonify({"error": "GROQ_API_KEY not set. Get a free key at https://console.groq.com"}), 500
    body     = request.get_json(force=True)
    messages = body.get("messages", [])
    raw_model = body.get("model", "llama-3.3-70b-versatile")
    model_id  = GROQ_MODEL_REMAP.get(raw_model, raw_model)
    groq_msgs = [{"role": "system", "content": KRISHI_SYSTEM}] + [
        {"role": "assistant" if m["role"]=="assistant" else "user", "content": m["content"]}
        for m in messages
    ]
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    }
    try:
        resp = http_requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers=headers,
            json={"model": model_id, "messages": groq_msgs, "max_tokens": 4096, "temperature": 0.7},
            timeout=90,
        )
        if not resp.ok:
            try:
                err_msg = resp.json().get("error", {}).get("message", resp.text[:300])
            except Exception:
                err_msg = resp.text[:300]
            print(f"  Groq HTTP {resp.status_code}: {err_msg}")
            return jsonify({"error": f"Groq Error {resp.status_code}: {err_msg}"}), 500
        text = resp.json()["choices"][0]["message"]["content"]
        print(f"  Groq OK ({model_id})")
        return jsonify({"text": text})
    except http_requests.exceptions.Timeout:
        return jsonify({"error": "Groq timed out. Please try again."}), 500
    except Exception as e:
        print(f"  Groq exception: {e}")
        return jsonify({"error": f"Groq failed: {str(e)}"}), 500

# ── Translate Proxy — Groq first, Gemini fallback ─────────────────────────────
@app.route("/translate_proxy", methods=["POST"])
def translate_proxy():
    body   = request.get_json(force=True)
    text   = body.get("text", "")
    target = body.get("target_lang", "Hindi")
    prompt = (
        f"Translate the following agricultural text into {target}. "
        "Preserve all markdown formatting, tables, headers, and emojis exactly. "
        f"Output ONLY the translated text:\n\n{text}"
    )
    if GROQ_API_KEY:
        try:
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            }
            resp = http_requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers=headers,
                json={
                    "model": "llama-3.3-70b-versatile",
                    "messages": [
                        {"role": "system", "content": f"Translate to {target}. Preserve all markdown. Output only the translation."},
                        {"role": "user", "content": prompt},
                    ],
                    "max_tokens": 8192, "temperature": 0.3,
                },
                timeout=60,
            )
            if resp.ok:
                return jsonify({"translated": resp.json()["choices"][0]["message"]["content"]})
        except Exception as e:
            print(f"  Translate Groq failed: {e}")
    if gemini_client:
        for model_id in GEMINI_FALLBACKS:
            try:
                r = gemini_client.models.generate_content(
                    model=model_id, contents=prompt,
                    config=types.GenerateContentConfig(
                        system_instruction=f"Translate to {target}. Preserve markdown. Output only the translation.",
                        max_output_tokens=8192, temperature=0.3,
                    ),
                )
                return jsonify({"translated": r.text})
            except Exception as e:
                if _is_quota_error(str(e)):
                    continue
                return jsonify({"error": str(e)}), 500
    return jsonify({"error": "No AI service available for translation."}), 500


# ── TTS Proxy — Gemini 3.1 Flash TTS → Gemini 2.5 Flash TTS ──────────────────
# Returns base64-encoded WAV audio so the browser can play it directly.
# Falls back gracefully; frontend falls back to Browser Web Speech API.

import base64 as _b64
import wave   as _wave
import io     as _io

def _pcm_to_wav_bytes(pcm_bytes, channels=1, rate=24000, sample_width=2):
    """Convert raw PCM (audio/L16) bytes to WAV bytes playable by browsers."""
    buf = _io.BytesIO()
    with _wave.open(buf, "wb") as wf:
        wf.setnchannels(channels)
        wf.setsampwidth(sample_width)
        wf.setframerate(rate)
        wf.writeframes(pcm_bytes)
    return buf.getvalue()

# Dedicated Gemini TTS client — tight 9s SDK timeout for fast failure.
# Latency scales with text length:  300 chars → 2-4s  |  600 chars → 4-8s
# We send ONLY the first 300 chars (fast intro), then Layer 3 handles the rest.
_tts_client = None
def _get_tts_client():
    global _tts_client
    if _tts_client is None and GEMINI_API_KEY:
        _tts_client = genai.Client(
            api_key=GEMINI_API_KEY,
            http_options=types.HttpOptions(timeout=15000), # 15s (Gemini min is 10s)
        )
    return _tts_client

TTS_CHUNK_CHARS = 300  # max chars per TTS request — tuned for <8s response

@app.route("/tts_proxy", methods=["POST"])
def tts_proxy():
    tts_client = _get_tts_client()
    if not tts_client:
        return jsonify({"error": "GEMINI_API_KEY not configured", "fallback": True}), 503

    body  = request.get_json(force=True)
    text  = body.get("text", "").strip()
    voice = body.get("voice", "Kore")

    if not text:
        return jsonify({"error": "No text provided"}), 400

    # Only send first TTS_CHUNK_CHARS characters — keeps response under 8s
    text = text[:TTS_CHUNK_CHARS]

    # ── TTS model priority chain ──────────────────────────────────────────────
    # Confirmed model IDs from Google AI docs, April 15 2026:
    # • gemini-3.1-flash-tts-preview  — Layer 1 ("-preview" IS part of the ID)
    # • gemini-2.5-flash-preview-tts  — Layer 2 (correct v1beta name; -tts alone is Vertex AI only)
    TTS_MODELS = [
        "gemini-3.1-flash-tts-preview",  # Layer 1 — Gemini 3.1 Flash TTS
        "gemini-2.5-flash-preview-tts",  # Layer 2 — Gemini 2.5 Flash TTS (v1beta name)
    ]

    last_err = ""
    for model_id in TTS_MODELS:
        try:
            print(f"  TTS trying {model_id} voice={voice} text_len={len(text)}")
            response = tts_client.models.generate_content(
                model=model_id,
                contents=text,
                config=types.GenerateContentConfig(
                    response_modalities=["AUDIO"],
                    speech_config=types.SpeechConfig(
                        voice_config=types.VoiceConfig(
                            prebuilt_voice_config=types.PrebuiltVoiceConfig(
                                voice_name=voice,
                            )
                        )
                    ),
                ),
            )

            # Validate response structure
            if (not response.candidates or
                    not response.candidates[0].content or
                    not response.candidates[0].content.parts):
                last_err = f"{model_id}: empty response (no audio parts)"
                print(f"  TTS {model_id} empty response — trying next model")
                continue

            part = response.candidates[0].content.parts[0]
            if not part.inline_data or not part.inline_data.data:
                last_err = f"{model_id}: response has no inline_data"
                print(f"  TTS {model_id} no inline_data — trying next model")
                continue

            pcm_data = part.inline_data.data          # raw PCM bytes, audio/L16, 24kHz mono
            mime     = part.inline_data.mime_type or "audio/L16"
            print(f"  TTS {model_id} OK mime={mime} pcm_len={len(pcm_data)}")

            wav_bytes = _pcm_to_wav_bytes(pcm_data)
            audio_b64 = _b64.b64encode(wav_bytes).decode("utf-8")
            return jsonify({
                "audio_b64":  audio_b64,
                "model_used": model_id,
                "format":     "wav",
            })

        except Exception as e:
            last_err = str(e)
            print(f"  TTS {model_id} FAILED: {last_err[:220]}")
            err_lower = last_err.lower()

            # Hard stop only on auth errors — bad API key won't work on any model
            if ("api_key" in err_lower or "authentication" in err_lower or
                    "permission_denied" in err_lower or
                    ("invalid" in err_lower and "key" in err_lower)):
                print(f"  TTS auth error — stopping retry")
                break

            # For all other errors (quota, model not found, preview access denied,
            # timeout, 500, 503) → continue to next model in the chain

    # All models failed — return fallback:true so frontend uses Web Speech API
    print(f"  TTS all models failed. Last error: {last_err[:300]}")
    return jsonify({
        "error":    last_err or "All Gemini TTS models unavailable",
        "fallback": True,
    }), 503


if __name__ == "__main__":
    port  = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_DEBUG", "True").lower() == "true"

    # localhost (not 127.0.0.1) is treated as a "secure context" by all browsers
    # This means speechSynthesis, microphone, etc. all work WITHOUT needing HTTPS.
    # Reference: https://w3c.github.io/webappsec-secure-contexts/#is-origin-trustworthy
    print(f"\n  KrishiTech starting on http://localhost:{port}")
    print("  Gemini API key loaded OK." if GEMINI_API_KEY else "  WARNING: GEMINI_API_KEY not set")
    print("  Groq API key loaded OK."   if GROQ_API_KEY   else "  INFO: GROQ_API_KEY not set — get free key at https://console.groq.com")

    app.run(debug=debug, port=port, host="localhost")