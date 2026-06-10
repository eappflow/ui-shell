export const SHELL_VERSION = "0.1.0";

export const STORAGE_KEYS = {
  AUTH_TOKEN: "eappflow_auth_token",
  THEME: "eappflow_theme",
  SIDEBAR_COLLAPSED: "eappflow_sidebar_collapsed",
} as const;

export const DEFAULT_NAVIGATION_ITEMS = [
  { label: "Dashboard", to: "/", icon: "📊" },
  { label: "Settings", to: "/settings", icon: "⚙️" },
];