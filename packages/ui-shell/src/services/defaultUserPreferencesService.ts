import type { UserPreferencesService } from "./interfaces";
import { STORAGE_KEYS } from "../utils/constants";

/**
 * Default user preferences service — keeps them in this browser's
 * localStorage. Host applications provide their own to keep them per user
 * on their backend.
 */
export function createDefaultUserPreferencesService(): UserPreferencesService {
  return {
    get: () =>
      JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES) ?? "{}"),
    save: (preferences) =>
      localStorage.setItem(
        STORAGE_KEYS.USER_PREFERENCES,
        JSON.stringify(preferences),
      ),
  };
}
