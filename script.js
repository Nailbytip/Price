document.getElementById("year").textContent = new Date().getFullYear();

const updated = new Date().toLocaleDateString(undefined, { year:"numeric", month:"short", day:"numeric" });
document.getElementById("updatedPill").textContent = `Updated: ${updated}`;

// Filter categories
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

// Language toggle TH/EN
const toggle = document.getElementById("langToggle");
toggle.addEventListener("change", () => {
  const isTH = toggle.checked;
  document.querySelectorAll("[data-en]").forEach(el => {
    el.textContent = isTH ? el.getAttribute("data-th") : el.getAttribute("data-en");
  });
});

