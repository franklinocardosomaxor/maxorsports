import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { useMemo } from "react";
import { Shell } from "@/components/site/Shell";
import { ProductMiniCard } from "@/components/site/ProductMiniCard";
import { ViewModeToggle, ProductListRow, useViewMode, viewModeContainerClass } from "@/components/site/view-mode";
import { ALL_PRODUCTS, groupProductsByModel } from "@/lib/catalog";
import { useCatalogVersion } from "@/hooks/use-crm-sync";

export const Route = createFileRoute("/mais-vendidos")({
  component: MaisVendidosPage,
  head: () => ({
    meta: [
      { title: "Mais Vendidos — Maxor Sports" },
      { name: "description", content: "Os modelos mais populares e desejados da Maxor Sports." },
      { property: "og:title", content: "Mais Vendidos — Maxor Sports" },
      { property: "og:description", content: "Confira o que está fazendo sucesso na Maxor Sports." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://maxorsports.lovable.app/mais-vendidos" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://maxorsports.lovable.app/mais-vendidos" }],
  }),
});

function MaisVendidosPage() {
  const catalogVersion = useCatalogVersion();
  const viewMode = useViewMode();

  const products = useMemo(() => {
    return groupProductsByModel(ALL_PRODUCTS.filter((p) => p.selo === "mais-vendido"));
  }, [catalogVersion]);

  return (
    <Shell active="Mais Vendidos">
      <div className="border-b border-white/10 bg-navy">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[color:var(--cyan-brand)]">
          <Link to="/" className="hover:brightness-110 text-muted-foreground">Home</Link>
          <ChevronRight className="h-3 w-3 text-muted-foreground" />
          <span className="text-offwhite">Mais Vendidos</span>
        </div>
      </div>

      <section
        className="relative overflow-hidden border-b border-border"
        style={{ backgroundImage: "linear-gradient(120deg, #0F1720 0%, #1a3040 55%, #00BFC6 100%)" }}
      >
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:py-16">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-[color:var(--cyan-brand)]">Os preferidos</p>
          <h1 className="mt-2 font-display text-4xl font-black uppercase tracking-tight text-offwhite sm:text-5xl md:text-6xl">
            Mais Vendidos
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-offwhite/80 sm:text-base">
            Os modelos que não ficam na prateleira. Seus favoritos em um só lugar.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10">
        {products.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            Aguardando sincronização de produtos populares...
          </div>
        ) : (
          <>
            <div className="mb-6 flex justify-end">
              <ViewModeToggle />
            </div>
            <div className={viewModeContainerClass(viewMode)}>
              {products.map((p) =>
                viewMode === "list" ? (
                  <ProductListRow key={`${p.section}-${p.id}`} product={p} />
                ) : (
                  <ProductMiniCard key={`${p.section}-${p.id}`} product={p} />
                ),
              )}
            </div>
          </>
        )}
      </div>
    </Shell>
  );
}
