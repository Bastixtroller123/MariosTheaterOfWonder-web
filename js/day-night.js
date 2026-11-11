// Header: logo arrastrable + ciclo dia/noche

let isDragging = false;
let userInteractedWithLogo = false; 
let dragStartX = 0;
let currentLogoOffset = 0;

function getMaxDragRange() {
  return Math.min(window.innerWidth / 2.5, 400);
}

function getSunTimes(date, lat) {
  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  const declination = 23.45 * Math.sin((360 * (284 + dayOfYear) / 365) * (Math.PI / 180));
  
  let sunsetHour = 19 - (lat * declination / 400); 
  let sunriseHour = 6 + (lat * declination / 400);

  if (isNaN(sunsetHour) || sunsetHour < 17) sunsetHour = 19.5; 
  if (isNaN(sunriseHour) || sunriseHour > 8) sunriseHour = 6.0;  

  return { sunrise: sunriseHour, sunset: sunsetHour };
}

function calculateTimeOpacity() {
  const now = new Date();
  const currentHours = now.getHours() + (now.getMinutes() / 60) + (now.getSeconds() / 3600);
  let userLat = 25.0; 
  const sunTimes = getSunTimes(now, userLat);
  const twilightDuration = 1.5; 

  const sunsetStart = sunTimes.sunset - twilightDuration;
  const sunsetEnd = sunTimes.sunset + 0.5;
  const sunriseStart = sunTimes.sunrise - 0.5;
  const sunriseEnd = sunTimes.sunrise + twilightDuration;

  let opacity = 0;
  if (currentHours >= sunsetStart && currentHours <= sunsetEnd) {
    opacity = (currentHours - sunsetStart) / (sunsetEnd - sunsetStart);
  } else if (currentHours > sunsetEnd || currentHours < sunriseStart) {
    opacity = 1;
  } else if (currentHours >= sunriseStart && currentHours <= sunriseEnd) {
    opacity = 1 - ((currentHours - sunriseStart) / (sunriseEnd - sunriseStart));
  } else {
    opacity = 0;
  }
  return Math.max(0, Math.min(1, opacity));
}

function updateDayNightCycle() {
  if (isDragging || userInteractedWithLogo) return; 

  const opacity = calculateTimeOpacity();
  document.documentElement.style.setProperty("--night-opacity", opacity.toFixed(3));

  const maxRange = getMaxDragRange();
  currentLogoOffset = (opacity - 0.5) * (maxRange * 2);
  applyLogoTransform();
}

function applyLogoTransform() {
  const logoEl = document.getElementById("draggable-logo");
  if (logoEl) {
    logoEl.style.transform = `translateX(${currentLogoOffset}px)`;
  }
}

function setupLogoSlider() {
  const logoEl = document.getElementById("draggable-logo");
  if (!logoEl) return;

  function startDrag(clientX) {
    isDragging = true;
    userInteractedWithLogo = true; 
    dragStartX = clientX - currentLogoOffset;
    logoEl.style.transition = "none";
  }

  function onDrag(clientX) {
    if (!isDragging) return;
    let newOffset = clientX - dragStartX;
    const maxRange = getMaxDragRange();
    
    currentLogoOffset = Math.max(-maxRange, Math.min(maxRange, newOffset));
    applyLogoTransform();

    const normalizedOpacity = (currentLogoOffset + maxRange) / (maxRange * 2);
    document.documentElement.style.setProperty("--night-opacity", Math.max(0, Math.min(1, normalizedOpacity)).toFixed(3));
  }

  function endDrag() {
    if (!isDragging) return;
    isDragging = false;
    logoEl.style.transition = "transform 0.1s ease-out";
  }

  logoEl.addEventListener("mousedown", (e) => {
    startDrag(e.clientX);
    e.preventDefault();
  });
  window.addEventListener("mousemove", (e) => onDrag(e.clientX));
  window.addEventListener("mouseup", endDrag);

  logoEl.addEventListener("touchstart", (e) => {
    if (e.touches.length === 1) {
      startDrag(e.touches[0].clientX);
    }
  });
  window.addEventListener("touchmove", (e) => {
    if (e.touches.length === 1) {
      onDrag(e.touches[0].clientX);
    }
  });
  window.addEventListener("touchend", endDrag);
}

updateDayNightCycle();
setInterval(updateDayNightCycle, 30000);

const logo = document.querySelector(".logo");
function scaleLogo() {
  if (logo && logo.naturalWidth) {
    logo.style.width = logo.naturalWidth * SCALE + "px";
  }
}
if (logo && logo.complete && logo.naturalWidth) {
  scaleLogo();
  setupLogoSlider();
} else if (logo) {
  logo.addEventListener("load", () => {
    scaleLogo();
    setupLogoSlider();
  });
}
