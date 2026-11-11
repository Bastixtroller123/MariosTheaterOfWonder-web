// Pagina Devlogs (carga desde la API de Google Apps Script)

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
    if (b.type === "spacer") {
      return `<div class="post-gap"></div>`;
    }
    if (b.type === "text") {
      return `<p class="${b.list ? "post-li" : ""}">${esc(b.value)}</p>`;
    }
    return "";
  }).join("");
}

let allDevlogs = [];
let currentFilter = "all";
let currentSection = DEVLOG_SECTIONS[0].id;

// Joke: el script marca category = "joke" cuando la palabra JOKE esta arriba del todo del devlog
function isJoke(log) {
  return String(log.category || "").toLowerCase() === "joke";
}

// Video: cualquier devlog con un link de YouTube valido
function hasVideo(log) {
  return (log.blocks || []).some(b => b.type === "youtube" && getYouTubeEmbedUrl(b.url));
}

// Devlogs = todo menos jokes | Jokes = solo jokes | Videos = no-jokes con YouTube
function inSection(log, section) {
  if (section === "jokes") return isJoke(log);
  if (isJoke(log)) return false;
  return section === "videos" ? hasVideo(log) : true;
}

function sectionLogs() {
  return allDevlogs.filter(log => inSection(log, currentSection));
}

function displayDevlogs() {
  const container = document.getElementById("devlogs-container");
  if (!container) return;

  container.innerHTML = "";

  const inCurrent = sectionLogs();
  if (inCurrent.length === 0) {
    const label = DEVLOG_SECTIONS.find(s => s.id === currentSection).label.toLowerCase();
    container.innerHTML = `<p style='text-align:center;'>No ${esc(label)} yet.</p>`;
    return;
  }

  const filtered = currentFilter === "all"
    ? inCurrent
    : inCurrent.filter(log => String(log.author).toLowerCase() === currentFilter.toLowerCase());

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
        <time>${esc(formatDate(log.date))}</time>
        ${log.author ? `<span class="post-author" style="color: ${authorColor};">By ${esc(log.author)}</span>` : ""}
      </div>
      ${renderBlocks(log.blocks)}
    `;

    container.appendChild(article);
  });
}

function setupSections() {
  const el = document.getElementById("devlog-sections");
  if (!el) return;

  el.innerHTML = DEVLOG_SECTIONS.map(s =>
    `<button class="filter-btn section-btn ${s.id === currentSection ? "active" : ""}" data-section="${esc(s.id)}">${esc(s.label)}</button>`
  ).join("");

  el.querySelectorAll(".section-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      currentSection = btn.dataset.section;
      setupSections();
      setupFilters();
      displayDevlogs();
    });
  });
}

function setupFilters() {
  const filtersContainer = document.getElementById("devlog-filters");
  if (!filtersContainer) return;

  // autores de la seccion actual; si el autor elegido no tiene nada aqui, vuelve a "All"
  const authors = Array.from(new Set(sectionLogs().map(log => log.author).filter(Boolean)));
  if (currentFilter !== "all" && !authors.some(a => String(a).toLowerCase() === currentFilter.toLowerCase())) {
    currentFilter = "all";
  }

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

    setupSections();
    setupFilters();
    displayDevlogs();
  } catch (error) {
    container.innerHTML = `<p style="text-align:center;color:#ff6b6b;">Error loading devlogs.</p>`;
    console.error("Error fetching devlogs:", error);
  }
}
