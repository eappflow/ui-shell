import { useUserPreferencesStore } from "../stores/useUserPreferencesStore";

/**
 * The pages the user pinned to the top of the menu. A module unpins a page
 * that is gone for good, e.g. a deleted record's.
 */
export function usePinnedPages() {
  const store = useUserPreferencesStore();

  return {
    /** Paths of the pinned pages */
    get pinnedPages(): readonly string[] {
      return store.pinnedPages;
    },
    togglePin: store.togglePin,
    unpin: store.unpin,
  };
}
