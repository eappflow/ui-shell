import { updatePrimaryPalette } from "@primeuix/themes";
import type { ThemeService } from "./interfaces";
import type { ThemeSettings, ThemeColorName, EafThemeConfig } from "../types";
import { THEME_COLOR_SHADES } from "../types";
import { STORAGE_KEYS } from "../utils/constants";

/**
 * Builds `{ 50: "{blue.50}", … }` — token references the host's preset
 * resolves itself, so every derived token stays consistent.
 */
function primaryPalette(color: ThemeColorName): Record<string, string> {
  return Object.fromEntries(
    THEME_COLOR_SHADES.map((shade) => [shade, `{${color}.${shade}}`]),
  );
}

/**
 * Default theme service — persists to localStorage and applies
 * the theme to the DOM / PrimeVue. Host applications can override
 * this to use remote or user-preference-based theme storage.
 */
export function createDefaultThemeService(
  config?: EafThemeConfig,
): ThemeService {
  const colors = config?.colors ?? [];
  const defaultColor = config?.defaultColor ?? colors[0] ?? "";

  function isKnownColor(value: string | null): value is ThemeColorName {
    return value !== null && colors.includes(value);
  }

  return {
    getSettings(): ThemeSettings {
      const storedDarkMode = localStorage.getItem(STORAGE_KEYS.THEME_DARK_MODE);
      const storedPrimaryColor = localStorage.getItem(
        STORAGE_KEYS.THEME_PRIMARY_COLOR,
      );

      return {
        darkMode: storedDarkMode ? JSON.parse(storedDarkMode) : false,
        primaryColor: isKnownColor(storedPrimaryColor)
          ? storedPrimaryColor
          : defaultColor,
      };
    },

    saveSettings(settings: ThemeSettings): void {
      localStorage.setItem(
        STORAGE_KEYS.THEME_DARK_MODE,
        JSON.stringify(settings.darkMode),
      );
      localStorage.setItem(
        STORAGE_KEYS.THEME_PRIMARY_COLOR,
        settings.primaryColor,
      );
    },

    applyTheme(settings: ThemeSettings): void {
      const root = document.documentElement;

      if (settings.darkMode) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }

      // Nothing configured — the preset's own primary stays untouched.
      if (settings.primaryColor) {
        updatePrimaryPalette(primaryPalette(settings.primaryColor));
      }
    },
  };
}
