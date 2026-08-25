import { createFileRoute, Link } from "@tanstack/react-router";
import { ALL_PRODUCTS, groupProductsByModel, type ProductWithSection } from "@/lib/catalog";
import { useMemo } from "react";
import { ProductMiniCard } from "@/components/site/ProductMiniCard";
import { ViewModeToggle, ProductListRow, useViewMode, viewModeContainerClass } from "@/components/site/view-mode";
import { ChevronRight, Grid2X2 } from "lucide-react";
import { useCatalogVersion } from "@/hooks/use-crm-sync";

export const Route = createFileRoute("/destaques")({
  component: DestaquesPage,
  head: () => ({
    meta: [
      { title: "Destaques — Maxor Sports" },
      { name: "description", content: "Seleção exclusiva dos modelos mais icônicos e desejados da Maxor Sports." },
      { property: "og:title", content: "Destaques — Maxor Sports" },
      { property: "og:description", content: "Modelos selecionados pela curadoria Maxor Sports." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://maxorsports.lovable.app/destaques" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://maxorsports.lovable.app/destaques" }],
  }),
});

function DestaquesPage() {
  const version = useCatalogVersion();
  const viewMode = useViewMode();

  // Agrupa os produtos que possuem o selo 'destaque' pela sua tag original (ex: "Destaque", "Novidade", etc.)
  // para permitir a visualização "separada pelo seu destaque"
  const groupedHighlights = useMemo(() => {
    const highlights = ALL_PRODUCTS.filter(p => p.selo === 'destaque');
    const groups: Record<string, ProductWithSection[]> = {};
    
    highlights.forEach(p => {
      const tag = p.tag || "Destaques";
      if (!groups[tag]) groups[tag] = [];
      groups[tag].push(p);
    });
    
    return Object.fromEntries(
      Object.entries(groups).map(([name, items]) => [name, groupProductsByModel(items)]),
    ) as Record<string, ProductWithSection[]>;
  }, [version]);

  const groupNames = Object.keys(groupedHighlights).sort();
  const totalCount = Object.values(groupedHighlights).reduce((sum, group) => sum + group.length, 0);

  return (
    <div className="min-h-screen bg-navy pt-24 pb-20">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-widest">
          <Link to="/" className="hover:text-foreground transition">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-bold">Destaques</span>
        </nav>

        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="font-display text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-white">
              Nossos <span className="text-[color:var(--cyan-brand)]">Destaques</span>
            </h1>
            <p className="mt-2 text-muted-foreground max-w-xl">
              Seleção exclusiva dos modelos mais icônicos e desejados do momento, organizados por categoria.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-white/40">{totalCount} PRODUTOS</span>
            <ViewModeToggle />
          </div>
        </header>

        {totalCount === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
              <Grid2X2 className="h-10 w-10 text-white/20" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Nenhum destaque no momento</h3>
            <p className="text-muted-foreground">Sincronizando as melhores escolhas do CRM.</p>
          </div>
        ) : (
          <div className="space-y-16">
            {groupNames.map((groupName) => (
              <section key={groupName}>
                <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-4">
                  <div className="h-8 w-1.5 rounded-full bg-[color:var(--mint-brand)]"></div>
                  <h2 className="font-display text-2xl md:text-3xl font-bold uppercase italic tracking-tight text-white">
                    {groupName}
                  </h2>
                </div>
                <div className={viewModeContainerClass(viewMode)}>
                  {groupedHighlights[groupName].map((product) =>
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
