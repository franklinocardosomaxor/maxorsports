import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { useMemo } from "react";
import { Shell } from "@/components/site/Shell";
import { ProductMiniCard } from "@/components/site/ProductMiniCard";
import { ALL_PRODUCTS } from "@/lib/catalog";
import { BRANDS } from "@/components/site/brands-data";

export const Route = createFileRoute("/catalogo")({
  component: CatalogoPage,
  head: () => ({
    meta: [
      { title: "Catálogo completo — Maxor Sports" },
      { name: "description", content: "Catálogo completo Maxor Sports com todos os tênis separados por marca." },
      { property: "og:title", content: "Catálogo completo — Maxor Sports" },
      { property: "og:description", content: "Todos os tênis da Maxor Sports organizados por marca." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
          { property: "og:url", content: "https://maxorsports.lovable.app/catalogo" },
],
    links: [{ rel: "canonical", href: "https://maxorsports.lovable.app/catalogo" }],
  }),
});

function CatalogoPage() {
  const groups = useMemo(() => {
    const map = new Map<string, typeof ALL_PRODUCTS>();
    for (const p of ALL_PRODUCTS) {
      const list = map.get(p.brand) ?? [];
      list.push(p);
      map.set(p.brand, list);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, []);

  const logoFor = (brand: string) =>
    BRANDS.find((b) => b.name.toLowerCase() === brand.toLowerCase())?.logo;

  return (
    <Shell>
      <div className="border-b border-white/10 bg-navy">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[color:var(--lime-brand)]">
          <Link to="/" className="hover:brightness-110">Home</Link>
          <ChevronRight className="h-3 w-3 text-[color:var(--lime-brand)]/60" />
          <span className="text-offwhite">Catálogo</span>
        </div>
      </div>

      <section
        className="relative overflow-hidden border-b border-border"
        style={{ backgroundImage: "linear-gradient(120deg, #0F1720 0%, #103642 55%, #7EEBC1 100%)" }}
      >
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:py-16">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-[color:var(--cyan-brand)]">Maxor Sports</p>
          <h1 className="mt-2 font-display text-4xl font-black uppercase tracking-tight text-offwhite sm:text-5xl md:text-6xl">
            Catálogo completo
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-offwhite/80 sm:text-base">
            Todos os modelos organizados por marca — do performance ao lifestyle.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-14 px-4 py-10">
        {groups.map(([brand, items]) => {
          const logo = logoFor(brand);
          return (
            <section key={brand}>
              <div className="flex items-end justify-between gap-6">
                <div className="flex items-center gap-3">
                  {logo && (
                    <div className="grid h-12 w-20 place-items-center rounded-xl bg-[color:var(--cream)] p-2">
                      <img src={logo} alt={brand} className="max-h-full max-w-full object-contain" />
                    </div>
                  )}
                  <div>
                    <h2 className="font-display text-2xl font-bold uppercase tracking-wide">{brand}</h2>
                    <p className="text-xs text-muted-foreground">{items.length} modelos</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
                {items.map((p) => (
                  <ProductMiniCard key={`${p.section}-${p.id}`} product={p} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </Shell>
  );
}
