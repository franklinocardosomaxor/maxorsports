import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronRight, SlidersHorizontal, Heart, X } from "lucide-react";
import shoeBostonPink from "@/assets/shoe-boston-pink.jpg.asset.json";
import shoeTerrexSpeed from "@/assets/shoe-terrex-speed.jpg.asset.json";
import shoeUltraboost5 from "@/assets/shoe-ultraboost5.jpg.asset.json";
import shoeUltraboost22 from "@/assets/shoe-ultraboost22.jpg.asset.json";
import shoeUb20Osaka from "@/assets/shoe-ub20-osaka.jpg.asset.json";
import shoeGazelleRed from "@/assets/shoe-gazelle-red.jpg.asset.json";
import shoeSupernova from "@/assets/shoe-supernova.jpg.asset.json";
import shoeTerrexDaroga from "@/assets/shoe-terrex-daroga.jpg.asset.json";
import shoeAf1Grey from "@/assets/shoe-af1-grey.jpg.asset.json";
import shoeAf1Cpfm from "@/assets/shoe-af1-cpfm.jpg.asset.json";

export const Route = createFileRoute("/masculino")({
  component: MasculinoPage,
  head: () => ({
    meta: [
      { title: "Tênis Masculino — Maxor Sports" },
      { name: "description", content: "Coleção masculina Maxor Sports: tênis de corrida, basquete, casual, trail e training. Curadoria com marcas premium e drops exclusivos." },
      { property: "og:title", content: "Tênis Masculino — Maxor Sports" },
      { property: "og:description", content: "Tênis masculinos com performance e estilo. Corrida, basquete, casual e trail." },
    ],
  }),
});

type Product = {
  id: string;
  name: string;
  brand: string;
  category: "Corrida" | "Basquete" | "Casual" | "Trail" | "Training";
  price: number;
  old?: number;
  tag?: string;
  img: string;
  colors: string[];
  sizes: number[];
};

const PRODUCTS: Product[] = [
  { id: "adz-boston-13", name: "Adizero Boston 13", brand: "Adidas", category: "Corrida", price: 899.9, old: 1199.9, tag: "Novo", img: shoeBostonPink.url, colors: ["#f5e6d8", "#ff4d8a", "#c0c0c0"], sizes: [39, 40, 41, 42, 43] },
  { id: "terrex-speed-2", name: "Terrex Agravic Speed 2", brand: "Adidas", category: "Trail", price: 949.9, old: 1249.9, tag: "-24%", img: shoeTerrexSpeed.url, colors: ["#f7f2e6", "#111111", "#ff5a2b"], sizes: [40, 41, 42, 43, 44] },
  { id: "ub5-gtx", name: "Ultraboost 5 GTX", brand: "Adidas", category: "Corrida", price: 1099.9, old: 1399.9, tag: "Top", img: shoeUltraboost5.url, colors: ["#0a0a0a", "#3a4bff"], sizes: [39, 40, 41, 42, 43, 44] },
  { id: "af1-cpfm", name: "Air Force 1 x CPFM", brand: "Nike", category: "Casual", price: 1299.9, old: 1599.9, tag: "Drop", img: shoeAf1Cpfm.url, colors: ["#0a0a0a", "#ffffff"], sizes: [40, 41, 42, 43] },
  { id: "ub22-grey", name: "Ultraboost 22 Grey", brand: "Adidas", category: "Corrida", price: 699.9, old: 999.9, tag: "-30%", img: shoeUltraboost22.url, colors: ["#c0c0c0", "#0a0a0a"], sizes: [39, 40, 41, 42, 43] },
  { id: "ub20-osaka", name: "Ultraboost 20 Osaka", brand: "Adidas", category: "Corrida", price: 649.9, old: 949.9, tag: "-31%", img: shoeUb20Osaka.url, colors: ["#0a0a0a", "#ff2b2b", "#f4c400"], sizes: [40, 41, 42, 43] },
  { id: "supernova", name: "Supernova Rise 3M", brand: "Adidas", category: "Corrida", price: 579.9, old: 819.9, tag: "-29%", img: shoeSupernova.url, colors: ["#7ec8f7"], sizes: [39, 40, 41, 42, 43, 44] },
  { id: "gazelle-red", name: "Gazelle Indoor Red", brand: "Adidas", category: "Casual", price: 549.9, old: 799.9, tag: "-31%", img: shoeGazelleRed.url, colors: ["#c8102e"], sizes: [39, 40, 41, 42, 43] },
  { id: "af1-grey", name: "Air Force 1 x Off-White", brand: "Nike", category: "Casual", price: 1199.9, old: 1499.9, tag: "Drop", img: shoeAf1Grey.url, colors: ["#b8b8b8", "#0a0a0a"], sizes: [40, 41, 42, 43] },
  { id: "terrex-daroga", name: "Terrex Daroga", brand: "Adidas", category: "Trail", price: 749.9, old: 999.9, tag: "-25%", img: shoeTerrexDaroga.url, colors: ["#0a0a0a", "#ffffff"], sizes: [40, 41, 42, 43, 44] },
];

const BRANDS = ["Adidas", "Nike", "New Balance", "Asics", "Puma"];
const CATEGORIES = ["Corrida", "Basquete", "Casual", "Trail", "Training"];
const SIZES = [38, 39, 40, 41, 42, 43, 44, 45];
const SORTS = ["Mais relevantes", "Menor preço", "Maior preço", "Novidades", "Maior desconto"] as const;
type Sort = (typeof SORTS)[number];

const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function MasculinoPage() {
  const [brands, setBrands] = useState<string[]>([]);
  const [cats, setCats] = useState<string[]>([]);
  const [sizes, setSizes] = useState<number[]>([]);
  const [maxPrice, setMaxPrice] = useState(1600);
  const [sort, setSort] = useState<Sort>("Mais relevantes");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filtered = useMemo(() => {
    const list = PRODUCTS.filter(
      (p) =>
        (brands.length === 0 || brands.includes(p.brand)) &&
        (cats.length === 0 || cats.includes(p.category)) &&
        (sizes.length === 0 || p.sizes.some((s) => sizes.includes(s))) &&
        p.price <= maxPrice,
    );
    const sorted = [...list];
    if (sort === "Menor preço") sorted.sort((a, b) => a.price - b.price);
    else if (sort === "Maior preço") sorted.sort((a, b) => b.price - a.price);
    else if (sort === "Maior desconto")
      sorted.sort((a, b) => (b.old ? (b.old - b.price) / b.old : 0) - (a.old ? (a.old - a.price) / a.old : 0));
    else if (sort === "Novidades") sorted.sort((a, b) => (a.tag === "Novo" ? -1 : 1) - (b.tag === "Novo" ? -1 : 1));
    return sorted;
  }, [brands, cats, sizes, maxPrice, sort]);

  const toggle = <T,>(arr: T[], v: T, set: (x: T[]) => void) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const activeCount = brands.length + cats.length + sizes.length + (maxPrice < 1600 ? 1 : 0);

  const Sidebar = (
    <aside className="space-y-6">
      <FilterGroup title="Categoria">
        {CATEGORIES.map((c) => (
          <CheckRow key={c} label={c} checked={cats.includes(c)} onChange={() => toggle(cats, c, setCats)} />
        ))}
      </FilterGroup>
      <FilterGroup title="Marca">
        {BRANDS.map((b) => (
          <CheckRow key={b} label={b} checked={brands.includes(b)} onChange={() => toggle(brands, b, setBrands)} />
        ))}
      </FilterGroup>
      <FilterGroup title="Tamanho">
        <div className="grid grid-cols-4 gap-2">
          {SIZES.map((s) => {
            const on = sizes.includes(s);
            return (
              <button
                key={s}
                onClick={() => toggle(sizes, s, setSizes)}
                className={`h-10 rounded-md border text-sm font-semibold transition ${
                  on
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:border-primary/60"
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </FilterGroup>
      <FilterGroup title="Preço">
        <div className="space-y-3">
          <input
            type="range"
            min={200}
            max={1600}
            step={50}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>R$ 200</span>
            <span className="font-semibold text-foreground">até {brl(maxPrice)}</span>
          </div>
        </div>
      </FilterGroup>
      {activeCount > 0 && (
        <button
          onClick={() => {
            setBrands([]);
            setCats([]);
            setSizes([]);
            setMaxPrice(1600);
          }}
          className="w-full rounded-md border border-border py-2 text-sm font-semibold text-muted-foreground hover:border-primary hover:text-primary"
        >
          Limpar filtros ({activeCount})
        </button>
      )}
    </aside>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="border-b border-border bg-card/50">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-primary">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span>Masculino</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">Tênis</span>
        </div>
      </div>

      {/* Page header */}
      <section className="border-b border-border bg-gradient-brand">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:py-14">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary-foreground/70">Coleção Maxor</p>
          <h1 className="mt-2 font-display text-4xl font-black uppercase tracking-tight text-primary-foreground sm:text-5xl">
            Tênis Masculino
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-primary-foreground/80 sm:text-base">
            Performance com seu estilo. Corrida, basquete, casual, trail e training — curadoria com as principais marcas
            e drops exclusivos.
          </p>
        </div>
      </section>

      {/* Toolbar */}
      <div className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:flex sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex shrink-0 items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-semibold hover:border-primary lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filtros
              {activeCount > 0 && (
                <span className="rounded-full bg-primary px-1.5 text-xs text-primary-foreground">{activeCount}</span>
              )}
            </button>
            <span className="truncate text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{filtered.length}</span> produtos
            </span>
          </div>
          <label className="flex shrink-0 items-center gap-2 text-sm">
            <span className="hidden text-muted-foreground sm:inline">Ordenar por</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm font-semibold focus:border-primary focus:outline-none"
            >
              {SORTS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* Content grid */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
          <div className="hidden lg:block">{Sidebar}</div>

          <div>
            {filtered.length === 0 ? (
              <div className="grid place-items-center rounded-xl border border-dashed border-border py-24 text-center">
                <p className="text-lg font-semibold">Nenhum tênis com esses filtros</p>
                <p className="mt-1 text-sm text-muted-foreground">Ajuste os filtros pra descobrir novas opções.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                {filtered.map((p) => (
                  <ProductCard key={p.id} p={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setDrawerOpen(false)}>
          <div className="absolute inset-0 bg-foreground/50" />
          <div
            className="absolute inset-y-0 left-0 w-[85%] max-w-sm overflow-y-auto bg-background p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-black uppercase">Filtros</h2>
              <button onClick={() => setDrawerOpen(false)} className="rounded-md p-1 hover:bg-muted">
                <X className="h-5 w-5" />
              </button>
            </div>
            {Sidebar}
            <button
              onClick={() => setDrawerOpen(false)}
              className="mt-6 w-full rounded-md bg-gradient-brand py-3 text-sm font-bold uppercase text-primary-foreground shadow-brand-glow"
            >
              Ver {filtered.length} produtos
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="mb-3 font-display text-sm font-black uppercase tracking-wider">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function CheckRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm hover:text-primary">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-border accent-primary"
      />
      <span className={checked ? "font-semibold text-foreground" : "text-muted-foreground"}>{label}</span>
    </label>
  );
}

function ProductCard({ p }: { p: Product }) {
  const off = p.old ? Math.round(((p.old - p.price) / p.old) * 100) : 0;
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition hover:border-primary/60 hover:shadow-brand-glow">
      {p.tag && (
        <span className="absolute left-3 top-3 z-10 rounded-full bg-gradient-brand px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-primary-foreground">
          {p.tag}
        </span>
      )}
      <button
        aria-label="Favoritar"
        className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-background/80 text-muted-foreground backdrop-blur hover:text-primary"
      >
        <Heart className="h-4 w-4" />
      </button>
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={p.img}
          alt={p.name}
          className="h-full w-full scale-[1.05] object-contain object-center transition duration-500 group-hover:scale-[1.12]"
          loading="lazy"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{p.brand}</p>
        <h3 className="line-clamp-2 text-sm font-semibold leading-tight">{p.name}</h3>
        <div className="mt-auto space-y-1">
          {p.old && <p className="text-xs text-muted-foreground line-through">{brl(p.old)}</p>}
          <div className="flex items-baseline gap-2">
            <p className="font-display text-lg font-black text-foreground">{brl(p.price)}</p>
            {off > 0 && <span className="text-xs font-bold text-primary">-{off}%</span>}
          </div>
          <p className="text-[11px] text-muted-foreground">ou 10x de {brl(p.price / 10)}</p>
        </div>
        <div className="flex items-center gap-1 pt-2">
          {p.colors.slice(0, 4).map((c, i) => (
            <span
              key={i}
              className="h-4 w-4 rounded-full border border-border"
              style={{ background: c }}
              aria-hidden
            />
          ))}
          {p.colors.length > 4 && (
            <span className="text-[10px] text-muted-foreground">+{p.colors.length - 4}</span>
          )}
        </div>
      </div>
    </article>
  );
}
