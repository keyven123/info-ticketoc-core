import { useEffect, useState } from 'react';
import { CmsError, getJson, type CmsConfig } from './client';

/**
 * One deployment of this site can serve many CMS websites of the same design. Hostnames under
 * VITE_CMS_TENANT_DOMAIN (e.g. "acme.sites.ticketoc.com") are looked up in the CMS; any other
 * hostname shows the website of VITE_CMS_SITE_KEY. Without a site key, every hostname is looked
 * up (custom domains pointed at a shared deployment).
 */
export interface CmsEnv {
  VITE_CMS_API_URL?: string;
  VITE_CMS_SITE_KEY?: string;
  VITE_CMS_TENANT_DOMAIN?: string;
}

export type SiteSelection = { kind: 'fixed'; config: CmsConfig } | { kind: 'lookup'; apiUrl: string; hostname: string } | null;

export function selectSite(hostname: string, env: CmsEnv = import.meta.env): SiteSelection {
  const apiUrl = (env.VITE_CMS_API_URL ?? '').trim().replace(/\/+$/, '');
  if (!apiUrl) return null;
  const siteKey = (env.VITE_CMS_SITE_KEY ?? '').trim();
  const tenant = (env.VITE_CMS_TENANT_DOMAIN ?? '').trim().toLowerCase().replace(/^\.+|\.+$/g, '');
  const host = hostname.trim().toLowerCase().replace(/\.+$/, '');

  // Customer sites on the hosting domain (e.g. acme.sites.ticketoc.com).
  if (tenant && host.endsWith(`.${tenant}`)) return { kind: 'lookup', apiUrl, hostname: host };
  // Main marketing hostname: use the baked-in site key (no /resolve, no TXT).
  if (siteKey) return { kind: 'fixed', config: { apiUrl, siteKey } };
  // Shared deploy with no site key: every hostname is a custom domain to look up.
  if (tenant && host) return { kind: 'lookup', apiUrl, hostname: host };
  return null;
}

/** Asks the CMS which website a verified hostname belongs to. Unknown hostnames are a 404 CmsError. */
export async function resolveSite(apiUrl: string, hostname: string, signal?: AbortSignal): Promise<CmsConfig> {
  const data = await getJson<{ site_key: string }>(`${apiUrl}/api/v1/public/resolve?domain=${encodeURIComponent(hostname)}`, signal);
  return { apiUrl, siteKey: data.site_key };
}

export type SiteConfigState =
  | { status: 'loading' }
  | { status: 'ready'; config: CmsConfig }
  | { status: 'unconfigured' }
  | { status: 'unknown_domain'; hostname: string }
  | { status: 'error'; retry: () => void };

export function useSiteConfig(hostname: string = window.location.hostname, env: CmsEnv = import.meta.env): SiteConfigState {
  const [selection] = useState(() => selectSite(hostname, env));
  const [attempt, setAttempt] = useState(0);
  const [resolved, setResolved] = useState<SiteConfigState>({ status: 'loading' });

  useEffect(() => {
    if (selection?.kind !== 'lookup') return;
    const controller = new AbortController();
    resolveSite(selection.apiUrl, selection.hostname, controller.signal)
      .then((config) => setResolved({ status: 'ready', config }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setResolved(
          error instanceof CmsError && error.notFound
            ? { status: 'unknown_domain', hostname: selection.hostname }
            : {
                status: 'error',
                retry: () => {
                  setResolved({ status: 'loading' });
                  setAttempt((n) => n + 1);
                },
              },
        );
      });
    return () => controller.abort();
  }, [selection, attempt]);

  if (selection === null) return { status: 'unconfigured' };
  if (selection.kind === 'fixed') return { status: 'ready', config: selection.config };
  return resolved;
}
