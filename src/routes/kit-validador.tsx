import { createFileRoute } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import * as React from "react";
import {
  MAXOR_ASSET_LIBRARY,
  maxorColors,
  maxorFonts,
  maxorGradients,
  maxorRootCss,
  ALL_PRODUCTS,
  BRANDS,
  ROUPAS,
  getVariants,
  brl,
  productPlaceholder,
} from "@/maxor-kit";

const LogoLoopLazy = React.lazy(() =>
  import("@/components/site/LogoLoop").then((m) => ({ default: m.LogoLoop })),
);

type Check = { label: string; ok: boolean; detail: string };

function KitValidador() {
  const checks: Check[] = [
    { label: "Tokens de cor", ok: !!maxorColors.navy, detail: `${Object.keys(maxorColors).length} tokens` },
    { label: "Tipografia", ok: !!maxorFonts.display, detail: maxorFonts.display.split(",")[0] },
    { label: "Gradientes", ok: !!maxorGradients.brand, detail: `${Object.keys(maxorGradients).length} gradientes` },
    { label: "CSS :root para o CRM", ok: maxorRootCss().includes("--cyan-brand"), detail: `${maxorRootCss().split("\n").length} linhas` },
    { label: "Biblioteca de mídia", ok: MAXOR_ASSET_LIBRARY.length > 0, detail: `${MAXOR_ASSET_LIBRARY.length} assets` },
    { label: "Catálogo", ok: Array.isArray(ALL_PRODUCTS), detail: `${ALL_PRODUCTS.length} produtos` },
    { label: "Marcas", ok: BRANDS.length > 0, detail: `${BRANDS.length} marcas` },
    { label: "Linhas de roupa", ok: ROUPAS.length > 0, detail: `${ROUPAS.length} categorias` },
    { label: "Agrupamento de variantes", ok: typeof getVariants === "function", detail: "getVariants()" },
    { label: "Formatação BRL", ok: brl(199.9).includes("199"), detail: brl(199.9) },
    { label: "Placeholder de produto", ok: productPlaceholder("teste", "Teste").startsWith("data:image/svg"), detail: "SVG data-URI" },
  ];

  const okCount = checks.filter((c) => c.ok).length;

  return (
    <main className="min-h-screen bg-background px-6 py-12 text-foreground">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-primary">Maxor Kit</p>
          <h1 className="font-display text-4xl font-bold">Validador de ambiente CRM</h1>
          <p className="text-muted-foreground">
            Esta página consome o kit exatamente como o CRM Maxor fará: um único import de{" "}
            <code className="text-primary">@/maxor-kit</code>.
          </p>
        </header>

        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-display text-xl font-semibold">
            {okCount}/{checks.length} verificações
          </h2>
          <ul className="mt-4 space-y-2">
            {checks.map((c) => (
              <li key={c.label} className="flex items-center justify-between gap-4 border-b border-border/50 py-2 text-sm last:border-0">
                <span className="flex items-center gap-2">
                  <span className={c.ok ? "text-[#7EEBC1]" : "text-destructive"}>{c.ok ? "OK" : "FALHA"}</span>
                  {c.label}
                </span>
                <span className="text-muted-foreground">{c.detail}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-display text-xl font-semibold">Paleta</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {Object.entries(maxorColors).map(([name, hex]) => (
              <div key={name} className="w-28 text-xs">
                <div className="h-12 rounded-md border border-border" style={{ background: hex }} />
                <p className="mt-1 text-muted-foreground">{name}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-display text-xl font-semibold">Biblioteca de mídia</h2>
          <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
            {MAXOR_ASSET_LIBRARY.filter((a) => a.kind !== "video").map((a) => (
              <figure key={a.key} className="rounded-md border border-border bg-secondary/40 p-3 text-center">
                <img src={a.url} alt={a.label} loading="lazy" className="mx-auto h-10 w-full object-contain" />
                <figcaption className="mt-2 truncate text-[10px] text-muted-foreground">{a.label}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-display text-xl font-semibold">Efeito LogoLoop (client-only)</h2>
          <div className="mt-4">
            <ClientOnly fallback={<div className="h-16 animate-pulse rounded-md bg-secondary/40" />}>
              <React.Suspense fallback={<div className="h-16 rounded-md bg-secondary/40" />}>
                <LogoLoopLazy
                  logos={MAXOR_ASSET_LIBRARY.filter((a) => a.kind === "brand-logo").map((a) => ({
                    src: a.url,
                    alt: a.label,
                  }))}
                  speed={60}
                  logoHeight={28}
                  gap={48}
                />
              </React.Suspense>
            </ClientOnly>
          </div>
        </section>
      </div>
    </main>
  );
}

export const Route = createFileRoute("/kit-validador")({
  component: KitValidador,
  head: () => ({
    meta: [
      { title: "Validador do Maxor Kit — ambiente CRM" },
      { name: "description", content: "Página de validação que consome o Maxor Kit como o CRM Maxor fará: tokens, mídia, catálogo e efeitos." },
      { property: "og:title", content: "Validador do Maxor Kit — ambiente CRM" },
      { property: "og:description", content: "Verificação de tokens, biblioteca de mídia, catálogo e efeitos do Maxor Kit." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});
