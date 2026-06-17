import type { InjectionKey } from "vue";

/**
 * Configuration options for the Identity module.
 */
export interface IdentityConfig {
  /** Base URL for identity API endpoints */
  apiBaseUrl?: string;

  /** Application display name */
  appName?: string;
}

/** Injection key for identity module config */
export const IDENTITY_CONFIG_KEY: InjectionKey<IdentityConfig> =
  Symbol("identityConfig");