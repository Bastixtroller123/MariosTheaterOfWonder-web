const API_URL = "https://script.google.com/macros/s/AKfycbxctk6OTPu1UGwoyQWWR_llHHvgZFRV34lvvPZINYTf1rYwPyyL6zE1ScOsY2neIevH/exec";
const SCALE = 3;
const BG_SCROLL_FACTOR = 0.4;
const BG_AUTO_SPEED = 0.3; 
const PAGES = ["home", "downloads", "credits", "devlogs"];

const clickSound = new Audio("content/sounds/smw_map_move_to_spot.wav");
clickSound.volume = 0.4;

document.addEventListener("click", (e) => {
  const target = e.target.closest("a, button, .tab, .big-btn, .dl-btn, .filter-btn, .credit-link-btn, .logo");
  if (target) {
    clickSound.currentTime = 0;
    clickSound.play().catch((error) => {
      console.log("Audio play prevented:", error);
    });
  }
});

window.addEventListener('wheel', function (e) {
  if (e.ctrlKey) {
    e.preventDefault();
  }
}, { passive: false });

window.addEventListener('keydown', function (e) {
  if (e.ctrlKey && (e.key === '+' || e.key === '-' || e.key === '=' || e.key === '_' || e.key === '0')) {
    e.preventDefault();
  }
});

const AUTHOR_COLORS = {
  "xagst3er": "#0000FF",
  "bastixtroller123": "#FFC300",
  "sunnidaize_official": "#9B111E",
};
const DEFAULT_AUTHOR_COLOR = "#ffcc00";

let isDragging = false;
let userInteractedWithLogo = false; 
let dragStartX = 0;
let currentLogoOffset = 0;

function getMaxDragRange() {
  return Math.min(window.innerWidth / 2.5, 400);
}

function getSunTimes(date, lat) {
  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  const declination = 23.45 * Math.sin((360 * (284 + dayOfYear) / 365) * (Math.PI / 180));
  
  let sunsetHour = 19 - (lat * declination / 400); 
  let sunriseHour = 6 + (lat * declination / 400);

  if (isNaN(sunsetHour) || sunsetHour < 17) sunsetHour = 19.5; 
  if (isNaN(sunriseHour) || sunriseHour > 8) sunriseHour = 6.0;  

  return { sunrise: sunriseHour, sunset: sunsetHour };
}

function calculateTimeOpacity() {
  const now = new Date();
  const currentHours = now.getHours() + (now.getMinutes() / 60) + (now.getSeconds() / 3600);
  let userLat = 25.0; 
  const sunTimes = getSunTimes(now, userLat);
  const twilightDuration = 1.5; 

  const sunsetStart = sunTimes.sunset - twilightDuration;
  const sunsetEnd = sunTimes.sunset + 0.5;
  const sunriseStart = sunTimes.sunrise - 0.5;
  const sunriseEnd = sunTimes.sunrise + twilightDuration;

  let opacity = 0;
  if (currentHours >= sunsetStart && currentHours <= sunsetEnd) {
    opacity = (currentHours - sunsetStart) / (sunsetEnd - sunsetStart);
  } else if (currentHours > sunsetEnd || currentHours < sunriseStart) {
    opacity = 1;
  } else if (currentHours >= sunriseStart && currentHours <= sunriseEnd) {
    opacity = 1 - ((currentHours - sunriseStart) / (sunriseEnd - sunriseStart));
  } else {
    opacity = 0;
  }
  return Math.max(0, Math.min(1, opacity));
}

function updateDayNightCycle() {
  if (isDragging || userInteractedWithLogo) return; 

  const opacity = calculateTimeOpacity();
  document.documentElement.style.setProperty("--night-opacity", opacity.toFixed(3));

  const maxRange = getMaxDragRange();
  currentLogoOffset = (opacity - 0.5) * (maxRange * 2);
  applyLogoTransform();
}

function applyLogoTransform() {
  const logoEl = document.getElementById("draggable-logo");
  if (logoEl) {
    logoEl.style.transform = `translateX(${currentLogoOffset}px)`;
  }
}

function setupLogoSlider() {
  const logoEl = document.getElementById("draggable-logo");
  if (!logoEl) return;

  function startDrag(clientX) {
    isDragging = true;
    userInteractedWithLogo = true; 
    dragStartX = clientX - currentLogoOffset;
    logoEl.style.transition = "none";
  }

  function onDrag(clientX) {
    if (!isDragging) return;
    let newOffset = clientX - dragStartX;
    const maxRange = getMaxDragRange();
    
    currentLogoOffset = Math.max(-maxRange, Math.min(maxRange, newOffset));
    applyLogoTransform();

    const normalizedOpacity = (currentLogoOffset + maxRange) / (maxRange * 2);
    document.documentElement.style.setProperty("--night-opacity", Math.max(0, Math.min(1, normalizedOpacity)).toFixed(3));
  }

  function endDrag() {
    if (!isDragging) return;
    isDragging = false;
    logoEl.style.transition = "transform 0.1s ease-out";
  }

  logoEl.addEventListener("mousedown", (e) => {
    startDrag(e.clientX);
    e.preventDefault();
  });
  window.addEventListener("mousemove", (e) => onDrag(e.clientX));
  window.addEventListener("mouseup", endDrag);

  logoEl.addEventListener("touchstart", (e) => {
    if (e.touches.length === 1) {
      startDrag(e.touches[0].clientX);
    }
  });
  window.addEventListener("touchmove", (e) => {
    if (e.touches.length === 1) {
      onDrag(e.touches[0].clientX);
    }
  });
  window.addEventListener("touchend", endDrag);
}

updateDayNightCycle();
setInterval(updateDayNightCycle, 30000);

function hexToRgba(hex, alpha = 0.15) {
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

const logo = document.querySelector(".logo");
function scaleLogo() {
  if (logo && logo.naturalWidth) {
    logo.style.width = logo.naturalWidth * SCALE + "px";
  }
}
if (logo && logo.complete && logo.naturalWidth) {
  scaleLogo();
  setupLogoSlider();
} else if (logo) {
  logo.addEventListener("load", () => {
    scaleLogo();
    setupLogoSlider();
  });
}

const bg = new Image();
bg.onload = () => {
  document.documentElement.style.setProperty(
    "--bg-size",
    bg.naturalWidth * SCALE + "px " + bg.naturalHeight * SCALE + "px"
  );
};
bg.src = "content/background.png";

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let bgX = 0;
let lastScrollY = window.scrollY;

function updateBg() {
  const scrollY = window.scrollY;
  lastScrollY = scrollY;

  if (!reduceMotion.matches) {
    bgX -= BG_AUTO_SPEED; 
  }

  const bgY = reduceMotion.matches ? 0 : Math.round(-scrollY * BG_SCROLL_FACTOR);

  document.documentElement.style.setProperty("--bg-x", bgX + "px");
  document.documentElement.style.setProperty("--bg-y", bgY + "px");

  requestAnimationFrame(updateBg);
}

requestAnimationFrame(updateBg);

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

function renderCredits() {
  const el = document.getElementById("sec-credits");
  if (!el || typeof MOD_INFO === "undefined") return;

  const icons = {
    youtube: `<svg viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
    twitter: `<svg viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
    web: `<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm7.93 6h-3.14a15.28 15.28 0 0 0-1.85-4.22A8 8 0 0 1 19.93 8zM12 4.04a13.35 13.35 0 0 1 2.3 3.96H9.7A13.35 13.35 0 0 1 12 4.04zM4.07 14h3.14a15.28 15.28 0 0 0 1.85 4.22A8 8 0 0 1 4.07 14zm0-4a8 8 0 0 1 2.76-4.22A15.28 15.28 0 0 0 8.68 10H4.07zm3.14 6h9.58a13.35 13.35 0 0 1-2.3 3.96 13.35 13.35 0 0 1-4.98 0A13.35 13.35 0 0 1 7.21 16zm6.11 4.22a15.28 15.28 0 0 0 1.85-4.22h3.14a8 8 0 0 1-4.99 4.22zM15.32 12a15.8 15.8 0 0 0 0-4h3.61a8 8 0 0 1 0 8h-3.61z"/></svg>`
  };

  const items = (MOD_INFO.credits || []).map(m => {
    const links = (m.links || []).map(l => {
      const urlLower = (l.url || "").toLowerCase();
      let icon = icons.web;
      if (urlLower.includes("youtube.com") || urlLower.includes("youtu.be")) {
        icon = icons.youtube;
      } else if (urlLower.includes("twitter.com") || urlLower.includes("x.com")) {
        icon = icons.twitter;
      }
      return `<a class="credit-link-btn" href="${esc(safeUrl(l.url))}" target="_blank" rel="noopener noreferrer">${icon}<span>${esc(l.label)}</span></a>`;
    }).join("");

    const avatarImg = m.avatar 
      ? `<img class="credit-avatar" src="${esc(safeUrl(m.avatar))}" alt="${esc(m.name)}">` 
      : `<div class="credit-avatar" style="display:flex;align-items:center;justify-content:center;color:#ffcc00;font-weight:bold;">?</div>`;

    let quoteHTML = "";
    if (m.quoteImage) {
      quoteHTML = `
        <div class="credit-quote-container">
          <img class="credit-quote-img" src="${esc(safeUrl(m.quoteImage))}" alt="Drawing">
          ${m.quoteSubtext ? `<small class="credit-quote-sub">${esc(m.quoteSubtext)}</small>` : ""}
        </div>
      `;
    } else if (m.quote) {
      quoteHTML = `<blockquote>“${esc(m.quote)}”</blockquote>`;
    }

    return `
      <div class="credit-card">
        <div class="credit-header">
          ${avatarImg}
          <div class="credit-titles">
            <span class="credit-name">${esc(m.name)}</span>
            ${m.role ? `<span class="credit-role">${esc(m.role)}</span>` : ""}
          </div>
        </div>
        ${quoteHTML}
        ${links ? `<div class="credit-links">${links}</div>` : ""}
      </div>`;
  }).join("");

  el.innerHTML = `
    <h2>Credits</h2>
    <div>${items || "<p style='text-align:center;'>Nothing here yet.</p>"}</div>
  `;
}

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

  filtered.forEach((log) => {
    const article = document.createElement("article");
    article.className = "post";

    const authorKey = String(log.author || "").trim().toLowerCase();
    const authorColor = AUTHOR_COLORS[authorKey] || DEFAULT_AUTHOR_COLOR;

    article.style.borderColor = authorColor;
    article.style.backgroundColor = hexToRgba(authorColor, 0.15);

    article.innerHTML = `
      <h3>${esc(cleanTitle(log.title))}</h3>
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