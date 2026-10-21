/**
 * Client-side allowlist sanitizer for rich text. Content is already sanitized by the API when it is
 * saved; this is defense in depth for pages that render unsaved or cached HTML.
 */
const FONT_FAMILIES = [
  "ui-sans-serif, system-ui, sans-serif",
  "Georgia, serif",
  "ui-monospace, SFMono-Regular, Menlo, monospace",
  "Palatino, serif",
];

function safeInlineStyle(style: string): string | null {
  const kept: string[] = [];
  for (const part of style.split(";")) {
    const piece = part.trim();
    if (!piece) continue;
    const match = piece.match(/^([a-z-]+)\s*:\s*(.+)$/i);
    if (!match) return null;
    const prop = match[1].toLowerCase();
    const value = match[2].trim().replace(/["']/g, "").replace(/\s+/g, " ");
    if (prop === "color" && /^#[0-9a-f]{6}$/i.test(value)) kept.push(`color: ${value.toLowerCase()}`);
    else if (prop === "font-family" && FONT_FAMILIES.includes(value)) kept.push(`font-family: ${value}`);
    else if (prop === "font-size" && /^\d+px$/.test(value) && [12, 14, 16, 18, 20, 24, 32, 40, 48, 64, 80, 96].includes(Number(value.slice(0, -2)))) kept.push(`font-size: ${value}`);
    else return null;
  }
  return kept.length ? kept.join("; ") : null;
}

const ALLOWED_TAGS = new Set(["P", "BR", "STRONG", "B", "EM", "I", "U", "S", "A", "UL", "OL", "LI", "H2", "H3", "H4", "BLOCKQUOTE", "CODE", "HR", "SPAN"]);
const SAFE_URL = /^(https?:|mailto:|tel:|\/(?!\/)|#)/i;

export function sanitizeHtml(html: string): string {
  if (typeof window === "undefined" || !html) return "";
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, "text/html");

  const clean = (node: Element) => {
    for (const child of Array.from(node.children)) {
      const tag = child.tagName.toUpperCase();
      if (!ALLOWED_TAGS.has(tag) || child.namespaceURI !== "http://www.w3.org/1999/xhtml") {
        if (["SCRIPT", "STYLE", "IFRAME", "OBJECT", "EMBED", "TEMPLATE", "SVG", "MATH", "NOSCRIPT"].includes(tag)) {
          child.remove();
        } else {
          clean(child);
          child.replaceWith(...Array.from(child.childNodes));
        }
        continue;
      }
      const spanStyle = tag === "SPAN" ? safeInlineStyle(child.getAttribute("style") ?? "") : null;
      for (const attr of Array.from(child.attributes)) {
        const keep = tag === "A" && (attr.name === "href" || attr.name === "target" || attr.name === "rel");
        if (!keep) child.removeAttribute(attr.name);
      }
      if (tag === "SPAN") {
        if (!spanStyle) {
          clean(child);
          child.replaceWith(...Array.from(child.childNodes));
          continue;
        }
        child.setAttribute("style", spanStyle);
      }
      if (tag === "A") {
        const href = child.getAttribute("href") ?? "";
        if (!SAFE_URL.test(href.trim())) child.removeAttribute("href");
        if (child.getAttribute("target") === "_blank") child.setAttribute("rel", "noopener noreferrer");
        else child.removeAttribute("target");
      }
      clean(child);
    }
  };

  clean(doc.body);
  return doc.body.innerHTML;
}
