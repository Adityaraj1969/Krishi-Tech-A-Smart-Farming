// ===== CROP DATA =====
const CROP_DATA = {
  kharif: [
    { name: "Rice", emoji: "🌾", sci: "Oryza sativa" },
    { name: "Maize", emoji: "🌽", sci: "Zea mays" },
    { name: "Jowar", emoji: "🌾", sci: "Sorghum bicolor" },
    { name: "Bajra", emoji: "🌾", sci: "Pennisetum glaucum" },
    { name: "Tur (Arhar)", emoji: "🫘", sci: "Cajanus cajan" },
    { name: "Moong", emoji: "🟢", sci: "Vigna radiata" },
    { name: "Urad", emoji: "⚫", sci: "Vigna mungo" },
    { name: "Groundnut", emoji: "🥜", sci: "Arachis hypogaea" },
    { name: "Soybean", emoji: "🫘", sci: "Glycine max" }
  ],
  rabi: [
    { name: "Wheat", emoji: "🌾", sci: "Triticum aestivum" },
    { name: "Barley", emoji: "🌾", sci: "Hordeum vulgare" },
    { name: "Gram (Chickpea)", emoji: "🫘", sci: "Cicer arietinum" },
    { name: "Masur (Lentil)", emoji: "🟤", sci: "Lens culinaris" },
    { name: "Mustard", emoji: "🌻", sci: "Brassica juncea" },
    { name: "Rapeseed", emoji: "🌼", sci: "Brassica napus" },
    { name: "Safflower", emoji: "🌸", sci: "Carthamus tinctorius" },
    { name: "Sunflower", emoji: "🌻", sci: "Helianthus annuus" }
  ],
  zaid: [
    { name: "Watermelon", emoji: "🍉", sci: "Citrullus lanatus" },
    { name: "Muskmelon", emoji: "🍈", sci: "Cucumis melo" },
    { name: "Cucumber", emoji: "🥒", sci: "Cucumis sativus" },
    { name: "Pumpkin", emoji: "🎃", sci: "Cucurbita pepo" },
    { name: "Bittergourd", emoji: "🥬", sci: "Momordica charantia" },
    { name: "Fodder Crops", emoji: "🌿", sci: "Various species" }
  ],
  cash: [
    { name: "Cotton", emoji: "🌿", sci: "Gossypium hirsutum" },
    { name: "Jute", emoji: "🌿", sci: "Corchorus capsularis" }
  ],
  flowers: [
    { name: "Rose", emoji: "🌹", sci: "Rosa hybrida" },
    { name: "Marigold", emoji: "🌼", sci: "Tagetes erecta" },
    { name: "Rajanigandha", emoji: "🤍", sci: "Polianthes tuberosa" },
    { name: "Tulip", emoji: "🌷", sci: "Tulipa gesneriana" },
    { name: "Sadabahar", emoji: "🌸", sci: "Catharanthus roseus" },
    { name: "Kusum", emoji: "🌺", sci: "Carthamus tinctorius" },
    { name: "Lily", emoji: "🌸", sci: "Lilium spp." }
  ],
  plantation: [
    { name: "Tea", emoji: "🍵", sci: "Camellia sinensis" },
    { name: "Coffee", emoji: "☕", sci: "Coffea arabica" }
  ]
};

// ===== STATE =====
let currentSeason = "kharif";
let currentModalContent = "";
let conversationHistory = [];

// ===== INIT =====
document.addEventListener("DOMContentLoaded", () => {
  renderCrops("kharif");
  initNavScroll();
  // Quick search on Enter
  document.getElementById("quickSearchInput").addEventListener("keydown", e => { if(e.key === "Enter") quickSearch(); });
  document.getElementById("cropSearchInput").addEventListener("keydown", e => { if(e.key === "Enter") searchCrop(); });
  document.getElementById("soilSearchInput").addEventListener("keydown", e => { if(e.key === "Enter") searchSoil(); });
  document.getElementById("diseaseInput").addEventListener("keydown", e => { if(e.key === "Enter") searchDisease(); });
  document.getElementById("regionTextInput").addEventListener("keydown", e => { if(e.key === "Enter") searchRegionText(); });
});

// ===== NAV =====
function initNavScroll() {
  window.addEventListener("scroll", () => {
    const nav = document.getElementById("navbar");
    nav.classList.toggle("scrolled", window.scrollY > 40);
  });
}
function toggleMenu() {
  const links = document.querySelector(".nav-links");
  links.style.display = links.style.display === "flex" ? "none" : "flex";
  if(links.style.display === "flex") {
    links.style.flexDirection = "column";
    links.style.position = "absolute";
    links.style.top = "68px"; links.style.left = 0; links.style.right = 0;
    links.style.background = "rgba(253,248,240,0.98)";
    links.style.padding = "16px 24px";
    links.style.boxShadow = "0 8px 32px rgba(0,0,0,0.1)";
    links.style.gap = "4px";
  }
}
function scrollToSearch() {
  document.getElementById("smart-search").scrollIntoView({ behavior: "smooth" });
}

// ===== CROPS GRID =====
function renderCrops(season) {
  const grid = document.getElementById("crops-grid");
  const crops = CROP_DATA[season] || [];
  grid.innerHTML = crops.map(crop => `
    <div class="crop-card" onclick="askAI('Provide a comprehensive farming guide for ${crop.name} in India. Include: suitable soil type and nutrition requirements, ideal climate and temperature range, geographic regions in India where it is grown, irrigation schedule, types of fertilizers (organic and chemical), pesticides, weedicides, timeline from sowing to harvesting, common diseases and herbal/ayurvedic prevention methods, average rainfall requirement, and post-harvest tips.')">
      <span class="crop-emoji">${crop.emoji}</span>
      <div class="crop-name">${crop.name}</div>
      <div class="crop-sci">${crop.sci}</div>
      <div class="crop-action">Full Guide →</div>
    </div>
  `).join("");
}

function showSeason(season, btn) {
  currentSeason = season;
  document.querySelectorAll(".stab").forEach(b => b.classList.remove("active"));
  if(btn) btn.classList.add("active");
  document.querySelectorAll(".season-info").forEach(el => el.classList.add("hidden"));
  const info = document.getElementById("season-info-" + season);
  if(info) info.classList.remove("hidden");
  renderCrops(season);
  document.getElementById("natural-farming").scrollIntoView({ behavior: "smooth", block: "start" });
}

// ===== SEARCH TABS =====
function switchSearchTab(tab, btn) {
  document.querySelectorAll(".search-tab").forEach(b => b.classList.remove("active"));
  document.querySelectorAll(".search-panel").forEach(p => p.classList.remove("active"));
  if(btn) btn.classList.add("active");
  document.getElementById("panel-" + tab).classList.add("active");
}

// ===== SEARCH FUNCTIONS =====
function quickSearch() {
  const val = document.getElementById("quickSearchInput").value.trim();
  if(!val) return;
  document.getElementById("cropSearchInput").value = val;
  switchSearchTab("crop", document.querySelector(".search-tab"));
  searchCrop(val);
}

function searchCrop(overrideVal) {
  const val = overrideVal || document.getElementById("cropSearchInput").value.trim();
  if(!val) { alert("Please enter a crop name."); return; }
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
(Include: land prep, sowing, germination, vegetative, flowering, fruiting, harvesting)

## 💧 Irrigation Schedule
- Water requirement (liters/hectare)
- Irrigation method (drip, flood, sprinkler)
- Critical irrigation stages
- Frequency and quantity at each stage

## 🌱 Fertilizer Guide
### Organic/Natural Fertilizers:
- Types, quantity, timing, application method

### Chemical Fertilizers (if needed):
- NPK dosage, timing, precautions

## 🛡️ Pest & Disease Management
### Common Diseases:
| Disease | Symptoms | Organic Treatment | Ayurvedic Remedy |
|---------|----------|-------------------|------------------|

### Common Pests:
| Pest | Damage | Natural Control | Herbal Spray |

## 🌿 Weedicide & Herbicide
- Common weeds
- Manual weeding schedule
- Organic weed management
- Safe chemical options (last resort)

## 🌿 Herbal & Ayurvedic Treatments
- Panchagavya application
- Jeevamrutha recipe and use
- Other traditional remedies

## 🚜 Harvest & Post-Harvest
- Maturity indicators
- Harvesting method
- Yield per hectare
- Storage and market tips

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
  if(!val) { alert("Please describe your soil."); return; }
  const prompt = `Based on this soil description: "${val}"

Provide a comprehensive list of suitable crops for Indian farming with full details:

## 🪨 Soil Analysis
Analyze the given soil type, its characteristics, strengths and limitations for farming.

## ✅ Highly Suitable Crops (Best Match)
For each crop provide:
- Crop name and variety
- Why it suits this soil
- Expected yield
- Season (Kharif/Rabi/Zaid)
- Key care tips

## 🟡 Moderately Suitable Crops (With Amendments)
Crops that can grow with soil improvement — explain what amendments are needed.

## 🌱 Soil Improvement Recommendations
- How to improve this soil for better yield
- Organic amendments (compost, vermicompost, green manure)
- Micronutrient corrections
- pH adjustment (if needed)

## 📋 Top 5 Recommended Crops Summary
| Crop | Season | Expected Yield | Difficulty | Profitability |
|------|--------|----------------|------------|---------------|

## 💡 Expert Advice
Practical guidance for farmers with this soil type in India.`;

  openModal(`🪨 Crops for: ${val}`, prompt);
}

function setSoilAndSearch(soil) {
  document.getElementById("soilSearchInput").value = soil;
  switchSearchTab("soil", document.querySelectorAll(".search-tab")[1]);
  searchSoil();
}

function loadDistricts() {
  const state = document.getElementById("stateSelect").value;
  const distSelect = document.getElementById("districtSelect");
  if(!state) { distSelect.innerHTML = '<option value="">— Choose District —</option>'; return; }
  fetch(`/api/districts/${encodeURIComponent(state)}`)
    .then(r => r.json())
    .then(districts => {
      distSelect.innerHTML = '<option value="">— Choose District —</option>' +
        districts.map(d => `<option value="${d}">${d}</option>`).join("");
    });
}

function searchRegion() {
  const state = document.getElementById("stateSelect").value;
  const district = document.getElementById("districtSelect").value;
  if(!state) { alert("Please select a state."); return; }
  const location = district ? `${district}, ${state}` : state;
  searchRegionByLocation(location);
}

function searchRegionText() {
  const val = document.getElementById("regionTextInput").value.trim();
  if(!val) { alert("Please enter a region name."); return; }
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
Geographic description, area, major rivers, elevation.

## 🪨 Soil Types in This Region
| Soil Type | Coverage % | Characteristics | Best For |
|-----------|-----------|-----------------|----------|
(List all major soil types found in ${location})

- Soil pH ranges
- Mineral content
- Organic matter levels
- Water retention capacity
- Fertility status

## 🌤️ Agro-Climatic Profile
- Climate zone classification
- Annual rainfall (mm) and distribution
- Temperature range (min/max seasonal)
- Humidity levels
- Natural calamity risks (drought, flood, frost)

## 🌾 Major Crops Grown
### Currently Grown:
| Crop | Season | Area (hectares) | Significance |
|------|--------|-----------------|--------------|

### Recommended Crops (for optimal returns):
Based on the soil and climate, list ideal crops with justification.

## 📅 Crop Calendar for ${location}
Month-by-month farming activities for the region.

## 💧 Water & Irrigation Resources
- Rivers, groundwater availability
- Common irrigation systems used
- Water scarcity issues (if any)

## 🏛️ Agricultural Support
- Nearby KVK (Krishi Vigyan Kendra)
- Government schemes applicable
- Nearest APMC/Mandi

## 💡 Best Practices for This Region
Top recommendations for farmers in ${location} to maximize productivity sustainably.`;

  openModal(`🗺️ Agriculture Guide: ${location}`, prompt);
}

function searchDisease() {
  const val = document.getElementById("diseaseInput").value.trim();
  if(!val) { alert("Please enter a crop or disease name."); return; }
  const prompt = `Provide a detailed disease and pest management guide for: "${val}"

## 🔍 Disease/Pest Identification
- Full name (common and scientific)
- Type (fungal / bacterial / viral / pest / nutritional deficiency)
- Affected crops
- Disease cycle and spread

## 🩺 Symptoms & Diagnosis
Detailed description of visible symptoms:
- Early stage symptoms
- Advanced stage symptoms
- How to distinguish from similar diseases
- Visual diagnostic guide

## 🌿 Organic & Herbal Prevention (Primary Recommendation)
### Preventive Measures:
- Cultural practices (crop rotation, spacing, sanitation)
- Biological control agents

### Herbal Sprays & Treatments:
| Remedy | Ingredients | Preparation | Application | Frequency |
|--------|-------------|-------------|-------------|-----------|

### Ayurvedic/Traditional Treatments:
- Panchagavya application
- Neem-based formulations
- Garlic-chili spray recipes
- Dashparni Ark and other traditional preparations

## 🛡️ Safe Chemical Options (Last Resort)
- Recommended fungicide/pesticide (minimum toxicity)
- Dosage and dilution
- Safety precautions
- Waiting period before harvest
- Environmental precautions

## ✅ Integrated Disease Management Plan
Week-by-week management schedule for complete control.

## 🚫 What NOT to Do
Common mistakes farmers make and how to avoid them.

## 💡 Prevention for Next Season
How to prevent recurrence through soil health and cultural practices.`;

  openModal(`🔬 Disease Guide: ${val}`, prompt);
}

// ===== AI MODAL =====
async function askAI(prompt) {
  openModal("🤖 KrishiTech AI", prompt);
}

function openModal(title, prompt) {
  const modal = document.getElementById("aiModal");
  const titleEl = document.getElementById("modalTitle");
  const body = document.getElementById("modalBody");
  titleEl.textContent = title;
  body.innerHTML = `
    <div class="modal-loading">
      <div class="loading-spinner"></div>
      <p>Consulting agricultural knowledge base...</p>
      <small style="color:#aaa;margin-top:8px">Powered by Gemini AI</small>
    </div>`;
  modal.classList.add("open");
  document.body.style.overflow = "hidden";
  conversationHistory = [{ role: "user", content: prompt }];
  callAI(conversationHistory, body);
}

async function callAI(messages, bodyEl) {
  try {
    /*
     * ROUTING LOGIC
     * ─────────────
     * 1. Flask is running  →  POST to /ai_proxy  (API key stays on the server, most secure)
     * 2. Standalone HTML   →  POST direct to Gemini using window.KRISHI_API_KEY
     *
     * The Flask template injects:  window.KRISHI_API_KEY = "{{ api_key }}"
     * For the standalone file you can set:  window.KRISHI_API_KEY = "sk-ant-..."
     * at the top of the <script> block in the HTML.
     */
    const useProxy = window.location.protocol !== "file:";  // running via Flask
    let text = "";

    if (useProxy) {
      // ── Secure backend proxy ──────────────────────────────────────
      const resp = await fetch("/ai_proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });
      const data = await resp.json();
      if (data.error) throw new Error(data.error);
      text = data.text;
    } else {
      // ── Direct Google Gemini call (standalone HTML only) ──────────────
      const apiKey = window.KRISHI_API_KEY || "";
      if (!apiKey || apiKey === "your_gemini_api_key_here") {
        throw new Error(
          "API key not set. Open krishiTech_website.html in a text editor, " +
          "find  window.KRISHI_API_KEY = \"\"  near the bottom and paste your key."
        );
      }
      const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: {"Content-Type": "application/json",},
        body: JSON.stringify({
          contents: messages.map(msg => ({
            role: msg.role === "assistant" ? "model" : "user",
            parts: [{ text: msg.content }]
          })),
          systemInstruction: {
            role: "system",
            parts: [{
              text: "You are KrishiTech, an expert agricultural assistant specialising in Indian farming. " +
                    "You have deep knowledge of all Indian crops, soil science, agro-climatic zones of India, " +
                    "modern farming techniques (Hydroponics, Aeroponics, Aquaponics), organic and Ayurvedic " +
                    "farming practices (Panchagavya, Jeevamrutha, Beejamrutha), plant diseases and traditional " +
                    "herbal remedies, and government schemes like PM-KISAN and PMFBY. " +
                    "Always prioritise natural and organic solutions. " +
                    "Use Markdown formatting with tables where appropriate. " +
                    "Be comprehensive yet practical for Indian farmers. Use markdown and tables. \n\n" +
                    "User Request: " + messages[messages.length - 1].content 
            }]
          },
        })
      });

      const data = await resp.json();
      if (data.error) throw new Error(data.error.message || "Gemini API Error");
      text = data.content.map(c => c.text || "").join("");
      
      if (data.candidates && data.candidates[0].content.parts[0].text) {
        text = data.candidates[0].content.parts[0].text;
      } else {
        throw new Error("Empty response from AI service.");
      }
    }
    if (text) {
      currentModalContent = text;
      conversationHistory.push({ role: "assistant", content: text });
      bodyEl.innerHTML = `<div class="ai-response">${renderMarkdown(text)}</div>`;
    }
  
  } catch (err) {
    console.error("KrishiTech AI Error:", err);
    bodyEl.innerHTML = `
      <div style="padding:20px;color:#e53e3e;background:#fff5f5;border-radius:8px;border-left:4px solid #e53e3e">
        <strong>⚠️ Error:</strong> ${err.message}<br><br>
        <small>Check your API key and internet connection. See the README for setup instructions.</small>
      </div>`;
  }
}

function closeModal() {
  document.getElementById("aiModal").classList.remove("open");
  document.body.style.overflow = "";
}

function closeModalOutside(e) {
  if(e.target === document.getElementById("aiModal")) closeModal();
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
  if(!q) return;
  const body = document.getElementById("modalBody");
  const currentHtml = body.innerHTML;
  body.innerHTML = currentHtml + `
    <hr style="margin:20px 0;border-color:rgba(82,183,136,0.2)">
    <div style="background:rgba(82,183,136,0.08);border-radius:12px;padding:12px 16px;margin-bottom:16px;font-size:0.9rem;color:#2d6a4f"><strong>You asked:</strong> ${q}</div>
    <div class="modal-loading"><div class="loading-spinner"></div><p>Getting answer...</p></div>`;
  conversationHistory.push({ role: "user", content: q });
  const loadingDiv = body.querySelector(".modal-loading:last-child");
  const tempDiv = document.createElement("div");
  body.appendChild(tempDiv);
  await callAI(conversationHistory, tempDiv);
  if(loadingDiv) loadingDiv.remove();
}

// ===== MARKDOWN RENDERER =====
function renderMarkdown(text) {
  return text
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/^#{3}\s+(.+)$/gm, "<h3>$1</h3>")
    .replace(/^#{2}\s+(.+)$/gm, "<h2>$1</h2>")
    .replace(/^#{1}\s+(.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/^---$/gm, "<hr>")
    .replace(/^\|(.+)\|$/gm, (match) => {
      const cells = match.slice(1,-1).split("|");
      return "<tr>" + cells.map(c => {
        const t = c.trim();
        return t.match(/^[-:]+$/) ? null : `<td>${t}</td>`;
      }).filter(Boolean).join("") + "</tr>";
    })
    .replace(/(<tr>.*<\/tr>\n?)+/gs, m => {
      const rows = m.trim().split("\n");
      const header = rows[0].replace(/<td>/g, "<th>").replace(/<\/td>/g, "</th>");
      const body = rows.slice(1).join("\n");
      return `<table><thead>${header}</thead><tbody>${body}</tbody></table>`;
    })
    .replace(/^&gt;\s+(.+)$/gm, "<blockquote>$1</blockquote>")
    .replace(/^[\*\-]\s+(.+)$/gm, "<li>$1</li>")
    .replace(/^\d+\.\s+(.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/gs, m => `<ul>${m}</ul>`)
    .replace(/\n\n+/g, "</p><p>")
    .replace(/^(?!<[htul\/<>]).+/gm, m => m ? m : "")
    .replace(/<\/h([1-3])><p>/g, "</h$1><p>")
    .replace(/<p><h/g, "<h").replace(/<\/h([1-3])><\/p>/g, "</h$1>")
    .replace(/<p><\/p>/g, "")
    .replace(/<p><ul>/g, "<ul>").replace(/<\/ul><\/p>/g, "</ul>")
    .replace(/<p><table>/g, "<table>").replace(/<\/table><\/p>/g, "</table>")
    .replace(/<p><blockquote>/g, "<blockquote>").replace(/<\/blockquote><\/p>/g, "</blockquote>");
}

// ===== ENTRY POINT for footer links =====
window.askAI = askAI;
window.showSeason = showSeason;
window.switchSearchTab = switchSearchTab;
window.setAndSearch = setAndSearch;
window.setSoilAndSearch = setSoilAndSearch;
window.setRegionAndSearch = setRegionAndSearch;