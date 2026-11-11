// Pagina Credits

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
