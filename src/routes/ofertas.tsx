import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight, Plus, Minus, ImagePlus, Sparkles, Trash2 } from "lucide-react";
import { Shell } from "@/components/site/Shell";
import { CatalogPage, type CatalogProduct } from "@/components/site/CatalogPage";
import { OFERTAS, PROMO_COMBOS, type PromoCombo } from "@/components/site/ofertas-data";
import { ALL_PRODUCTS, getSectionProducts } from "@/lib/catalog";
import { useCatalogVersion } from "@/hooks/use-crm-sync";


const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const Route = createFileRoute("/ofertas")({
  component: OfertasPage,
  head: () => ({
    meta: [
      { title: "Ofertas — Maxor Sports" },
      {
        name: "description",
        content:
          "Ofertas Maxor Sports: descontos reais em tênis de corrida, casual, trail e combos promocionais montados a dedo.",
      },
      { property: "og:title", content: "Ofertas — Maxor Sports" },
      {
        property: "og:description",
        content: "Descontos reais + combos promocionais Maxor Sports.",
      },
          { property: "og:url", content: "https://maxorsports.lovable.app/ofertas" },
],
    links: [{ rel: "canonical", href: "https://maxorsports.lovable.app/ofertas" }],
  }),
});

function OfertasPage() {
  // Re-renderiza quando o CRM sincroniza (realtime).
  useCatalogVersion();

  // Ofertas = produtos marcados como "ofertas" no CRM + qualquer produto
  // com preço antigo maior que o atual + a vitrine base local.
  const products = useMemo(() => {
    const crm = [
      ...getSectionProducts("ofertas"),
      ...ALL_PRODUCTS.filter((p) => p.old && p.old > p.price && p.section !== "ofertas"),
    ] as unknown as CatalogProduct[];
    const seen = new Set(crm.map((p) => p.id));
    return [...crm, ...OFERTAS.filter((p) => !seen.has(p.id))];
  }, []);

  const brands = useMemo(
    () => Array.from(new Set(products.map((p) => p.brand))).sort(),
    [products],
  );
  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category))).sort(),
    [products],
  );
  const sizes = useMemo(
    () => Array.from(new Set(products.flatMap((p) => p.sizes))).sort((a, b) => a - b),
    [products],
  );

  return (
    <div>
      {/* Catálogo padrão (mesmo layout de masculino/feminino/infantil) */}
      <CatalogPage
        activeNav="Ofertas"
        breadcrumb={["Ofertas"]}
        theme={{
          eyebrow: "Semana Maxor",
          title: "Ofertas Imperdíveis",
          subtitle:
            "Descontos reais nos tênis mais procurados. Combos promocionais montados a dedo para você somar itens e economizar mais.",
          headerGradient:
            "linear-gradient(120deg, #0F1720 0%, #3a2b12 55%, #C7F500 100%)",
          accent: "lime",
        }}
        products={products}
        brands={brands}
        categories={categories}
        sizes={sizes.length > 0 ? sizes : [38, 39, 40, 41, 42, 43, 44, 45]}
      />

      {/* Seção adicional: builder de combos promocionais */}
      <ComboSection />
    </div>
  );
}

/**
 * ComboSection — permite ao Franklin (agente) montar promoções somando
 * produtos com imagem, exibindo o total e um ícone de selo.
 * Pronto pra plugar no CRM: `savePromoCombo` (server fn) → tabela
 * `promo_combos` no Supabase.
 */
function ComboSection() {
  const seed = PROMO_COMBOS[0];
  const [iconUrl, setIconUrl] = useState<string>(seed?.iconUrl ?? "");
  const [title, setTitle] = useState<string>(seed?.title ?? "Novo combo promo");
  const [subtitle, setSubtitle] = useState<string>(seed?.subtitle ?? "");
  const [items, setItems] = useState<CatalogProduct[]>(
    () =>
      seed?.productIds
        .map((id) => OFERTAS.find((p) => p.id === id))
        .filter(Boolean) as CatalogProduct[],
  );
  const [overrideTotal, setOverrideTotal] = useState<string>("");

  const autoTotal = useMemo(
    () => items.reduce((s, p) => s + p.price, 0),
    [items],
  );
  const finalTotal = overrideTotal ? Number(overrideTotal) : autoTotal;

  const add = (p: CatalogProduct) => {
    if (items.find((x) => x.id === p.id)) return;
    setItems((prev) => [...prev, p]);
  };
  const remove = (id: string) => setItems((prev) => prev.filter((p) => p.id !== id));

  const handleIcon = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setIconUrl(url);
  };

  const saveCombo = () => {
    const payload: PromoCombo = {
      id: `combo-${Date.now()}`,
      title,
      subtitle,
      iconUrl,
      productIds: items.map((p) => p.id),
      overrideTotal: overrideTotal ? Number(overrideTotal) : undefined,
    };
    // TODO(CRM): substituir por server function
    //   import { savePromoCombo } from "@/lib/crm.promos.functions";
    //   await savePromoCombo({ data: payload });
    console.log("[promo-combo:payload]", payload);
    alert(
      `Combo pronto pra salvar no CRM:\n${title}\n${items.length} itens · Total ${brl(finalTotal)}`,
    );
  };

  return (
    <section className="border-t border-border bg-navy text-offwhite">
      <div className="mx-auto max-w-7xl px-4 py-14">
        <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.35em] text-[color:var(--lime-brand)]">
              Monte sua promoção
            </p>
            <h2 className="mt-2 font-display text-3xl font-black uppercase md:text-4xl">
              Combo <span className="text-gradient-brand">MX Deals</span>
            </h2>
            <p className="mt-2 max-w-xl text-sm text-offwhite/70">
              Adicione produtos ao combo, veja o total somado com o ícone
              da promoção. Depois publicamos no CRM e o cliente enxerga
              como um card único de oferta.
            </p>
          </div>
          <button
            onClick={saveCombo}
            disabled={items.length === 0}
            className="rounded-full bg-[color:var(--lime-brand)] px-6 py-3 text-sm font-black uppercase tracking-widest text-navy transition hover:brightness-110 disabled:opacity-40"
          >
            Salvar combo
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* Coluna esquerda: escolha de produtos */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="font-display text-sm font-black uppercase tracking-widest text-[color:var(--cyan-brand)]">
              Escolher produtos
            </h3>
            <p className="mt-1 text-xs text-offwhite/60">
              Clique no + pra adicionar ao combo.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
              {OFERTAS.map((p) => {
                const on = !!items.find((x) => x.id === p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => (on ? remove(p.id) : add(p))}
                    className={`group relative flex flex-col overflow-hidden rounded-xl border text-left transition ${
                      on
                        ? "border-[color:var(--lime-brand)] bg-white/10"
                        : "border-white/10 bg-white/[0.03] hover:border-[color:var(--cyan-brand)]/60"
                    }`}
                  >
                    <div className="relative aspect-square overflow-hidden bg-white/5">
                      <img
                        src={p.img}
                        alt={p.name}
                        className="h-full w-full scale-[1.05] object-contain object-center"
                        loading="lazy"
                      />
                      <span
                        className={`absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full text-offwhite transition ${
                          on
                            ? "bg-[color:var(--lime-brand)]"
                            : "bg-[color:var(--cyan-brand)]"
                        }`}
                      >
                        {on ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                      </span>
                    </div>
                    <div className="p-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--lime-brand)]">
                        {p.brand}
                      </p>
                      <p className="line-clamp-1 text-sm font-semibold text-offwhite">
                        {p.name}
                      </p>
                      <p className="mt-1 font-display text-sm font-black text-offwhite">
                        {brl(p.price)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Coluna direita: combo montado */}
          <aside className="rounded-2xl border border-[color:var(--lime-brand)]/40 bg-white/[0.04] p-5">
            <div className="flex items-center gap-3">
              <label
                className="grid h-16 w-16 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-xl border border-dashed border-[color:var(--lime-brand)]/60 bg-navy text-[color:var(--lime-brand)] hover:bg-white/5"
                title="Enviar ícone da promoção"
              >
                {iconUrl ? (
                  <img src={iconUrl} alt="Ícone da promoção" className="h-full w-full object-cover" />
                ) : (
                  <ImagePlus className="h-6 w-6" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleIcon}
                />
              </label>
              <div className="min-w-0 flex-1">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-transparent font-display text-lg font-black uppercase tracking-wider text-offwhite outline-none"
                  placeholder="Título do combo"
                />
                <input
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="mt-1 w-full bg-transparent text-xs text-offwhite/70 outline-none"
                  placeholder="Subtítulo (opcional)"
                />
              </div>
            </div>

            <div className="mt-5 space-y-2">
              {items.length === 0 ? (
                <p className="rounded-lg border border-dashed border-white/15 py-6 text-center text-xs text-offwhite/50">
                  Nenhum produto no combo ainda.
                </p>
              ) : (
                items.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 rounded-lg bg-white/[0.05] p-2"
                  >
                    <img
                      src={p.img}
                      alt={p.name}
                      className="h-12 w-12 shrink-0 rounded-md bg-white/10 object-contain"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-offwhite">{p.name}</p>
                      <p className="text-[11px] text-offwhite/60">{brl(p.price)}</p>
                    </div>
                    <button
                      onClick={() => remove(p.id)}
                      className="rounded-md p-1.5 text-offwhite/60 hover:bg-white/10 hover:text-[color:var(--lime-brand)]"
                      aria-label="Remover"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="mt-5 space-y-3 border-t border-white/10 pt-4">
              <div className="flex items-center justify-between text-xs text-offwhite/70">
                <span>Soma dos itens</span>
                <span className="font-semibold text-offwhite">{brl(autoTotal)}</span>
              </div>
              <label className="flex items-center gap-2 text-xs text-offwhite/70">
                <span className="shrink-0">Total promocional</span>
                <input
                  type="number"
                  value={overrideTotal}
                  onChange={(e) => setOverrideTotal(e.target.value)}
                  placeholder="opcional"
                  className="w-full rounded-md border border-white/10 bg-navy px-2 py-1 text-right text-offwhite outline-none focus:border-[color:var(--lime-brand)]"
                />
              </label>
              <div className="flex items-center justify-between rounded-xl bg-[color:var(--lime-brand)] px-4 py-3 text-navy">
                <span className="flex items-center gap-2 font-display text-xs font-black uppercase tracking-widest">
                  <Sparkles className="h-4 w-4" /> Total
                </span>
                <span className="font-display text-xl font-black">{brl(finalTotal)}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

// Silence unused-import lint on Shell/ChevronRight/Link when tree-shaken.
void Shell;
void ChevronRight;
void Link;
