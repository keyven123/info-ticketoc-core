import { createContext, useContext, useMemo, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import { appendAttributionToUrl, isAttributedOutboundHref } from "../attribution";
import type { LinkValue, MediaValue } from "../types";
import { cn, resolveUrl } from "./utils";
import { sanitizeHtml } from "./sanitize";

export interface RenderOptions {
  /** Root-relative media and links resolve against this URL; null keeps them on the current origin. */
  baseUrl: string | null;
  /** Client-side navigation for same-origin links (full page loads when omitted). */
  navigate?: (path: string) => void;
  /** Fired when the visitor clicks an outbound Ticketoc link that carries attribution. */
  onAttributedOutboundClick?: (ctaKey: string, href: string) => void;
}

const RenderContext = createContext<RenderOptions>({ baseUrl: null });
export const RenderProvider = RenderContext.Provider;
export const useRender = () => useContext(RenderContext);

/* ---------- value helpers (content is untrusted JSON; never assume shapes) ---------- */

export const str = (value: unknown): string => (typeof value === "string" ? value : typeof value === "number" ? String(value) : "");

const TEXT_FONT_FAMILY: Record<string, string> = {
  sans: "ui-sans-serif, system-ui, sans-serif",
  serif: "Georgia, serif",
  mono: "ui-monospace, SFMono-Regular, Menlo, monospace",
  display: "Palatino, serif",
};

/** Inline style for a text field, read from sibling keys such as `heading__font`. */
export function textStyle(source: unknown, key: string): CSSProperties | undefined {
  if (!source || typeof source !== "object" || Array.isArray(source)) return undefined;
  const record = source as Record<string, unknown>;
  const fontValue = record[`${key}__font`];
  const styleValue = record[`${key}__style`];
  const colorValue = record[`${key}__color`];
  const font = typeof fontValue === "string" ? fontValue : "";
  const style = typeof styleValue === "string" ? styleValue : "";
  const color = typeof colorValue === "string" ? colorValue : "";
  const css: CSSProperties = {};
  if (TEXT_FONT_FAMILY[font]) css.fontFamily = TEXT_FONT_FAMILY[font];
  if (style === "regular") {
    css.fontStyle = "normal";
    css.fontWeight = 400;
  } else if (style === "italic") css.fontStyle = "italic";
  else if (style === "bold") css.fontWeight = 700;
  else if (style === "bold-italic") {
    css.fontStyle = "italic";
    css.fontWeight = 700;
  }
  if (/^#[0-9a-f]{6}$/i.test(color)) css.color = color.toLowerCase();
  const sizeValue = record[`${key}__size`];
  const size = typeof sizeValue === "number" ? sizeValue : typeof sizeValue === "string" && sizeValue.trim() !== "" ? Number(sizeValue) : Number.NaN;
  if ([12, 14, 16, 18, 20, 24, 32, 40, 48, 64, 80, 96].includes(size)) css.fontSize = `${size}px`;
  return Object.keys(css).length ? css : undefined;
}

function displayPixels(value: unknown): number | undefined {
  const n = typeof value === "number" ? value : Number.NaN;
  if (!Number.isFinite(n)) return undefined;
  const px = Math.round(n);
  if (px < 1 || px > 4000) return undefined;
  return px;
}

/** Pixel size for an image on the page. Empty means the layout decides. */
export function imageDisplayStyle(width: unknown, height: unknown): CSSProperties | undefined {
  const w = displayPixels(width);
  const h = displayPixels(height);
  if (!w && !h) return undefined;
  return { width: w ? `${w}px` : undefined, height: h ? `${h}px` : undefined, maxWidth: "100%", objectFit: "contain" };
}

export const list = <T = Record<string, unknown>,>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);
export const obj = (value: unknown): Record<string, unknown> => (value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {});

export function media(value: unknown): MediaValue | null {
  if (typeof value === "string" && value) return { url: value };
  const m = obj(value) as MediaValue;
  return m.url ? m : null;
}

export function link(value: unknown): LinkValue | null {
  const l = obj(value) as LinkValue;
  return l.label && l.url ? l : null;
}

export function useMediaUrl(value: unknown): string | undefined {
  const { baseUrl } = useRender();
  return resolveUrl(media(value)?.url, baseUrl);
}

/* ---------- style tokens ---------- */

export type Accent = "yellow" | "orange";

export const accentGradient = (accent: Accent) =>
  accent === "orange" ? "from-orange-400 to-yellow-500" : "from-yellow-400 to-orange-500";

export function sectionStyle(style: Record<string, unknown>) {
  const background = str(style.background) || "black";
  const accent: Accent = str(style.accent) === "orange" ? "orange" : "yellow";
  const padding = str(style.padding) || "lg";
  const width = str(style.width) || "normal";
  const align = str(style.align) === "left" ? "left" : "center";
  const anchor = str(style.anchor_id) || undefined;
  const light = background === "white" || background === "surface";
  return { background, accent, padding, width, align, anchor, light } as const;
}

export type SectionStyle = ReturnType<typeof sectionStyle>;

const PADDING: Record<string, string> = { none: "py-0", sm: "py-10", md: "py-14", lg: "py-20", xl: "py-28" };
const BACKGROUND: Record<string, string> = {
  black: "bg-black text-white",
  zinc: "bg-zinc-950 text-white",
  glow: "bg-black text-white",
  white: "bg-white text-gray-900",
  surface: "bg-gray-100 text-gray-900",
};

export function widthClass(width: string) {
  return { narrow: "max-w-3xl mx-auto", normal: "max-w-6xl mx-auto", wide: "", full: "" }[width] ?? "max-w-6xl mx-auto";
}

export function SectionShell({ s, children, className }: { s: SectionStyle; children: ReactNode; className?: string }) {
  return (
    <section id={s.anchor} className={cn("relative overflow-hidden transition-colors duration-300", BACKGROUND[s.background] ?? BACKGROUND.black, PADDING[s.padding] ?? PADDING.lg, className)}>
      {s.background === "zinc" && (
        <div
          className={cn(
            "absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent to-transparent",
            s.accent === "orange" ? "via-yellow-500/30" : "via-yellow-400/30",
          )}
        />
      )}
      {s.background === "glow" && (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-orange-500/5" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-64 bg-yellow-500/5 rounded-full blur-3xl animate-glow" />
        </>
      )}
      <div className={cn("relative z-10", s.width === "full" ? "px-6" : "container mx-auto px-6")}>{children}</div>
    </section>
  );
}

export function SectionHeader({ props, s, highlightBreak = false }: { props: Record<string, unknown>; s: SectionStyle; highlightBreak?: boolean }) {
  const badge = str(props.badge_text);
  const heading = str(props.heading);
  const highlight = str(props.heading_highlight);
  const description = str(props.description);
  if (!badge && !heading && !highlight && !description) return null;

  const filled = str(props.badge_style) === "filled";
  const center = s.align === "center";

  return (
    <div className={cn("mb-16", center ? "text-center" : "text-left", s.width === "narrow" && "max-w-3xl mx-auto")}>
      {badge && (
        <div
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 animate-fade-in",
            filled ? `bg-gradient-to-r ${accentGradient(s.accent)}` : s.accent === "orange" ? "border-2 border-orange-500/80" : "border-2 border-yellow-500",
          )}
        >
          <span
            className={cn(
              "text-sm font-semibold uppercase tracking-wider",
              filled ? "text-white" : s.accent === "orange" ? "text-orange-400" : s.light ? "text-gray-900" : "text-white",
            )}
          >
            {badge}
          </span>
        </div>
      )}
      {(heading || highlight) && (
        <h2 className="text-4xl md:text-6xl font-black mb-4 animate-slide-up">
          {heading && <span className={s.light ? "text-gray-900" : "text-white"} style={textStyle(props, "heading")}>{heading}</span>}
          {heading && highlight && (highlightBreak ? <br /> : " ")}
          {highlight && <span className={cn("text-transparent bg-clip-text bg-gradient-to-r", accentGradient(s.accent))} style={textStyle(props, "heading_highlight")}>{highlight}</span>}
        </h2>
      )}
      {description && (
        <p className={cn("text-lg max-w-2xl animate-fade-in-delay", center && "mx-auto", s.light ? "text-gray-600" : s.background === "zinc" ? "text-zinc-400" : "text-zinc-300")} style={textStyle(props, "description")}>
          {description}
        </p>
      )}
    </div>
  );
}

/** Hash links scroll smoothly; same-origin links navigate inside the app; everything else is a normal link. */
export function SiteAnchor({
  href,
  newTab,
  className,
  children,
  style,
  ariaLabel,
}: {
  href: string | null | undefined;
  newTab?: boolean;
  className?: string;
  children: ReactNode;
  style?: CSSProperties;
  ariaLabel?: string;
}) {
  const { baseUrl, navigate, onAttributedOutboundClick } = useRender();
  const resolved = resolveUrl(href ?? undefined, baseUrl) ?? "#";
  const attributed = resolved.startsWith("#") ? resolved : appendAttributionToUrl(resolved);
  const isHash = attributed.startsWith("#");

  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (isHash) {
      e.preventDefault();
      if (attributed.length > 1) {
        document.getElementById(attributed.slice(1))?.scrollIntoView({ behavior: "smooth" });
        window.history.replaceState(window.history.state, "", attributed);
      }
      return;
    }
    if (isAttributedOutboundHref(attributed) && e.button === 0 && !e.defaultPrevented) {
      const path = (() => {
        try {
          return new URL(attributed, window.location.href).pathname;
        } catch {
          return "outbound";
        }
      })();
      const ctaKey = path.includes("organizer/registration")
        ? "become_merchant_partner"
        : path.includes("register")
          ? "customer_signup"
          : "outbound_ticketoc";
      onAttributedOutboundClick?.(ctaKey, attributed);
    }
    if (!navigate || newTab || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const url = new URL(attributed, window.location.href);
    if (url.origin !== window.location.origin || !/^https?:$/.test(url.protocol)) return;
    e.preventDefault();
    navigate(url.pathname + url.search + url.hash);
  };

  return (
    <a
      href={attributed}
      onClick={onClick}
      className={className}
      style={style}
      aria-label={ariaLabel}
      {...(newTab && !isHash ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  );
}

export function PrimaryButton({ value, accent, size = "lg" }: { value: unknown; accent: Accent; size?: "lg" | "md" }) {
  const l = link(value);
  if (!l) return null;
  return (
    <SiteAnchor
      href={l.url}
      newTab={l.new_tab}
      className={cn(
        "group relative font-bold overflow-hidden transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-yellow-500/30 transform btn-glow inline-block text-center text-white bg-gradient-to-r",
        accentGradient(accent),
        size === "lg" ? "px-8 py-4 rounded-xl hover:scale-[1.02]" : "px-8 py-4 rounded-lg hover:scale-105",
      )}
    >
      <span className="relative z-10">{l.label}</span>
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </SiteAnchor>
  );
}

export function SecondaryButton({ value, light, variant = "accent" }: { value: unknown; light?: boolean; variant?: "accent" | "neutral" }) {
  const l = link(value);
  if (!l) return null;
  return (
    <SiteAnchor
      href={l.url}
      newTab={l.new_tab}
      className={cn(
        "group relative px-8 py-4 border-2 font-bold overflow-hidden transition-all duration-300 transform inline-block text-center",
        variant === "accent"
          ? cn("rounded-xl hover:scale-[1.02]", light ? "border-yellow-500 text-yellow-600 hover:bg-yellow-500/10" : "border-yellow-400 text-yellow-400 hover:bg-yellow-400/10")
          : cn("border-yellow-400 dark:border-yellow-500 rounded-lg hover:bg-yellow-400/10 dark:hover:bg-yellow-500/10 hover:scale-105", light ? "text-gray-900" : "text-white"),
      )}
    >
      <span className="relative z-10">{l.label}</span>
    </SiteAnchor>
  );
}

export function SiteImage({ value, className, alt }: { value: unknown; className?: string; alt?: string }) {
  const m = media(value);
  const src = useMediaUrl(value);
  if (!src) return null;
  return <img src={src} alt={alt ?? m?.alt ?? ""} width={m?.width} height={m?.height} className={className} style={imageDisplayStyle(m?.display_width, m?.display_height)} loading="lazy" />;
}

export function RichText({ html, className }: { html: unknown; className?: string }) {
  const clean = useMemo(() => sanitizeHtml(str(html)), [html]);
  if (!clean) return null;
  return <div className={cn("prose-site", className)} dangerouslySetInnerHTML={{ __html: clean }} />;
}

/** Editor placeholder for media that has not been chosen yet. Visitors see nothing. */
export function MissingMedia(_props: { label: string; className?: string }) {
  return null;
}
