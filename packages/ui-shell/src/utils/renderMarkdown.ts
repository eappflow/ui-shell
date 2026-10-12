import DOMPurify from "dompurify";
import { marked } from "marked";

// What marked makes of markdown, less images
const MARKDOWN_TAGS =
  "a b blockquote br code del em h1 h2 h3 h4 h5 h6 hr i li ol p pre strong table tbody td th thead tr ul".split(
    " ",
  );

/**
 * The model's markdown as HTML, kept to what markdown itself makes - so its
 * raw HTML can't bring scripts, forms, styles, ids or media into the app
 */
export function renderMarkdown(markdown: string): string {
  return DOMPurify.sanitize(
    marked.parse(markdown, { async: false, breaks: true }),
    {
      ALLOWED_TAGS: MARKDOWN_TAGS,
      ALLOWED_ATTR: ["href", "title", "start", "align"],
    },
  );
}
