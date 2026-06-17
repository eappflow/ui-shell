import type { InjectionKey } from "vue";

/**
 * Configuration options for the Diagnostics module.
 */
export interface DiagnosticsConfig {
  /** Whether to register the module in the menu */
  registerInMenu?: boolean;  
}

/** Injection key for diagnostics module config */
export const DIAGNOSTICS_CONFIG_KEY: InjectionKey<DiagnosticsConfig> =
  Symbol("diagnosticsConfig");