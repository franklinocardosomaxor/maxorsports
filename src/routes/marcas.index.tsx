import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { Shell } from "@/components/site/Shell";
import { BRANDS, BRAND_PRODUCTS } from "@/components/site/brands-data";

export const Route = createFileRoute("/marcas/")({
  component: MarcasIndex,
  head: () => ({
    meta: [
      { title: "Marcas — Maxor Sports" },
      { name: "description", content: "Explore tênis por marca: Nike, Adidas, New Balance, Puma, ASICS, Jordan, HOKA, On, Salomon e mais na Maxor Sports." },
      { property: "og:title", content: "Marcas — Maxor Sports" },
      { property: "og:description", content: "Curadoria por marca com performance e estilo." },
    ],
  }),
});

function MarcasIndex() {
  return (
    <Shell active="Marcas">
      <div className="border-b border-border bg-secondary/40">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-navy">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">Marcas</span>
        </div>
      </div>

      <section
        className="relative overflow-hidden border-b border-border"
        style={{ backgroundImage: "linear-gradient(120deg, #0F1720 0%, #103642 55%, #00BFC6 100%)" }}
      >
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:py-16">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-[color:var(--cyan-brand)]">Curadoria Maxor</p>
          <h1 className="mt-2 font-display text-4xl font-black uppercase tracking-tight text-offwhite sm:text-5xl md:text-6xl">
            Marcas
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-offwhite/80 sm:text-base">
            As marcas que moldam a cena — do performance ao lifestyle, do drop de rua ao luxo italiano.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {BRANDS.map((b) => {
            const count = BRAND_PRODUCTS[b.slug]?.length ?? 0;
            return (
              <Link
                key={b.slug}
                to="/marcas/$brand"
                params={{ brand: b.slug }}
                className="group relative overflow-hidden rounded-2xl border border-border shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div
                  className="flex aspect-square flex-col items-center justify-center gap-3 p-4 text-center"
                  style={{ backgroundImage: b.bg }}
                >
                  {b.logo ? (
                    <img
                      src={b.logo}
                      alt={b.name}
                      className="h-16 w-auto max-w-[70%] object-contain brightness-0 invert drop-shadow sm:h-20"
                      loading="lazy"
                    />
                  ) : (
                    <span className="font-display text-3xl font-black uppercase tracking-widest text-offwhite drop-shadow sm:text-4xl">
                      {b.mark}
                    </span>
                  )}
                  <span className="font-display text-sm font-bold uppercase tracking-[0.25em] text-offwhite/90">
                    {b.name}
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-offwhite/60">
                    {b.tagline}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-border bg-background px-3 py-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  <span>{count} modelos</span>
                  <span className="text-[color:var(--cyan-brand)] transition group-hover:translate-x-1">
                    ver →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </Shell>
  );
}
