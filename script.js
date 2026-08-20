/* =====================================================================
   Nailgel Bytip — price menu
   ---------------------------------------------------------------------
   CONFIG — the only lines you normally need to touch
   ===================================================================== */
const WHATSAPP_PHONE_E164 = "66917027652";  // international format, no "+"
const LINE_URL = "https://line.me/ti/p/dhMSH5t2T3";  // LINE "add friend" link
                                            // set to "" and the LINE buttons are removed
const OPEN_HOUR           = 10;             // opens 10:00 — same hours every day
const CLOSE_HOUR          = 22;             // closes 22:00
                                            // always read in Bangkok time, so a visitor
                                            // whose phone is on another timezone still
                                            // sees the shop's real status
const PHOTO_COUNT         = 28;             // files in /photos (1.jpg … N.jpg): 1-20 nails, 21-28 hair
/* ===================================================================== */

const qs = (s) => document.querySelector(s);
const qsa = (s) => Array.from(document.querySelectorAll(s));

/* ---------- Copy that JS builds at runtime (EN / TH / RU) ---------- */

// Russian nouns take three forms after a number: 1 услуга, 2 услуги, 5 услуг.
const ruPlural = (n, one, few, many) => {
  const d = n % 10, h = n % 100;
  if (d === 1 && h !== 11) return one;
  if (d >= 2 && d <= 4 && (h < 12 || h > 14)) return few;
  return many;
};

const COPY = {
  en: {
    waPlain: "Hi Tip! I'd like to book. Date/time: __ / Service: __ / (optional) design example photo",
    waIntro: "Hi Tip! I'd like to book:",
    waOutro: "Date/time: __",
    bookDefault: "Book on WhatsApp",
    bookN: (n) => (n === 1 ? "Book 1 service" : `Book ${n} services`),
    selectedN: (n) => (n === 1 ? "1 service selected" : `${n} services selected`),
    openNow: (close) => `Open now · until ${close}`,
    closingSoon: (min) => `Closing in ${min} min`,
    closedUntil: (open) => `Closed · opens at ${open}`,
    closedTomorrow: (open) => `Closed · opens tomorrow ${open}`
  },
  th: {
    waPlain: "สวัสดีค่ะ คุณ Tip ขอจองคิวค่ะ วัน/เวลา: __ / บริการ: __ / (ถ้ามี) รูปตัวอย่างลาย",
    waIntro: "สวัสดีค่ะ คุณ Tip ขอจองคิวค่ะ",
    waOutro: "วัน/เวลา: __",
    bookDefault: "จองผ่าน WhatsApp",
    bookN: (n) => `จอง ${n} บริการ`,
    selectedN: (n) => `เลือก ${n} บริการ`,
    openNow: (close) => `เปิดอยู่ · ถึง ${close}`,
    closingSoon: (min) => `ปิดในอีก ${min} นาที`,
    closedUntil: (open) => `ปิดอยู่ · เปิด ${open}`,
    closedTomorrow: (open) => `ปิดอยู่ · เปิดพรุ่งนี้ ${open}`
  },
  ru: {
    waPlain: "Здравствуйте, Tip! Хочу записаться. Дата/время: __ / Услуга: __ / (по желанию) фото дизайна",
    waIntro: "Здравствуйте, Tip! Хочу записаться:",
    waOutro: "Дата/время: __",
    bookDefault: "Записаться",
    bookN: (n) => `Записаться: ${n} ${ruPlural(n, "услуга", "услуги", "услуг")}`,
    selectedN: (n) => `Выбрано: ${n} ${ruPlural(n, "услуга", "услуги", "услуг")}`,
    openNow: (close) => `Открыто · до ${close}`,
    closingSoon: (min) => `Закрытие через ${min} мин`,
    closedUntil: (open) => `Закрыто · откроется в ${open}`,
    closedTomorrow: (open) => `Закрыто · завтра с ${open}`
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

/* ---------- Open / closed, in Bangkok time ---------- */
const statusChip = qs("#statusChip");

function bangkokMinutes() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Bangkok",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).formatToParts(new Date());
  const val = (type) => Number(parts.find((p) => p.type === type).value);
  return (val("hour") % 24) * 60 + val("minute"); // %24: some engines report midnight as 24
}

function updateStatus() {
  if (!statusChip) return;
  const t = COPY[lang];
  const now = bangkokMinutes();
  const open = OPEN_HOUR * 60;
  const close = CLOSE_HOUR * 60;
  const hhmm = (h) => String(h).padStart(2, "0") + ":00";

  let text, state;
  if (now < open) {
    text = t.closedUntil(hhmm(OPEN_HOUR));
    state = "closed";
  } else if (now >= close) {
    text = t.closedTomorrow(hhmm(OPEN_HOUR));
    state = "closed";
  } else if (close - now <= 60) {
    text = t.closingSoon(close - now);
    state = "soon";
  } else {
    text = t.openNow(hhmm(CLOSE_HOUR));
    state = "open";
  }

  statusChip.textContent = text;
  statusChip.dataset.state = state;
  statusChip.hidden = false;
}

// the page can stay open for a while: keep the status honest
setInterval(updateStatus, 60000);

/* ---------- Language ---------- */
const LANGS = ["en", "th", "ru"];
const LANG_KEY = "nbt-lang";

function detectLang() {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (LANGS.includes(saved)) return saved;
  } catch (e) { /* private browsing: fall through to the phone's setting */ }

  for (const pref of navigator.languages || [navigator.language || "en"]) {
    const code = String(pref).toLowerCase().slice(0, 2);
    if (LANGS.includes(code)) return code;
  }
  return "en";
}

let lang = detectLang();

function applyLang() {
  qsa("[data-en]").forEach((el) => {
    const v = el.getAttribute("data-" + lang);
    if (v !== null) el.textContent = v;
  });
  document.documentElement.lang = lang;
  const sel = qs("#langSel");
  if (sel) sel.value = lang;
  // both must run last: they rewrite text applyLang has just set
  updateBooking();
  updateStatus();
}

const langSel = qs("#langSel");
if (langSel) {
  langSel.addEventListener("change", () => {
    lang = LANGS.includes(langSel.value) ? langSel.value : "en";
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) { /* nothing to do */ }
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

/* ---------- Lightbox (browse the whole set, swipe or arrows) ---------- */
const lb = qs("#lightbox");
const lbImg = qs("#lightboxImg");
const lbClose = qs("#lightboxClose");
const lbPrev = qs("#lightboxPrev");
const lbNext = qs("#lightboxNext");
const lbCount = qs("#lightboxCount");

let lbList = [];
let lbIndex = 0;

function showLightboxAt(i) {
  if (!lbList.length || !lbImg) return;
  lbIndex = (i + lbList.length) % lbList.length; // wraps at both ends
  lbImg.src = lbList[lbIndex];
  if (lbCount) lbCount.textContent = `${lbIndex + 1} / ${lbList.length}`;
}

function openLightbox(list, index) {
  if (!lb || !lbImg) return;
  lbList = list;
  showLightboxAt(index);
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

const isOpen = () => !!lb && lb.classList.contains("open");

if (lbClose) lbClose.addEventListener("click", closeLightbox);
if (lbPrev) lbPrev.addEventListener("click", (e) => { e.stopPropagation(); showLightboxAt(lbIndex - 1); });
if (lbNext) lbNext.addEventListener("click", (e) => { e.stopPropagation(); showLightboxAt(lbIndex + 1); });
if (lb) lb.addEventListener("click", (e) => { if (e.target === lb) closeLightbox(); });

document.addEventListener("keydown", (e) => {
  if (!isOpen()) return;
  if (e.key === "Escape") closeLightbox();
  else if (e.key === "ArrowLeft") showLightboxAt(lbIndex - 1);
  else if (e.key === "ArrowRight") showLightboxAt(lbIndex + 1);
});

// swipe left/right on touch
let swipeFrom = null;
if (lb) {
  lb.addEventListener("touchstart", (e) => { swipeFrom = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", (e) => {
    if (swipeFrom === null) return;
    const dx = e.changedTouches[0].clientX - swipeFrom;
    if (Math.abs(dx) > 45) showLightboxAt(lbIndex + (dx < 0 ? 1 : -1));
    swipeFrom = null;
  }, { passive: true });
}

/* ---------- Gallery: horizontal strip, whole set in random order ---------- */
(function gallery() {
  const strip = qs("#gallery");
  if (!strip) return;

  const order = Array.from({ length: PHOTO_COUNT }, (_, i) => i + 1);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  // the strip shows 450px thumbnails (~35 KB); the lightbox gets the originals
  const thumbs = order.map((n) => `photos/thumb/${n}.jpg`);
  const fulls = order.map((n) => `photos/${n}.jpg`);

  // all 20 are in the DOM but lazy: only the few on screen are downloaded
  strip.innerHTML = thumbs.map((src, i) => `
      <button class="shot" type="button" data-i="${i}">
        <img loading="lazy" decoding="async" width="400" height="500"
             src="${src}" alt="Nailgel Bytip work photo">
      </button>`).join("");

  strip.addEventListener("click", (e) => {
    const btn = e.target.closest(".shot");
    if (btn) openLightbox(fulls, Number(btn.dataset.i));
  });

  /* arrows — pointer devices only, touch users swipe */
  const prevBtn = qs("#galPrev");
  const nextBtn = qs("#galNext");
  const step = () => Math.max(170, strip.clientWidth * 0.8);

  function syncArrows() {
    if (!prevBtn || !nextBtn) return;
    const max = strip.scrollWidth - strip.clientWidth - 2;
    prevBtn.disabled = strip.scrollLeft <= 2;
    nextBtn.disabled = strip.scrollLeft >= max;
  }

  // strips inside a price card browse only their own set — the before/after
  // pair, or the lash chart where every tile points at the same full image
  qsa(".minigal").forEach((mg) => {
    const shots = Array.from(mg.querySelectorAll(".shot"));
    const srcs = [...new Set(shots.map((b) => b.dataset.full))];
    mg.addEventListener("click", (e) => {
      const btn = e.target.closest(".shot");
      if (btn) openLightbox(srcs, Math.max(0, srcs.indexOf(btn.dataset.full)));
    });
  });

  if (prevBtn) prevBtn.addEventListener("click", () => strip.scrollBy({ left: -step(), behavior: "smooth" }));
  if (nextBtn) nextBtn.addEventListener("click", () => strip.scrollBy({ left: step(), behavior: "smooth" }));
  strip.addEventListener("scroll", syncArrows, { passive: true });
  window.addEventListener("resize", syncArrows);
  syncArrows();
})();
