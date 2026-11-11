// Pagina Home

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
