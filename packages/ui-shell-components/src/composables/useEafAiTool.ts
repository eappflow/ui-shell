import { getCurrentScope, onScopeDispose } from "vue";
import type { z } from "zod";
import type { EafAiTool } from "../types";
import { eafFormTools } from "../ai-tools/formTools";

// A key per call, so a tool offered by two components stays until both are gone
const offeredTools = new Map<symbol, EafAiTool>();

/**
 * Offers `tool` to the AI chat while the calling component is mounted - for
 * what that screen shows, as a form's fields are offered. Tools that don't
 * depend on a screen belong in the shell's `aiTools` instead.
 */
export function useEafAiTool<P extends z.ZodObject>(tool: EafAiTool<P>): void {
  if (!getCurrentScope()) {
    throw new Error(
      "useEafAiTool works in a component's setup - for a tool of the whole app use `aiTools`.",
    );
  }
  const key = Symbol(tool.name);
  offeredTools.set(key, tool);
  onScopeDispose(() => offeredTools.delete(key));
}

/** The tools of what is on screen: its forms', then those its components offer - each once */
export function eafScreenTools(): EafAiTool[] {
  return [...eafFormTools(), ...new Set(offeredTools.values())];
}
