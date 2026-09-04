import { createFileRoute, Link } from "@tanstack/react-router";
import { getBrandDirectory, getBrandVariants, type ProductWithSection } from "@/lib/catalog";

import { useMemo } from "react";
import { ProductMiniCard } from "@/components/site/ProductMiniCard";
import { ViewModeToggle, ProductListRow, useViewMode, viewModeContainerClass } from "@/components/site/view-mode";
import { ChevronRight, ChevronLeft, Grid2X2 } from "lucide-react";
import { useCatalogVersion } from "@/hooks/use-crm-sync";

const brandAnchor = (brand: string) => `marca-${brand.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

// Limite de cards por página. Acima disso a página fica pesada demais
// (muitas imagens carregando de uma vez), então quebramos em /catalogo?p=2, ?p=3...
const PAGE_SIZE = 100;


type CatalogSearch = { p?: number };

export const Route = createFileRoute("/catalogo")({
  component: CatalogoSeloPage,
  validateSearch: (search: Record<string, unknown>): CatalogSearch => {
    const raw = Number(search.p);
    return { p: Number.isFinite(raw) && raw > 1 ? Math.floor(raw) : undefined };
  },
  head: () => ({
    meta: [
      { title: "Catálogo Completo — Maxor Sports" },
      { name: "description", content: "Explore o catálogo completo de tênis e artigos esportivos da Maxor Sports. Filtre por marca, selo e novidades." },
      { property: "og:title", content: "Catálogo Completo — Maxor Sports" },
      { property: "og:description", content: "Encontre seu par ideal no catálogo da Maxor Sports." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://maxorsports.lovable.app/catalogo" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://maxorsports.lovable.app/catalogo" }],
  }),
});

function CatalogoSeloPage() {
  const version = useCatalogVersion();
  const viewMode = useViewMode();
  const { p } = Route.useSearch();
  const currentPage = p && p > 1 ? p : 1;

  // Catálogo completo separado por MARCA, listando TODAS as variações de cor
  // cadastradas (um card por cor). Marcas-categoria (Chuteiras) ficam fora
  // para não duplicar produtos que já aparecem na marca real.
  const brandGroups = useMemo(() => {
    return getBrandDirectory()
      .filter((entry) => entry.matchBy !== "category")
      .map((entry) => ({
        brand: entry.name,
        products: getBrandVariants(entry.slug) as ProductWithSection[],
      }))
      .filter((g) => g.products.length > 0);
  }, [version]);

  const totalItems = brandGroups.reduce((sum, g) => sum + g.products.length, 0);

  // Lista plana (mesma ordem exibida) para poder fatiar em páginas de 100 cards.
  const flat = useMemo(
    () => brandGroups.flatMap((g) => g.products.map((product) => ({ brand: g.brand, product }))),
    [brandGroups],
  );


  const totalPages = Math.max(1, Math.ceil(flat.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const pageSlice = flat.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // Re-agrupa por marca só dentro da página atual, preservando a ordem de aparição.
  const pageGroups = useMemo(() => {
    const map = new Map<string, ProductWithSection[]>();
    for (const { brand, product } of pageSlice) {
      if (!map.has(brand)) map.set(brand, []);
      map.get(brand)!.push(product);
    }
    return Array.from(map.entries()).map(([brand, products]) => ({ brand, products }));
  }, [pageSlice]);

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-navy pt-24 pb-20">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-widest">
          <Link to="/" className="hover:text-foreground transition">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-bold">Catálogo Completo</span>
        </nav>

        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="font-display text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-foreground">
              Explorar <span className="text-[color:var(--cyan-brand)]">Catálogo</span>
            </h1>
            <p className="mt-2 text-muted-foreground max-w-xl">
              Catálogo completo, separado por marca. Todas as cores cadastradas aparecem como cards individuais.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold uppercase text-muted-foreground">{totalItems} {totalItems === 1 ? "produto" : "produtos"}</span>

            <ViewModeToggle />
          </div>
        </header>

        {/* Índice de marcas (respeita a página atual) */}
        {pageGroups.length > 0 && (
          <div className="mb-12 flex flex-wrap gap-2 border-y border-border/40 py-4">
            {pageGroups.map(({ brand, products }) => (
              <a
                key={brand}
                href={`#${brandAnchor(brand)}`}
                className="rounded-full border border-border/60 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-muted-foreground transition hover:brightness-110 hover:text-foreground hover:border-[color:var(--cyan-brand)]"
              >
                {brand} <span className="text-[color:var(--cyan-brand)]">{products.length}</span>
              </a>
            ))}
          </div>
        )}

        {totalItems === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-20 w-20 rounded-full bg-card flex items-center justify-center mb-6">
              <Grid2X2 className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Nenhum produto encontrado</h3>
            <p className="text-muted-foreground">O catálogo está sendo sincronizado com o CRM.</p>
          </div>
        ) : (
          <>
            {totalPages > 1 && (
              <p className="mb-6 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Página {safePage} de {totalPages} — produtos {(safePage - 1) * PAGE_SIZE + 1} a {Math.min(safePage * PAGE_SIZE, flat.length)} de {flat.length}
              </p>
            )}

            <div className="space-y-20">
              {pageGroups.map(({ brand, products }) => (
                <section key={brand} id={brandAnchor(brand)} className="scroll-mt-32 mb-12 last:mb-0">
                  <div className="flex items-center justify-between mb-8 border-b border-border/40 pb-4">
                    <div className="flex items-center gap-4">
                      <div className="h-8 w-1.5 rounded-full" style={{ backgroundColor: "var(--cyan-brand)" }} />
                      <h2 className="font-display text-2xl md:text-3xl font-bold uppercase italic tracking-tight text-foreground">
                        {brand}
                      </h2>
                    </div>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                      {products.length} {products.length === 1 ? "produto" : "produtos"}
                    </span>
                  </div>

                  <div className={viewModeContainerClass(viewMode)}>
                    {products.map((product) =>
                      viewMode === "list" ? (
                        <ProductListRow key={product.id} product={product} />
                      ) : (
                        <ProductMiniCard key={product.id} product={product} />
                      ),
                    )}
                  </div>
                </section>
              ))}
            </div>

            {/* Paginação — só aparece quando o catálogo passa de 100 modelos */}
            {totalPages > 1 && (
              <nav
                aria-label="Paginação do catálogo"
                className="mt-16 flex flex-wrap items-center justify-center gap-2 border-t border-border/40 pt-8"
              >
                <Link
                  to="/catalogo"
                  search={safePage > 2 ? { p: safePage - 1 } : {}}
                  disabled={safePage === 1}
                  aria-disabled={safePage === 1}
                  className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-widest transition ${
                    safePage === 1
                      ? "pointer-events-none border-border/40 text-muted-foreground/40"
                      : "border-border/60 text-muted-foreground hover:text-foreground hover:border-[color:var(--cyan-brand)]"
                  }`}
                >
                  <ChevronLeft className="h-3 w-3" />
                  Anterior
                </Link>

                {pageNumbers.map((n) => (
                  <Link
                    key={n}
                    to="/catalogo"
                    search={n > 1 ? { p: n } : {}}
                    className={`h-9 min-w-9 rounded-full border px-3 text-xs font-bold flex items-center justify-center transition ${
                      n === safePage
                        ? "border-[color:var(--cyan-brand)] bg-[color:var(--cyan-brand)] text-navy"
                        : "border-border/60 text-muted-foreground hover:text-foreground hover:border-[color:var(--cyan-brand)]"
                    }`}
                  >
                    {n}
                  </Link>
                ))}

                <Link
                  to="/catalogo"
                  search={{ p: safePage + 1 }}
                  disabled={safePage === totalPages}
                  aria-disabled={safePage === totalPages}
                  className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-widest transition ${
                    safePage === totalPages
                      ? "pointer-events-none border-border/40 text-muted-foreground/40"
                      : "border-border/60 text-muted-foreground hover:text-foreground hover:border-[color:var(--cyan-brand)]"
                  }`}
                >
                  Próxima
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </nav>
            )}
          </>
        )}
      </div>

    </div>
  );
}
