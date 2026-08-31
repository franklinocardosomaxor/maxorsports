import { useSyncExternalStore } from "react";
import { Link } from "@tanstack/react-router";
import { LayoutGrid, Grid3x3, List } from "lucide-react";
import { brl } from "@/lib/catalog";
import type { CatalogProduct } from "./CatalogPage";

/**
 * Modo de visualização das vitrines de produtos — compartilhado por TODO o
 * site (CatalogPage, categorias, lançamentos, destaques, mais-vendidos,
 * catálogo). A escolha fica salva no navegador e se aplica a todas as páginas.
 */
export type ViewMode = "grid-lg" | "grid-sm" | "list";

const KEY = "maxor-view-mode";
const listeners = new Set<() => void>();

function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  window.addEventListener("storage", fn);
  return () => {
    listeners.delete(fn);
    window.removeEventListener("storage", fn);
  };
}

function getSnapshot(): ViewMode {
  try {
    const v = localStorage.getItem(KEY);
    if (v === "list" || v === "grid-sm" || v === "grid-lg") return v;
  } catch {
    /* storage indisponível */
  }
  return "grid-lg";
}

const getServerSnapshot = (): ViewMode => "grid-lg";

export function setViewMode(mode: ViewMode) {
  try {
    localStorage.setItem(KEY, mode);
  } catch {
    /* storage indisponível */
  }
  listeners.forEach((fn) => fn());
}

/** Modo atual de visualização das grades de produto (reativo + persistido). */
export function useViewMode(): ViewMode {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Classes do container da grade/lista conforme o modo escolhido. */
export function viewModeContainerClass(mode: ViewMode): string {
  if (mode === "list") return "flex flex-col gap-3";
  if (mode === "grid-sm")
    return "grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6";
  return "grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-6";
}

const MODES: { id: ViewMode; label: string; Icon: typeof List }[] = [
  { id: "list", label: "Lista", Icon: List },
  { id: "grid-lg", label: "Ícones grandes", Icon: LayoutGrid },
  { id: "grid-sm", label: "Ícones pequenos", Icon: Grid3x3 },
];

/** Seletor Lista / Ícones grandes / Ícones pequenos. */
export function ViewModeToggle() {
  const mode = useViewMode();
  return (
    <div
      role="group"
      aria-label="Modo de visualização dos produtos"
      className="flex items-center overflow-hidden rounded-md border border-border"
    >
      {MODES.map(({ id, label, Icon }) => {
        const on = mode === id;
        return (
          <button
            key={id}
            type="button"
            title={label}
            aria-label={label}
            aria-pressed={on}
            onClick={() => setViewMode(id)}
            className={`grid h-9 w-9 place-items-center transition ${
              on
                ? "bg-[color:var(--cyan-brand)] text-navy"
                : "bg-transparent text-muted-foreground hover:text-offwhite"
            }`}
          >
            <Icon className="h-4 w-4" />
          </button>
        );
      })}
    </div>
  );
}

/** Linha horizontal de produto usada no modo "Lista". */
export function ProductListRow({ product }: { product: CatalogProduct }) {
  const discount = product.old ? Math.round((1 - product.price / product.old) * 100) : 0;
  return (
    <Link
      to="/produto/$id"
      params={{ id: product.id }}
      className="group flex items-center gap-4 rounded-xl border border-border bg-card p-3 transition hover:border-[color:var(--cyan-brand)] hover:shadow-lg"
    >
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-navy sm:h-24 sm:w-24">
        {product.tag && (
          <span className="absolute left-1 top-1 z-10 rounded-full bg-[color:var(--lime-brand)] px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-navy">
            {product.tag}
          </span>
        )}
        <img
          src={product.img}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-contain object-center transition duration-300 group-hover:scale-110"
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          {product.brand} · {product.category}
        </div>
        <div className="truncate font-display text-sm font-bold uppercase tracking-wide text-offwhite sm:text-base">
          {product.name}
        </div>
        {product.colors.length > 0 && (
          <div className="mt-1 flex gap-1.5" title={product.colorVariant ?? undefined}>
            {product.colors.slice(0, 5).map((c, i) => (
              <span
                key={`${c}-${i}`}
                className="h-3 w-3 rounded-full border border-black/10"
                style={{ background: c }}
                aria-hidden
              />
            ))}
          </div>
        )}
      </div>
      <div className="shrink-0 text-right">
        {product.old && (
          <div className="text-xs text-muted-foreground line-through">{brl(product.old)}</div>
        )}
        <div className="font-display text-base font-black text-[color:var(--cyan-brand)] sm:text-lg">
          {brl(product.price)}
        </div>
        {discount > 0 && (
          <span className="mt-0.5 inline-block rounded bg-[color:var(--cyan-brand)] px-1.5 py-0.5 text-[10px] font-bold text-navy">
            -{discount}%
          </span>
        )}
      </div>
    </Link>
  );
}
