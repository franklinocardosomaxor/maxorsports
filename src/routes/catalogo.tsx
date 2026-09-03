import { createFileRoute, Link } from "@tanstack/react-router";
import { getBrandDirectory, getBrandProducts, type ProductWithSection } from "@/lib/catalog";

import { useMemo } from "react";
import { ProductMiniCard } from "@/components/site/ProductMiniCard";
import { ViewModeToggle, ProductListRow, useViewMode, viewModeContainerClass } from "@/components/site/view-mode";
import { ChevronRight, Grid2X2 } from "lucide-react";
import { useCatalogVersion } from "@/hooks/use-crm-sync";

const brandAnchor = (brand: string) => `marca-${brand.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;


export const Route = createFileRoute("/catalogo")({
  component: CatalogoSeloPage,
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

  // Catálogo completo agrupado por MARCA usando exatamente a mesma fonte do
  // menu e de /marcas: diretório vivo + getBrandProducts (modelos agrupados).
  // Assim a contagem aqui, no card da marca e dentro da página da marca é
  // sempre idêntica. Marcas-categoria (Chuteiras) ficam fora para não duplicar
  // produtos que já aparecem na marca real.
  const brandGroups = useMemo(() => {
    return getBrandDirectory()
      .filter((entry) => entry.matchBy !== "category")
      .map((entry) => ({
        brand: entry.name,
        products: getBrandProducts(entry.slug) as ProductWithSection[],
      }))
      .filter((g) => g.products.length > 0);
  }, [version]);


  const totalCount = brandGroups.reduce((sum, g) => sum + g.products.length, 0);

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
              Catálogo completo, separado por marca. Cada cor cadastrada aparece como um item — aqui você vê tudo o que está disponível.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-muted-foreground">{totalCount} PRODUTOS</span>
            <ViewModeToggle />
          </div>
        </header>

        {/* Índice de marcas */}
        {brandGroups.length > 0 && (
          <div className="mb-12 flex flex-wrap gap-2 border-y border-border/40 py-4">
            {brandGroups.map(({ brand, products }) => (
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

        {totalCount === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-20 w-20 rounded-full bg-card flex items-center justify-center mb-6">
              <Grid2X2 className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Nenhum produto encontrado</h3>
            <p className="text-muted-foreground">O catálogo está sendo sincronizado com o CRM.</p>
          </div>
        ) : (
          <div className="space-y-20">
            {brandGroups.map(({ brand, products }) => (
              <section key={brand} id={brandAnchor(brand)} className="scroll-mt-32 mb-12 last:mb-0">
                <div className="flex items-center justify-between mb-8 border-b border-border/40 pb-4">
                  <div className="flex items-center gap-4">
                    <div className="h-8 w-1.5 rounded-full" style={{ backgroundColor: "var(--cyan-brand)" }} />
                    <h2 className="font-display text-2xl md:text-3xl font-bold uppercase italic tracking-tight text-foreground">
                      {brand}
                    </h2>
                  </div>
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    {products.length} itens
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
        )}
      </div>

    </div>
  );
}
