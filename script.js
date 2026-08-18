/* =====================================================================
   Nail by Tip — price menu
   ---------------------------------------------------------------------
   CONFIG — the only lines you normally need to touch
   ===================================================================== */
const WHATSAPP_PHONE_E164 = "66917027652";  // international format, no "+"
const LINE_URL            = "";             // e.g. "https://line.me/R/ti/p/~yourlineid"
                                            // leave "" and the LINE buttons are removed
const PHOTO_COUNT         = 20;             // number of files in /photos (1.jpg … N.jpg)
const PHOTOS_SHOWN        = 6;              // how many to show at random
/* ===================================================================== */

const qs = (s) => document.querySelector(s);
const qsa = (s) => Array.from(document.querySelectorAll(s));

/* ---------- Copy that JS builds at runtime (EN / TH) ---------- */
const COPY = {
  en: {
    waPlain: "Hi Nail by Tip! I'd like to book. Date/time: __ / Service: __ / (optional) design example photo",
    waIntro: "Hi Nail by Tip! I'd like to book:",
    waOutro: "Date/time: __",
    bookDefault: "Book on WhatsApp",
    bookN: (n) => (n === 1 ? "Book 1 service" : `Book ${n} services`),
    selectedN: (n) => (n === 1 ? "1 service selected" : `${n} services selected`)
  },
  th: {
    waPlain: "สวัสดีค่ะ Nail by Tip ขอจองคิวค่ะ วัน/เวลา: __ / บริการ: __ / (ถ้ามี) รูปตัวอย่างลาย",
    waIntro: "สวัสดีค่ะ Nail by Tip ขอจองคิวค่ะ",
    waOutro: "วัน/เวลา: __",
    bookDefault: "จองผ่าน WhatsApp",
    bookN: (n) => `จอง ${n} บริการ`,
    selectedN: (n) => `เลือก ${n} บริการ`
  }
};

/* ---------- Footer year ---------- */
const yearEl = qs("#year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ---------- LINE: wire it up, or remove the dead buttons ---------- */
qsa(".js-line").forEach((el) => {
  if (LINE_URL) el.href = LINE_URL;
  else el.remove();
});

/* ---------- Service selection ---------- */
const selected = new Set();
const rows = qsa(".row");

rows.forEach((row) => {
  row.addEventListener("click", () => {
    const on = row.getAttribute("aria-pressed") === "true";
    row.setAttribute("aria-pressed", on ? "false" : "true");
    if (on) selected.delete(row);
    else selected.add(row);
    updateBooking();
  });
});

const clearBtn = qs("#clearSel");
if (clearBtn) {
  clearBtn.addEventListener("click", () => {
    selected.forEach((r) => r.setAttribute("aria-pressed", "false"));
    selected.clear();
    updateBooking();
  });
}

function serviceLine(row) {
  const name = row.querySelector(".row-name");
  const price = row.querySelector(".row-price");
  return `• ${name ? name.textContent.trim() : ""} — ${price ? price.textContent.trim() : ""}`;
}

function buildMessage() {
  const t = COPY[lang];
  if (!selected.size) return t.waPlain;
  // keep the menu order, not the click order
  const lines = rows.filter((r) => selected.has(r)).map(serviceLine);
  return [t.waIntro, ...lines, "", t.waOutro].join("\n");
}

function updateBooking() {
  const t = COPY[lang];
  const n = selected.size;

  const url = `https://wa.me/${WHATSAPP_PHONE_E164}?text=${encodeURIComponent(buildMessage())}`;
  ["#waTop", "#waHero", "#waBar"].forEach((id) => {
    const el = qs(id);
    if (el) el.href = url;
  });

  const label = n === 0 ? t.bookDefault : t.bookN(n);
  qsa("#waBarLabel, .bigBookTitle").forEach((el) => (el.textContent = label));

  const strip = qs("#selstrip");
  const count = qs("#selCount");
  if (strip) strip.hidden = n === 0;
  if (count) count.textContent = t.selectedN(n);
}

/* ---------- Language ---------- */
let lang = (navigator.language || "en").toLowerCase().startsWith("th") ? "th" : "en";

function applyLang() {
  qsa("[data-en]").forEach((el) => {
    const v = el.getAttribute(lang === "th" ? "data-th" : "data-en");
    if (v !== null) el.textContent = v;
  });
  const label = qs("#langLabel");
  if (label) label.textContent = lang === "th" ? "TH" : "EN";
  document.documentElement.lang = lang;
  updateBooking(); // must run last: it overrides the booking labels
}

const langBtn = qs("#langBtn");
if (langBtn) {
  langBtn.addEventListener("click", (e) => {
    e.preventDefault();
    lang = lang === "en" ? "th" : "en";
    applyLang();
  });
}

applyLang();

/* ---------- Sticky offsets + category nav scroll-spy ---------- */
const topbar = qs("#topbar");
const catnav = qs("#catnav");
const scroller = qs(".catnav-inner");
const navLinks = qsa("#catnav .pill");
const catCards = qsa(".card[data-cat]");
let stickH = 110;

function measure() {
  const th = topbar ? topbar.offsetHeight : 0;
  const nh = catnav ? catnav.offsetHeight : 0;
  stickH = th + nh;
  const root = document.documentElement.style;
  root.setProperty("--topbar-h", th + "px");
  root.setProperty("--stick-h", stickH + "px");
}

let lastActive = null;

function updateSpy() {
  if (!catCards.length) return;
  const line = stickH + 20;
  let active = catCards[0];
  for (const c of catCards) {
    if (c.getBoundingClientRect().top <= line) active = c;
  }
  if (active === lastActive) return;
  lastActive = active;

  navLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + active.id));

  // keep the active pill visible in the horizontal scroller
  const on = navLinks.find((a) => a.classList.contains("active"));
  if (scroller && on) {
    const left = on.offsetLeft - (scroller.clientWidth - on.offsetWidth) / 2;
    scroller.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
  }
}

let ticking = false;
function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    ticking = false;
    updateSpy();
  });
}

measure();
updateSpy();
window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", () => {
  measure();
  lastActive = null;
  updateSpy();
});
window.addEventListener("load", measure);

/* ---------- Reveal on scroll ---------- */
const obs = new IntersectionObserver(
  (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("in"); }),
  { threshold: 0.12 }
);
qsa(".reveal").forEach((el) => obs.observe(el));

// Last resort: if the observer never reports anything, drop the effect
// rather than leaving the page blank.
setTimeout(() => {
  if (!qs(".reveal.in")) document.documentElement.classList.remove("js");
}, 800);

/* ---------- Lightbox ---------- */
const lb = qs("#lightbox");
const lbImg = qs("#lightboxImg");
const lbClose = qs("#lightboxClose");

function openLightbox(src) {
  if (!lb || !lbImg) return;
  lbImg.src = src;
  lb.classList.add("open");
  lb.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  if (!lb) return;
  lb.classList.remove("open");
  lb.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  if (lbImg) lbImg.src = "";
}

if (lbClose) lbClose.addEventListener("click", closeLightbox);
if (lb) lb.addEventListener("click", (e) => { if (e.target === lb) closeLightbox(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeLightbox(); });

/* ---------- Random gallery ---------- */
(function randomGallery() {
  const gallery = qs("#gallery");
  if (!gallery) return;

  const all = Array.from({ length: PHOTO_COUNT }, (_, i) => i + 1);
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }

  gallery.innerHTML = all
    .slice(0, PHOTOS_SHOWN)
    .map(
      (n) => `
      <button class="shot" type="button" data-full="photos/${n}.jpg">
        <img loading="lazy" decoding="async" width="400" height="400"
             src="photos/${n}.jpg" alt="Nail by Tip work ${n}">
      </button>`
    )
    .join("");

  qsa("#gallery .shot").forEach((btn) =>
    btn.addEventListener("click", () => openLightbox(btn.getAttribute("data-full")))
  );
})();
