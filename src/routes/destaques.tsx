import { createFileRoute, Link } from "@tanstack/react-router";
import { ALL_PRODUCTS, getCatalogVersion, Selo, SELO_LABEL } from "@/lib/catalog";
import { useMemo } from "react";
import { ProductMiniCard } from "@/components/site/ProductMiniCard";
import { ChevronRight, Grid2X2 } from "lucide-react";

// Ordenação visual dos selos
const SELOS_ORDER: Selo[] = ["destaque", "lancamento", "oferta", "mais-vendido", "normal"];

export const Route = createFileRoute("/destaques")({
  component: DestaquesPage,
});

function DestaquesPage() {
  const version = getCatalogVersion();

  // Filtra apenas produtos que são 'destaque' e agrupa por selo (para manter a lógica de separação)
  // Ou, conforme solicitado: "incluir os produtos que tem tag de destaque separado pelo seu destaque"
  // Interpretando: Mostrar a página de Destaques onde os itens com selo 'destaque' são o foco,
  // ou talvez ele queira que a seção "Destaques" do menu mostre os produtos agrupados.
  const highlights = useMemo(() => {
    return ALL_PRODUCTS.filter(p => p.selo === 'destaque');
  }, [version]);

  const totalCount = highlights.length;

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
              Seleção exclusiva dos modelos mais icônicos e desejados do momento.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-white/40">{totalCount} PRODUTOS EM DESTAQUE</span>
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {highlights.map((product) => (
              <ProductMiniCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
