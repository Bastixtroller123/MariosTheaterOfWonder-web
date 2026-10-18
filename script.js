// Change this one number to scale the logo AND the background together.
// 1 = original size, 2 = double, 3 = triple, etc.
const SCALE = 3;

// Logo
const logo = document.querySelector(".logo");
function scaleLogo() {
  logo.style.width = logo.naturalWidth * SCALE + "px";
}
if (logo.complete && logo.naturalWidth) {
  scaleLogo();
} else {
  logo.addEventListener("load", scaleLogo);
}

// Background
const bg = new Image();
bg.onload = () => {
  document.body.style.backgroundSize =
    bg.naturalWidth * SCALE + "px " + bg.naturalHeight * SCALE + "px";
};
bg.src = "content/background.gif";
