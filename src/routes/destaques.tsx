import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { useMemo } from "react";
import { Shell } from "@/components/site/Shell";
import { ProductMiniCard } from "@/components/site/ProductMiniCard";
import { ALL_PRODUCTS } from "@/lib/catalog";
import { useCatalogVersion } from "@/hooks/use-crm-sync";

export const Route = createFileRoute("/destaques")({
  component: DestaquesPage,
  head: () => ({
    meta: [
      { title: "Destaques — Maxor Sports" },
      { name: "description", content: "Modelos selecionados a dedo pela curadoria Maxor Sports." },
      { property: "og:title", content: "Destaques — Maxor Sports" },
      { property: "og:description", content: "O melhor da Maxor Sports selecionado para você." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://maxorsports.lovable.app/destaques" }],
  }),
});

function DestaquesPage() {
  const catalogVersion = useCatalogVersion();

  const products = useMemo(() => {
    return ALL_PRODUCTS.filter((p) => p.selo === "destaque");
  }, [catalogVersion]);

  return (
    <Shell active="Destaques">
      <div className="border-b border-white/10 bg-navy">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[color:var(--mint-brand)]">
          <Link to="/" className="hover:brightness-110 text-muted-foreground">Home</Link>
          <ChevronRight className="h-3 w-3 text-muted-foreground" />
          <span className="text-offwhite">Destaques</span>
        </div>
      </div>

      <section
        className="relative overflow-hidden border-b border-border"
        style={{ backgroundImage: "linear-gradient(120deg, #0F1720 0%, #153a30 55%, #7EEBC1 100%)" }}
      >
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:py-16">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-[color:var(--mint-brand)]">Curadoria Elite</p>
          <h1 className="mt-2 font-display text-4xl font-black uppercase tracking-tight text-offwhite sm:text-5xl md:text-6xl">
            Destaques
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-offwhite/80 sm:text-base">
            O que há de melhor em tecnologia e design no mundo esportivo.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10">
        {products.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            Buscando destaques no CRM...
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {products.map((p) => (
              <ProductMiniCard key={`${p.section}-${p.id}`} product={p} />
            ))}
          </div>
        )}
      </div>
    </Shell>
  );
}
