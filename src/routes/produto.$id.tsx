import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronRight, Heart, ShieldCheck, Truck, RotateCw } from "lucide-react";
import { Shell } from "@/components/site/Shell";
import { getProduct, getVariants, brl, type ProductWithSection } from "@/lib/catalog";
import { useCart } from "@/lib/cart";

const WHATSAPP_NUMBER = "5577999599009";

export const Route = createFileRoute("/produto/$id")({
  loader: ({ params }): { product: ProductWithSection; variants: ProductWithSection[] } => {
    const product = getProduct(params.id);
    if (!product) throw notFound();
    return { product, variants: getVariants(product) };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Produto — Maxor Sports" }] };
    const { product } = loaderData;
    const title = `${product.name} — ${product.brand} | Maxor Sports`;
    return {
      meta: [
        { title },
        { name: "description", content: `${product.name} da ${product.brand}. ${product.category} com curadoria Maxor Sports.` },
        { property: "og:title", content: title },
        { property: "og:description", content: `${product.brand} · ${product.category} · a partir de ${brl(product.price)}.` },
        { property: "og:image", content: product.img },
        { name: "twitter:image", content: product.img },
      ],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { product, variants } = Route.useLoaderData() as { product: ProductWithSection; variants: ProductWithSection[] };
  const navigate = useNavigate();
  const cart = useCart();

  const [selectedColor, setSelectedColor] = useState<string>(product.colors[0] ?? "#000");
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [sizeErr, setSizeErr] = useState(false);

  const off = product.old ? Math.round(((product.old - product.price) / product.old) * 100) : 0;

  const doAdd = (redirectToCheckout: boolean) => {
    if (!selectedSize) {
      setSizeErr(true);
      return;
    }
    cart.add({
      productId: product.id,
      name: product.name,
      brand: product.brand,
      img: product.img,
      color: selectedColor,
      size: selectedSize,
      price: product.price,
    });
    if (redirectToCheckout) navigate({ to: "/checkout" });
  };

  const waHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Olá Maxor! Tenho interesse no ${product.name} (${product.brand})${selectedSize ? ` — tamanho ${selectedSize}` : ""}. Podem me ajudar?`,
  )}`;

  return (
    <Shell active="">
      {/* Breadcrumb */}
      <div className="border-b border-white/10 bg-navy">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[color:var(--lime-brand)]">
          <Link to="/" className="hover:brightness-110">Home</Link>
          <ChevronRight className="h-3 w-3 opacity-60" />
          <span className="text-[color:var(--lime-brand)]">{product.brand}</span>
          <ChevronRight className="h-3 w-3 opacity-60" />
          <span className="text-offwhite">{product.name}</span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          {/* Gallery */}
          <div>
            <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
              {product.tag && (
                <span className="absolute left-4 top-4 z-10 rounded-full bg-[color:var(--lime-brand)] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-navy">
                  {product.tag}
                </span>
              )}
              <button
                aria-label="Favoritar"
                className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-navy/90 text-muted-foreground shadow hover:text-offwhite"
              >
                <Heart className="h-5 w-5" />
              </button>
              <div className="aspect-square">
                <img src={product.img} alt={product.name} width={800} height={800} decoding="async" fetchPriority="high" className="h-full w-full object-contain p-6" />
              </div>
            </div>
            {/* Thumbnails de variantes (mostra outras cores como galeria) */}
            {variants.length > 1 && (
              <div className="mt-4 grid grid-cols-5 gap-2">
                {variants.slice(0, 5).map((v) => (
                  <Link
                    key={v.id}
                    to="/produto/$id"
                    params={{ id: v.id }}
                    className={`overflow-hidden rounded-lg border bg-card p-1 transition ${
                      v.id === product.id ? "border-[color:var(--cyan-brand)] ring-2 ring-[color:var(--cyan-brand)]" : "border-border hover:border-[color:var(--cyan-brand)]"
                    }`}
                  >
                    <img src={v.img} alt={v.name} loading="lazy" decoding="async" className="aspect-square w-full object-contain" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-[color:var(--cyan-brand)]">{product.brand}</p>
              <h1 className="mt-2 font-display text-3xl font-black uppercase leading-tight text-offwhite md:text-4xl">
                {product.name}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">{product.category}</p>
            </div>

            {/* Preço */}
            <div className="rounded-xl border border-border bg-card p-5">
              {product.old && (
                <p className="text-sm text-muted-foreground line-through">de {brl(product.old)}</p>
              )}
              <div className="flex items-baseline gap-3">
                <p className="font-display text-4xl font-black text-offwhite">{brl(product.price)}</p>
                {off > 0 && (
                  <span className="rounded-md bg-[color:var(--lime-brand)] px-2 py-1 text-xs font-black text-navy">
                    -{off}%
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                à vista no PIX · ou em 10x de {brl(product.price / 10)} sem juros
              </p>
            </div>

            {/* Variantes de cor */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-display text-sm font-black uppercase tracking-widest text-offwhite">
                  {variants.length > 1 ? `Cores disponíveis (${variants.length})` : "Cor"}
                </h3>
                <span className="text-xs text-muted-foreground">
                  {variants.find((v) => v.id === product.id)?.name}
                </span>
              </div>
              <div className="flex flex-wrap gap-3">
                {variants.map((v) => {
                  const isCurrent = v.id === product.id;
                  const swatch = v.colors[0] ?? "#111";
                  return (
                    <Link
                      key={v.id}
                      to="/produto/$id"
                      params={{ id: v.id }}
                      title={v.name}
                      className={`group flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                        isCurrent
                          ? "border-[color:var(--cyan-brand)] bg-navy text-offwhite"
                          : "border-border bg-card hover:border-navy"
                      }`}
                    >
                      <span
                        className="h-5 w-5 rounded-full border border-black/10"
                        style={{ background: swatch }}
                        aria-hidden
                      />
                      <span className="max-w-[10rem] truncate">{v.name}</span>
                    </Link>
                  );
                })}
              </div>
              {/* Swatches secundários (variações internas de cor do próprio SKU) */}
              {product.colors.length > 1 && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Detalhes:</span>
                  {product.colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      aria-label={`Cor ${c}`}
                      className={`h-6 w-6 rounded-full border transition ${
                        selectedColor === c ? "border-navy ring-2 ring-[color:var(--cyan-brand)]" : "border-border"
                      }`}
                      style={{ background: c }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Tamanhos */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-display text-sm font-black uppercase tracking-widest text-offwhite">Tamanho</h3>
                <span className="text-xs text-muted-foreground">Numeração BR</span>
              </div>
              <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
                {product.sizes.map((s) => {
                  const on = selectedSize === s;
                  return (
                    <button
                      key={s}
                      onClick={() => {
                        setSelectedSize(s);
                        setSizeErr(false);
                      }}
                      className={`h-11 rounded-md border text-sm font-bold transition ${
                        on
                          ? "border-[color:var(--cyan-brand)] bg-[color:var(--cyan-brand)] text-navy"
                          : "border-border bg-card hover:border-navy"
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
              {sizeErr && (
                <p className="mt-2 text-xs font-semibold text-red-500">Selecione um tamanho antes de continuar.</p>
              )}
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                onClick={() => doAdd(true)}
                className="flex-1 rounded-full bg-navy py-4 text-sm font-black uppercase tracking-widest text-[color:var(--lime-brand)] transition hover:brightness-110"
              >
                Comprar agora
              </button>
              <button
                onClick={() => doAdd(false)}
                className="flex-1 rounded-full border-2 border-navy py-4 text-sm font-black uppercase tracking-widest text-offwhite transition hover:bg-navy hover:text-offwhite"
              >
                Adicionar à sacola
              </button>
            </div>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-full bg-[#25D366] py-3 text-sm font-bold uppercase tracking-widest text-white hover:brightness-110"
            >
              Falar sobre esse modelo no WhatsApp
            </a>

            {/* Descrição */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="font-display text-sm font-black uppercase tracking-widest text-offwhite">Sobre o produto</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                O <strong>{product.name}</strong> da {product.brand} é a escolha certa para {product.category.toLowerCase()}.
                Curadoria Maxor Sports: importado sob demanda direto da fonte, garantia de originalidade e atendimento
                pessoal com o agente Maxor até a entrega.
              </p>
              <ul className="mt-4 grid gap-2 text-xs text-offwhite sm:grid-cols-2">
                <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[color:var(--cyan-brand)]" /> Curadoria e garantia Maxor</li>
                <li className="flex items-center gap-2"><Truck className="h-4 w-4 text-[color:var(--cyan-brand)]" /> Envio para todo Brasil</li>
                <li className="flex items-center gap-2"><RotateCw className="h-4 w-4 text-[color:var(--cyan-brand)]" /> Suporte pós-venda via WhatsApp</li>
                <li className="flex items-center gap-2"><Heart className="h-4 w-4 text-[color:var(--cyan-brand)]" /> Marca: {product.brand}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
