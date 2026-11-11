// Punto de entrada

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
