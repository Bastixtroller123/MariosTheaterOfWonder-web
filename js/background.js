// Fondo con scroll/parallax automatico

const bg = new Image();
bg.onload = () => {
  document.documentElement.style.setProperty(
    "--bg-size",
    bg.naturalWidth * SCALE + "px " + bg.naturalHeight * SCALE + "px"
  );
};
bg.src = "assets/images/backgrounds/background.png";

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
