/** Shapes returned by the CMS public API (cms-web-ws `/api/v1/public/*` and `/api/v1/preview/{token}`). */

export interface MediaValue {
  asset_id?: string;
  url?: string;
  alt?: string;
  width?: number;
  height?: number;
  /** How wide the image is drawn on the page, in pixels. */
  display_width?: number;
  /** How tall the image is drawn on the page, in pixels. */
  display_height?: number;
}

export interface LinkValue {
  label?: string | null;
  url?: string | null;
  new_tab?: boolean;
}

export interface Section {
  id: string;
  type: string;
  visible?: boolean;
  props: Record<string, unknown>;
  style: Record<string, unknown>;
}

export interface PageSeo {
  title?: string;
  description?: string;
  canonical_url?: string;
  og_title?: string;
  og_description?: string;
  og_image?: MediaValue | null;
  robots?: string;
}

export interface PageSettings {
  show_header?: boolean;
  show_footer?: boolean;
  [key: string]: unknown;
}

export interface RenderNavItem {
  id: string;
  label: string;
  href: string | null;
  new_tab: boolean;
  children: RenderNavItem[];
}

export type SiteTheme = 'ticketoc' | 'business';

export interface RenderSite {
  key: string;
  name: string;
  /** Website design chosen in the CMS (Settings → Design). Older payloads omit it. */
  theme?: SiteTheme;
  base_url: string | null;
  primary_domain: string | null;
  content_revision: number;
  home_page_slug: string | null;
  settings: Record<string, Record<string, unknown>>;
  navigation: { header: RenderNavItem[]; footer: RenderNavItem[] };
}

export interface RenderPage {
  id: string | null;
  slug: string;
  path: string;
  name: string;
  type: string;
  is_home: boolean;
  version: number;
  status: string;
  published_at: string | null;
  schema_version: number;
  seo: PageSeo;
  settings: PageSettings;
  sections: Section[];
  compatibility?: { unsupported_section_types: string[] };
}

export interface PreviewPayload {
  site: RenderSite;
  page: RenderPage;
  preview: { label: string; expires_at: string };
}
