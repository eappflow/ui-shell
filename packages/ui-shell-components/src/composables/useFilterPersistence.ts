import { ref, watch, type Ref } from 'vue'

export interface TablePaginationState {
  page: number
  rows: number
}

/**
 * Composable for persisting filter values to localStorage
 * Automatically saves filter changes and restores them on next visit
 *
 * @param storageKey - Unique key for localStorage (e.g., 'businessUnits.filters')
 * @param defaultFilters - Default filter values
 * @returns Reactive filters ref that auto-saves to localStorage
 *
 * @example
 * ```ts
 * const filters = useFilterPersistence('employees.filters', {
 *   search: '',
 *   status: EmployeeStatus.All,
 *   roleId: ''
 * })
 * ```
 */
export function useFilterPersistence<T extends Record<string, unknown> = Record<string, unknown>>(
  storageKey: string,
  defaultFilters: T
): Ref<T> {
  // Try to load saved filters from localStorage
  const loadFilters = (): T => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const parsed = JSON.parse(saved)
        // Merge with defaults to ensure all keys exist
        return { ...defaultFilters, ...parsed }
      }
    } catch (error) {
      console.warn(`Failed to load filters from localStorage (${storageKey}):`, error)
    }
    return { ...defaultFilters }
  }

  // Create reactive filters ref with loaded or default values
  const filters = ref<T>(loadFilters()) as Ref<T>

  // Save filters to localStorage whenever they change
  watch(
    filters,
    (newFilters) => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(newFilters))
      } catch (error) {
        console.warn(`Failed to save filters to localStorage (${storageKey}):`, error)
      }
    },
    { deep: true }
  )

  return filters
}

/**
 * Composable for persisting DataTable pagination state to localStorage
 * Automatically saves page number and page size changes
 *
 * @param storageKey - Unique key for localStorage (e.g., 'businessUnits.pagination')
 * @param defaultState - Default pagination state (page and rows)
 * @returns Reactive pagination state ref that auto-saves to localStorage
 *
 * @example
 * ```ts
 * const pagination = usePaginationPersistence('employees.pagination', {
 *   page: 0,
 *   rows: 10
 * })
 * ```
 */
export function usePaginationPersistence(
  storageKey: string,
  defaultState: TablePaginationState = { page: 0, rows: 10 }
): Ref<TablePaginationState> {
  // Try to load saved pagination from localStorage
  const loadPagination = (): TablePaginationState => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const parsed = JSON.parse(saved)
        return { ...defaultState, ...parsed }
      }
    } catch (error) {
      console.warn(`Failed to load pagination from localStorage (${storageKey}):`, error)
    }
    return { ...defaultState }
  }

  // Create reactive pagination ref with loaded or default values
  const pagination = ref<TablePaginationState>(loadPagination())

  // Save pagination to localStorage whenever it changes
  watch(
    pagination,
    (newPagination) => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(newPagination))
      } catch (error) {
        console.warn(`Failed to save pagination to localStorage (${storageKey}):`, error)
      }
    },
    { deep: true }
  )

  return pagination
}

/**
 * Clear persisted filters from localStorage
 * Useful for reset functionality or cleanup
 *
 * @param storageKey - The key used when creating the filter persistence
 *
 * @example
 * ```ts
 * function resetFilters() {
 *   clearPersistedFilters('employees.filters')
 *   filters.value = { ...defaultFilters }
 * }
 * ```
 */
export function clearPersistedFilters(storageKey: string): void {
  try {
    localStorage.removeItem(storageKey)
  } catch (error) {
    console.warn(`Failed to clear persisted filters (${storageKey}):`, error)
  }
}
