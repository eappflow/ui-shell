export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface NavigationItem {
  label: string;
  to: string;
  icon?: string;
  roles?: string[];
}

export interface NavigationState {
  items: NavigationItem[];
}

export interface LayoutState {
  sidebarCollapsed: boolean;
  theme: "light" | "dark";
}