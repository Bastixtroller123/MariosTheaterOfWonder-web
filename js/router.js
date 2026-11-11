// Navegacion por hash entre paginas

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
