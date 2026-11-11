// Interacciones globales: sonido de click y bloqueo de zoom

const clickSound = new Audio("assets/sounds/smw_map_move_to_spot.wav");
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
