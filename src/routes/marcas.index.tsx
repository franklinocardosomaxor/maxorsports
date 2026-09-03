import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { Shell } from "@/components/site/Shell";
import { getBrandVisual } from "@/components/site/brands-data";
import { getBrandDirectory, getBrandProducts } from "@/lib/catalog";
import { useCatalogVersion } from "@/hooks/use-crm-sync";

export const Route = createFileRoute("/marcas/")({
  component: MarcasIndex,
  head: () => ({
    meta: [
      { title: "Marcas — Maxor Sports" },
      { name: "description", content: "Explore tênis por marca: Nike, Adidas, New Balance, Puma, ASICS, Jordan, HOKA, On, Salomon e mais na Maxor Sports." },
      { property: "og:title", content: "Marcas — Maxor Sports" },
      { property: "og:description", content: "Curadoria por marca com performance e estilo." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://maxorsports.lovable.app/marcas" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://maxorsports.lovable.app/marcas" }],
  }),
});

function MarcasIndex() {
  // Re-renderiza quando o CRM sincroniza: contagens e marcas novas sobem sozinhas.
  useCatalogVersion();
  // Diretório vivo: lista estática + marcas do CRM (src/lib/brands.ts).
  const directory = getBrandDirectory();
  return (
    <Shell active="Marcas">
      <div className="border-b border-white/10 bg-navy">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[color:var(--lime-brand)]">
          <Link to="/" className="hover:brightness-110">Home</Link>
          <ChevronRight className="h-3 w-3 text-[color:var(--lime-brand)]/60" />
          <span className="text-offwhite">Marcas</span>
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
          {directory.map((entry) => {
            const b = getBrandVisual(entry);
            // Conta MODELOS agrupados (mesmo critério da página /marcas/$brand),
            // não produtos brutos — evita o número aqui divergir da quantidade
            // real de cards ao entrar na página da marca (ex.: Adidas mostrava
            // 16 aqui e só 6 cards na página, porque cada cor virava +1).
            const count = getBrandProducts(entry.slug).length;
            const comingSoon = count === 0;
            return (
              <Link
                key={b.slug}
                to="/marcas/$brand"
                params={{ brand: b.slug }}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-1 hover:shadow-lg"
              >
                {comingSoon && (
                  <span className="absolute right-2 top-2 z-10 rounded-full border border-[color:var(--lime-brand)]/40 bg-navy/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-[color:var(--lime-brand)]">
                    Em breve
                  </span>
                )}
                <div className="flex aspect-square items-center justify-center bg-card p-4">
                  {b.logo ? (
                    <div className={`flex h-full w-full items-center justify-center rounded-xl bg-[color:var(--cream)] p-4 ${comingSoon ? "opacity-60 grayscale" : ""}`}>
                      <img
                        src={b.logo}
                        alt={b.name}
                        className="max-h-[55%] max-w-[75%] object-contain transition group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <span className="font-display text-4xl font-black uppercase tracking-widest text-offwhite">
                      {b.mark}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between border-t border-border bg-card px-3 py-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  <span>{comingSoon ? "Em breve" : `${count} ${count === 1 ? "modelo" : "modelos"}`}</span>
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
