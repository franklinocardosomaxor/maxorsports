import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { Shell } from "@/components/site/Shell";
import { ProductMiniCard } from "@/components/site/ProductMiniCard";
import { ViewModeToggle, ProductListRow, useViewMode, viewModeContainerClass } from "@/components/site/view-mode";
import { ALL_PRODUCTS } from "@/lib/catalog";
import { useCatalogVersion } from "@/hooks/use-crm-sync";

export const Route = createFileRoute("/categorias")({
  component: CategoriasPage,
  head: () => ({
    meta: [
      { title: "Categorias — Maxor Sports" },
      { name: "description", content: "Navegue os tênis Maxor Sports por categoria: corrida, casual, trail, training e mais." },
      { property: "og:title", content: "Categorias — Maxor Sports" },
      { property: "og:description", content: "Escolha sua categoria esportiva e encontre o modelo certo." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://maxorsports.lovable.app/categorias" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://maxorsports.lovable.app/categorias" }],
  }),
});

function CategoriasPage() {
  // Muda a cada sync do CRM — precisa entrar nas deps, senão os memos
  // congelam na primeira renderização e produtos novos não aparecem.
  const catalogVersion = useCatalogVersion();
  const viewMode = useViewMode();
  const categories = useMemo(
    () => Array.from(new Set(ALL_PRODUCTS.map((p) => p.category))).sort(),
    [catalogVersion],
  );
  const [active, setActive] = useState<string>("Todas");

  const products = useMemo(
    () => (active === "Todas" ? ALL_PRODUCTS : ALL_PRODUCTS.filter((p) => p.category === active)),
    [active, catalogVersion],
  );


  return (
    <Shell active="Categoria">
      <div className="border-b border-white/10 bg-navy">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[color:var(--lime-brand)]">
          <Link to="/" className="hover:brightness-110">Home</Link>
          <ChevronRight className="h-3 w-3 text-[color:var(--lime-brand)]/60" />
          <span className="text-offwhite">Categorias</span>
        </div>
      </div>

      <section
        className="relative overflow-hidden border-b border-border"
        style={{ backgroundImage: "linear-gradient(120deg, #0F1720 0%, #103642 55%, #00BFC6 100%)" }}
      >
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:py-16">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-[color:var(--cyan-brand)]">Curadoria Maxor</p>
          <h1 className="mt-2 font-display text-4xl font-black uppercase tracking-tight text-offwhite sm:text-5xl md:text-6xl">
            Categorias
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-offwhite/80 sm:text-base">
            Escolha seu esporte e vá além — cada categoria com a curadoria Maxor.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex flex-wrap gap-2">
          {["Todas", ...categories].map((c) => {
            const on = active === c;
            return (
              <button
                key={c}
                onClick={() => setActive(c)}
                className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-widest transition ${
                  on
                    ? "border-[color:var(--cyan-brand)] bg-[color:var(--cyan-brand)] text-navy"
                    : "border-border text-foreground hover:border-[color:var(--cyan-brand)]"
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex justify-end">
          <ViewModeToggle />
        </div>

        <div className={`mt-4 ${viewModeContainerClass(viewMode)}`}>
          {products.map((p) =>
            viewMode === "list" ? (
              <ProductListRow key={`${p.section}-${p.id}`} product={p} />
            ) : (
              <ProductMiniCard key={`${p.section}-${p.id}`} product={p} />
            ),
          )}
        </div>
      </div>
    </Shell>
  );
}
