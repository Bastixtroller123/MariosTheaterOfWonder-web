// Utilidades: escape HTML, URLs seguras, fechas, colores, titulos

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

function cleanTitle(t) {
  return String(t ?? "").replace(/^\s*devlog\s*#?\d+\s*[:.\-–—]?\s*/i, "").trim();
}

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

function formatDate(s) {
  const d = new Date(s);
  if (isNaN(d)) return String(s ?? "");
  const hasTime = d.getHours() !== 0 || d.getMinutes() !== 0;
  return d.toLocaleString("en", hasTime
    ? { dateStyle: "medium", timeStyle: "short" }
    : { dateStyle: "medium" });
}
