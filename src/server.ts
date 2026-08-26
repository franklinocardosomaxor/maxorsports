import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

/**
 * Cabeçalhos de segurança aplicados a toda resposta HTML/JSON.
 * Defende contra:
 *  - Clonagem via iframe / clickjacking (X-Frame-Options + CSP frame-ancestors)
 *  - MIME sniffing (X-Content-Type-Options)
 *  - Vazamento de referrer p/ terceiros (Referrer-Policy)
 *  - Downgrade HTTPS (Strict-Transport-Security)
 *  - Uso indevido de APIs sensíveis do navegador (Permissions-Policy)
 *  - Cross-origin leaks (Cross-Origin-Opener-Policy)
 *
 * Preview (iframe do editor Lovable) fica liberado; produção nega frame.
 */
function applySecurityHeaders(request: Request, response: Response): Response {
  const url = new URL(request.url);
  // Hostname "real" pode vir mascarado por proxy/sandbox (o Host da request
  // interna difere do domínio público que o navegador vê dentro do iframe).
  const forwardedHost = request.headers.get("x-forwarded-host");
  const hostsToCheck = [url.hostname, forwardedHost].filter(
    (value): value is string => Boolean(value),
  );
  const isPreview = hostsToCheck.some(
    (hostname) =>
      hostname.endsWith(".lovable.app") ||
      hostname.endsWith(".lovableproject.com") ||
      hostname.endsWith(".lovable.dev") ||
      hostname.endsWith(".e2b.dev") ||
      hostname.endsWith(".e2b.app") ||
      hostname === "localhost" ||
      hostname === "127.0.0.1",
  );

  const headers = new Headers(response.headers);
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set(
    "Permissions-Policy",
    "camera=(self), microphone=(), geolocation=(), payment=(self), usb=(), interest-cohort=()",
  );
  headers.set("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  headers.set("X-DNS-Prefetch-Control", "off");

  if (isPreview) {
    headers.set("Content-Security-Policy", "frame-ancestors 'self' https://*.lovable.app https://*.lovable.dev https://lovable.dev");
  } else {
    headers.set("X-Frame-Options", "DENY");
    headers.set("Content-Security-Policy", "frame-ancestors 'none'");
    headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  }

  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return applySecurityHeaders(request, await normalizeCatastrophicSsrResponse(response));
    } catch (error) {
      console.error(error);
      return applySecurityHeaders(request, new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      }));
    }
  },
};

