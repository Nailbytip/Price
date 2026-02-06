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
const updated = new Date().toLocaleDateString(undefined, { year:"numeric", month:"short", day:"numeric" });
safeSetText("#updatedPill", `Updated: ${updated}`);

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

