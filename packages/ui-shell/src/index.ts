export { default as AppLayout } from "./components/AppLayout.vue";
export { default as AppSidebar } from "./components/AppSidebar.vue";
export { default as AppHeader } from "./components/AppHeader.vue";
export { default as AppFooter } from "./components/AppFooter.vue";

export { useAuth } from "./composables/useAuth";
export { useNavigation } from "./composables/useNavigation";
export { useLayout } from "./composables/useLayout";

export { createNavigationGuards } from "./router/navigationGuards";

export { useAuthStore } from "./stores/useAuthStore";
export { useNavigationStore } from "./stores/useNavigationStore";
export { useLayoutStore } from "./stores/useLayoutStore";

export type {
  User,
  AuthState,
  NavigationItem,
  NavigationState,
  LayoutState,
} from "./types";