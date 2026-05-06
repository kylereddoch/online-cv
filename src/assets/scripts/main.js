document.documentElement.classList.remove("no-js");

const root = document.documentElement;
const storageKey = "online-cv-theme";
const themeButton = document.querySelector(".js-theme-toggle");

function applyTheme(theme) {
  root.dataset.theme = theme;

  if (themeButton) {
    const isLight = theme === "light";
    themeButton.setAttribute("aria-pressed", String(isLight));
    themeButton.setAttribute("aria-label", isLight ? "Switch to dark mode" : "Switch to light mode");
  }
}

function loadTheme() {
  const savedTheme = window.localStorage.getItem(storageKey);
  applyTheme(savedTheme === "light" ? "light" : "dark");
}

function toggleTheme() {
  const nextTheme = root.dataset.theme === "light" ? "dark" : "light";
  window.localStorage.setItem(storageKey, nextTheme);
  applyTheme(nextTheme);
}

function onScroll() {
  if (window.scrollY > 160) {
    root.classList.add("js-scrolled");
  } else {
    root.classList.remove("js-scrolled");
  }
}

loadTheme();
onScroll();

if (themeButton) {
  themeButton.addEventListener("click", toggleTheme);
}

window.addEventListener("scroll", onScroll, { passive: true });
