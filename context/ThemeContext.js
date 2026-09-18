/* ==========================================================================
   CONTEXTO DE TEMA - MODO CLARO / OSCURO (clase body.dark-mode)
   ========================================================================== */

class ThemeContext {
  constructor() {
    this.currentTheme = localStorage.getItem("salchicha_theme") || "light";
    this.init();
  }

  init() {
    this.applyTheme(this.currentTheme);
    this.createThemeToggleButton();
  }

  applyTheme(theme) {
    this.currentTheme = theme;
    localStorage.setItem("salchicha_theme", theme);
    document.body.classList.toggle("dark-mode", theme === "dark");
    this.updateToggleButtonIcon();
  }

  toggleTheme() {
    const newTheme = this.currentTheme === "light" ? "dark" : "light";
    this.applyTheme(newTheme);
  }

  createThemeToggleButton() {
    const btn = document.getElementById("theme-toggle-btn");
    if (!btn) return;

    btn.addEventListener("click", () => {
      this.toggleTheme();
      if (typeof sound !== "undefined") sound.playClick();
    });

    this.updateToggleButtonIcon();
  }

  updateToggleButtonIcon() {
    const icon =
      this.currentTheme === "light"
        ? '<i class="fa-solid fa-moon"></i>'
        : '<i class="fa-solid fa-sun"></i>';
    const title =
      this.currentTheme === "light"
        ? "Activar modo oscuro"
        : "Activar modo claro";

    ["theme-toggle-btn", "game-theme-btn"].forEach((id) => {
      const btn = document.getElementById(id);
      if (!btn) return;
      btn.innerHTML = icon;
      btn.title = title;
      btn.setAttribute("aria-label", title);
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.themeContext = new ThemeContext();
});
