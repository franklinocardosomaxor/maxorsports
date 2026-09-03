import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight, SlidersHorizontal, Heart, X } from "lucide-react";
import { Shell } from "./Shell";
import { useInstallments } from "@/hooks/use-site-settings";
import { ViewModeToggle, ProductListRow, useViewMode, viewModeContainerClass } from "./view-mode";

export type CatalogProduct = {
  id: string;
  name: string;
  brand: string;
  /** Categoria do produto (campo do cadastro no CRM). */
  category: string;
  price: number;
  old?: number;
  tag?: string;
  img: string;
  /** Galeria de fotos cadastradas no CRM (a primeira é a capa). */
  images?: string[];
  colors: string[];
  /** Nome da variação de cor cadastrada no CRM (ex.: "Rosa Claro / Rosa Escuro"). */
  colorVariant?: string;
  sizes: number[];
  /** Checkbox "Lançamento" do cadastro do produto no CRM. */
  launch?: boolean;
};


export type CatalogTheme = {
  eyebrow: string; // "Coleção Maxor"
  title: string; // "Tênis Masculino"
  subtitle: string;
  headerGradient: string; // css background-image
  accent: "cyan" | "mint" | "lime";
};

const SORTS = ["Mais relevantes", "Menor preço", "Maior preço", "Novidades", "Maior desconto"] as const;
type Sort = (typeof SORTS)[number];

const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const ACCENT_VAR: Record<CatalogTheme["accent"], string> = {
  cyan: "var(--cyan-brand)",
  mint: "var(--mint)",
  lime: "var(--lime-brand)",
};

export function CatalogPage({
  activeNav,
  breadcrumb,
  theme,
  products,
  brands,
  categories,
  sizes: SIZE_OPTIONS,
}: {
  activeNav: string;
  breadcrumb: string[];
  theme: CatalogTheme;
  products: CatalogProduct[];
  brands: string[];
  categories: string[];
  sizes: number[];
}) {
  const [selBrands, setBrands] = useState<string[]>([]);
  const [selCats, setCats] = useState<string[]>([]);
  const [selSizes, setSizes] = useState<number[]>([]);
  const [maxPrice, setMaxPrice] = useState(1600);
  const [sort, setSort] = useState<Sort>("Mais relevantes");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const viewMode = useViewMode();

  const accentColor = ACCENT_VAR[theme.accent];

  const filtered = useMemo(() => {
    const list = products.filter(
      (p) =>
        (selBrands.length === 0 || selBrands.includes(p.brand)) &&
        (selCats.length === 0 || selCats.includes(p.category)) &&
        (selSizes.length === 0 || p.sizes.some((s) => selSizes.includes(s))) &&
        p.price <= maxPrice,
    );
    const sorted = [...list];
    if (sort === "Menor preço") sorted.sort((a, b) => a.price - b.price);
    else if (sort === "Maior preço") sorted.sort((a, b) => b.price - a.price);
    else if (sort === "Maior desconto")
      sorted.sort(
        (a, b) =>
          (b.old ? (b.old - b.price) / b.old : 0) - (a.old ? (a.old - a.price) / a.old : 0),
      );
    else if (sort === "Novidades")
      sorted.sort((a, b) => (a.tag === "Novo" ? -1 : 1) - (b.tag === "Novo" ? -1 : 1));
    return sorted;
  }, [products, selBrands, selCats, selSizes, maxPrice, sort]);

  const toggle = <T,>(arr: T[], v: T, set: (x: T[]) => void) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const activeCount =
    selBrands.length + selCats.length + selSizes.length + (maxPrice < 1600 ? 1 : 0);

  const Sidebar = (
    <aside className="space-y-6">
      <FilterGroup title="Categoria" accent={accentColor}>
        {categories.map((c) => (
          <CheckRow
            key={c}
            label={c}
            checked={selCats.includes(c)}
            onChange={() => toggle(selCats, c, setCats)}
          />
        ))}
      </FilterGroup>
      <FilterGroup title="Marca" accent={accentColor}>
        {brands.map((b) => (
          <CheckRow
            key={b}
            label={b}
            checked={selBrands.includes(b)}
            onChange={() => toggle(selBrands, b, setBrands)}
          />
        ))}
      </FilterGroup>
      <FilterGroup title="Tamanho" accent={accentColor}>
        <div className="grid grid-cols-4 gap-2">
          {SIZE_OPTIONS.map((s) => {
            const on = selSizes.includes(s);
            return (
              <button
                key={s}
                onClick={() => toggle(selSizes, s, setSizes)}
                className="h-10 rounded-md border text-sm font-semibold transition"
                style={
                  on
                    ? { background: accentColor, borderColor: accentColor, color: "var(--navy)" }
                    : undefined
                }
              >
                {s}
              </button>
            );
          })}
        </div>
      </FilterGroup>
      <FilterGroup title="Preço" accent={accentColor}>
        <div className="space-y-3">
          <input
            type="range"
            min={200}
            max={1600}
            step={50}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full"
            style={{ accentColor }}
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
          className="w-full rounded-md border border-border py-2 text-sm font-semibold text-muted-foreground hover:text-offwhite"
          style={{ borderColor: accentColor, color: accentColor }}
        >
          Limpar filtros ({activeCount})
        </button>
      )}
    </aside>
  );

  return (
    <Shell active={activeNav}>
      {/* Breadcrumb */}
      <div className="border-b border-white/10 bg-navy">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[color:var(--lime-brand)]">
          <Link to="/" className="hover:brightness-110">
            Home
          </Link>
          {breadcrumb.map((b, i) => (
            <span key={b} className="flex items-center gap-2">
              <ChevronRight className="h-3 w-3 text-[color:var(--lime-brand)]/60" />
              <span className={i === breadcrumb.length - 1 ? "text-offwhite" : "text-[color:var(--lime-brand)]"}>{b}</span>
            </span>
          ))}
        </div>
      </div>


      {/* Page header */}
      <section
        className="relative overflow-hidden border-b border-border"
        style={{ backgroundImage: theme.headerGradient }}
      >
        <div
          className="absolute inset-0 opacity-30 mix-blend-overlay"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.4), transparent 50%), radial-gradient(circle at 80% 70%, rgba(0,0,0,0.35), transparent 55%)",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:py-16">
          <p
            className="text-xs font-black uppercase tracking-[0.35em]"
            style={{ color: accentColor }}
          >
            {theme.eyebrow}
          </p>
          <h1 className="mt-2 font-display text-4xl font-black uppercase tracking-tight text-offwhite sm:text-5xl md:text-6xl">
            {theme.title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-offwhite/80 sm:text-base">{theme.subtitle}</p>
          <div className="mt-6 flex items-center gap-3">
            <span
              className="inline-block h-1 w-16 rounded-full"
              style={{ background: accentColor }}
            />
            <span className="font-display text-xs uppercase tracking-widest text-offwhite/60">
              {products.length} modelos na coleção
            </span>
          </div>
        </div>
      </section>

      {/* Toolbar */}
      <div className="sticky top-[65px] z-20 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-3 py-2 sm:justify-between sm:gap-3 sm:px-4 sm:py-3">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex shrink-0 items-center gap-1.5 rounded-md border border-border px-2.5 py-2 text-sm font-semibold lg:hidden"
              style={{ borderColor: accentColor, color: accentColor }}
            >
              <SlidersHorizontal className="h-4 w-4 shrink-0" />
              <span>Filtros</span>
              {activeCount > 0 && (
                <span
                  className="rounded-full px-1.5 text-xs text-offwhite"
                  style={{ background: accentColor }}
                >
                  {activeCount}
                </span>
              )}
            </button>
            <span className="truncate text-xs text-muted-foreground sm:text-sm">
              <span className="font-semibold text-foreground">{filtered.length}</span> produtos
            </span>
          </div>
          <div className="flex w-full shrink-0 items-center justify-between gap-2 sm:w-auto sm:justify-end sm:gap-3">
            <ViewModeToggle />
            <label className="flex min-w-0 items-center gap-2 text-sm">
              <span className="hidden text-muted-foreground sm:inline">Ordenar por</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                className="min-w-0 max-w-[52vw] truncate rounded-md border border-border bg-background px-2 py-2 text-xs font-semibold focus:outline-none sm:max-w-none sm:px-3 sm:text-sm"
                style={{ borderColor: accentColor }}
              >
                {SORTS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
          </div>
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
                <p className="mt-1 text-sm text-muted-foreground">
                  Ajuste os filtros pra descobrir novas opções.
                </p>
              </div>
            ) : (
              <div className={viewModeContainerClass(viewMode)}>
                {filtered.map((p) =>
                  viewMode === "list" ? (
                    <ProductListRow key={p.id} product={p} />
                  ) : (
                    <ProductCard key={p.id} p={p} accent={accentColor} />
                  ),
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setDrawerOpen(false)}>
          <div className="absolute inset-0 bg-navy/70" />
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
              className="mt-6 w-full rounded-full py-3 text-sm font-bold uppercase tracking-widest text-offwhite"
              style={{ background: accentColor }}
            >
              Ver {filtered.length} produtos
            </button>
          </div>
        </div>
      )}
    </Shell>
  );
}

function FilterGroup({
  title,
  accent,
  children,
}: {
  title: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3
        className="mb-3 font-display text-sm font-black uppercase tracking-widest"
        style={{ color: accent }}
      >
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function CheckRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm hover:text-offwhite">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-border accent-[color:var(--cyan-brand)]"
      />
      <span className={checked ? "font-semibold text-foreground" : "text-muted-foreground"}>
        {label}
      </span>
    </label>
  );
}

function ProductCard({ p, accent }: { p: CatalogProduct; accent: string }) {
  const parcelas = useInstallments();
  const off = p.old ? Math.round(((p.old - p.price) / p.old) * 100) : 0;
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition hover:-translate-y-1 hover:shadow-xl">
      {p.tag && (
        <span
          className="absolute left-3 top-3 z-10 rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-offwhite"
          style={{ background: accent }}
        >
          {p.tag}
        </span>
      )}
      <button
        aria-label="Favoritar"
        className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-background/80 text-muted-foreground backdrop-blur hover:text-offwhite"
      >
        <Heart className="h-4 w-4" />
      </button>
      <Link to="/produto/$id" params={{ id: p.id }} className="relative aspect-square overflow-hidden bg-secondary/50">
        <img
          src={p.img}
          alt={p.name}
          className="h-full w-full scale-[1.05] object-contain object-center transition duration-500 group-hover:scale-[1.12]"
          loading="lazy"
        />
      </Link>
      <Link to="/produto/$id" params={{ id: p.id }} className="flex flex-1 flex-col gap-2 p-4">
        <p
          className="text-[10px] font-bold uppercase tracking-widest"
          style={{ color: accent }}
        >
          {p.brand}
        </p>
        <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-offwhite">{p.name}</h3>
        <div className="mt-auto space-y-1">
          {p.old && <p className="text-xs text-muted-foreground line-through">{brl(p.old)}</p>}
          <div className="flex items-baseline gap-2">
            <p className="font-display text-lg font-black text-offwhite">{brl(p.price)}</p>
            {off > 0 && (
              <span
                className="rounded px-1.5 py-0.5 text-[10px] font-black text-offwhite"
                style={{ background: accent }}
              >
                -{off}%
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground">ou {parcelas}x de {brl(p.price / parcelas)}</p>
        </div>
        {p.colors.length > 0 && (
          <div className="flex items-center gap-1 pt-2" title={p.colorVariant ?? undefined}>
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
        )}
      </Link>
    </article>
  );
}
