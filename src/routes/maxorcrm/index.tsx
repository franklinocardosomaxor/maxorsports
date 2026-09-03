import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Boxes, Kanban, Loader2, Image as ImageIcon, Upload, X,
  Megaphone, RefreshCw, Eye, EyeOff, CreditCard,
  Wallet, TrendingUp, TrendingDown, AlertTriangle, ArrowRight,
} from "lucide-react";

import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { uploadCampaignImage, type SiteCampaign } from "@/lib/campaign.functions";
import { refreshSiteSettings } from "@/hooks/use-site-settings";

export const Route = createFileRoute("/maxorcrm/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "MaxorCRM — Visão geral" },
      { name: "description", content: "Visão geral das três fases do MaxorCRM da Maxor Sports." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "MaxorCRM — Visão geral" },
      { property: "og:description", content: "Catálogo, comercial e operação em um só painel." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Overview,
});

function Overview() {
  const [counts, setCounts] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const [p, pv, c, d, a, fr, fp] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("products").select("id", { count: "exact", head: true }).eq("site_visible", true),
        supabase.from("contacts").select("id", { count: "exact", head: true }),
        supabase.from("deals").select("id", { count: "exact", head: true }),
        supabase.from("activities").select("id", { count: "exact", head: true }),
        supabase.from("finance_entries").select("id", { count: "exact", head: true })
          .eq("kind", "receivable").eq("status", "open"),
        supabase.from("finance_entries").select("id", { count: "exact", head: true })
          .eq("kind", "payable").eq("status", "open"),
      ]);
      if (!active) return;
      setCounts({
        produtos: p.count ?? 0,
        publicados: pv.count ?? 0,
        contatos: c.count ?? 0,
        negocios: d.count ?? 0,
        atividades: a.count ?? 0,
        aReceber: fr.count ?? 0,
        aPagar: fp.count ?? 0,
      });

    })();
    return () => {
      active = false;
    };
  }, []);

  const cards = [
    {
      to: "/maxorcrm/fase-1" as const,
      icon: Boxes,
      title: "Estoque (Fase 1)",
      desc: "Cadastre produtos reais: SKU, nome, marca, custo/frete/margem, fotos e selos (Destaque/Lançamento).",
      stat: counts && `${counts.publicados}/${counts.produtos} publicados`,
    },
    {
      to: "/maxorcrm/fase-2" as const,
      icon: Kanban,
      title: "Vendas (Fase 2)",
      desc: "Gestão comercial, contatos, negócios e pipeline de vendas.",
      stat: counts && `${counts.contatos} contatos · ${counts.negocios} negócios`,
    },
    {
      to: "/maxorcrm/fase-3" as const,
      icon: Wallet,
      title: "Financeiro",
      desc: "Contas a pagar e a receber, vencimentos, saldo previsto e fluxo de caixa.",
      stat: counts && `${counts.aReceber} a receber · ${counts.aPagar} a pagar`,
    },
  ];


  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        {cards.map(({ to, icon: Icon, title, desc, stat }) => (
          <Link
            key={to}
            to={to}
            className="rounded-2xl border border-border bg-card p-6 transition hover:border-[color:var(--cyan-brand)] hover:brightness-110"
          >
            <Icon className="h-6 w-6 text-[color:var(--cyan-brand)]" />
            <h2 className="mt-3 font-display text-lg font-black uppercase text-offwhite">{title}</h2>
            <p className="mt-1 text-sm text-foreground/65">{desc}</p>
            <p className="mt-4 text-xs font-bold uppercase tracking-wider text-[color:var(--mint-brand)]">
              {stat ?? <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            </p>
          </Link>
        ))}
      </section>

      <FinanceOverview />

      <div className="grid gap-6 lg:grid-cols-2">
        <InstallmentsManager />
        <ShippingManager />
      </div>

      <CampaignManager />

    </div>
  );
}

/**
 * Parcelamento exibido no site (ex.: "ou 3x de R$ …"). Editável pelo painel;
 * o site recalcula o valor da parcela automaticamente.
 */
function InstallmentsManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [parcelas, setParcelas] = useState(3);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [sample, setSample] = useState(599.9);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("id, installments_max")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!alive) return;
      if (data) {
        setSettingsId(data.id as string);
        setParcelas(Number(data.installments_max) || 3);
      }
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const save = async () => {
    const n = Math.min(24, Math.max(1, Math.round(parcelas)));
    setSaving(true);
    setFeedback(null);
    const { error } = settingsId
      ? await supabase.from("site_settings").update({ installments_max: n }).eq("id", settingsId)
      : await supabase.from("site_settings").insert([{ installments_max: n }]);
    setSaving(false);
    setParcelas(n);
    if (!error) refreshSiteSettings();
    setFeedback(error ? `Erro ao salvar: ${error.message}` : `Site passa a exibir ${n}x.`);
  };

  const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h2 className="flex items-center gap-2 font-display text-lg font-black uppercase text-offwhite">
        <CreditCard className="h-5 w-5 text-[color:var(--cyan-brand)]" /> Parcelamento do Site
      </h2>
      <p className="mt-1 text-xs text-foreground/60">
        Define em quantas vezes o site anuncia os produtos. O valor da parcela continua sendo
        calculado automaticamente (preço ÷ número de parcelas).
      </p>

      {loading ? (
        <Loader2 className="mt-4 h-4 w-4 animate-spin text-foreground/60" />
      ) : (
        <div className="mt-4 flex flex-wrap items-end gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-foreground/60">
              Máximo de parcelas
            </span>
            <input
              type="number"
              min={1}
              max={24}
              value={parcelas}
              onChange={(e) => setParcelas(Number(e.target.value))}
              className="w-28 rounded-lg border border-border bg-navy px-3 py-2 text-offwhite outline-none focus:border-[color:var(--cyan-brand)]"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-foreground/60">
              Simular com preço
            </span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={sample}
              onChange={(e) => setSample(Number(e.target.value))}
              className="w-36 rounded-lg border border-border bg-navy px-3 py-2 text-offwhite outline-none focus:border-[color:var(--cyan-brand)]"
            />
          </label>

          <p className="rounded-lg border border-border bg-navy px-3 py-2 text-sm text-[color:var(--mint-brand)]">
            ou {Math.max(1, Math.round(parcelas) || 1)}x de{" "}
            {brl(sample / Math.max(1, Math.round(parcelas) || 1))}
          </p>

          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="rounded-lg bg-[color:var(--cyan-brand)] px-4 py-2 text-sm font-bold uppercase text-navy transition hover:brightness-110 disabled:opacity-60"
          >
            {saving ? "Salvando…" : "Salvar parcelamento"}
          </button>
        </div>
      )}

      {feedback && <p className="mt-3 text-xs text-foreground/75">{feedback}</p>}
    </section>
  );
}

/**
 * Frete por categoria — define o frete de todos os produtos de uma categoria
 * de uma só vez e recalcula o preço final mantendo a margem de cada produto.
 */
function ShippingManager() {
  const listStats = useServerFn(listShippingByCategory);
  const applyShipping = useServerFn(applyShippingByCategory);

  const [stats, setStats] = useState<ShippingCategoryStat[] | null>(null);
  const [category, setCategory] = useState<string>(ALL_CATEGORIES);
  const [shipping, setShipping] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const reload = async () => {
    try {
      setStats(await listStats());
    } catch (e) {
      setFeedback(e instanceof Error ? e.message : "Falha ao carregar categorias");
      setStats([]);
    }
  };

  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const total = (stats ?? []).reduce((s, c) => s + c.total, 0);
  const current = stats?.find((s) => s.category === category);
  const affected = category === ALL_CATEGORIES ? total : current?.total ?? 0;

  const apply = async () => {
    const value = Math.max(0, Number(shipping) || 0);
    const label = category === ALL_CATEGORIES ? "todos os produtos" : `a categoria "${category}"`;
    if (!window.confirm(`Aplicar frete de ${brl(value)} em ${label} (${affected} produto(s))?`)) return;
    setSaving(true);
    setFeedback(null);
    try {
      const res = await applyShipping({ data: { category, shipping: value } });
      setFeedback(`${res.updated} produto(s) atualizados com frete de ${brl(res.shipping)}.`);
      await reload();
    } catch (e) {
      setFeedback(e instanceof Error ? e.message : "Falha ao aplicar o frete");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h2 className="flex items-center gap-2 font-display text-lg font-black uppercase text-offwhite">
        <Truck className="h-5 w-5 text-[color:var(--cyan-brand)]" /> Frete por Categoria
      </h2>
      <p className="mt-1 text-xs text-foreground/60">
        Define o frete de todos os produtos de uma categoria de uma vez. O preço de venda é
        recalculado mantendo a margem cadastrada em cada produto.
      </p>

      {stats === null ? (
        <Loader2 className="mt-4 h-4 w-4 animate-spin text-foreground/60" />
      ) : (
        <div className="mt-4 flex flex-wrap items-end gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-foreground/60">
              Categoria
            </span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-52 rounded-lg border border-border bg-navy px-3 py-2 text-offwhite outline-none focus:border-[color:var(--cyan-brand)]"
            >
              <option value={ALL_CATEGORIES}>Todos os produtos ({total})</option>
              {stats.map((s) => (
                <option key={s.category} value={s.category}>
                  {s.category} ({s.total})
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-foreground/60">
              Novo frete (R$)
            </span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={shipping}
              onChange={(e) => setShipping(Number(e.target.value))}
              className="w-36 rounded-lg border border-border bg-navy px-3 py-2 text-offwhite outline-none focus:border-[color:var(--cyan-brand)]"
            />
          </label>

          <p className="rounded-lg border border-border bg-navy px-3 py-2 text-sm text-[color:var(--mint-brand)]">
            {affected} produto(s)
            {current && (
              <> · frete atual {brl(current.minShipping)}–{brl(current.maxShipping)}</>
            )}
          </p>

          <button
            type="button"
            onClick={() => void apply()}
            disabled={saving || affected === 0}
            className="rounded-lg bg-[color:var(--cyan-brand)] px-4 py-2 text-sm font-bold uppercase text-navy transition hover:brightness-110 disabled:opacity-60"
          >
            {saving ? "Aplicando…" : "Aplicar frete"}
          </button>
        </div>
      )}

      {feedback && <p className="mt-3 text-xs text-foreground/75">{feedback}</p>}
    </section>
  );
}

/**
 * Banner de abertura do site — o admin sobe até 3 imagens, escreve os textos
 * e decide se a campanha aparece (modal) quando o cliente abre o site.
 */
function CampaignManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [active, setActive] = useState(false);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [ctaLabel, setCtaLabel] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const uploadImage = useServerFn(uploadCampaignImage);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data } = await supabase
        .from("site_campaign")
        .select("id, active, title, subtitle, cta_label, cta_url, images, updated_at")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!alive) return;
      if (data) {
        const c = data as unknown as SiteCampaign;
        setCampaignId(c.id);
        setActive(c.active);
        setTitle(c.title ?? "");
        setSubtitle(c.subtitle ?? "");
        setCtaLabel(c.cta_label ?? "");
        setCtaUrl(c.cta_url ?? "");
        setImages(Array.isArray(c.images) ? c.images : []);
      }
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(0, 3 - images.length);
    if (fileRef.current) fileRef.current.value = "";
    if (!files.length) return;
    setUploading(true);
    setFeedback(null);
    try {
      for (const f of files) {
        if (f.size > 7 * 1024 * 1024) {
          setFeedback(`"${f.name}" é muito grande (máx. 7MB).`);
          continue;
        }
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result ?? ""));
          reader.onerror = () => reject(new Error("falha ao ler arquivo"));
          reader.readAsDataURL(f);
        });
        const idx = images.length;
        const { url } = await uploadImage({ data: { imageDataUrl: dataUrl, index: idx } });
        setImages((prev) => [...prev, url]);
      }
    } catch (err) {
      setFeedback(`Erro no upload: ${(err as Error).message}`);
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    setSaving(true);
    setFeedback(null);
    const payload = {
      active,
      title: title.trim() || "Campanha Maxor Sports",
      subtitle: subtitle.trim() || null,
      cta_label: ctaLabel.trim() || null,
      cta_url: ctaUrl.trim() || null,
      images: images.slice(0, 3),
    };
    const { error } = campaignId
      ? await supabase.from("site_campaign").update(payload).eq("id", campaignId)
      : await supabase.from("site_campaign").insert([payload]);
    setSaving(false);
    setFeedback(error ? `Erro ao salvar: ${error.message}` : "Campanha salva com sucesso.");
  };

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-display text-lg font-black uppercase text-offwhite">
          <Megaphone className="h-5 w-5 text-[color:var(--cyan-brand)]" /> Banner de Abertura do Site
        </h2>
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="accent-[color:var(--mint-brand)]"
          />
          <span className="flex items-center gap-1.5 text-xs font-bold uppercase text-foreground/75">
            {active ? <Eye className="h-4 w-4 text-[color:var(--mint-brand)]" /> : <EyeOff className="h-4 w-4" />}
            {active ? "Visível ao abrir o site" : "Oculto"}
          </span>
        </label>
      </div>
      <p className="mt-1 text-xs text-foreground/60">
        A campanha aparece como um cartaz quando o cliente abre o site; ele fecha e navega normalmente. Aceita até 3 imagens em rotação.
      </p>

      {loading ? (
        <div className="mt-6 flex items-center gap-2 text-sm text-foreground/60">
          <Loader2 className="h-4 w-4 animate-spin" /> Carregando campanha…
        </div>
      ) : (
        <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Caixa grande de imagens */}
          <div>
            <div className="grid gap-3 sm:grid-cols-3">
              {images.map((src, i) => (
                <div
                  key={src}
                  className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-background"
                >
                  <img src={src} alt={`Imagem da campanha ${i + 1}`} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                    aria-label={`Remover imagem ${i + 1}`}
                    className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/60 text-white transition hover:bg-rose-500"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  <span className="absolute bottom-2 left-2 rounded bg-navy/80 px-2 py-0.5 text-[10px] font-bold text-offwhite">
                    {i + 1}/3
                  </span>
                </div>
              ))}

              {images.length < 3 && (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[color:var(--cyan-brand)]/40 bg-background transition hover:bg-[color:var(--cyan-brand)]/5 disabled:opacity-50"
                >
                  {uploading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-[color:var(--cyan-brand)]" />
                  ) : (
                    <Upload className="h-6 w-6 text-[color:var(--cyan-brand)]" />
                  )}
                  <span className="text-[11px] font-bold uppercase tracking-wider text-foreground/60">
                    {uploading ? "Enviando…" : "Inserir foto do banner"}
                  </span>
                </button>
              )}
            </div>
            {images.length === 0 && (
              <p className="mt-3 flex items-center gap-2 text-[11px] text-foreground/50">
                <ImageIcon className="h-3.5 w-3.5" /> Nenhuma imagem ainda — suba até 3 artes da campanha.
              </p>
            )}
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={onPick} />
          </div>

          {/* Textos e ações */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-foreground/50">Título da campanha</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex.: Semana do Consumidor"
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-[color:var(--cyan-brand)] focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-foreground/50">Subtítulo (opcional)</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Ex.: Até 40% off em modelos selecionados"
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-[color:var(--cyan-brand)] focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-foreground/50">Botão (opcional)</label>
                <input
                  type="text"
                  value={ctaLabel}
                  onChange={(e) => setCtaLabel(e.target.value)}
                  placeholder="Ver ofertas"
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-[color:var(--cyan-brand)] focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-foreground/50">Link do botão</label>
                <input
                  type="text"
                  value={ctaUrl}
                  onChange={(e) => setCtaUrl(e.target.value)}
                  placeholder="/ofertas"
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-[color:var(--cyan-brand)] focus:outline-none"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={save}
              disabled={saving || uploading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[color:var(--cyan-brand)] px-6 py-2.5 text-sm font-bold text-navy transition hover:brightness-110 disabled:opacity-50"
            >
              {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Megaphone className="h-4 w-4" />}
              {saving ? "Salvando…" : "Salvar campanha"}
            </button>
            {feedback && (
              <p className={`text-xs ${feedback.startsWith("Erro") ? "text-rose-400" : "text-[color:var(--mint-brand)]"}`}>
                {feedback}
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

/**
 * Resumo financeiro do painel inicial: totais em aberto do mês, vencidos,
 * próximos vencimentos e um comparativo simples de entradas x saídas.
 */
function FinanceOverview() {
  type Row = {
    id: string; kind: "payable" | "receivable"; description: string;
    amount_brl: number; due_date: string; paid_at: string | null; status: string;
  };
  const [rows, setRows] = useState<Row[] | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase
        .from("finance_entries")
        .select("id, kind, description, amount_brl, due_date, paid_at, status")
        .order("due_date", { ascending: true })
        .limit(1000);
      if (active) setRows((data ?? []) as Row[]);
    })();
    return () => { active = false; };
  }, []);

  const money = (n: number) =>
    `R$ ${Number(n || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const today = new Date().toISOString().slice(0, 10);
  const monthKey = today.slice(0, 7);

  const list = rows ?? [];
  const open = list.filter((r) => r.status === "open");
  const receberMes = open.filter((r) => r.kind === "receivable" && r.due_date.startsWith(monthKey))
    .reduce((s, r) => s + Number(r.amount_brl || 0), 0);
  const pagarMes = open.filter((r) => r.kind === "payable" && r.due_date.startsWith(monthKey))
    .reduce((s, r) => s + Number(r.amount_brl || 0), 0);
  const vencido = open.filter((r) => r.due_date < today).reduce((s, r) => s + Number(r.amount_brl || 0), 0);
  const proximos = open.filter((r) => r.due_date >= today).slice(0, 5);

  // Últimos 6 meses: entradas x saídas (pelo vencimento).
  const months: { key: string; label: string; in: number; out: number }[] = [];
  const base = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(base.getFullYear(), base.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    months.push({
      key,
      label: d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
      in: list.filter((r) => r.kind === "receivable" && r.status !== "canceled" && r.due_date.startsWith(key))
        .reduce((s, r) => s + Number(r.amount_brl || 0), 0),
      out: list.filter((r) => r.kind === "payable" && r.status !== "canceled" && r.due_date.startsWith(key))
        .reduce((s, r) => s + Number(r.amount_brl || 0), 0),
    });
  }
  const max = Math.max(1, ...months.map((m) => Math.max(m.in, m.out)));

  const stats = [
    { icon: TrendingUp, label: "A receber no mês", value: money(receberMes), color: "text-[color:var(--mint-brand)]" },
    { icon: TrendingDown, label: "A pagar no mês", value: money(pagarMes), color: "text-[color:var(--lime-brand)]" },
    { icon: Wallet, label: "Saldo previsto", value: money(receberMes - pagarMes), color: "text-[color:var(--cyan-brand)]" },
    { icon: AlertTriangle, label: "Vencidos", value: money(vencido), color: "text-destructive" },
  ];

  return (
    <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-display text-lg font-black uppercase text-offwhite">
          <Wallet className="h-5 w-5 text-[color:var(--cyan-brand)]" /> Resumo financeiro
        </h2>
        <Link
          to="/maxorcrm/fase-3"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-foreground/75 transition hover:brightness-110"
        >
          Abrir financeiro <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {rows === null ? (
        <p className="mt-5 flex items-center gap-2 text-sm text-foreground/60">
          <Loader2 className="h-4 w-4 animate-spin" /> Carregando…
        </p>
      ) : (
        <>
          <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {stats.map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="rounded-xl border border-border bg-background p-4">
                <Icon className={`h-5 w-5 ${color}`} />
                <p className="mt-2 text-[11px] uppercase tracking-wider text-foreground/55">{label}</p>
                <p className="mt-1 font-display text-base font-black text-offwhite sm:text-lg">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-foreground/55">
                Entradas x saídas (6 meses)
              </p>
              <div className="mt-3 flex h-32 items-end gap-3">
                {months.map((m) => (
                  <div key={m.key} className="flex flex-1 flex-col items-center gap-1">
                    <div className="flex h-24 w-full items-end justify-center gap-1">
                      <span
                        title={`Entradas ${money(m.in)}`}
                        className="w-1/2 rounded-t bg-[color:var(--mint-brand)]/80"
                        style={{ height: `${Math.max(2, (m.in / max) * 100)}%` }}
                      />
                      <span
                        title={`Saídas ${money(m.out)}`}
                        className="w-1/2 rounded-t bg-[color:var(--lime-brand)]/70"
                        style={{ height: `${Math.max(2, (m.out / max) * 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] uppercase text-foreground/50">{m.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-wider text-foreground/55">Próximos vencimentos</p>
              {proximos.length === 0 ? (
                <p className="mt-3 text-sm text-foreground/60">Nenhuma conta em aberto.</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {proximos.map((r) => (
                    <li key={r.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2">
                      <span className="min-w-0">
                        <span className="block truncate text-sm text-offwhite">{r.description}</span>
                        <span className="text-[11px] text-foreground/55">
                          {r.kind === "receivable" ? "A receber" : "A pagar"} · vence{" "}
                          {new Date(`${r.due_date}T12:00:00`).toLocaleDateString("pt-BR")}
                        </span>
                      </span>
                      <span className={`shrink-0 text-sm font-bold ${r.kind === "receivable" ? "text-[color:var(--mint-brand)]" : "text-[color:var(--lime-brand)]"}`}>
                        {money(r.amount_brl)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
