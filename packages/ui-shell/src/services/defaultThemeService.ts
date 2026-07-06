import type { ThemeService } from "./interfaces";
import type { ThemeSettings, ThemeColorName } from "../types";
import { THEME_COLORS } from "../types";

const STORAGE_KEY_DARK_MODE = "theme_dark_mode";
const STORAGE_KEY_PRIMARY_COLOR = "theme_primary_color";

/**
 * Default theme service — persists to localStorage and applies
 * CSS classes / variables to the DOM. Host applications can
 * override this to use remote or user-preference-based theme storage.
 */
export function createDefaultThemeService(): ThemeService {
  return {
    getSettings(): ThemeSettings {
      const storedDarkMode = localStorage.getItem(STORAGE_KEY_DARK_MODE);
      const storedPrimaryColor = localStorage.getItem(
        STORAGE_KEY_PRIMARY_COLOR,
      );

      return {
        darkMode: storedDarkMode ? JSON.parse(storedDarkMode) : false,
        primaryColor:
          storedPrimaryColor && storedPrimaryColor in THEME_COLORS
            ? (storedPrimaryColor as ThemeColorName)
            : "blue",
      };
    },

    saveSettings(settings: ThemeSettings): void {
      localStorage.setItem(
        STORAGE_KEY_DARK_MODE,
        JSON.stringify(settings.darkMode),
      );
      localStorage.setItem(STORAGE_KEY_PRIMARY_COLOR, settings.primaryColor);
    },

    applyTheme(settings: ThemeSettings): void {
      const root = document.documentElement;

      if (settings.darkMode) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }

      root.style.setProperty(
        "--primary-color",
        THEME_COLORS[settings.primaryColor],
      );
    },
  };
}
