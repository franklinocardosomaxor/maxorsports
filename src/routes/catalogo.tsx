import { createFileRoute, Link } from "@tanstack/react-router";
import { ALL_PRODUCTS, getCatalogVersion, groupProductsByModel, Selo, SELO_LABEL, type ProductWithSection } from "@/lib/catalog";
import { useMemo } from "react";
import { ProductMiniCard } from "@/components/site/ProductMiniCard";
import { ViewModeToggle, ProductListRow, useViewMode, viewModeContainerClass } from "@/components/site/view-mode";
import { ChevronRight, Grid2X2 } from "lucide-react";

const SELOS_ORDER: Selo[] = ["destaque", "lancamento", "oferta", "mais-vendido", "normal"];

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
  const version = getCatalogVersion();
  const viewMode = useViewMode();

  // Agrupa produtos por selo
  const groupedProducts = useMemo(() => {
    const groups: Record<Selo, ProductWithSection[]> = {
      destaque: [],
      lancamento: [],
      oferta: [],
      "mais-vendido": [],
      normal: [],
    };

    ALL_PRODUCTS.forEach((p) => {
      if (p.selo && groups[p.selo]) {
        groups[p.selo].push(p);
      }
    });

    return {
      destaque: groupProductsByModel(groups.destaque),
      lancamento: groupProductsByModel(groups.lancamento),
      oferta: groupProductsByModel(groups.oferta),
      "mais-vendido": groupProductsByModel(groups["mais-vendido"]),
      normal: groupProductsByModel(groups.normal),
    } satisfies Record<Selo, ProductWithSection[]>;
  }, [version]);

  const totalCount = Object.values(groupedProducts).reduce((sum, group) => sum + group.length, 0);

  return (
    <div className="min-h-screen bg-navy pt-24 pb-20">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-widest">
          <Link to="/" className="hover:text-foreground transition">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-bold">Catálogo Completo</span>
        </nav>

        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="font-display text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-white">
                Explorar <span className="text-[color:var(--cyan-brand)]">Catálogo</span>
              </h1>
              <p className="mt-2 text-muted-foreground max-w-xl">
                Confira todos os nossos produtos divididos por categorias de destaque e novidades. Utilize os filtros para encontrar o modelo ideal por marca, gênero ou faixa de preço.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-white/40">{totalCount} PRODUTOS</span>
              <ViewModeToggle />
            </div>
          </div>
        </header>

        {totalCount === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
              <Grid2X2 className="h-10 w-10 text-white/20" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Nenhum produto encontrado</h3>
            <p className="text-muted-foreground">O catálogo está sendo sincronizado com o CRM.</p>
          </div>
        ) : (
          <div className="space-y-20">
            {SELOS_ORDER.map((selo) => {
              const products = groupedProducts[selo];
              if (products.length === 0) return null;

              const label = SELO_LABEL[selo] || "Geral";
              const accentColor = selo === 'oferta' ? 'var(--cyan-brand)' : 
                                 selo === 'lancamento' ? 'var(--lime-brand)' : 
                                 selo === 'destaque' ? 'var(--mint-brand)' : 
                                 'var(--offwhite-brand)';

              return (
                <section key={selo} id={selo} className="scroll-mt-32 mb-12 last:mb-0">
                  <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
                    <div className="flex items-center gap-4">
                      <div className="h-8 w-1.5 rounded-full" style={{ backgroundColor: accentColor }}></div>
                      <h2 className="font-display text-2xl md:text-3xl font-bold uppercase italic tracking-tight text-white">
                        {label}
                      </h2>
                    </div>
                    <span className="text-xs font-bold text-white/30 uppercase tracking-widest">
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
