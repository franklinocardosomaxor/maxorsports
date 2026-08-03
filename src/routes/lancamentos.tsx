import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { useMemo } from "react";
import { Shell } from "@/components/site/Shell";
import { ProductMiniCard } from "@/components/site/ProductMiniCard";
import { ALL_PRODUCTS } from "@/lib/catalog";
import { useCatalogVersion } from "@/hooks/use-crm-sync";

export const Route = createFileRoute("/lancamentos")({
  component: LancamentosPage,
  head: () => ({
    meta: [
      { title: "Lançamentos — Maxor Sports" },
      { name: "description", content: "Os lançamentos e drops mais recentes da curadoria Maxor Sports." },
      { property: "og:title", content: "Lançamentos — Maxor Sports" },
      { property: "og:description", content: "Novidades e drops que acabaram de chegar na Maxor Sports." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
          { property: "og:url", content: "https://maxorsports.lovable.app/lancamentos" },
],
    links: [{ rel: "canonical", href: "https://maxorsports.lovable.app/lancamentos" }],
  }),
});

function LancamentosPage() {
  const catalogVersion = useCatalogVersion();

  const products = useMemo(() => {
    return ALL_PRODUCTS.filter((p) => p.selo === "lancamento");
  }, [catalogVersion]);


  return (
    <Shell active="Lançamentos">
      <div className="border-b border-white/10 bg-navy">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[color:var(--lime-brand)]">
          <Link to="/" className="hover:brightness-110">Home</Link>
          <ChevronRight className="h-3 w-3 text-[color:var(--lime-brand)]/60" />
          <span className="text-offwhite">Lançamentos</span>
        </div>
      </div>

      <section
        className="relative overflow-hidden border-b border-border"
        style={{ backgroundImage: "linear-gradient(120deg, #0F1720 0%, #1d3a1f 55%, #C7F500 100%)" }}
      >
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:py-16">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-[color:var(--lime-brand)]">Acabou de chegar</p>
          <h1 className="mt-2 font-display text-4xl font-black uppercase tracking-tight text-offwhite sm:text-5xl md:text-6xl">
            Lançamentos
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-offwhite/80 sm:text-base">
            A curadoria mais fresca da Maxor — drops, novidades e destaques da temporada.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {products.map((p) => (
            <ProductMiniCard key={`${p.section}-${p.id}`} product={p} />
          ))}
        </div>
      </div>
    </Shell>
  );
}
