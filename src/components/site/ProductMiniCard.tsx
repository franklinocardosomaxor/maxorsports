import { Link } from "@tanstack/react-router";
import type { ProductWithSection } from "@/lib/catalog";
import { brl } from "@/lib/catalog";

export function ProductMiniCard({ product }: { product: ProductWithSection }) {
  const discount = product.old ? Math.round((1 - product.price / product.old) * 100) : 0;
  return (
    <Link
      to="/produto/$id"
      params={{ id: product.id }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative aspect-square overflow-hidden bg-navy">
        {product.tag && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-[color:var(--lime-brand)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-navy shadow-lg shadow-black/20">
            {product.tag}
          </span>
        )}
        {discount > 0 && (
          <span className="absolute right-3 top-3 z-10 rounded-full bg-[color:var(--cyan-brand)] px-2.5 py-1 text-[10px] font-bold text-navy">
            -{discount}%
          </span>
        )}
        <img
          src={product.img}
          alt={product.name}
          loading="lazy"
          className="h-full w-full scale-[1.05] object-contain object-center transition duration-500 group-hover:scale-[1.15]"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          {product.brand} · {product.category}
        </div>
        <div className="font-display text-sm font-bold uppercase tracking-wide">{product.name}</div>
        <div className="flex gap-1.5">
          {product.colors.map((c) => (
            <span key={c} className="h-3.5 w-3.5 rounded-full border border-black/10" style={{ background: c }} />
          ))}
        </div>
        <div className="mt-auto">
          {product.old && (
            <div className="text-xs text-muted-foreground line-through">{brl(product.old)}</div>
          )}
          <div className="text-lg font-bold text-[color:var(--cyan-brand)]">{brl(product.price)}</div>
        </div>
      </div>
    </Link>
  );
}
