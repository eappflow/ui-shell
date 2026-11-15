import { onScopeDispose, toValue, type MaybeRefOrGetter } from "vue";
import { useLayoutStore } from "../stores/useLayoutStore";

export function usePageTitle(title: MaybeRefOrGetter<string>): void {
  const layout = useLayoutStore();
  const entry = () => toValue(title);
  layout.pageTitles.push(entry);
  onScopeDispose(() => {
    layout.pageTitles = layout.pageTitles.filter((e) => e !== entry);
  });
}
