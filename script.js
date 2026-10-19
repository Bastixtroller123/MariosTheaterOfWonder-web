const API_URL = "https://script.google.com/macros/s/AKfycbxctk6OTPu1UGwoyQWWR_llHHvgZFRV34lvvPZINYTf1rYwPyyL6zE1ScOsY2neIevH/exec";
const SCALE = 3;
const BG_SCROLL_FACTOR = 0.4;
const PAGES = ["home", "downloads", "credits", "devlogs"];

// ============================================================
//  CONFIGURACIÓN DE COLORES POR AUTOR (Bordes y Fondo del Devlog)
// ============================================================
const AUTHOR_COLORS = {
  "xagst3er": "#0000FF",
  "bastixtroller123": "#FFC300",
  "sunnidaize_official": "#9B111E",
};
const DEFAULT_AUTHOR_COLOR = "#ffcc00"; // Color por defecto

/* ---------- Función auxiliar para convertir Hex a RGBA (con opacidad muy baja) ---------- */
function hexToRgba(hex, alpha = 0.15) { // <-- Valor reducido para que sea sutil y transparente
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('');
  }
  const num = parseInt(cleanHex, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/* ---------- Logo y fondo pixelados ---------- */
const logo = document.querySelector(".logo");
function scaleLogo() {
  logo.style.width = logo.naturalWidth * SCALE + "px";
}
if (logo.complete && logo.naturalWidth) {
  scaleLogo();
} else {
  logo.addEventListener("load", scaleLogo);
}

const bg = new Image();
bg.onload = () => {
  document.documentElement.style.setProperty(
    "--bg-size",
    bg.naturalWidth * SCALE + "px " + bg.naturalHeight * SCALE + "px"
  );
};
bg.src = "content/background.gif";

/* ---------- Parallax del fondo ---------- */
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let bgTicking = false;

function updateBg() {
  const y = reduceMotion.matches ? 0 : Math.round(-window.scrollY * BG_SCROLL_FACTOR);
  document.documentElement.style.setProperty("--bg-y", y + "px");
  bgTicking = false;
}

window.addEventListener("scroll", () => {
  if (!bgTicking) {
    bgTicking = true;
    requestAnimationFrame(updateBg);
  }
}, { passive: true });

updateBg();

/* ---------- Utilidades ---------- */
function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function safeUrl(u) {
  u = String(u ?? "").trim();
  return /^(javascript|data|vbscript):/i.test(u) ? "#" : u;
}

function getYouTubeEmbedUrl(url) {
  if (!url) return "";
  let videoId = "";
  if (url.includes("youtu.be/")) {
    videoId = url.split("youtu.be/")[1]?.split("?")[0];
  } else if (url.includes("watch?v=")) {
    videoId = url.split("watch?v=")[1]?.split("&")[0];
  }
  return videoId ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}` : "";
}

/* ---------- Navegación entre secciones ---------- */
function currentPage() {
  const h = location.hash.replace("#", "");
  return PAGES.includes(h) ? h : "home";
}

function showPage(name, scrollToNav) {
  document.querySelectorAll(".page-section").forEach(sec => {
    sec.hidden = sec.dataset.page !== name;
  });

  document.querySelectorAll(".tab").forEach(tab => {
    const active = tab.dataset.page === name;
    tab.classList.toggle("active", active);
    if (active) tab.setAttribute("aria-current", "page");
    else tab.removeAttribute("aria-current");
  });

  if (scrollToNav) {
    const navTop = document.getElementById("topnav").offsetTop;
    if (window.scrollY > navTop) window.scrollTo(0, navTop);
  }
}

window.addEventListener("hashchange", () => showPage(currentPage(), true));

/* ---------- Home ---------- */
function renderHome() {
  const el = document.getElementById("sec-home");
  if (!el || typeof MOD_INFO === "undefined") return;

  const about = (MOD_INFO.about || []).map(t => `<p>${esc(t)}</p>`).join("");
  const chapters = (MOD_INFO.story || []).map(ch => {
    const paragraphs = [].concat(ch.text || []).map(t => `<p>${esc(t)}</p>`).join("");
    return `<div class="info-box">${ch.title ? `<h4>${esc(ch.title)}</h4>` : ""}${paragraphs}</div>`;
  }).join("");

  el.innerHTML = `
    ${about ? `<div class="info-box"><h4>About</h4>${about}</div>` : ""}
    ${chapters}
    <div class="cta">
      <a class="big-btn" href="#downloads">Download</a>
      <a class="big-btn alt" href="#devlogs">Devlogs</a>
    </div>
  `;
}

/* ---------- Downloads ---------- */
function renderDownloads() {
  const el = document.getElementById("sec-downloads");
  if (!el || typeof MOD_INFO === "undefined") return;

  const items = (MOD_INFO.downloads || []).map(d =>
    `<a class="dl-btn" href="${esc(safeUrl(d.url))}" target="_blank" rel="noopener noreferrer">
       <span>${esc(d.label)}</span>${d.note ? `<small>${esc(d.note)}</small>` : ""}
     </a>`
  ).join("");

  el.innerHTML = `
    <h2>Downloads</h2>
    <div class="info-box">
      ${items ? `<div class="downloads">${items}</div>` : "<p>Nothing here yet.</p>"}
    </div>
  `;
}

/* ---------- Credits ---------- */
function renderCredits() {
  const el = document.getElementById("sec-credits");
  if (!el || typeof MOD_INFO === "undefined") return;

  const items = (MOD_INFO.credits || []).map(m => {
    const links = (m.links || []).map(l =>
      `<a href="${esc(safeUrl(l.url))}" target="_blank" rel="noopener noreferrer">${esc(l.label)}</a>`
    ).join("");
    return `
      <div class="member">
        <div class="member-head">
          <span class="member-name">${esc(m.name)}</span>
          ${m.role ? `<span class="member-role">${esc(m.role)}</span>` : ""}
        </div>
        ${m.quote ? `<blockquote>“${esc(m.quote)}”</blockquote>` : ""}
        ${links ? `<div class="member-links">${links}</div>` : ""}
      </div>`;
  }).join("");

  el.innerHTML = `
    <h2>Credits</h2>
    <div class="info-box">${items || "<p>Nothing here yet.</p>"}</div>
  `;
}

/* ---------- Devlogs & Categorías ---------- */
function cleanTitle(t) {
  return String(t ?? "").replace(/^\s*devlog\s*#?\d+\s*[:.\-–—]?\s*/i, "").trim();
}

function renderBlocks(blocks) {
  return (blocks || []).map(b => {
    if (b.type === "image" && typeof b.src === "string" && b.src.startsWith("data:image/")) {
      return `<div class="post-media-container"><img class="post-img" src="${b.src}" alt=""></div>`;
    }
    if (b.type === "youtube") {
      const embed = getYouTubeEmbedUrl(b.url);
      return embed
        ? `<div class="video-container"><iframe src="${embed}" title="YouTube video player" frameborder="0" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`
        : "";
    }
    if (b.type === "text") {
      return `<p>${esc(b.value)}</p>`;
    }
    return "";
  }).join("");
}

let allDevlogs = [];
let currentFilter = "all";

function parseDate(dateStr) {
  if (!dateStr) return 0;
  let time = new Date(dateStr).getTime();
  if (!isNaN(time)) return time;

  const parts = String(dateStr).trim().split(/[\/\-]/);
  if (parts.length === 3) {
    time = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).getTime();
    if (!isNaN(time)) return time;
  }
  return 0;
}

function displayDevlogs() {
  const container = document.getElementById("devlogs-container");
  if (!container) return;

  container.innerHTML = "";

  const filtered = currentFilter === "all"
    ? allDevlogs
    : allDevlogs.filter(log => String(log.author).toLowerCase() === currentFilter.toLowerCase());

  if (filtered.length === 0) {
    container.innerHTML = "<p style='text-align:center;'>No devlogs found for this category.</p>";
    return;
  }

  filtered.forEach((log, index) => {
    const article = document.createElement("article");
    article.className = "post";

    const authorKey = String(log.author || "").trim().toLowerCase();
    const authorColor = AUTHOR_COLORS[authorKey] || DEFAULT_AUTHOR_COLOR;

    article.style.borderColor = authorColor;
    article.style.backgroundColor = hexToRgba(authorColor, 0.15); // Fondo transparente y sutil

    article.innerHTML = `
      <h3>Devlog ${index + 1}: ${esc(cleanTitle(log.title))}</h3>
      <div class="post-meta">
        <time>${esc(log.date)}</time>
        ${log.author ? `<span class="post-author" style="color: ${authorColor};">By ${esc(log.author)}</span>` : ""}
      </div>
      ${renderBlocks(log.blocks)}
    `;

    container.appendChild(article);
  });
}

function setupFilters() {
  const filtersContainer = document.getElementById("devlog-filters");
  if (!filtersContainer) return;

  const authors = Array.from(new Set(allDevlogs.map(log => log.author).filter(Boolean)));
  
  let html = `<button class="filter-btn ${currentFilter === 'all' ? 'active' : ''}" data-author="all">All</button>`;
  authors.forEach(author => {
    const isActive = currentFilter.toLowerCase() === String(author).toLowerCase();
    html += `<button class="filter-btn ${isActive ? 'active' : ''}" data-author="${esc(author)}">${esc(author)}</button>`;
  });

  filtersContainer.innerHTML = html;

  filtersContainer.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      currentFilter = btn.dataset.author;
      setupFilters();
      displayDevlogs();
    });
  });
}

async function renderDevlogs() {
  const container = document.getElementById("devlogs-container");
  if (!container) return;

  container.innerHTML = "<p style='text-align:center;'>Loading devlogs...</p>";

  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const logs = await res.json();

    if (!Array.isArray(logs) || logs.length === 0) {
      container.innerHTML = "<p style='text-align:center;'>No devlogs yet.</p>";
      return;
    }

    allDevlogs = logs.sort((a, b) => parseDate(a.date) - parseDate(b.date));

    setupFilters();
    displayDevlogs();
  } catch (error) {
    container.innerHTML = `<p style="text-align:center;color:#ff6b6b;">Error loading devlogs.</p>`;
    console.error("Error fetching devlogs:", error);
  }
}

function init() {
  renderHome();
  renderDownloads();
  renderCredits();
  renderDevlogs();
  showPage(currentPage(), false);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}