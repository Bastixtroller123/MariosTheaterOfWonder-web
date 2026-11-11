// Configuracion y constantes globales

const API_URL = "https://script.google.com/macros/s/AKfycbx-D-8UlzDGvwwSJLaX9KbsU_0axwFbGYlrDm7E6nyHTB5ZtKzVho0XXAXOvSsNqRcEug/exec";
const SCALE = 3;
const BG_SCROLL_FACTOR = 0.4;
const BG_AUTO_SPEED = 0.3; 
const PAGES = ["home", "downloads", "credits", "devlogs"];

const AUTHOR_COLORS = {
  "xagst3er": "#0000FF",
  "bastixtroller123": "#FFC300",
  "sunnidaize_official": "#9B111E",
};
const DEFAULT_AUTHOR_COLOR = "#ffcc00";

// Secciones de la pagina Devlogs (el id "devlogs" es la lista principal)
const DEVLOG_SECTIONS = [
  { id: "devlogs", label: "Devlogs" },
  { id: "jokes", label: "Jokes" },
  { id: "videos", label: "Videos" }
];
