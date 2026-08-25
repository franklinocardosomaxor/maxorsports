import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { Shell } from "@/components/site/Shell";
import { CatalogPage } from "@/components/site/CatalogPage";
import { getCategoryProducts } from "@/lib/catalog";
import { useCatalogVersion } from "@/hooks/use-crm-sync";
import type { CatalogProduct } from "@/components/site/CatalogPage";

const HEADER_GRADIENT = "linear-gradient(120deg, #0F1720 0%, #2c3a12 55%, #C7F500 100%)";

export const Route = createFileRoute("/acessorios")({
  component: AcessoriosPage,
  head: () => ({
    meta: [
      { title: "Acessórios — Maxor Sports" },
      { name: "description", content: "Acessórios esportivos Maxor Sports: meias, bonés, mochilas e tudo que completa o seu look." },
      { property: "og:title", content: "Acessórios — Maxor Sports" },
      { property: "og:description", content: "Acessórios esportivos com a curadoria Maxor Sports." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://maxorsports.lovable.app/acessorios" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://maxorsports.lovable.app/acessorios" }],
  }),
});

function AcessoriosPage() {
  useCatalogVersion();
  const products = getCategoryProducts("Acessórios") as unknown as CatalogProduct[];
  const categories = Array.from(new Set(products.map((p) => p.category)));
  const brands = Array.from(new Set(products.map((p) => p.brand)));
  const sizes = Array.from(new Set(products.flatMap((p) => p.sizes))).sort((a, b) => a - b);

  if (products.length === 0) {
    return (
      <Shell active="Diversos">
        <div className="border-b border-white/10 bg-navy">
          <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[color:var(--lime-brand)]">
            <Link to="/" className="hover:brightness-110">Home</Link>
            <ChevronRight className="h-3 w-3 text-[color:var(--lime-brand)]/60" />
            <span className="text-offwhite">Acessórios</span>
          </div>
        </div>

        <section
          className="relative overflow-hidden border-b border-border"
          style={{ backgroundImage: HEADER_GRADIENT }}
        >
          <div className="relative mx-auto max-w-7xl px-4 py-12 sm:py-16">
            <p className="text-xs font-black uppercase tracking-[0.35em] text-[color:var(--lime-brand)]">Curadoria Maxor</p>
            <h1 className="mt-2 font-display text-4xl font-black uppercase tracking-tight text-offwhite sm:text-5xl md:text-6xl">
              Acessórios
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-offwhite/80 sm:text-base">
              Em breve: meias, bonés, mochilas e os detalhes que completam seu estilo esportivo.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 py-16 text-center">
          <p className="text-sm text-offwhite/60">Nenhum acessório cadastrado no catálogo ainda.</p>
          <Link
            to="/"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-[color:var(--cyan-brand)] px-6 py-2 text-xs font-bold uppercase tracking-widest text-navy hover:brightness-110"
          >
            Voltar para home
          </Link>
        </div>
      </Shell>
    );
  }

  return (
    <CatalogPage
      activeNav="Diversos"
      breadcrumb={["Acessórios"]}
      theme={{
        eyebrow: "Curadoria Maxor",
        title: "Acessórios",
        subtitle: "Os detalhes que completam o seu look esportivo — meias, bonés, mochilas e mais.",
        headerGradient: HEADER_GRADIENT,
        accent: "lime",
      }}
      products={products}
      brands={brands.length > 0 ? brands : ["Maxor"]}
      categories={categories.length > 0 ? categories : ["Acessórios"]}
      sizes={sizes.length > 0 ? sizes : []}
    />
  );
}
