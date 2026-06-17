import mitt from "mitt";

type ShellEvents = {
  "auth:login": { user: unknown };
  "auth:logout": void;
  "navigation:changed": void;
  "layout:theme-changed": "light" | "dark";
  "layout:sidebar-toggled": boolean;
};

export const eventBus = mitt<ShellEvents>();
