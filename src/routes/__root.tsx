import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { CartProvider } from "../lib/cart";
import { useCrmSync } from "../hooks/use-crm-sync";




const SplashCursor = lazy(() => import("../components/site/SplashCursor"));

function DomMutationSafety() {
  useEffect(() => {
    if (typeof window === "undefined" || typeof Node === "undefined") return;

    const nodePrototype = Node.prototype as typeof Node.prototype & {
      __maxorSafeDomPatch?: boolean;
      __maxorOriginalRemoveChild?: typeof Node.prototype.removeChild;
      __maxorOriginalInsertBefore?: typeof Node.prototype.insertBefore;
    };

    if (nodePrototype.__maxorSafeDomPatch) return;

    const originalRemoveChild = nodePrototype.removeChild;
    const originalInsertBefore = nodePrototype.insertBefore;

    nodePrototype.__maxorSafeDomPatch = true;
    nodePrototype.__maxorOriginalRemoveChild = originalRemoveChild;
    nodePrototype.__maxorOriginalInsertBefore = originalInsertBefore;

    nodePrototype.removeChild = function patchedRemoveChild<T extends Node>(this: Node, child: T): T {
      if (child.parentNode !== this) {
        if (child.parentNode) {
          return originalRemoveChild.call(child.parentNode, child) as T;
        }
        return child;
      }
      return originalRemoveChild.call(this, child) as T;
    } as typeof Node.prototype.removeChild;

    nodePrototype.insertBefore = function patchedInsertBefore<T extends Node>(
      this: Node,
      newNode: T,
      referenceNode: Node | null,
    ): T {
      if (referenceNode && referenceNode.parentNode !== this) {
        return originalInsertBefore.call(this, newNode, null) as T;
      }
      return originalInsertBefore.call(this, newNode, referenceNode) as T;
    } as typeof Node.prototype.insertBefore;
  }, []);

  return null;
}

function SplashCursorClient() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return (
    <Suspense fallback={null}>
      <SplashCursor SPLAT_RADIUS={0.08} SPLAT_FORCE={2500} DENSITY_DISSIPATION={5.5} />
    </Suspense>
  );
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "google-site-verification", content: "1QakVOtZU4MeleAgzk6HjKEFCVGmKBYtU6uA46MgPKI" },
      { title: "Maxor Sports — Tênis e artigos esportivos" },
      { name: "description", content: "Curadoria Maxor Sports: tênis, roupas e acessórios esportivos com performance, estilo e personalidade." },
      { name: "author", content: "Maxor Sports" },
      { property: "og:title", content: "Maxor Sports — Tênis e artigos esportivos" },
      { property: "og:description", content: "Curadoria Maxor Sports: tênis, roupas e acessórios esportivos com performance, estilo e personalidade." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Maxor Sports — Tênis e artigos esportivos" },
      { name: "twitter:description", content: "Curadoria Maxor Sports: tênis, roupas e acessórios esportivos com performance, estilo e personalidade." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/9f1506de-9e9e-4ecb-b492-276fdd6aabdd/id-preview-2f68a433--7d5f6004-7285-47c6-b8ad-208f005afc03.lovable.app-1785260050547.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/9f1506de-9e9e-4ecb-b492-276fdd6aabdd/id-preview-2f68a433--7d5f6004-7285-47c6-b8ad-208f005afc03.lovable.app-1785260050547.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});


function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const isCrmArea = pathname.startsWith("/admin") || pathname.startsWith("/maxorcrm");
  // Sincroniza o catálogo publicado pelo CRM (tabela compartilhada products).
  useCrmSync();

  useEffect(() => {
    if (!isCrmArea || typeof document === "undefined") return;

    const html = document.documentElement;
    const body = document.body;
    const previousHtmlTranslate = html.getAttribute("translate");
    const previousBodyTranslate = body.getAttribute("translate");

    html.setAttribute("translate", "no");
    body.setAttribute("translate", "no");
    html.classList.add("notranslate");
    body.classList.add("notranslate");

    return () => {
      if (previousHtmlTranslate === null) html.removeAttribute("translate");
      else html.setAttribute("translate", previousHtmlTranslate);
      if (previousBodyTranslate === null) body.removeAttribute("translate");
      else body.setAttribute("translate", previousBodyTranslate);
      html.classList.remove("notranslate");
      body.classList.remove("notranslate");
    };
  }, [isCrmArea]);


  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <DomMutationSafety />
        {!isCrmArea && <SplashCursorClient />}
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
      </CartProvider>
    </QueryClientProvider>
  );
}
