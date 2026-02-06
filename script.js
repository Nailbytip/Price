// ---- CONFIG (edit these) ----
const WHATSAPP_PHONE_E164 = "66XXXXXXXXX"; // ex: 66981234567 (no +)
const LINE_URL = "https://line.me/R/ti/p/~YOUR_LINE_ID";
// -----------------------------

// helper
const qs = (s) => document.querySelector(s);

// year + updated
qs("#year").textContent = new Date().getFullYear();
const updated = new Date().toLocaleDateString(undefined, { year:"numeric", month:"short", day:"numeric" });
qs("#updatedPill").textContent = `Updated: ${updated}`;

// WhatsApp links (with prefill message)
const waMsgEN = encodeURIComponent("Hi Nail by Tip! I’d like to book. Date/time: __ / Service: __ / (Photo optional)");
const waMsgTH = encodeURIComponent("สวัสดีค่ะ Nail by Tip ขอจองคิวค่ะ วัน/เวลา: __ / บริการ: __ / (แนบรูปได้ค่ะ)");
const waBase = `https://wa.me/${WHATSAPP_PHONE_E164}`;

function setWhatsAppLinks(msg){
  const url = `${waBase}?text=${msg}`;
  ["#waTop","#waHero","#waSticky"].forEach(id => {
    const el = qs(id);
    if (el) el.href = url;
  });
}
function setLineLink(){
  const el = qs("#lineTop");
  if (el) el.href = LINE_URL;
}
setLineLink();

// language auto (Thai locale) + manual switch
let lang = (navigator.language || "en").toLowerCase().startsWith("th") ? "th" : "en";
const langLabel = qs("#langLabel");
const langBtn = qs("#langBtn");

function applyLang(){
  document.querySelectorAll("[data-en]").forEach(el => {
    el.textContent = (lang === "th") ? el.getAttribute("data-th") : el.getAttribute("data-en");
  });
  langLabel.textContent = (lang === "th") ? "TH" : "EN";
  setWhatsAppLinks(lang === "th" ? waMsgTH : waMsgEN);
}
applyLang();

langBtn.addEventListener("click", () => {
  lang = (lang === "en") ? "th" : "en";
  applyLang();
});

// category filter
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

// reveal animation on scroll
const obs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add("in");
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach(el => obs.observe(el));

