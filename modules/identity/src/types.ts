import type { InjectionKey } from "vue";

/**
 * Configuration options for the Identity plugin.
 */
export interface IdentityConfig {
  /** Base URL for identity API endpoints */
  apiBaseUrl?: string;

  /** Application display name */
  appName?: string;
}

/** Injection key for identity plugin config */
export const IDENTITY_CONFIG_KEY: InjectionKey<IdentityConfig> =
  Symbol("identityConfig");