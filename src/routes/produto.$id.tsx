import { createFileRoute, Link, notFound, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { listMyFavoriteIds, toggleFavorite } from "@/lib/favorites.functions";
import { ChevronRight, Heart, ShieldCheck, Truck, RotateCw } from "lucide-react";
import { Shell } from "@/components/site/Shell";
import { brl, type ProductWithSection } from "@/lib/catalog";
import { swatchBackground } from "@/lib/color-swatches";
import { getProductPageData } from "@/lib/product-page.functions";
import { useCart } from "@/lib/cart";
import { useInstallments } from "@/hooks/use-site-settings";

const WHATSAPP_NUMBER = "5577999599009";

export const Route = createFileRoute("/produto/$id")({
  // O loader roda no servidor (SSR) e busca o produto direto no banco —
  // acesso direto, reload e links compartilhados não dependem mais do
  // catálogo em memória do cliente (que só é populado após a hidratação).
  loader: async ({ params }): Promise<{ product: ProductWithSection; variants: ProductWithSection[] }> => {
    const data = await getProductPageData({ data: { id: params.id } });
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [{ title: "Produto — Maxor Sports" }] };
    const { product } = loaderData;
    const title = `${product.name} — ${product.brand} | Maxor Sports`;
    const url = `https://maxorsports.lovable.app/produto/${params.id}`;
    const imgAbs = product.img
      ? product.img.startsWith("http")
        ? product.img
        : `https://maxorsports.lovable.app${product.img}`
      : undefined;
    return {
      meta: [
        { title },
        { name: "description", content: `${product.name} da ${product.brand}. ${product.category} com curadoria Maxor Sports.` },
        { property: "og:title", content: title },
        { property: "og:description", content: `${product.brand} · ${product.category} · a partir de ${brl(product.price)}.` },
        { property: "og:type", content: "product" },
        { property: "og:url", content: url },
        ...(imgAbs
          ? [
              { property: "og:image", content: imgAbs },
              { name: "twitter:image", content: imgAbs },
            ]
          : []),
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },

  notFoundComponent: ProductNotFound,
  errorComponent: ProductError,
  component: ProductPage,
});

function ProductNotFound() {
  return (
    <Shell active="">
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-[color:var(--cyan-brand)]">Erro 404</p>
        <h1 className="mt-3 font-display text-3xl font-black uppercase text-offwhite">Produto não encontrado</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Este tênis pode ter saído da vitrine ou o link está incorreto.
        </p>
        <Link
          to="/catalogo"
          className="mt-8 inline-block rounded-xl bg-[color:var(--cyan-brand)] px-6 py-3 font-display text-sm font-black uppercase tracking-widest text-navy transition hover:brightness-110"
        >
          Explorar catálogo
        </Link>
      </div>
    </Shell>
  );
}

function ProductError({ reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <Shell active="">
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-black uppercase text-offwhite">
          Não foi possível carregar o produto
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Falha ao sincronizar com o catálogo do CRM. Tente novamente.
        </p>
        <button
          type="button"
          onClick={() => {
            void router.invalidate();
            reset();
          }}
          className="mt-8 rounded-xl bg-[color:var(--cyan-brand)] px-6 py-3 font-display text-sm font-black uppercase tracking-widest text-navy transition hover:brightness-110"
        >
          Tentar novamente
        </button>
      </div>
    </Shell>
  );
}

function ProductPage() {
  const { product, variants } = Route.useLoaderData() as { product: ProductWithSection; variants: ProductWithSection[] };
  const navigate = useNavigate();
  const cart = useCart();
  const parcelas = useInstallments();

  const [selectedColor, setSelectedColor] = useState<string>(product.colors[0] ?? "#000");
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [sizeErr, setSizeErr] = useState(false);

  /** Galeria: fotos cadastradas no CRM (fallback: foto de capa). */
  const gallery = (product.images?.length ? product.images : [product.img]).filter(Boolean) as string[];
  const [activeImg, setActiveImg] = useState(gallery[0]);
  // Ao trocar de cor (outra variação), recarrega foto, cor e numeração da variação escolhida.
  useEffect(() => {
    setActiveImg(gallery[0]);
    setSelectedColor(product.colors[0] ?? "#000");
    setSelectedSize((prev) => (prev && product.sizes.includes(prev) ? prev : null));
    setSizeErr(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

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
              <FavoriteButton product={product} />

              <div className="aspect-square">
                <img src={activeImg} alt={product.name} width={800} height={800} decoding="async" fetchPriority="high" className="h-full w-full object-contain p-6" />
              </div>
            </div>
            {/* Galeria de fotos do produto (CRM) */}
            {gallery.length > 1 && (
              <div className="mt-4 grid grid-cols-5 gap-2">
                {gallery.slice(0, 10).map((src) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setActiveImg(src)}
                    aria-label="Ver foto do produto"
                    className={`overflow-hidden rounded-lg border bg-card p-1 transition ${
                      src === activeImg ? "border-[color:var(--cyan-brand)] ring-2 ring-[color:var(--cyan-brand)]" : "border-border hover:border-[color:var(--cyan-brand)]"
                    }`}
                  >
                    <img src={src} alt={product.name} loading="lazy" decoding="async" className="aspect-square w-full object-contain" />
                  </button>
                ))}
              </div>
            )}
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
                à vista no PIX · ou em {parcelas}x de {brl(product.price / parcelas)} sem juros
              </p>
            </div>

            {/* Variantes de cor */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-display text-sm font-black uppercase tracking-widest text-offwhite">
                  {variants.length > 1 ? `Cores disponíveis (${variants.length})` : "Cor"}
                </h3>
                <span className="text-xs text-muted-foreground">
                  {variants.find((v) => v.id === product.id)?.colorVariant ?? "Modelo selecionado"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {variants.map((v) => {
                  const isCurrent = v.id === product.id;
                  const swatch = swatchBackground(v.colors);
                  return (
                    <Link
                      key={v.id}
                      to="/produto/$id"
                      params={{ id: v.id }}
                      title={v.colorVariant ?? v.name}
                      className={`group grid grid-cols-[3rem_minmax(0,1fr)] items-center gap-3 rounded-xl border p-2 text-xs font-semibold transition ${
                        isCurrent
                          ? "border-[color:var(--cyan-brand)] bg-navy text-offwhite ring-1 ring-[color:var(--cyan-brand)]"
                          : "border-border bg-card hover:border-[color:var(--cyan-brand)]"
                      }`}
                    >
                      <span className="relative block aspect-square overflow-hidden rounded-lg border border-border bg-background">
                        <img src={v.img} alt={v.colorVariant ?? v.name} loading="lazy" decoding="async" className="h-full w-full object-contain p-1" />
                        {swatch && (
                          <span
                            className="absolute bottom-1 right-1 h-4 w-4 rounded-full border border-border"
                            style={{ background: swatch }}
                            aria-hidden
                          />
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-offwhite">{v.colorVariant ?? "Cor disponível"}</span>
                        <span className="mt-0.5 block truncate text-[10px] font-medium text-muted-foreground">{v.name}</span>
                      </span>
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
                        selectedColor === c ? "border-offwhite ring-2 ring-[color:var(--cyan-brand)]" : "border-border"
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
                          : "border-border bg-card hover:border-[color:var(--cyan-brand)]"
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
                className="flex-1 rounded-full bg-[color:var(--cyan-brand)] py-4 text-sm font-black uppercase tracking-widest text-navy transition hover:brightness-110"
              >
                Comprar agora
              </button>
              <button
                onClick={() => doAdd(false)}
                className="flex-1 rounded-full border-2 border-[color:var(--lime-brand)] py-4 text-sm font-black uppercase tracking-widest text-[color:var(--lime-brand)] transition hover:bg-[color:var(--lime-brand)] hover:text-navy"
              >
                Adicionar à sacola
              </button>
            </div>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-center text-xs font-bold uppercase tracking-widest text-white hover:brightness-110 sm:text-sm"
            >
              Falar sobre esse modelo no WhatsApp
            </a>

            {/* Descrição */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="font-display text-sm font-black uppercase tracking-widest text-offwhite">Sobre o produto</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                O <strong>{product.name}</strong> da {product.brand} é a escolha certa para {product.category.toLowerCase()}.
                Curadoria Maxor Sports: importado sob demanda direto da fonte, Garantia Premium e atendimento
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

function FavoriteButton({ product }: { product: ProductWithSection }) {
  const navigate = useNavigate();
  const loadIds = useServerFn(listMyFavoriteIds);
  const toggle = useServerFn(toggleFavorite);
  const [signedIn, setSignedIn] = useState(false);
  const [fav, setFav] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!alive || !data.session) return;
      setSignedIn(true);
      try {
        const ids = await loadIds();
        if (alive) setFav(ids.includes(product.id));
      } catch { /* ignore */ }
    });
    return () => { alive = false; };
  }, [loadIds, product.id]);

  async function onClick() {
    if (!signedIn) { navigate({ to: "/login" }); return; }
    setBusy(true);
    try {
      const r = await toggle({
        data: {
          product_id: product.id,
          name: product.name,
          brand: product.brand,
          img: product.img,
          price: product.price,
        },
      });
      setFav(r.favorited);
    } catch { /* ignore */ } finally { setBusy(false); }
  }

  return (
    <button
      onClick={onClick}
      disabled={busy}
      aria-label={fav ? "Remover dos favoritos" : "Favoritar"}
      title={signedIn ? (fav ? "Remover dos favoritos" : "Salvar na minha biblioteca") : "Entre para favoritar"}
      className={`absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-navy/90 shadow transition hover:brightness-110 disabled:opacity-60 ${
        fav ? "text-[color:var(--lime-brand)]" : "text-muted-foreground hover:text-offwhite"
      }`}
    >
      <Heart className={`h-5 w-5 ${fav ? "fill-current" : ""}`} />
    </button>
  );
}
