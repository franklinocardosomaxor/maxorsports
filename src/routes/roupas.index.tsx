import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { Shell } from "@/components/site/Shell";
import { ROUPAS } from "@/components/site/roupas-data";
import { getCategoryProducts } from "@/lib/catalog";
import { useCatalogVersion } from "@/hooks/use-crm-sync";

export const Route = createFileRoute("/roupas/")({
  component: RoupasIndex,
  head: () => ({
    meta: [
      { title: "Roupas — Maxor Sports" },
      { name: "description", content: "Roupas esportivas Maxor Sports: academia, futebol e peças diversas com curadoria premium." },
      { property: "og:title", content: "Roupas — Maxor Sports" },
      { property: "og:description", content: "Vista o seu esporte com a energia Maxor." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://maxorsports.lovable.app/roupas" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://maxorsports.lovable.app/roupas" }],
  }),
});

function RoupasIndex() {
  useCatalogVersion();
  return (
    <Shell active="Roupas">
      <div className="border-b border-white/10 bg-navy">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[color:var(--lime-brand)]">
          <Link to="/" className="hover:brightness-110">Home</Link>
          <ChevronRight className="h-3 w-3 text-[color:var(--lime-brand)]/60" />
          <span className="text-offwhite">Roupas</span>
        </div>
      </div>

      <section
        className="relative overflow-hidden border-b border-border"
        style={{ backgroundImage: "linear-gradient(120deg, #0F1720 0%, #124638 55%, #7EEBC1 100%)" }}
      >
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:py-16">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-[color:var(--mint)]">Curadoria Maxor</p>
          <h1 className="mt-2 font-display text-4xl font-black uppercase tracking-tight text-offwhite sm:text-5xl md:text-6xl">
            Roupas
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-offwhite/80 sm:text-base">
            Do treino ao jogo, do street ao dia a dia — vista a energia Maxor.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          {ROUPAS.map((r) => {
            const count = getCategoryProducts(r.name).length;
            return (
              <Link
                key={r.slug}
                to="/roupas/$category"
                params={{ category: r.slug }}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex aspect-square items-center justify-center bg-card p-4">
                  <div className="flex h-full w-full items-center justify-center rounded-xl bg-[color:var(--cream)] p-6">
                    <img
                      src={r.icon}
                      alt={r.name}
                      className="max-h-[70%] max-w-[80%] object-contain transition group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-border bg-card px-4 py-3">
                  <div>
                    <div className="font-display text-sm font-black uppercase tracking-widest text-offwhite">{r.name}</div>
                    <div className="text-[11px] text-muted-foreground">{count} modelos</div>
                  </div>
                  <span className="text-[color:var(--cyan-brand)] transition group-hover:translate-x-1">ver →</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </Shell>
  );
}
