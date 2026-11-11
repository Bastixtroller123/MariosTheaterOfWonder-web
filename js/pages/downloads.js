// Pagina Downloads

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
