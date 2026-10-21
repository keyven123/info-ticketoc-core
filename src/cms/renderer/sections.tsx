import { useRef, useState, type ComponentType, type ReactNode } from "react";
import { cn } from "./utils";
import { LineIcon, SiteIcon, isLineIcon } from "./icons";
import {
  MissingMedia,
  PrimaryButton,
  RichText,
  SecondaryButton,
  SectionHeader,
  SectionShell,
  SiteAnchor,
  SiteImage,
  accentGradient,
  link,
  list,
  media,
  obj,
  str,
  textStyle,
  useMediaUrl,
  widthClass,
  type SectionStyle,
} from "./primitives";

export interface SectionProps {
  props: Record<string, unknown>;
  s: SectionStyle;
}

const LG_COLS: Record<string, string> = { "1": "lg:grid-cols-1", "2": "lg:grid-cols-2", "3": "lg:grid-cols-3", "4": "lg:grid-cols-4" };
const lgCols = (value: unknown, fallback = "3") => LG_COLS[str(value)] ?? LG_COLS[fallback];

function cardClass(s: SectionStyle) {
  return s.light
    ? "bg-gray-50 border border-gray-200 hover:border-yellow-500 text-gray-900"
    : "bg-zinc-900 border border-zinc-800 hover:border-yellow-500";
}

const titleClass = (s: SectionStyle) => (s.light ? "text-gray-900" : "text-white");
const bodyClass = (s: SectionStyle) => (s.light ? "text-gray-600" : "text-zinc-300");

/* ------------------------------------------------------------------ hero */

function HeroMedia({ props }: { props: Record<string, unknown> }) {
  const type = str(props.media_type) || "image";
  const videoUrl = useMediaUrl(props.video);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    const muted = !video.muted;
    video.muted = muted;
    if (!muted) video.volume = 1;
    setIsMuted(muted);
  };
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void video.play();
    else video.pause();
  };

  const corners = [
    "-top-0.5 -left-0.5 border-l-[3px] border-t-[3px] rounded-tl-lg",
    "-top-0.5 -right-0.5 border-r-[3px] border-t-[3px] rounded-tr-lg",
    "-bottom-0.5 -left-0.5 border-l-[3px] border-b-[3px] rounded-bl-lg",
    "-bottom-0.5 -right-0.5 border-r-[3px] border-b-[3px] rounded-br-lg",
  ];

  const frame = (content: ReactNode) => (
    <div className="relative w-full max-w-2xl p-2 animate-fade-in-delay">
      {corners.map((c, i) => (
        <div
          key={c}
          className={cn("absolute w-24 h-24 border-yellow-400 animate-border-glow [box-shadow:0_0_15px_rgba(251,191,36,0.4)]", c)}
          style={{ animationDelay: `${i * 0.5}s` }}
        />
      ))}
      {content}
    </div>
  );

  if (type === "video") {
    if (!videoUrl) return null;
    return frame(
      <div
        className="relative w-full rounded-xl overflow-hidden shadow-2xl border border-yellow-400/40 video-frame-glow cursor-pointer transition-all duration-300 hover:border-yellow-400/60"
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("button")) return;
          if (isMuted) toggleMute();
          else togglePlay();
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (isMuted ? toggleMute() : togglePlay())}
        aria-label={isMuted ? "Click to unmute video" : undefined}
      >
        <video
          ref={videoRef}
          src={videoUrl}
          autoPlay
          controls
          muted={isMuted}
          loop
          playsInline
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          className="w-full aspect-video bg-black object-cover"
          aria-label={media(props.video)?.alt || undefined}
        >
          Your browser does not support the video tag.
        </video>
        <button
          onClick={(e) => {
            e.stopPropagation();
            togglePlay();
          }}
          className="absolute bottom-4 left-4 p-2 rounded-lg bg-black/60 hover:bg-black/80 text-white transition-colors"
          aria-label={isPlaying ? "Pause video" : "Play video"}
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7L8 5z" />
            </svg>
          )}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleMute();
          }}
          className={cn(
            "absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
            isMuted ? "bg-yellow-400/90 hover:bg-yellow-400 text-black font-semibold" : "bg-black/60 hover:bg-black/80 text-white",
          )}
          aria-label={isMuted ? "Unmute video" : "Mute video"}
          title={isMuted ? "Click for sound" : "Mute"}
        >
          {isMuted ? (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
              <span>Click for sound</span>
            </>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          )}
        </button>
      </div>,
    );
  }

  if (type === "image") {
    if (!media(props.image)) return null;
    return frame(
      <div className="relative w-full rounded-xl overflow-hidden shadow-2xl border border-yellow-400/40 video-frame-glow">
        <SiteImage value={props.image} className="w-full aspect-video object-cover bg-black" />
      </div>,
    );
  }
  return null;
}

function ScrollIndicator({ className }: { className?: string }) {
  return (
    <div className={cn("animate-scroll-bounce", className)}>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Scroll to explore</p>
      <LineIcon name="arrow-down" className="w-6 h-6 text-gray-500 dark:text-gray-400 mx-auto lg:mx-0" />
    </div>
  );
}

const HERO_BACKGROUND: Record<string, string> = {
  black: "bg-[#0a0a0a] dark:bg-black",
  glow: "bg-[#0a0a0a] dark:bg-black",
  zinc: "bg-zinc-950",
  white: "bg-white",
  surface: "bg-gray-100",
};

export function Hero({ props, s }: SectionProps) {
  const hasMedia = (str(props.media_type) || "image") !== "none";
  const logo = media(props.logo);
  const heading = str(props.heading);
  const highlight = str(props.heading_highlight);
  const showScroll = props.show_scroll_indicator !== false;

  return (
    <section id={s.anchor} className={cn("relative min-h-screen flex items-center overflow-hidden transition-colors duration-300", HERO_BACKGROUND[s.background] ?? HERO_BACKGROUND.black)}>
      {!s.light && <div className="absolute inset-0 bg-grid-pattern" />}
      <div className="absolute inset-0 bg-hero-grid opacity-80" />
      {!s.light && <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />}
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-tl from-yellow-400/25 to-orange-500/20 rounded-full blur-[100px] animate-glow-pulse" />
      <div className="absolute top-1/4 left-0 w-80 h-80 bg-orange-500/15 rounded-full blur-[80px] animate-float-slow" />
      <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-yellow-400/10 rounded-full blur-3xl animate-float" />
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-yellow-400/40 rounded-full animate-float"
            style={{ left: `${15 + i * 15}%`, top: `${20 + (i % 3) * 25}%`, animationDelay: `${i * 0.5}s`, animationDuration: `${4 + i}s` }}
          />
        ))}
      </div>

      <div className="container mx-auto px-6 py-12 lg:py-20 relative z-10">
        <div className={cn("grid grid-cols-1 gap-8 lg:gap-12 items-center", hasMedia && "lg:grid-cols-2")}>
          <div className={cn("flex flex-col justify-center text-center", hasMedia ? "lg:text-left" : "items-center")}>
            {str(props.badge_text) && (
              <div className="hidden lg:inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-yellow-400/60 dark:border-yellow-500/70 bg-yellow-400/5 dark:bg-yellow-500/5 backdrop-blur-sm mb-6 animate-fade-in hero-badge-glow">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                <span className={cn("text-sm font-semibold uppercase tracking-widest", s.light ? "text-gray-800" : "text-gray-800 dark:text-white")}>{str(props.badge_text)}</span>
              </div>
            )}
            <div className={cn("hidden lg:block w-12 h-0.5 bg-gradient-to-r from-yellow-400 to-transparent mb-4 animate-fade-in", !hasMedia && "lg:mx-auto")} />

            <h1 className="mb-6 animate-slide-up">
              {logo ? (
                <SiteImage
                  value={props.logo}
                  alt={logo.alt || heading}
                  className={cn("h-20 md:h-28 lg:h-36 w-auto object-contain mx-auto drop-shadow-[0_0_30px_rgba(251,191,36,0.15)]", hasMedia && "lg:mx-0")}
                />
              ) : (
                <span className="block text-5xl md:text-7xl font-black leading-tight">
                  <span className={titleClass(s)} style={textStyle(props, "heading")}>{heading}</span>
                  {highlight && (
                    <>
                      {" "}
                      <span className={cn("text-transparent bg-clip-text bg-gradient-to-r", accentGradient(s.accent))} style={textStyle(props, "heading_highlight")}>{highlight}</span>
                    </>
                  )}
                </span>
              )}
            </h1>

            {str(props.description) && (
              <p className={cn("text-lg md:text-xl mb-8 max-w-xl mx-auto leading-relaxed animate-fade-in-delay", s.light ? "text-gray-600" : "text-gray-500 dark:text-gray-300", hasMedia && "lg:mx-0")} style={textStyle(props, "description")}>
                {str(props.description)}
              </p>
            )}

            {(link(props.primary_button) || link(props.secondary_button)) && (
              <div className={cn("flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-delay-2", hasMedia && "lg:justify-start")}>
                <PrimaryButton value={props.primary_button} accent={s.accent} />
                <SecondaryButton value={props.secondary_button} light={s.light} />
              </div>
            )}

            {str(props.note) && (
              <p className={cn("mt-4 text-sm max-w-xl mx-auto animate-fade-in-delay-2", s.light ? "text-gray-600" : "text-gray-500 dark:text-gray-400", hasMedia && "lg:mx-0")}>{str(props.note)}</p>
            )}

            {showScroll && <ScrollIndicator className="hidden lg:block mt-12 lg:mt-16" />}
          </div>

          {hasMedia && (
            <div className="flex items-center justify-center">
              <HeroMedia props={props} />
            </div>
          )}
        </div>

        {showScroll && (
          <div className="lg:hidden flex flex-col items-center pt-6 pb-4">
            <ScrollIndicator className="text-center" />
          </div>
        )}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ feature grid */

const TILE_ACCENTS: Record<string, string> = {
  violet: "from-violet-500 to-purple-600",
  orange: "from-orange-500 to-amber-600",
  green: "from-green-500 to-emerald-600",
  blue: "from-blue-500 to-cyan-600",
  yellow: "from-yellow-400 to-orange-500",
  pink: "from-pink-500 to-rose-600",
};

const TEXT_ACCENTS: Record<string, string> = {
  violet: "text-violet-500",
  orange: "text-orange-500",
  green: "text-green-500",
  blue: "text-blue-500",
  yellow: "text-yellow-500",
  pink: "text-pink-500",
};

export function FeatureGrid({ props, s }: SectionProps) {
  const variant = str(props.card_variant) || "detailed";
  const items = list(props.items);
  const compact = variant === "compact";

  return (
    <SectionShell s={s}>
      <SectionHeader props={props} s={s} />
      {media(props.image) && (
        <div className="mb-16 animate-fade-in">
          <div className={cn("relative max-w-4xl mx-auto rounded-2xl overflow-hidden border p-6 md:p-10", s.light ? "border-gray-200 bg-gray-50" : "border-zinc-800 bg-zinc-900/50")}>
            <SiteImage value={props.image} className="w-full h-auto object-contain rounded-lg" />
          </div>
        </div>
      )}
      <div className={cn("grid grid-cols-1 gap-6", compact ? "sm:grid-cols-2" : "md:grid-cols-2", lgCols(props.columns), widthClass(s.width))}>
        {items.map((item, index) => {
          const anchor = str(item.anchor_id) || undefined;
          const accent = str(item.accent);

          if (compact) {
            return (
              <div
                key={index}
                id={anchor}
                className={cn(
                  "group relative rounded-2xl p-6 lg:p-8 border transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 animate-scale-in scroll-mt-24",
                  s.light ? "bg-gray-50 border-gray-200" : "bg-zinc-900/80 border-zinc-800",
                  s.accent === "orange" ? "hover:border-orange-500/50 hover:shadow-orange-500/5" : "hover:border-yellow-500/50 hover:shadow-yellow-500/5",
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-white/5 mb-5 group-hover:bg-white/10 transition-colors duration-300">
                  {isLineIcon(item.icon) ? (
                    <LineIcon name={str(item.icon)} className={cn("w-8 h-8", TEXT_ACCENTS[accent] ?? "text-yellow-500")} />
                  ) : (
                    <span className={accent ? cn("text-3xl font-bold", TEXT_ACCENTS[accent]) : "text-4xl"} aria-hidden>
                      {str(item.icon)}
                    </span>
                  )}
                </div>
                <h3 className={cn("text-lg font-semibold leading-snug", titleClass(s))} style={textStyle(item, "title")}>{str(item.title)}</h3>
                {str(item.description) && <p className={cn("mt-2 text-sm leading-relaxed", bodyClass(s))}>{str(item.description)}</p>}
                <div
                  className={cn(
                    "absolute bottom-0 left-6 right-6 h-0.5 bg-gradient-to-r rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left",
                    s.accent === "orange" ? "from-orange-500 to-yellow-500" : "from-yellow-400 to-orange-500",
                  )}
                />
              </div>
            );
          }

          return (
            <div
              key={index}
              id={anchor}
              className={cn("group rounded-2xl p-6 transition-all duration-300 hover:shadow-card-hover transform hover:-translate-y-2 animate-scale-in scroll-mt-24", cardClass(s))}
              style={{ animationDelay: `${index * 80}ms` }}
            >
              {variant === "icon_tile" ? (
                <div className={cn("inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br mb-4 text-2xl text-white", TILE_ACCENTS[accent] ?? TILE_ACCENTS.yellow)}>
                  <SiteIcon value={item.icon} className="w-7 h-7" />
                </div>
              ) : variant === "icon" ? (
                <div className={cn("mb-4 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300", TEXT_ACCENTS[accent] ?? "text-yellow-500", !isLineIcon(item.icon) && "text-4xl")}>
                  <SiteIcon value={item.icon} className="w-8 h-8" />
                </div>
              ) : (
                str(item.icon) && (
                  <div className={cn("mb-4 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300", isLineIcon(item.icon) ? "text-yellow-500" : "text-5xl")}>
                    <SiteIcon value={item.icon} className="w-12 h-12" />
                  </div>
                )
              )}
              <h3 className={cn("text-xl font-bold mb-3", titleClass(s))} style={textStyle(item, "title")}>{str(item.title)}</h3>
              {str(item.description) && (
                <p className={cn("leading-relaxed", bodyClass(s), variant === "icon_tile" && "text-sm", variant === "detailed" && list(item.bullets).length > 0 && "mb-4")}>
                  {str(item.description)}
                </p>
              )}
              {variant === "detailed" && list<string>(item.bullets).length > 0 && (
                <ul className="space-y-2">
                  {list<string>(item.bullets).map((bullet, i) => (
                    <li key={i} className={cn("flex items-center gap-2 text-sm", s.light ? "text-gray-500" : "text-zinc-400")}>
                      <span className="w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0" />
                      {str(bullet)}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </SectionShell>
  );
}

/* ------------------------------------------------------------------ gallery */

const ASPECT: Record<string, string> = { "4:3": "aspect-[4/3]", "1:1": "aspect-square", "16:9": "aspect-video" };

export function Gallery({ props, s }: SectionProps) {
  const images = list(props.images);
  return (
    <SectionShell s={s}>
      <SectionHeader props={props} s={s} />
      {images.length === 0 ? (
        <MissingMedia label="Add images to this gallery" className={cn("h-48", widthClass(s.width))} />
      ) : (
        <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6", lgCols(props.columns), widthClass(s.width))}>
          {images.map((item, index) => (
            <figure
              key={index}
              className={cn(
                "group relative overflow-hidden rounded-xl md:rounded-2xl border transition-all duration-300",
                s.light ? "border-gray-200 bg-gray-50" : "border-zinc-800 hover:border-yellow-500/50 bg-zinc-900/50",
              )}
            >
              <div className={cn("overflow-hidden", ASPECT[str(props.aspect_ratio)] ?? ASPECT["4:3"])}>
                {media(item.image) ? (
                  <SiteImage value={item.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <MissingMedia label="No image" className="h-full w-full rounded-none border-0" />
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              {str(item.caption) && <figcaption className="absolute bottom-0 inset-x-0 p-3 text-sm text-white bg-gradient-to-t from-black/70 to-transparent">{str(item.caption)}</figcaption>}
            </figure>
          ))}
        </div>
      )}
    </SectionShell>
  );
}

/* ------------------------------------------------------------------ cta */

export function Cta({ props, s }: SectionProps) {
  const badge = str(props.badge_text);
  return (
    <SectionShell s={{ ...s, width: "normal" }}>
      <div className="text-center max-w-3xl mx-auto">
        {badge && (
          <div className={cn("inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r mb-8 animate-fade-in", accentGradient(s.accent))}>
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm font-semibold text-white uppercase tracking-wider">{badge}</span>
          </div>
        )}
        <h2 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 animate-slide-up">
          <span className={s.light ? "text-gray-900" : "text-white"} style={textStyle(props, "heading")}>{str(props.heading)}</span>
          {str(props.heading_highlight) && (
            <>
              <br />
              <span className={cn("text-transparent bg-clip-text bg-gradient-to-r", accentGradient(s.accent))} style={textStyle(props, "heading_highlight")}>{str(props.heading_highlight)}</span>
            </>
          )}
        </h2>
        {str(props.description) && (
          <p className={cn("text-lg mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in-delay", s.light ? "text-gray-600" : "text-gray-300")}>{str(props.description)}</p>
        )}
        {list<string>(props.bullets).length > 0 && (
          <ul className="mb-10 flex flex-wrap justify-center gap-x-6 gap-y-3">
            {list<string>(props.bullets).map((bullet, i) => (
              <li key={i} className={cn("flex items-center gap-2", bodyClass(s))}>
                <LineIcon name="check" className="w-5 h-5 flex-shrink-0 text-yellow-500" />
                {str(bullet)}
              </li>
            ))}
          </ul>
        )}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-delay-2">
          <PrimaryButton value={props.primary_button} accent={s.accent} size="md" />
          <SecondaryButton value={props.secondary_button} variant="neutral" light={s.light} />
        </div>
        {str(props.note) && <p className={cn("mt-6 text-sm", s.light ? "text-gray-500" : "text-zinc-400")}>{str(props.note)}</p>}
      </div>
    </SectionShell>
  );
}

/* ------------------------------------------------------------------ text + image */

export function TextImage({ props, s }: SectionProps) {
  const imageLeft = str(props.image_position) === "left";
  return (
    <SectionShell s={s}>
      <div className={cn("grid grid-cols-1 lg:grid-cols-2 gap-12 items-center", widthClass(s.width))}>
        <div className={cn(imageLeft && "lg:order-2")}>
          {str(props.badge_text) && (
            <div className={cn("inline-flex items-center px-4 py-2 rounded-full mb-6 border-2", s.accent === "orange" ? "border-orange-500/80" : "border-yellow-500")}>
              <span className={cn("text-sm font-semibold uppercase tracking-wider", s.accent === "orange" ? "text-orange-400" : titleClass(s))}>{str(props.badge_text)}</span>
            </div>
          )}
          <h2 className="text-3xl md:text-5xl font-black mb-6">
            <span className={titleClass(s)} style={textStyle(props, "heading")}>{str(props.heading)}</span>
            {str(props.heading_highlight) && (
              <>
                {" "}
                <span className={cn("text-transparent bg-clip-text bg-gradient-to-r", accentGradient(s.accent))} style={textStyle(props, "heading_highlight")}>{str(props.heading_highlight)}</span>
              </>
            )}
          </h2>
          <RichText html={props.body} className={cn("text-lg", bodyClass(s))} />
          {link(props.button) && (
            <div className="mt-8">
              <PrimaryButton value={props.button} accent={s.accent} size="md" />
            </div>
          )}
        </div>
        <div className={cn(imageLeft && "lg:order-1")}>
          {media(props.image) ? (
            <div className={cn("rounded-2xl overflow-hidden border", s.light ? "border-gray-200" : "border-zinc-800")}>
              <SiteImage value={props.image} className="w-full h-auto object-cover" />
            </div>
          ) : (
            <MissingMedia label="Choose an image" className="aspect-[4/3]" />
          )}
        </div>
      </div>
    </SectionShell>
  );
}

/* ------------------------------------------------------------------ stats */

export function Stats({ props, s }: SectionProps) {
  const items = list(props.items);
  const cols = String(Math.min(Math.max(items.length, 1), 4));
  return (
    <SectionShell s={s}>
      <SectionHeader props={props} s={s} />
      <div className={cn("grid grid-cols-2 gap-6", LG_COLS[cols], widthClass(s.width))}>
        {items.map((item, i) => (
          <div key={i} className={cn("rounded-2xl p-6 text-center animate-scale-in", cardClass(s))} style={{ animationDelay: `${i * 80}ms` }}>
            <p className={cn("text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r", accentGradient(s.accent))}>{str(item.value)}</p>
            <p className={cn("mt-2 text-sm font-medium uppercase tracking-wide", s.light ? "text-gray-500" : "text-zinc-400")}>{str(item.label)}</p>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

/* ------------------------------------------------------------------ testimonials */

export function Testimonials({ props, s }: SectionProps) {
  return (
    <SectionShell s={s}>
      <SectionHeader props={props} s={s} />
      <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", widthClass(s.width))}>
        {list(props.items).map((item, i) => (
          <figure key={i} className={cn("flex flex-col rounded-2xl p-6 transition-all duration-300 hover:shadow-card-hover animate-scale-in", cardClass(s))} style={{ animationDelay: `${i * 80}ms` }}>
            <span className={cn("text-5xl leading-none font-black text-transparent bg-clip-text bg-gradient-to-r", accentGradient(s.accent))} aria-hidden>
              &ldquo;
            </span>
            <blockquote className={cn("mt-2 flex-1 leading-relaxed", bodyClass(s))}>{str(item.quote)}</blockquote>
            <figcaption className="mt-6 flex items-center gap-3">
              {media(item.image) && <SiteImage value={item.image} className="w-11 h-11 rounded-full object-cover" />}
              <div>
                <p className={cn("font-semibold", titleClass(s))}>{str(item.author)}</p>
                {str(item.role) && <p className={cn("text-sm", s.light ? "text-gray-500" : "text-zinc-400")}>{str(item.role)}</p>}
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </SectionShell>
  );
}

/* ------------------------------------------------------------------ faq */

export function Faq({ props, s }: SectionProps) {
  return (
    <SectionShell s={s}>
      <SectionHeader props={props} s={s} />
      <div className="max-w-3xl mx-auto space-y-3">
        {list(props.items).map((item, i) => (
          <details key={i} className={cn("group rounded-xl border px-6 py-4", s.light ? "border-gray-200 bg-gray-50" : "border-zinc-800 bg-zinc-900")}>
            <summary className={cn("flex cursor-pointer list-none items-center justify-between gap-4 font-semibold", titleClass(s))}>
              {str(item.question)}
              <span className="text-yellow-400 transition-transform group-open:rotate-45 text-2xl leading-none" aria-hidden>
                +
              </span>
            </summary>
            <RichText html={item.answer} className={cn("mt-3", bodyClass(s))} />
          </details>
        ))}
      </div>
      <RichText html={props.note} className={cn("mt-10 text-center", bodyClass(s))} />
    </SectionShell>
  );
}

/* ------------------------------------------------------------------ rich text */

export function RichTextSection({ props, s }: SectionProps) {
  return (
    <SectionShell s={s}>
      <div className={cn(widthClass(s.width === "normal" ? "narrow" : s.width), s.align === "center" && "text-center")}>
        {str(props.heading) && <h2 className={cn("text-3xl md:text-4xl font-black mb-6", titleClass(s))} style={textStyle(props, "heading")}>{str(props.heading)}</h2>}
        <RichText html={props.body} className={cn("text-lg", bodyClass(s))} />
      </div>
    </SectionShell>
  );
}

/* ------------------------------------------------------------------ video */

function embedUrl(url: string): string | null {
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}

export function VideoSection({ props, s }: SectionProps) {
  const url = useMediaUrl(props.video);
  const poster = useMediaUrl(props.poster);
  if (!url) return null;
  const embed = embedUrl(url);
  return (
    <SectionShell s={s}>
      <SectionHeader props={props} s={s} />
      <div className={cn("relative rounded-xl overflow-hidden border border-yellow-400/40 video-frame-glow", widthClass(s.width === "wide" || s.width === "full" ? "normal" : s.width), "max-w-4xl mx-auto")}>
        {embed ? (
          <iframe
            src={embed}
            title={str(props.heading) || "Video"}
            className="w-full aspect-video"
            allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <video src={url} poster={poster} controls playsInline className="w-full aspect-video bg-black">
            Your browser does not support the video tag.
          </video>
        )}
      </div>
    </SectionShell>
  );
}

/* ------------------------------------------------------------------ logo strip */

export function LogoStrip({ props, s }: SectionProps) {
  const logos = list(props.logos);
  return (
    <SectionShell s={s}>
      {str(props.heading) && <p className={cn("mb-10 text-center text-sm font-semibold uppercase tracking-widest", s.light ? "text-gray-500" : "text-zinc-400")} style={textStyle(props, "heading")}>{str(props.heading)}</p>}
      {logos.length === 0 ? (
        <MissingMedia label="Add logos" className="h-24" />
      ) : (
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
          {logos.map((logo, i) => {
            const img = <SiteImage value={logo.image} alt={str(logo.name) || media(logo.image)?.alt} className="h-10 md:h-12 w-auto object-contain opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0" />;
            return str(logo.url) ? (
              <SiteAnchor key={i} href={str(logo.url)} newTab ariaLabel={str(logo.name) || undefined}>
                {img}
              </SiteAnchor>
            ) : (
              <span key={i}>{img}</span>
            );
          })}
        </div>
      )}
    </SectionShell>
  );
}

/* ------------------------------------------------------------------ contact */

export function Contact({ props, s }: SectionProps) {
  const entries = [
    str(props.email) && { icon: "mail", label: "Email", value: str(props.email), href: `mailto:${str(props.email)}` },
    str(props.phone) && { icon: "phone", label: "Phone", value: str(props.phone), href: `tel:${str(props.phone).replace(/[^\d+]/g, "")}` },
    str(props.address) && { icon: "map-pin", label: "Address", value: str(props.address), href: str(props.map_url) || null },
    str(props.hours) && { icon: "clock", label: "Hours", value: str(props.hours), href: null },
  ].filter(Boolean) as { icon: string; label: string; value: string; href: string | null }[];

  return (
    <SectionShell s={s}>
      <SectionHeader props={props} s={s} />
      <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-6", entries.length >= 3 && "lg:grid-cols-3", widthClass(s.width))}>
        {entries.map((entry) => (
          <div key={entry.label} className={cn("rounded-2xl p-6 transition-all duration-300 hover:shadow-card-hover", cardClass(s))}>
            <LineIcon name={entry.icon} className="w-7 h-7 text-yellow-500 mb-4" />
            <p className={cn("text-sm font-semibold uppercase tracking-wide mb-1", s.light ? "text-gray-500" : "text-zinc-400")}>{entry.label}</p>
            {entry.href ? (
              <SiteAnchor href={entry.href} newTab={entry.icon === "map-pin"} className={cn("text-lg font-medium whitespace-pre-line hover:text-yellow-500 transition-colors", titleClass(s))}>
                {entry.value}
              </SiteAnchor>
            ) : (
              <p className={cn("text-lg font-medium whitespace-pre-line", titleClass(s))}>{entry.value}</p>
            )}
          </div>
        ))}
      </div>
      {link(props.button) && (
        <div className="mt-10 text-center">
          <PrimaryButton value={props.button} accent={s.accent} size="md" />
        </div>
      )}
    </SectionShell>
  );
}

/* ------------------------------------------------------------------ team */

export function Team({ props, s }: SectionProps) {
  return (
    <SectionShell s={s}>
      <SectionHeader props={props} s={s} />
      <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-6", lgCols(props.columns, "4"), widthClass(s.width))}>
        {list(props.members).map((member, i) => (
          <div key={i} className={cn("group rounded-2xl p-5 transition-all duration-300 hover:shadow-card-hover transform hover:-translate-y-1", cardClass(s))}>
            <div className="aspect-square overflow-hidden rounded-xl mb-4 bg-zinc-800">
              {media(member.photo) ? (
                <SiteImage value={member.photo} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              ) : (
                <div className="flex h-full items-center justify-center text-4xl font-black text-zinc-600">{str(member.name).charAt(0)}</div>
              )}
            </div>
            <h3 className={cn("text-lg font-bold", titleClass(s))}>{str(member.name)}</h3>
            {str(member.role) && <p className={cn("text-sm font-medium text-transparent bg-clip-text bg-gradient-to-r w-fit", accentGradient(s.accent))}>{str(member.role)}</p>}
            {str(member.bio) && <p className={cn("mt-3 text-sm leading-relaxed", bodyClass(s))}>{str(member.bio)}</p>}
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

/* ------------------------------------------------------------------ pricing */

export function Pricing({ props, s }: SectionProps) {
  const plans = list(props.plans);
  const cols = String(Math.min(Math.max(plans.length, 1), 3));
  return (
    <SectionShell s={s}>
      <SectionHeader props={props} s={s} />
      <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch", LG_COLS[cols], widthClass(s.width))}>
        {plans.map((plan, i) => {
          const highlighted = plan.highlighted === true;
          return (
            <div
              key={i}
              className={cn(
                "relative flex flex-col rounded-2xl p-8 transition-all duration-300",
                cardClass(s),
                highlighted && "border-yellow-500 shadow-card-hover",
              )}
            >
              {highlighted && (
                <span className={cn("absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r", accentGradient(s.accent))}>
                  Most popular
                </span>
              )}
              <h3 className={cn("text-xl font-bold", titleClass(s))}>{str(plan.name)}</h3>
              <p className="mt-4 flex items-baseline gap-1">
                <span className={cn("text-4xl font-black", titleClass(s))}>{str(plan.price)}</span>
                {str(plan.period) && <span className={s.light ? "text-gray-500" : "text-zinc-400"}>{str(plan.period)}</span>}
              </p>
              {str(plan.compare_price) && (
                <p className={cn("mt-1 text-sm", s.light ? "text-gray-500" : "text-zinc-400")}>
                  <s>{str(plan.compare_price)}</s> {str(plan.compare_label)}
                </p>
              )}
              {str(plan.description) && <p className={cn("mt-3 text-sm leading-relaxed", bodyClass(s))}>{str(plan.description)}</p>}
              <ul className="mt-6 flex-1 space-y-2">
                {list<string>(plan.features).map((feature, j) => (
                  <li key={j} className={cn("flex items-start gap-2 text-sm", bodyClass(s))}>
                    <LineIcon name="check" className="w-4 h-4 mt-0.5 flex-shrink-0 text-yellow-500" />
                    {str(feature)}
                  </li>
                ))}
              </ul>
              {link(plan.button) && (
                <div className="mt-8">
                  {highlighted ? <PrimaryButton value={plan.button} accent={s.accent} size="md" /> : <SecondaryButton value={plan.button} variant="neutral" light={s.light} />}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </SectionShell>
  );
}

/* ------------------------------------------------------------------ registry */

export const SECTION_COMPONENTS: Record<string, ComponentType<SectionProps>> = {
  hero: Hero,
  feature_grid: FeatureGrid,
  gallery: Gallery,
  cta: Cta,
  text_image: TextImage,
  stats: Stats,
  testimonials: Testimonials,
  faq: Faq,
  rich_text: RichTextSection,
  video: VideoSection,
  logo_strip: LogoStrip,
  contact: Contact,
  team: Team,
  pricing: Pricing,
};

export { obj };
