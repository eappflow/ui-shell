import type { z } from "zod";
import type { EafAiTool } from "../types";

/** `tool` as it is, with `run`'s arguments typed by `parameters` */
export const defineEafAiTool = <P extends z.ZodObject>(
  tool: EafAiTool<P>,
): EafAiTool<P> => tool;
