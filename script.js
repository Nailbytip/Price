// ---- CONFIG (edit these) ----
const WHATSAPP_PHONE_E164 = "66XXXXXXXXX"; // ex: 66981234567 (no +)
const LINE_URL = "https://line.me/R/ti/p/~YOUR_LINE_ID";
// -----------------------------

const qs = (s) => document.querySelector(s);

function safeSetText(id, text){
  const el = qs(id);
  if (el) el.textContent = text;
}

function safeSetHref(id, href){
  const el = qs(id);
  if (el) el.href = href;
}

// Year + Updated
safeSetText("#year", new Date().getFullYear());

// WhatsApp links (prefill)
const waBase = `https://wa.me/${WHATSAPP_PHONE_E164}`;
const waMsgEN = encodeURIComponent("Hi Nail by Tip! I’d like to book. Date/time: __ / Service: __ / (Optional) design example photo");
const waMsgTH = encodeURIComponent("สวัสดีค่ะ Nail by Tip ขอจองคิวค่ะ วัน/เวลา: __ / บริการ: __ / (ถ้ามี) รูปตัวอย่างลาย/แบบ");

function setWhatsAppLinks(msg){
  const url = `${waBase}?text=${msg}`;
  safeSetHref("#waTop", url);
  safeSetHref("#waHero", url);
}

// LINE
safeSetHref("#lineTop", LINE_URL);

// Language toggle (default auto)
let lang = (navigator.language || "en").toLowerCase().startsWith("th") ? "th" : "en";

function applyLang(){
  document.querySelectorAll("[data-en]").forEach(el => {
    el.textContent = (lang === "th") ? el.getAttribute("data-th") : el.getAttribute("data-en");
  });
  safeSetText("#langLabel", (lang === "th") ? "TH" : "EN");
  setWhatsAppLinks(lang === "th" ? waMsgTH : waMsgEN);
}
applyLang();

// Button click (force toggle)
const langBtn = qs("#langBtn");
if (langBtn){
  langBtn.addEventListener("click", (e) => {
    e.preventDefault();
    lang = (lang === "en") ? "th" : "en";
    applyLang();
  });
}

// Category filter
const pills = Array.from(document.querySelectorAll(".pill[data-filter]"));
const cards = Array.from(document.querySelectorAll(".card[data-cat]"));

pills.forEach(p => {
  p.addEventListener("click", () => {
    pills.forEach(x => x.classList.remove("active"));
    p.classList.add("active");

    const filter = p.getAttribute("data-filter");
    cards.forEach(c => {
      c.style.display = (filter === "all" || c.getAttribute("data-cat") === filter) ? "" : "none";
    });
  });
});

// Reveal animation
const obs = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("in"); });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach(el => obs.observe(el));

// Lightbox for photos
const lb = document.getElementById("lightbox");
const lbImg = document.getElementById("lightboxImg");
const lbClose = document.getElementById("lightboxClose");

function openLightbox(src){
  if (!lb || !lbImg) return;
  lbImg.src = src;
  lb.classList.add("open");
  lb.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}
function closeLightbox(){
  if (!lb) return;
  lb.classList.remove("open");
  lb.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  if (lbImg) lbImg.src = "";
}

document.querySelectorAll(".shot[data-full]").forEach(btn => {
  btn.addEventListener("click", () => openLightbox(btn.getAttribute("data-full")));
});

if (lbClose) lbClose.addEventListener("click", closeLightbox);
if (lb) lb.addEventListener("click", (e) => { if (e.target === lb) closeLightbox(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeLightbox(); });

// --- Random gallery (6 photos out of 19) ---
(function randomGallery(){
  const gallery = document.getElementById("gallery");
  if (!gallery) return;

  const TOTAL = 19;      // how many photos in /photos
  const SHOW = 6;        // how many to display

  // Build list [1..TOTAL]
  const all = Array.from({ length: TOTAL }, (_, i) => i + 1);

  // Shuffle (Fisher-Yates)
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }

  const pick = all.slice(0, SHOW);

  // Cache-bust param so refresh shows a different mix even with aggressive caching
  const bust = Date.now();

  gallery.innerHTML = pick.map(n => {
    const src = `photos/${n}.jpg?v=${bust}`;
    return `
      <button class="shot" type="button" data-full="photos/${n}.jpg?v=${bust}">
        <img loading="lazy" src="${src}" alt="Nail by Tip work ${n}">
      </button>
    `;
  }).join("");

  // Hook into your existing lightbox (if present)
  const lb = document.getElementById("lightbox");
  const lbImg = document.getElementById("lightboxImg");
  const openLightbox = (src) => {
    if (!lb || !lbImg) return;
    lbImg.src = src;
    lb.classList.add("open");
    lb.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };

  document.querySelectorAll("#gallery .shot[data-full]").forEach(btn => {
    btn.addEventListener("click", () => openLightbox(btn.getAttribute("data-full")));
  });
})();
