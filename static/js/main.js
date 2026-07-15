// =====================================================================
// KrishiTech main.js — Enhanced Edition
// Features: Voice input, Multilingual (translate), Multi-model AI
//           (Gemini 2.0 Flash / 2.5 Flash, Groq Llama/Mixtral/Gemma),
//           Community/Forum, Auth (Login/Signup), Speak-modal TTS
// =====================================================================

// ===== CROP DATA =====
const CROP_DATA = {
  kharif: [
    { name: "Rice",        emoji: "🌾", sci: "Oryza sativa" },
    { name: "Maize",       emoji: "🌽", sci: "Zea mays" },
    { name: "Jowar",       emoji: "🌾", sci: "Sorghum bicolor" },
    { name: "Bajra",       emoji: "🌾", sci: "Pennisetum glaucum" },
    { name: "Tur (Arhar)", emoji: "🫘", sci: "Cajanus cajan" },
    { name: "Moong",       emoji: "🟢", sci: "Vigna radiata" },
    { name: "Urad",        emoji: "⚫", sci: "Vigna mungo" },
    { name: "Groundnut",   emoji: "🥜", sci: "Arachis hypogaea" },
    { name: "Soybean",     emoji: "🫘", sci: "Glycine max" },
  ],
  rabi: [
    { name: "Wheat",          emoji: "🌾", sci: "Triticum aestivum" },
    { name: "Barley",         emoji: "🌾", sci: "Hordeum vulgare" },
    { name: "Gram (Chickpea)",emoji: "🫘", sci: "Cicer arietinum" },
    { name: "Masur (Lentil)", emoji: "🟤", sci: "Lens culinaris" },
    { name: "Mustard",        emoji: "🌻", sci: "Brassica juncea" },
    { name: "Rapeseed",       emoji: "🌼", sci: "Brassica napus" },
    { name: "Safflower",      emoji: "🌸", sci: "Carthamus tinctorius" },
    { name: "Sunflower",      emoji: "🌻", sci: "Helianthus annuus" },
  ],
  zaid: [
    { name: "Watermelon",  emoji: "🍉", sci: "Citrullus lanatus" },
    { name: "Muskmelon",   emoji: "🍈", sci: "Cucumis melo" },
    { name: "Cucumber",    emoji: "🥒", sci: "Cucumis sativus" },
    { name: "Pumpkin",     emoji: "🎃", sci: "Cucurbita pepo" },
    { name: "Bittergourd", emoji: "🥬", sci: "Momordica charantia" },
    { name: "Fodder Crops",emoji: "🌿", sci: "Various species" },
  ],
  cash: [
    { name: "Cotton", emoji: "🌿", sci: "Gossypium hirsutum" },
    { name: "Jute",   emoji: "🌿", sci: "Corchorus capsularis" },
  ],
  flowers: [
    { name: "Rose",         emoji: "🌹", sci: "Rosa hybrida" },
    { name: "Marigold",     emoji: "🌼", sci: "Tagetes erecta" },
    { name: "Rajanigandha", emoji: "🤍", sci: "Polianthes tuberosa" },
    { name: "Tulip",        emoji: "🌷", sci: "Tulipa gesneriana" },
    { name: "Sadabahar",    emoji: "🌸", sci: "Catharanthus roseus" },
    { name: "Kusum",        emoji: "🌺", sci: "Carthamus tinctorius" },
    { name: "Lily",         emoji: "🌸", sci: "Lilium spp." },
  ],
  plantation: [
    { name: "Tea",    emoji: "🍵", sci: "Camellia sinensis" },
    { name: "Coffee", emoji: "☕", sci: "Coffea arabica" },
  ],
};

// ===== STATE =====
let currentSeason         = "kharif";
let currentModalContent   = "";
let conversationHistory   = [];
let currentUser           = null;  // { username, name, avatar, state, district }
let communityPage         = 1;
let communityTag          = "";
let voiceRecognition      = null;
let speechSynth           = window.speechSynthesis;
let speakingUtterance     = null;
// ===== INIT =====
document.addEventListener("DOMContentLoaded", () => {
  renderCrops("kharif");
  initNavScroll();
  fetchAuthStatus();
  loadCommunityPosts(true);

  // Enter key bindings
  const enterKeys = [
    ["quickSearchInput",  quickSearch],
    ["cropSearchInput",   searchCrop],
    ["soilSearchInput",   searchSoil],
    ["diseaseInput",      searchDisease],
    ["regionTextInput",   searchRegionText],
  ];
  enterKeys.forEach(([id, fn]) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("keydown", e => { if (e.key === "Enter") fn(); });
  });
});

// ===== NAV =====
function initNavScroll() {
  window.addEventListener("scroll", () => {
    document.getElementById("navbar").classList.toggle("scrolled", window.scrollY > 40);
  });
}
function toggleMenu() {
  const links = document.querySelector(".nav-links");
  const open  = links.style.display === "flex";
  links.style.display = open ? "none" : "flex";
  if (!open) {
    Object.assign(links.style, {
      flexDirection: "column", position: "absolute",
      top: "68px", left: "0", right: "0",
      background: "rgba(253,248,240,0.98)",
      padding: "16px 24px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.1)", gap: "4px",
    });
  }
}
function scrollToSearch() {
  document.getElementById("smart-search").scrollIntoView({ behavior: "smooth" });
}

// ===== CROPS GRID =====
function renderCrops(season) {
  const grid  = document.getElementById("crops-grid");
  const crops = CROP_DATA[season] || [];
  grid.innerHTML = crops.map(crop => `
    <div class="crop-card" onclick="askAI('Provide a comprehensive farming guide for ${crop.name} in India. Include: suitable soil type and nutrition requirements, ideal climate and temperature range, geographic regions in India where it is grown, irrigation schedule, types of fertilizers (organic and chemical), pesticides, weedicides, timeline from sowing to harvesting, common diseases and herbal/ayurvedic prevention methods, average rainfall requirement, and post-harvest tips.')">
      <span class="crop-emoji">${crop.emoji}</span>
      <div class="crop-name">${crop.name}</div>
      <div class="crop-sci">${crop.sci}</div>
      <div class="crop-action">Full Guide →</div>
    </div>`).join("");
}
function showSeason(season, btn) {
  currentSeason = season;
  document.querySelectorAll(".stab").forEach(b => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
  document.querySelectorAll(".season-info").forEach(el => el.classList.add("hidden"));
  const info = document.getElementById("season-info-" + season);
  if (info) info.classList.remove("hidden");
  renderCrops(season);
  document.getElementById("natural-farming").scrollIntoView({ behavior: "smooth", block: "start" });
}

// ===== SEARCH TABS =====
function switchSearchTab(tab, btn) {
  document.querySelectorAll(".search-tab").forEach(b => b.classList.remove("active"));
  document.querySelectorAll(".search-panel").forEach(p => p.classList.remove("active"));
  if (btn) btn.classList.add("active");
  document.getElementById("panel-" + tab).classList.add("active");
}

// ===== SEARCH FUNCTIONS =====
function quickSearch() {
  const val = document.getElementById("quickSearchInput").value.trim();
  if (!val) return;
  document.getElementById("cropSearchInput").value = val;
  switchSearchTab("crop", document.querySelector(".search-tab"));
  searchCrop(val);
}
function searchCrop(overrideVal) {
  const val = overrideVal || document.getElementById("cropSearchInput").value.trim();
  if (!val) { alert("Please enter a crop name."); return; }
  const prompt = `Provide a highly detailed agricultural guide for "${val}" in India. Structure your response with clear sections:

## 🌾 About ${val}
Brief botanical description and importance in Indian agriculture.

## 🪨 Soil Requirements
- Soil type (loamy, clayey, sandy, black cotton etc.)
- pH range
- Nutritional requirements (N, P, K levels)
- Organic matter content
- Moisture/humidity requirements
- Soil preparation methods

## 🌤️ Climate & Environment
- Temperature range (sowing and growing)
- Rainfall requirement (mm/year)
- Humidity range
- Sunshine hours
- Wind sensitivity

## 🗺️ Geographic Regions
- Major producing states in India
- Suitable agro-climatic zones
- Districts known for quality production

## 📅 Farming Timeline
Step-by-step timeline from land preparation to harvest:
| Stage | Activity | Duration/Month |
|-------|----------|----------------|

## 💧 Irrigation Schedule
- Water requirement (liters/hectare)
- Irrigation method (drip, flood, sprinkler)
- Critical irrigation stages

## 🌱 Fertilizer Guide
### Organic/Natural Fertilizers
### Chemical Fertilizers (if needed)

## 🛡️ Pest & Disease Management
### Common Diseases:
| Disease | Symptoms | Organic Treatment | Ayurvedic Remedy |
### Common Pests:
| Pest | Damage | Natural Control | Herbal Spray |

## 🌿 Herbal & Ayurvedic Treatments
- Panchagavya, Jeevamrutha, other traditional remedies

## 🚜 Harvest & Post-Harvest
- Maturity indicators, Harvesting method, Yield per hectare, Storage and market tips

## 💡 Expert Tips
3-5 practical tips for maximizing yield naturally.`;
  openModal(`🌾 Complete Guide: ${val}`, prompt);
}
function setAndSearch(crop) {
  document.getElementById("cropSearchInput").value = crop;
  searchCrop(crop);
}
function searchSoil() {
  const val = document.getElementById("soilSearchInput").value.trim();
  if (!val) { alert("Please describe your soil."); return; }
  const prompt = `Based on this soil description: "${val}"

Provide a comprehensive list of suitable crops for Indian farming:

## 🪨 Soil Analysis
## ✅ Highly Suitable Crops (Best Match)
## 🟡 Moderately Suitable Crops (With Amendments)
## 🌱 Soil Improvement Recommendations
## 📋 Top 5 Recommended Crops Summary
| Crop | Season | Expected Yield | Difficulty | Profitability |
## 💡 Expert Advice`;
  openModal(`🪨 Crops for: ${val}`, prompt);
}
function setSoilAndSearch(soil) {
  document.getElementById("soilSearchInput").value = soil;
  switchSearchTab("soil", document.querySelectorAll(".search-tab")[1]);
  searchSoil();
}
function loadDistricts() {
  const state = document.getElementById("stateSelect").value;
  const sel   = document.getElementById("districtSelect");
  if (!state) { sel.innerHTML = '<option value="">— Choose District —</option>'; return; }
  fetch(`/api/districts/${encodeURIComponent(state)}`)
    .then(r => r.json())
    .then(d => {
      sel.innerHTML = '<option value="">— Choose District —</option>' +
        d.map(x => `<option value="${x}">${x}</option>`).join("");
    });
}
function searchRegion() {
  const state    = document.getElementById("stateSelect").value;
  const district = document.getElementById("districtSelect").value;
  if (!state) { alert("Please select a state."); return; }
  searchRegionByLocation(district ? `${district}, ${state}` : state);
}
function searchRegionText() {
  const val = document.getElementById("regionTextInput").value.trim();
  if (!val) { alert("Please enter a region name."); return; }
  searchRegionByLocation(val);
}
function setRegionAndSearch(state) {
  document.getElementById("stateSelect").value = state;
  document.getElementById("smart-search").scrollIntoView({ behavior: "smooth" });
  switchSearchTab("region", document.querySelectorAll(".search-tab")[2]);
  searchRegionByLocation(state);
}
function searchRegionByLocation(location) {
  const prompt = `Provide a comprehensive agricultural profile for "${location}" in India:

## 📍 Regional Overview
## 🪨 Soil Types in This Region
| Soil Type | Coverage % | Characteristics | Best For |
## 🌤️ Agro-Climatic Profile
## 🌾 Major Crops Grown
### Currently Grown:
| Crop | Season | Area (hectares) | Significance |
### Recommended Crops (for optimal returns)
## 📅 Crop Calendar for ${location}
## 💧 Water & Irrigation Resources
## 🏛️ Agricultural Support (KVK, schemes, Mandi)
## 💡 Best Practices for This Region`;
  openModal(`🗺️ Agriculture Guide: ${location}`, prompt);
}
function searchDisease() {
  const val = document.getElementById("diseaseInput").value.trim();
  if (!val) { alert("Please enter a crop or disease name."); return; }
  const prompt = `Provide a detailed disease and pest management guide for: "${val}"

## 🔍 Disease/Pest Identification
## 🩺 Symptoms & Diagnosis
## 🌿 Organic & Herbal Prevention (Primary Recommendation)
### Herbal Sprays & Treatments:
| Remedy | Ingredients | Preparation | Application | Frequency |
### Ayurvedic/Traditional Treatments
## 🛡️ Safe Chemical Options (Last Resort)
## ✅ Integrated Disease Management Plan
## 🚫 What NOT to Do
## 💡 Prevention for Next Season`;
  openModal(`🔬 Disease Guide: ${val}`, prompt);
}

// ===== AI MODAL =====
async function askAI(prompt) {
  openModal("🤖 KrishiTech AI", prompt);
}

function openModal(title, prompt) {
  const modal  = document.getElementById("aiModal");
  const titleEl = document.getElementById("modalTitle");
  const body   = document.getElementById("modalBody");
  titleEl.textContent = title;
  body.innerHTML = `
    <div class="modal-loading">
      <div class="loading-spinner"></div>
      <p>Consulting agricultural knowledge base...</p>
      <small style="color:#aaa;margin-top:8px">Powered by AI</small>
    </div>`;
  modal.classList.add("open");
  document.body.style.overflow = "hidden";
  conversationHistory = [{ role: "user", content: prompt }];
  callAI(conversationHistory, body);
}

// ===== CORE AI CALL — routes to Gemini or Groq based on selector =====
// Gemini fallback chain: all verified working with new google-genai SDK
const GEMINI_FALLBACK_CHAIN = [
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",   // lighter quota, good fallback
  "gemini-2.5-flash",        // last resort (low daily free quota)
];
const GROQ_SYSTEM = "You are KrishiTech, an expert agricultural assistant specialising in Indian farming. You have deep knowledge of all Indian crops, soil science, agro-climatic zones of India, modern farming techniques (Hydroponics, Aeroponics, Aquaponics), organic and Ayurvedic farming practices (Panchagavya, Jeevamrutha, Beejamrutha), plant diseases and traditional herbal remedies. Always prioritise natural and organic solutions. Use Markdown formatting with tables where appropriate. Be comprehensive yet practical for Indian farmers.";

async function callAI(messages, bodyEl) {
  const selectorVal = (document.getElementById("modelSelector")?.value) || "groq|llama-3.3-70b-versatile";
  const [provider, modelId] = selectorVal.split("|");
  const useProxy = window.location.protocol !== "file:";

  try {
    let text = "";

    if (provider === "groq") {
      // ── Groq (Llama / Gemma) ──────────────────────────────────────────
      if (useProxy) {
        const resp = await fetch("/groq_proxy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages, model: modelId }),
        });
        const data = await resp.json();
        if (data.error) throw new Error(data.error);
        text = data.text;
      } else {
        // Standalone HTML: call Groq API directly
        const groqKey = window.KRISHI_GROQ_KEY || "";
        if (!groqKey) throw new Error("GROQ_API_KEY not configured. Add it to your .env file.");
        const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${groqKey}` },
          body: JSON.stringify({
            model: modelId,
            messages: [
              { role: "system", content: GROQ_SYSTEM },
              ...messages.map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content })),
            ],
            max_tokens: 4096,
            temperature: 0.7,
          }),
        });
        if (!resp.ok) {
          const err = await resp.json().catch(() => ({}));
          throw new Error(`Groq API Error ${resp.status}: ${err?.error?.message || resp.statusText}`);
        }
        const data = await resp.json();
        text = data.choices[0].message.content;
      }

    } else {
      // ── Gemini — backend handles retries & fallback for 2.5-flash ──────
      if (useProxy) {
        // Show a status hint for 2.5-flash deep research mode
        const loadingP = bodyEl.querySelector(".modal-loading p");
        if (loadingP && modelId.includes("2.5")) {
          loadingP.textContent = "⚡ Using Gemini 2.5 Flash (deep research mode)…";
        }

        const resp = await fetch("/ai_proxy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages, model: modelId }),
        });
        const data = await resp.json();

        if (data.error) throw new Error(data.error);
        text = data.text;

        // If backend silently fell back to 2.0-flash, attach a soft notice
        if (data.fallback_notice) {
          bodyEl._fallbackNotice = data.fallback_notice;
        }
      } else {
        // Standalone HTML: direct Gemini API call with fallback
        const apiKey = window.KRISHI_API_KEY || "";
        if (!apiKey || apiKey === "your_gemini_api_key_here")
          throw new Error("Gemini API key not set. Add GEMINI_API_KEY to your .env file.");
        let modelsToTry = [modelId, ...GEMINI_FALLBACK_CHAIN.filter(m => m !== modelId)];
        let lastError = null;
        for (const tryModel of modelsToTry) {
          const resp = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${tryModel}:generateContent?key=${apiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                system_instruction: { parts: [{ text: GROQ_SYSTEM }] },
                contents: messages.map(m => ({
                  role: m.role === "assistant" ? "model" : "user",
                  parts: [{ text: m.content }],
                })),
              }),
            }
          );
          const data = await resp.json();
          if (data.error) {
            const code = data.error.code || 0;
            if (code === 429 || data.error.status === "RESOURCE_EXHAUSTED") {
              lastError = data.error.message; continue;
            }
            throw new Error(data.error.message || "Gemini API Error");
          }
          text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
          if (text) break;
        }
        if (!text && lastError) throw new Error(`Gemini quota exceeded. Switch to a Groq model using the dropdown.`);
      }
    }

    if (text) {
      currentModalContent = text;
      conversationHistory.push({ role: "assistant", content: text });

      // Show a soft yellow notice if backend fell back from 2.5-flash to 2.0-flash
      const notice = bodyEl._fallbackNotice || "";
      const noticeBanner = notice
        ? `<div style="margin-bottom:12px;padding:10px 14px;background:#fffbeb;border-left:4px solid #f6ad55;border-radius:6px;font-size:0.85rem;color:#744210">
             ⚡ <strong>Note:</strong> ${notice}
           </div>`
        : "";

      bodyEl.innerHTML = noticeBanner + `<div class="ai-response">${renderMarkdown(text)}</div>`;
      delete bodyEl._fallbackNotice;

      // auto-translate if a non-English language is selected
      const lang = document.getElementById("langSelector")?.value || "en";
      if (lang !== "en") translateAndDisplay(text, lang, bodyEl);
    }
  } catch (err) {
    console.error("KrishiTech AI Error:", err);
    const msg = err.message || "";
    const isQuota    = msg.includes("quota") || msg.includes("429") || msg.includes("quota_exceeded");
    const isOverload = msg.includes("503") || msg.toLowerCase().includes("overloaded") ||
                       msg.toLowerCase().includes("high demand") || msg.toLowerCase().includes("unavailable");
    const isGroqErr  = msg.toLowerCase().includes("groq");

    let badge = "Error";
    let tip   = "";
    if (isOverload) {
      badge = "🔴 Gemini Overloaded (503)";
      tip   = "<strong>💡 Fix:</strong> Gemini servers are temporarily overloaded. <b>Switch to a Groq model</b> (Llama 3.3 70B) using the dropdown — it's always available and free.<br><br>";
    } else if (isQuota) {
      badge = "⚠️ Quota Exceeded";
      tip   = "<strong>💡 Fix:</strong> Switch to a <b>Groq model</b> (Llama 3.3 70B) using the dropdown — free with no daily limits.<br><br>";
    }

    bodyEl.innerHTML = `
      <div style="padding:20px;color:#c53030;background:#fff5f5;border-radius:8px;border-left:4px solid #e53e3e">
        <strong>${badge}:</strong> ${msg}<br><br>
        ${tip}
        <small>Your API keys are fine. This is a temporary server-side issue.</small>
      </div>`;
  }
}

function closeModal() {
  document.getElementById("aiModal").classList.remove("open");
  document.body.style.overflow = "";
  stopSpeaking();
}
function closeModalOutside(e) {
  if (e.target === document.getElementById("aiModal")) closeModal();
}
function copyModalContent() {
  navigator.clipboard.writeText(currentModalContent).then(() => {
    const btn = document.querySelector(".modal-copy-btn");
    btn.textContent = "✅ Copied!";
    setTimeout(() => btn.textContent = "📋 Copy Response", 2000);
  });
}
async function askFollowUp() {
  const q = prompt("Ask a follow-up question:");
  if (!q) return;
  const body       = document.getElementById("modalBody");
  const currentHtml = body.innerHTML;
  body.innerHTML = currentHtml + `
    <hr style="margin:20px 0;border-color:rgba(82,183,136,0.2)">
    <div style="background:rgba(82,183,136,0.08);border-radius:12px;padding:12px 16px;margin-bottom:16px;font-size:0.9rem;color:#2d6a4f"><strong>You asked:</strong> ${q}</div>
    <div class="modal-loading"><div class="loading-spinner"></div><p>Getting answer...</p></div>`;
  conversationHistory.push({ role: "user", content: q });
  const loadingDiv = body.querySelector(".modal-loading:last-child");
  const tempDiv    = document.createElement("div");
  body.appendChild(tempDiv);
  await callAI(conversationHistory, tempDiv);
  if (loadingDiv) loadingDiv.remove();
}

// ===== LANGUAGE CHANGE =====
function onLangChange() {
  // If there's already content loaded, translate it
  const lang = document.getElementById("langSelector")?.value || "en";
  if (currentModalContent && lang !== "en") {
    const body = document.getElementById("modalBody");
    translateAndDisplay(currentModalContent, lang, body);
  } else if (currentModalContent && lang === "en") {
    const body = document.getElementById("modalBody");
    body.innerHTML = `<div class="ai-response">${renderMarkdown(currentModalContent)}</div>`;
  }
}

const LANG_NAMES = {
  en: "English", hi: "Hindi", bn: "Bengali", te: "Telugu", mr: "Marathi",
  ta: "Tamil", gu: "Gujarati", kn: "Kannada", pa: "Punjabi",
  ml: "Malayalam", or: "Odia", ur: "Urdu",
};
const LANG_BCP = {
  en: "en-IN", hi: "hi-IN", bn: "bn-IN", te: "te-IN", mr: "mr-IN",
  ta: "ta-IN", gu: "gu-IN", kn: "kn-IN", pa: "pa-IN",
  ml: "ml-IN", or: "or-IN", ur: "ur-IN",
};

async function translateAndDisplay(text, lang, bodyEl) {
  const langName = LANG_NAMES[lang] || "Hindi";
  bodyEl.innerHTML += `<div class="translate-loading" style="margin-top:16px;color:var(--text-light);font-size:0.9rem">⏳ Translating to ${langName}...</div>`;
  try {
    if (window.location.protocol !== "file:") {
      const resp = await fetch("/translate_proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, target_lang: langName }),
      });
      const data = await resp.json();
      if (data.error) throw new Error(data.error);
      currentModalContent = data.translated;
      bodyEl.innerHTML = `<div class="ai-response">${renderMarkdown(data.translated)}</div>`;
    } else {
      // Standalone: use Gemini directly for translation
      const apiKey = window.KRISHI_API_KEY || "";
      if (!apiKey) throw new Error("No API key for translation.");
      const resp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: `Translate the following agricultural text into ${langName}. Preserve all Markdown, tables, emojis. Output only the translation:\n\n${text}` }] }],
          }),
        }
      );
      const data = await resp.json();
      const translated = data.candidates[0].content.parts[0].text;
      currentModalContent = translated;
      bodyEl.innerHTML = `<div class="ai-response">${renderMarkdown(translated)}</div>`;
    }
  } catch (err) {
    const tl = bodyEl.querySelector(".translate-loading");
    if (tl) tl.remove();
    bodyEl.innerHTML += `<small style="color:#e53e3e">Translation failed: ${err.message}</small>`;
  }
}

function translateModalContent() {
  const lang = document.getElementById("langSelector")?.value || "en";
  if (!currentModalContent) return;
  const body = document.getElementById("modalBody");
  if (lang === "en") {
    body.innerHTML = `<div class="ai-response">${renderMarkdown(currentModalContent)}</div>`;
  } else {
    translateAndDisplay(currentModalContent, lang, body);
  }
}

// ===== TEXT-TO-SPEECH ENGINE (3-Layer) =====
// Layer 1: Gemini 3.1 Flash TTS  (via /tts_proxy — highest quality)
// Layer 2: Gemini 2.5 Flash TTS  (via /tts_proxy fallback)
// Layer 3: Browser Web Speech API (fully offline, always available)
//
// The backend tries Layer 1 → Layer 2 and returns base64 WAV.
// If the backend fails entirely, the frontend falls back to Layer 3.

function mdToPlainText(md) {
  return (md || "")
    // strip HTML tags (handles translated content with HTML)
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ").replace(/&#[0-9]+;/g, " ")
    // markdown tables
    .replace(/^\|.*\|$/gm, "")
    // ATX headers (# ## ###)
    .replace(/^#{1,6}\s+/gm, "")
    // Setext-style underline headers: lines of === or --- (must come BEFORE list marker strip)
    .replace(/^[=]{2,}\s*$/gm, "")
    .replace(/^[-]{2,}\s*$/gm, "")
    // Trailing dashes/equals used as decorators: "Introduction -------" or "Title ======="
    .replace(/\s*[=\-]{3,}\s*$/gm, "")
    // bold/italic
    .replace(/\*\*\*([\s\S]+?)\*\*\*/g, "$1")
    .replace(/\*\*([\s\S]+?)\*\*/g, "$1")
    .replace(/\*([^\s*][\s\S]*?[^\s*])\*/g, "$1")
    .replace(/___([\s\S]+?)___/g, "$1")
    .replace(/__([\s\S]+?)__/g, "$1")
    // code blocks and inline code
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]+`/g, "")
    // hr, blockquotes, list markers
    .replace(/^[-*_]{3,}$/gm, "")
    .replace(/^>\s*/gm, "")
    .replace(/^[\s]*[-*+]\s+/gm, "")
    .replace(/^[\s]*\d+\.\s+/gm, "")
    // links and images
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    // emojis
    .replace(/[\u{1F300}-\u{1FFFF}]/gu, " ")
    .replace(/[\u2600-\u27FF]/g, " ")
    // remove any remaining sequences of punctuation-only chars that browsers choke on
    .replace(/[|~^]/g, " ")
    .replace(/\*+/g, " ")
    // normalise whitespace
    .replace(/\n{2,}/g, ". ")
    .replace(/\n/g, " ")
    .replace(/\.(\s*\.)+/g, ".")
    .replace(/\s{2,}/g, " ")
    .trim();
}

// ── TTS state ──────────────────────────────────────────────────────────────────
let _tts = {
  active:           false,
  sentences:        [],
  index:            0,
  voice:            null,
  langBCP:          "en-IN",
  keepAlive:        null,
  consecutiveFails: 0,
  _fetchAbort:      null,   // AbortController for in-flight /tts_proxy fetch
};

function _ttsReset() {
  _tts.active           = false;
  _tts.sentences        = [];
  _tts.index            = 0;
  _tts.consecutiveFails = 0;
  if (_tts.keepAlive) { clearInterval(_tts.keepAlive); _tts.keepAlive = null; }
}

function _ttsBtnState(speaking) {
  document.querySelector(".modal-speak-btn")?.classList.toggle("hidden",  speaking);
  document.querySelector(".modal-stop-btn")?.classList.toggle("hidden",  !speaking);
}

// Split plain text into short sentences (~150 chars max)
function splitIntoChunks(text, maxLen) {
  maxLen = maxLen || 150;
  const raw = text.match(/[^.!?]+[.!?]+|\s*[^.!?]+$/g) || [text];
  const out = [];
  let cur   = "";
  for (const s of raw) {
    const t = s.trim();
    if (!t) continue;
    if (cur.length + t.length + 1 <= maxLen) {
      cur = cur ? cur + " " + t : t;
    } else {
      if (cur) out.push(cur);
      cur = t.length <= maxLen ? t : t.substring(0, maxLen);
    }
  }
  if (cur) out.push(cur);
  return out.filter(x => x.trim().length > 1);
}

// Speak one sentence; chain to next on completion
function _ttsSpeak() {
  if (!_tts.active || _tts.index >= _tts.sentences.length) {
    _ttsReset();
    _ttsBtnState(false);
    return;
  }

  const text = _tts.sentences[_tts.index].trim();
  if (!text) { _tts.index++; _ttsSpeak(); return; }

  // Kick Chrome if it froze
  if (window.speechSynthesis.paused) window.speechSynthesis.resume();

  const u    = new SpeechSynthesisUtterance(text);
  u.lang     = _tts.langBCP;
  u.rate     = 0.92;
  u.pitch    = 1;
  u.volume   = 1;
  if (_tts.voice) u.voice = _tts.voice;

  u.onend = () => {
    if (!_tts.active) return;
    _tts.consecutiveFails = 0;
    _tts.index++;
    setTimeout(_ttsSpeak, 60);
  };

  u.onerror = (e) => {
    if (e.error === "interrupted" || e.error === "canceled") {
      _ttsReset(); _ttsBtnState(false); return;
    }
    console.warn("TTS error on sentence", _tts.index, ":", e.error);

    // Track consecutive failures — if site sound is muted/blocked every sentence fails
    _tts.consecutiveFails = (_tts.consecutiveFails || 0) + 1;
    if (_tts.consecutiveFails >= 3) {
      _ttsReset();
      _ttsBtnState(false);
      const body = document.getElementById("modalBody");
      if (body) {
        const existing = body.querySelector(".tts-error-banner");
        if (!existing) {
          const banner = document.createElement("div");
          banner.className = "tts-error-banner";
          banner.style.cssText = "background:#fff3cd;border:1px solid #ffc107;border-radius:8px;padding:12px 16px;margin-top:12px;font-size:0.88rem;color:#856404;";
          banner.innerHTML = `
            <strong>🔇 Browser speech synthesis failed</strong><br>
            This is usually a browser sound permission issue. To fix:<br>
            1. Click the <b>🔒 lock icon</b> in the address bar → Set <b>Sound → Allow</b><br>
            2. Or try <b>Chrome/Edge</b> if you are on a different browser<br>
            3. Refresh the page (F5) and try Read Aloud again.<br>
            <small style="color:#9a6c00">Note: Gemini TTS requires a valid API key with TTS preview access.</small>`;
          body.prepend(banner);
        }
      }
      return;
    }

    _tts.index++;
    if (_tts.active) setTimeout(_ttsSpeak, 100);
  };

  window.speechSynthesis.speak(u);
}

// ── Gemini TTS state ──────────────────────────────────────────────────────────
let _geminiAudio = null;   // HTMLAudioElement for Gemini TTS playback

// ── Main entry point called by the Read Aloud button ──────────────────────────
async function speakModalContent() {
  if (!currentModalContent || !currentModalContent.trim()) {
    alert("No content to read yet. Please get an AI response first."); return;
  }

  const lang    = document.getElementById("langSelector")?.value || "en";
  const langBCP = LANG_BCP[lang] || "en-IN";
  const plain   = mdToPlainText(currentModalContent);

  if (!plain || plain.length < 5) {
    alert("Could not extract readable text."); return;
  }

  // Show Stop button immediately so user can cancel during Gemini generation
  _ttsBtnState(true);
  const speakBtn = document.querySelector(".modal-speak-btn");

  // ── Layer 1+2: Try Gemini TTS via backend proxy ───────────────────────────
  // Strategy: send only the FIRST 300 chars to Gemini for a fast intro (<8s).
  // The backend SDK has a 9s timeout; we give the frontend 10s.
  // Remaining text continues via Web Speech API (Layer 3) immediately after.
  if (window.location.protocol !== "file:") {
    const GEMINI_CHARS = 300;   // must match TTS_CHUNK_CHARS in app.py
    const TIMEOUT_MS   = 16000; // 16s — just above the 15s SDK timeout

    const ctrl  = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    _tts._fetchAbort = ctrl;

    try {
      if (speakBtn) speakBtn.textContent = "⏳ Generating audio…";

      // Only the opening portion goes to Gemini TTS for quality voice
      const geminiText  = plain.substring(0, GEMINI_CHARS);
      const remainText  = plain.length > GEMINI_CHARS ? plain.substring(GEMINI_CHARS) : "";
      const geminiVoice = _pickGeminiVoice(lang);

      const resp = await fetch("/tts_proxy", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ text: geminiText, voice: geminiVoice, lang: langBCP }),
        signal:  ctrl.signal,
      });

      clearTimeout(timer);
      _tts._fetchAbort = null;

      // User pressed Stop while waiting — bail cleanly
      if (!_tts.active && !_geminiAudio) { _ttsBtnState(false); return; }

      const data = await resp.json();

      if (data.audio_b64 && !data.fallback) {
        // ── SUCCESS: play Gemini audio, then chain to Web Speech for rest ────
        if (_geminiAudio) { _geminiAudio.pause(); _geminiAudio = null; }

        _geminiAudio = new Audio("data:audio/wav;base64," + data.audio_b64);

        _geminiAudio.onended = () => {
          _geminiAudio = null;
          if (remainText) {
            // Continue rest of content with Web Speech API (Layer 3)
            console.log("[TTS] Gemini intro done — handing off remainder to Web Speech API");
            _speakWithWebSpeech(remainText, langBCP);
          } else {
            _ttsBtnState(false);
          }
        };
        _geminiAudio.onerror = (e) => {
          console.warn("[TTS] Gemini audio playback error:", e, "— falling back to Web Speech API for full text");
          _geminiAudio = null;
          _speakWithWebSpeech(plain, langBCP);
        };

        const modelLabel = data.model_used?.includes("3.1") ? "Gemini 3.1 Flash TTS" : "Gemini 2.5 Flash TTS";
        console.log("[TTS]", modelLabel, "ready — playing first", GEMINI_CHARS, "chars");
        if (speakBtn) speakBtn.textContent = "🔊 Read Aloud";

        _geminiAudio.play().catch(err => {
          console.warn("[TTS] Audio play() blocked:", err.message, "— falling back to Web Speech API");
          _geminiAudio = null;
          _speakWithWebSpeech(plain, langBCP);
        });
        return;
      }

      // Gemini failed (fallback:true) → fall through to Layer 3
      console.log("[TTS] Gemini TTS unavailable:", data.error, "— using Web Speech API for full text");

    } catch (err) {
      clearTimeout(timer);
      _tts._fetchAbort = null;
      if (err.name === "AbortError") {
        console.log("[TTS] Gemini TTS timed out — using Web Speech API for full text");
      } else {
        console.warn("[TTS] /tts_proxy error:", err.message, "— using Web Speech API for full text");
      }
    }

    if (speakBtn) speakBtn.textContent = "🔊 Read Aloud";
  }

  // ── Layer 3: Browser Web Speech API (full text) ───────────────────────────
  _speakWithWebSpeech(plain, langBCP);
}

// Pick a Gemini voice that best matches the language
function _pickGeminiVoice(lang) {
  // Gemini TTS has 30 voices — Kore and Aoede work well across languages
  // For Indian languages, we still use English voices (Gemini handles multilingual)
  const VOICE_MAP = {
    hi: "Kore",   // Hindi — deeper, clear
    bn: "Aoede",  mr: "Kore",  te: "Aoede",
    ta: "Kore",   gu: "Aoede", kn: "Kore",
    pa: "Aoede",  ml: "Kore",  or: "Aoede",
    ur: "Kore",   en: "Kore",
  };
  return VOICE_MAP[lang] || "Kore";
}

// ── Layer 3 internals: Web Speech API ────────────────────────────────────────

// ── Layer 3: Web Speech API entry point ──────────────────────────────────────
function _speakWithWebSpeech(plain, langBCP) {
  const synth = window.speechSynthesis;
  if (!synth) { _ttsBtnState(false); return; }

  const lang      = langBCP.split("-")[0];
  const sentences = splitIntoChunks(plain, 150);
  if (!sentences.length) { _ttsBtnState(false); return; }

  synth.cancel();
  _ttsReset();

  _tts.langBCP   = langBCP;
  _tts.sentences = sentences;
  _tts.index     = 0;
  _tts.active    = true;

  _ttsBtnState(true);

  // Keepalive — Chrome pauses synthesis after ~15s
  _tts.keepAlive = setInterval(() => {
    if (_tts.active && synth.speaking) { synth.pause(); synth.resume(); }
    else if (!_tts.active) { clearInterval(_tts.keepAlive); _tts.keepAlive = null; }
  }, 10000);

  function pickBestVoice() {
    const v = synth.getVoices();
    if (!v || !v.length) return null;
    const bcp = langBCP.toLowerCase();
    const lc  = lang.toLowerCase();
    return (
      v.find(x => x.lang.toLowerCase() === bcp) ||
      v.find(x => x.lang.toLowerCase().startsWith(lc)) ||
      (lang !== "en" ? v.find(x => x.lang.toLowerCase().startsWith("en")) : null) ||
      v[0]
    );
  }

  const voices = synth.getVoices();
  if (voices && voices.length > 0) {
    _tts.voice = pickBestVoice();
    _ttsSpeak();
  } else {
    const p = new SpeechSynthesisUtterance(".");
    p.volume = 0.001; p.rate = 10; p.lang = "en-US";
    p.onend   = () => { if (_tts.active) { _tts.voice = pickBestVoice(); _ttsSpeak(); } };
    p.onerror = () => { if (_tts.active) { _tts.voice = pickBestVoice(); _ttsSpeak(); } };
    synth.speak(p);
    setTimeout(() => {
      if (_tts.active && _tts.index === 0) { _tts.voice = pickBestVoice(); _ttsSpeak(); }
    }, 700);
  }
}


function stopSpeaking() {
  // Cancel any in-flight /tts_proxy fetch (stops waiting for Gemini)
  if (_tts._fetchAbort) {
    _tts._fetchAbort.abort();
    _tts._fetchAbort = null;
  }
  // Stop Gemini TTS audio (Layers 1 & 2)
  if (_geminiAudio) {
    _geminiAudio.pause();
    _geminiAudio.src = "";
    _geminiAudio = null;
  }
  // Stop Web Speech API (Layer 3)
  _ttsReset();
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  _ttsBtnState(false);
}


// ===== VOICE INPUT (Web Speech API) =====
function startVoiceSearch() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { alert("Voice input is not supported in your browser. Please use Chrome or Edge."); return; }

  const lang = document.getElementById("langSelector")?.value || "en";
  voiceRecognition = new SR();
  voiceRecognition.lang = LANG_BCP[lang] || "en-IN";
  voiceRecognition.interimResults = false;
  voiceRecognition.maxAlternatives = 1;

  showVoiceToast("🎤 Listening... Speak now");
  voiceRecognition.start();

  voiceRecognition.onresult = (e) => {
    const transcript = e.results[0][0].transcript;
    hideVoiceToast();
    document.getElementById("quickSearchInput").value = transcript;
    quickSearch();
  };
  voiceRecognition.onerror = (e) => {
    hideVoiceToast();
    if (e.error !== "aborted") alert("Voice recognition error: " + e.error);
  };
  voiceRecognition.onend = hideVoiceToast;
}
function stopVoiceSearch() {
  if (voiceRecognition) { voiceRecognition.abort(); voiceRecognition = null; }
  hideVoiceToast();
}
function showVoiceToast(msg) {
  const t = document.getElementById("voiceToast");
  document.getElementById("voiceToastMsg").textContent = msg;
  t.classList.remove("hidden");
}
function hideVoiceToast() {
  document.getElementById("voiceToast")?.classList.add("hidden");
}

// ===== MARKDOWN RENDERER =====
function renderMarkdown(text) {
  return text
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    // Strip setext-style underline decorator lines (=== and ---) BEFORE other processing
    // These appear as "Title\n======" or "Introduction -------" in some model outputs
    .replace(/^[=]{2,}\s*$/gm, "")
    .replace(/^[-]{2,}\s*$/gm, "")
    .replace(/\s*[=]{3,}\s*$/gm, "")   // trailing === on same line as text
    .replace(/\s*[-]{3,}\s*$/gm, "")   // trailing --- on same line as text
    .replace(/^#{3}\s+(.+)$/gm, "<h3>$1</h3>")
    .replace(/^#{2}\s+(.+)$/gm, "<h2>$1</h2>")
    .replace(/^#{1}\s+(.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/^---$/gm, "<hr>")
    .replace(/^\|(.+)\|$/gm, (match) => {
      const cells = match.slice(1, -1).split("|");
      return "<tr>" + cells.map(c => {
        const t = c.trim();
        return t.match(/^[-:]+$/) ? null : `<td>${t}</td>`;
      }).filter(Boolean).join("") + "</tr>";
    })
    .replace(/(<tr>.*<\/tr>\n?)+/gs, m => {
      const rows   = m.trim().split("\n");
      const header = rows[0].replace(/<td>/g, "<th>").replace(/<\/td>/g, "</th>");
      const body   = rows.slice(1).join("\n");
      return `<table><thead>${header}</thead><tbody>${body}</tbody></table>`;
    })
    .replace(/^&gt;\s+(.+)$/gm, "<blockquote>$1</blockquote>")
    .replace(/^[\*\-]\s+(.+)$/gm, "<li>$1</li>")
    .replace(/^\d+\.\s+(.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/gs, m => `<ul>${m}</ul>`)
    .replace(/\n\n+/g, "</p><p>")
    .replace(/^(?!<[htul\/<>]).+/gm, m => m || "")
    .replace(/<\/h([1-3])><p>/g, "</h$1><p>")
    .replace(/<p><h/g, "<h").replace(/<\/h([1-3])><\/p>/g, "</h$1>")
    .replace(/<p><\/p>/g, "")
    .replace(/<p><ul>/g, "<ul>").replace(/<\/ul><\/p>/g, "</ul>")
    .replace(/<p><table>/g, "<table>").replace(/<\/table><\/p>/g, "</table>")
    .replace(/<p><blockquote>/g, "<blockquote>").replace(/<\/blockquote><\/p>/g, "</blockquote>");
}

// ===== AUTH =====
async function fetchAuthStatus() {
  try {
    const resp = await fetch("/auth/me");
    const data = await resp.json();
    if (data.logged_in) setUserLoggedIn(data);
    else setUserLoggedOut();
  } catch (_) { setUserLoggedOut(); }
}

function setUserLoggedIn(data) {
  currentUser = data;
  document.getElementById("navAuthArea").classList.add("hidden");
  document.getElementById("navUserArea").classList.remove("hidden");
  document.getElementById("navAvatar").textContent = data.avatar || data.name[0].toUpperCase();
  document.getElementById("numName").textContent = data.name;
}
function setUserLoggedOut() {
  currentUser = null;
  document.getElementById("navAuthArea").classList.remove("hidden");
  document.getElementById("navUserArea").classList.add("hidden");
}

function toggleUserMenu() {
  document.getElementById("navUserMenu").classList.toggle("hidden");
}
document.addEventListener("click", (e) => {
  const menu   = document.getElementById("navUserMenu");
  const avatar = document.getElementById("navAvatar");
  if (menu && !menu.contains(e.target) && e.target !== avatar)
    menu.classList.add("hidden");
});

function openAuthModal(tab) {
  document.getElementById("authModal").classList.add("open");
  document.body.style.overflow = "hidden";
  switchAuthTab(tab);
}
function closeAuthModal() {
  document.getElementById("authModal").classList.remove("open");
  document.body.style.overflow = "";
}
function closeAuthOutside(e) {
  if (e.target === document.getElementById("authModal")) closeAuthModal();
}
function switchAuthTab(tab) {
  const isLogin = tab === "login";
  document.getElementById("loginForm").classList.toggle("hidden", !isLogin);
  document.getElementById("signupForm").classList.toggle("hidden", isLogin);
  document.getElementById("authModalTitle").textContent = isLogin ? "Login to KrishiTech" : "Join KrishiTech";
  document.getElementById("authModalIcon").textContent  = isLogin ? "🔐" : "🌱";
  document.getElementById("loginError").classList.add("hidden");
  document.getElementById("signupError").classList.add("hidden");
}

async function submitLogin() {
  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value;
  const errEl    = document.getElementById("loginError");
  errEl.classList.add("hidden");
  if (!username || !password) { showAuthError(errEl, "Please fill in all fields."); return; }
  try {
    const resp = await fetch("/auth/login", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await resp.json();
    if (data.error) { showAuthError(errEl, data.error); return; }
    setUserLoggedIn({ ...data, avatar: data.name[0].toUpperCase() });
    closeAuthModal();
  } catch (e) { showAuthError(errEl, "Network error. Try again."); }
}

async function submitSignup() {
  const name     = document.getElementById("signupName").value.trim();
  const username = document.getElementById("signupUsername").value.trim();
  const password = document.getElementById("signupPassword").value;
  const state    = document.getElementById("signupState").value;
  const district = document.getElementById("signupDistrict").value.trim();
  const errEl    = document.getElementById("signupError");
  errEl.classList.add("hidden");
  if (!name || !username || !password) { showAuthError(errEl, "Please fill in all required fields."); return; }
  try {
    const resp = await fetch("/auth/signup", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, username, password, state, district }),
    });
    const data = await resp.json();
    if (data.error) { showAuthError(errEl, data.error); return; }
    setUserLoggedIn({ ...data, avatar: data.name[0].toUpperCase(), state, district });
    closeAuthModal();
  } catch (e) { showAuthError(errEl, "Network error. Try again."); }
}

async function logoutUser() {
  await fetch("/auth/logout", { method: "POST" });
  setUserLoggedOut();
  document.getElementById("navUserMenu").classList.add("hidden");
}

function showAuthError(el, msg) {
  el.textContent = msg;
  el.classList.remove("hidden");
}

// ===== COMMUNITY =====
async function loadCommunityPosts(reset = false) {
  if (reset) { communityPage = 1; }
  try {
    const url  = `/api/community/posts?page=${communityPage}&limit=10&tag=${encodeURIComponent(communityTag)}`;
    const resp = await fetch(url);
    const data = await resp.json();
    const feed = document.getElementById("communityFeed");
    const empty = document.getElementById("commEmpty");

    if (reset) feed.innerHTML = "";

    if (data.posts.length === 0 && communityPage === 1) {
      if (empty) { empty.style.display = ""; }
    } else {
      if (empty) empty.style.display = "none";
      data.posts.forEach(p => feed.insertAdjacentHTML("beforeend", renderPost(p)));
    }

    const loadMore = document.getElementById("commLoadMore");
    if (data.total > communityPage * 10) {
      loadMore.classList.remove("hidden");
    } else {
      loadMore.classList.add("hidden");
    }
  } catch (e) { console.error("Community load error:", e); }
}

function renderPost(p) {
  const timeAgo = formatTimeAgo(p.created_at);
  const tags    = (p.tags || []).map(t => `<span class="comm-tag">${t}</span>`).join("");
  const replies = p.replies?.length || 0;
  return `
  <div class="comm-post" id="post-${p.id}">
    <div class="comm-post-header">
      <div class="comm-avatar">${p.avatar || "?"}</div>
      <div class="comm-meta">
        <span class="comm-author">${escHtml(p.author_name)}</span>
        ${p.state ? `<span class="comm-location">📍 ${escHtml(p.state)}</span>` : ""}
        <span class="comm-time">${timeAgo}</span>
      </div>
      <div class="comm-tags">${tags}</div>
    </div>
    <h4 class="comm-post-title">${escHtml(p.title)}</h4>
    <p class="comm-post-body">${escHtml(p.body).replace(/\n/g,"<br>")}</p>
    <div class="comm-actions">
      <button class="comm-like-btn" onclick="likePost(${p.id}, this)">👍 <span>${p.likes}</span></button>
      <button class="comm-reply-btn" onclick="toggleReplies(${p.id})">💬 ${replies} Repl${replies === 1 ? "y" : "ies"}</button>
      <button class="comm-ai-btn" onclick="askAI('A farmer from ${escHtml(p.state||"India")} asks: ${escHtml(p.title)} — ${escHtml(p.body)}')">🤖 Ask AI</button>
    </div>
    <div class="comm-replies hidden" id="replies-${p.id}">
      ${(p.replies||[]).map(r => renderReply(r)).join("")}
      <div class="comm-reply-form">
        <input type="text" placeholder="Write a reply..." id="replyInput-${p.id}" class="comm-reply-input" onkeydown="if(event.key==='Enter')submitReply(${p.id})">
        <button class="comm-reply-submit" onclick="submitReply(${p.id})">Reply</button>
      </div>
    </div>
  </div>`;
}

function renderReply(r) {
  return `<div class="comm-reply">
    <div class="comm-avatar" style="width:30px;height:30px;font-size:0.8rem">${r.avatar||"?"}</div>
    <div class="comm-reply-content">
      <strong>${escHtml(r.author_name)}</strong>
      <span class="comm-time">${formatTimeAgo(r.created_at)}</span>
      <p>${escHtml(r.body).replace(/\n/g,"<br>")}</p>
    </div>
  </div>`;
}

function toggleReplies(pid) {
  const el = document.getElementById(`replies-${pid}`);
  el.classList.toggle("hidden");
}

async function likePost(pid, btn) {
  try {
    const resp = await fetch(`/api/community/posts/${pid}/like`, { method: "POST" });
    const data = await resp.json();
    btn.querySelector("span").textContent = data.likes;
    btn.disabled = true;
    btn.style.opacity = "0.6";
  } catch (e) { console.error(e); }
}

async function submitReply(pid) {
  if (!currentUser) { openAuthModal("login"); return; }
  const input = document.getElementById(`replyInput-${pid}`);
  const body  = input?.value.trim();
  if (!body) return;
  try {
    const resp = await fetch(`/api/community/posts/${pid}/reply`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    const data = await resp.json();
    if (data.error) { alert(data.error); return; }
    const repliesEl = document.getElementById(`replies-${pid}`);
    const form      = repliesEl.querySelector(".comm-reply-form");
    form.insertAdjacentHTML("beforebegin", renderReply(data.reply));
    input.value = "";
  } catch (e) { console.error(e); }
}

function filterPosts(tag, btn) {
  communityTag = tag;
  document.querySelectorAll(".comm-filter").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  loadCommunityPosts(true);
}

function loadMorePosts() {
  communityPage++;
  loadCommunityPosts(false);
}

function openNewPostModal() {
  if (!currentUser) { openAuthModal("login"); return; }
  document.getElementById("newPostModal").classList.add("open");
  document.body.style.overflow = "hidden";
  document.getElementById("postError").classList.add("hidden");
  document.getElementById("postTitle").value = "";
  document.getElementById("postBody").value  = "";
  document.querySelectorAll(".tag-pick input").forEach(c => c.checked = false);
}
function closeNewPostModal() {
  document.getElementById("newPostModal").classList.remove("open");
  document.body.style.overflow = "";
}
function closeNewPostOutside(e) {
  if (e.target === document.getElementById("newPostModal")) closeNewPostModal();
}

async function submitPost() {
  const title  = document.getElementById("postTitle").value.trim();
  const body   = document.getElementById("postBody").value.trim();
  const tags   = [...document.querySelectorAll(".tag-pick input:checked")].map(c => c.value);
  const errEl  = document.getElementById("postError");
  errEl.classList.add("hidden");
  if (!title || !body) { showAuthError(errEl, "Title and details are required."); return; }
  try {
    const resp = await fetch("/api/community/posts", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body, tags }),
    });
    const data = await resp.json();
    if (data.error) { showAuthError(errEl, data.error); return; }
    closeNewPostModal();
    // Prepend the new post
    const feed  = document.getElementById("communityFeed");
    const empty = document.getElementById("commEmpty");
    if (empty) empty.style.display = "none";
    feed.insertAdjacentHTML("afterbegin", renderPost(data.post));
  } catch (e) { showAuthError(errEl, "Network error. Try again."); }
}

// ===== UTILS =====
function formatTimeAgo(isoStr) {
  const diff = Date.now() - new Date(isoStr + "Z").getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60)     return "just now";
  if (s < 3600)   return `${Math.floor(s/60)}m ago`;
  if (s < 86400)  return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
}
function escHtml(str) {
  return String(str)
    .replace(/&/g,"&amp;").replace(/</g,"&lt;")
    .replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

// ===== GLOBAL EXPORTS =====
window.askAI             = askAI;
window.showSeason        = showSeason;
window.switchSearchTab   = switchSearchTab;
window.setAndSearch      = setAndSearch;
window.setSoilAndSearch  = setSoilAndSearch;
window.setRegionAndSearch= setRegionAndSearch;