/**
 * Cadastro em lote (MaxorCRM · Fase 1).
 *
 * Uma única ficha de dados/custos é preenchida uma vez e cada bloco de cor
 * (com suas imagens, gênero e numeração próprios) vira um produto INDEPENDENTE
 * no catálogo — cada cor tem seu próprio `model_group`, então o site exibe um
 * card separado por cor. O selo nasce sempre "Normal"; troque na edição.
 */


import React, { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Layers, Plus, Star, Trash2, Upload, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getMyOrgId } from "@/lib/maxorcrm-org";
import { uploadProductImage } from "@/lib/product-images.functions";
import { deriveModelGroup } from "@/lib/catalog";
import { BRAND_NAMES } from "@/lib/brands";
import { listTaxonomy, type TaxonomyItem } from "@/lib/crm.taxonomy.functions";

type BatchImage = { id: string; url: string; principal: boolean };
type Variation = {
  id: string;
  color: string;
  genero: string;
  numMin: number;
  numMax: number;
  images: BatchImage[];
};


const clean = (v: unknown) => String(v ?? "").trim();
const rid = (p: string) => `${p}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
const round2 = (n: number) => Math.round((Number.isFinite(n) ? n : 0) * 100) / 100;
const importTaxFor = (va: number) => (va > 0 ? Math.ceil((va * 0.6) / 0.83 + 15) : 0);

const slugify = (v: string) =>
  v
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .toUpperCase()
    .slice(0, 18);

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Falha ao ler a imagem."));
    reader.readAsDataURL(file);
  });

const imageFileToUploadDataUrl = async (file: File) => {
  if (!file.type.startsWith("image/")) throw new Error("Envie apenas arquivos de imagem.");
  if (file.type === "image/svg+xml") return readFileAsDataUrl(file);

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Não foi possível abrir a imagem."));
      image.src = objectUrl;
    });
    const maxSide = 1600;
    const scale = Math.min(1, maxSide / Math.max(img.naturalWidth || img.width, img.naturalHeight || img.height));
    if (file.size <= 900_000 && scale === 1) return readFileAsDataUrl(file);

    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round((img.naturalWidth || img.width) * scale));
    canvas.height = Math.max(1, Math.round((img.naturalHeight || img.height) * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) return readFileAsDataUrl(file);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return await new Promise<string>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error("Não foi possível otimizar a imagem."));
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result ?? ""));
          reader.onerror = () => reject(new Error("Falha ao preparar a imagem."));
          reader.readAsDataURL(blob);
        },
        "image/webp",
        0.86,
      );
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};

const GENDERS = ["Masculino", "Feminino", "Infantil", "Unissex"];

/**
 * Grade padrão por gênero, válida para todo o site (tênis, chuteiras, roupas).
 * Infantil não tem padrão: usa a numeração digitada no bloco comum.
 */
const GRADE_POR_GENERO: Record<string, [number, number]> = {
  masculino: [38, 44],
  feminino: [34, 39],
  unissex: [34, 44],
};

const gradeFor = (genero: string, fallback: [number, number]): [number, number] => {
  const g = genero.toLowerCase();
  if (g.includes("fem")) return GRADE_POR_GENERO.feminino;
  if (g.includes("unis")) return GRADE_POR_GENERO.unissex;
  if (g.includes("inf")) return fallback;
  if (g.includes("masc")) return GRADE_POR_GENERO.masculino;
  return fallback;
};

/** Selo fixo do cadastro em lote — a troca é feita depois, na edição individual. */
const LOTE_TAG = "Normal";


const inputCls =
  "w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-offwhite focus:border-[color:var(--cyan-brand)] focus:outline-none";
const labelCls = "text-[11px] font-bold uppercase tracking-wide text-foreground/50";

function MoneyInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <input
      inputMode="decimal"
      className={inputCls}
      value={value ? String(value).replace(".", ",") : ""}
      placeholder="0,00"
      onChange={(e) => {
        const raw = e.target.value.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
        onChange(Number(raw || 0));
      }}
    />
  );
}

export function Fase1BatchCreate({ onSaved }: { onSaved?: () => void }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [taxonomy, setTaxonomy] = useState<TaxonomyItem[]>([]);
  const fetchTaxonomy = useServerFn(listTaxonomy);
  const uploadImage = useServerFn(uploadProductImage);

  const [base, setBase] = useState({
    skuPrefix: "",
    name: "",
    brand: "Nike",
    category: "Calçados Esportivos",
    type: "Tênis de Corrida",
    modelGroup: "",
    description: "",
    costSupplier: 0,
    shippingCost: 0,
    marginPercent: 0,
    importCostIncluded: false,
    price: 0,
    numMin: 28,
    numMax: 34,
    stock: 0,
    venderSemEstoque: true,
    siteVisible: true,
    brandVisible: true,
  });

  const infantilGrade: [number, number] = [Number(base.numMin || 28), Number(base.numMax || 34)];

  const newVariation = (genero = "Masculino", fallback: [number, number] = [28, 34]): Variation => {
    const [min, max] = gradeFor(genero, fallback);
    return { id: rid("var"), color: "", genero, numMin: min, numMax: max, images: [] };
  };

  const [variations, setVariations] = useState<Variation[]>([
    { id: rid("var"), color: "", genero: "Masculino", numMin: 38, numMax: 44, images: [] },
  ]);


  useEffect(() => {
    if (!open) return;
    void (async () => {
      try {
        setTaxonomy(await fetchTaxonomy());
      } catch {
        setTaxonomy([]);
      }
    })();
  }, [open]);

  const options = (kind: "brand" | "category" | "type", extra: string[] = []) => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const n of [...taxonomy.filter((t) => t.kind === kind).map((t) => t.name), ...extra]) {
      const c = clean(n);
      if (!c || seen.has(c.toLowerCase())) continue;
      seen.add(c.toLowerCase());
      out.push(c);
    }
    return out;
  };

  const brandOptions = useMemo(() => options("brand", [...BRAND_NAMES]), [taxonomy]);
  const categoryOptions = useMemo(() => options("category", ["Calçados Esportivos"]), [taxonomy]);
  const typeOptions = useMemo(() => options("type", ["Tênis de Corrida"]), [taxonomy]);

  const extra = base.importCostIncluded ? importTaxFor(base.costSupplier) : 0;
  const recalcPrice = (cost: number, ship: number, margin: number, ex: number) =>
    round2((cost + ship + ex) * (1 + margin / 100));

  const setCost = (v: number) =>
    setBase((b) => ({
      ...b,
      costSupplier: v,
      price: recalcPrice(v, b.shippingCost, b.marginPercent, b.importCostIncluded ? importTaxFor(v) : 0),
    }));
  const setShipping = (v: number) =>
    setBase((b) => ({ ...b, shippingCost: v, price: recalcPrice(b.costSupplier, v, b.marginPercent, extra) }));
  const setMargin = (v: number) =>
    setBase((b) => ({ ...b, marginPercent: v, price: recalcPrice(b.costSupplier, b.shippingCost, v, extra) }));
  const setImportIncluded = (on: boolean) =>
    setBase((b) => ({
      ...b,
      importCostIncluded: on,
      price: recalcPrice(b.costSupplier, b.shippingCost, b.marginPercent, on ? importTaxFor(b.costSupplier) : 0),
    }));

  const patchVar = (id: string, patch: Partial<Variation>) =>
    setVariations((list) => list.map((v) => (v.id === id ? { ...v, ...patch } : v)));

  const addVariation = () =>
    setVariations((list) => [...list, newVariation(list.at(-1)?.genero ?? "Masculino", infantilGrade)]);


  const removeVariation = (id: string) =>
    setVariations((list) => (list.length <= 1 ? list : list.filter((v) => v.id !== id)));

  const uploadTo = async (variation: Variation, files: File[]) => {
    setError(null);
    const skuBase = clean(base.skuPrefix) || `LOTE-${Date.now().toString(36).toUpperCase()}`;
    for (const file of files) {
      if (file.size > 12 * 1024 * 1024) {
        setError(`A imagem "${file.name}" é muito grande. Use até 12MB.`);
        return;
      }
      try {
        const dataUrl = await imageFileToUploadDataUrl(file);
        const { url } = await uploadImage({
          data: { imageDataUrl: dataUrl, sku: `${skuBase}-${slugify(variation.color) || "COR"}` },
        });
        if (!url) throw new Error("Imagem não salva.");
        setVariations((list) =>
          list.map((v) =>
            v.id === variation.id
              ? { ...v, images: [...v.images, { id: rid("img"), url, principal: v.images.length === 0 }] }
              : v,
          ),
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Não foi possível enviar a imagem.");
        return;
      }
    }
  };

  const resetAll = () => {
    setBase((b) => ({ ...b, skuPrefix: "", name: "", modelGroup: "", description: "" }));
    setVariations([newVariation("Masculino", infantilGrade)]);
    setProgress("");
  };

  const handleSave = async () => {
    setError(null);
    if (!clean(base.name)) return setError("Informe o nome do modelo.");
    const filled = variations.filter((v) => clean(v.color) && v.images.length > 0);
    if (!filled.length) return setError("Cadastre ao menos uma cor com imagem.");
    if (filled.length !== variations.length)
      return setError("Toda cor precisa de nome e ao menos uma imagem (ou remova a cor vazia).");

    setSaving(true);
    try {
      const orgId = await getMyOrgId();
      if (!orgId) throw new Error("Não foi possível identificar sua organização no CRM. Faça login novamente.");

      const finalTag = LOTE_TAG;
      const siteVisible = Boolean(base.siteVisible);
      const prefix = clean(base.skuPrefix) || `MXR-${Date.now().toString(36).toUpperCase()}`;


      const rows = filled.map((v, index) => {
        const generoLc = v.genero.toLowerCase();
        const section = generoLc.includes("fem")
          ? "feminino"
          : generoLc.includes("inf")
            ? "infantil"
            : "masculino";
        const principal = v.images.find((i) => i.principal)?.url || v.images[0]?.url || "";
        const gallery = [...v.images].sort((a, b) => Number(b.principal) - Number(a.principal)).map((i) => i.url);
        const name = `${clean(base.name)} - ${clean(v.color)}`;
        return {
          org_id: orgId,
          sku: `${prefix}-${slugify(v.color) || index + 1}`,
          name,
          name_prod: name,
          brand: base.brand,
          marca_prod: base.brand,
          category: base.category,
          categoria_prod: base.category,
          type: base.type,
          tipo_prod: base.type,
          gender: v.genero,
          genero: v.genero,
          section: isOferta ? "ofertas" : section,
          model_group: modelGroup,
          color_variant: clean(v.color),
          cost_supplier: Number(base.costSupplier || 0),
          shipping_cost: Number(base.shippingCost || 0),
          margin_percent: Number(base.marginPercent || 0),
          import_cost: importTaxFor(Number(base.costSupplier || 0)),
          import_cost_included: Boolean(base.importCostIncluded),
          price: Number(base.price || 0),
          valor_dec: Number(base.price || 0),
          old_price: null,
          discount_price: 0,
          num_cal_min: Number(base.numMin || 37),
          num_cal_max: Number(base.numMax || 44),
          stock: Number(base.stock || 0),
          qtde_est: Number(base.stock || 0),
          vender_sem_estoque: Boolean(base.venderSemEstoque),
          site_visible: siteVisible,
          brand_visible: Boolean(base.brandVisible),
          tag: finalTag,
          badge_text: finalTag,
          status: siteVisible ? "published" : "hidden",
          descricao: base.description,
          description: base.description,
          imagens: v.images.map((i) => ({
            id: i.id,
            url_imagem: i.url,
            is_principal: Boolean(i.principal),
            exibir_no_site: true,
          })),
          foto_principal: principal,
          img: principal,
          images: gallery,
        };
      });

      setProgress(`Gravando ${rows.length} produto(s)…`);
      const { error: err } = await supabase.from("products").insert(rows);
      if (err) throw new Error(err.message);

      setProgress("");
      setOpen(false);
      resetAll();
      onSaved?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha inesperada ao salvar o lote.");
    } finally {
      setSaving(false);
      setProgress("");
    }
  };

  const totalImages = variations.reduce((sum, v) => sum + v.images.length, 0);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex shrink-0 items-center justify-center gap-2 rounded-xl border border-[color:var(--mint-brand)] px-5 py-2.5 font-bold text-[color:var(--mint-brand)] transition hover:brightness-110"
      >
        <Layers size={18} /> Cadastro em Lote
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-background/80 p-3 backdrop-blur-sm sm:p-6">
          <div className="my-4 w-full max-w-4xl rounded-2xl border border-border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border p-4 sm:p-5">
              <h2 className="flex items-center gap-2 text-base font-black uppercase text-offwhite sm:text-lg">
                <Layers size={20} className="text-[color:var(--mint-brand)]" /> Cadastro em Lote
              </h2>
              <button onClick={() => setOpen(false)} className="rounded-lg p-2 text-foreground/60 hover:bg-border">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-6 p-4 sm:p-5">
              {/* Bloco compartilhado */}
              <section className="space-y-4 rounded-2xl border border-border bg-background/40 p-4">
                <h3 className="text-xs font-black uppercase tracking-wide text-[color:var(--cyan-brand)]">
                  Dados comuns a todas as cores
                </h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <label className="space-y-1">
                    <span className={labelCls}>Nome do modelo *</span>
                    <input
                      className={inputCls}
                      value={base.name}
                      onChange={(e) => setBase((b) => ({ ...b, name: e.target.value }))}
                      placeholder="Air Zoom Alphafly"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className={labelCls}>Prefixo de SKU</span>
                    <input
                      className={inputCls}
                      value={base.skuPrefix}
                      onChange={(e) => setBase((b) => ({ ...b, skuPrefix: e.target.value.toUpperCase() }))}
                      placeholder="MXR-5981"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className={labelCls}>Marca</span>
                    <select
                      className={inputCls}
                      value={base.brand}
                      onChange={(e) => setBase((b) => ({ ...b, brand: e.target.value }))}
                    >
                      {brandOptions.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-1">
                    <span className={labelCls}>Categoria</span>
                    <select
                      className={inputCls}
                      value={base.category}
                      onChange={(e) => setBase((b) => ({ ...b, category: e.target.value }))}
                    >
                      {categoryOptions.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-1">
                    <span className={labelCls}>Tipo</span>
                    <select
                      className={inputCls}
                      value={base.type}
                      onChange={(e) => setBase((b) => ({ ...b, type: e.target.value }))}
                    >
                      {typeOptions.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-1">
                    <span className={labelCls}>Selo</span>
                    <select
                      className={inputCls}
                      value={base.tag}
                      onChange={(e) => setBase((b) => ({ ...b, tag: e.target.value }))}
                    >
                      {TAGS.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <label className="space-y-1">
                    <span className={labelCls}>Custo fornecedor</span>
                    <MoneyInput value={base.costSupplier} onChange={setCost} />
                  </label>
                  <label className="space-y-1">
                    <span className={labelCls}>Frete</span>
                    <MoneyInput value={base.shippingCost} onChange={setShipping} />
                  </label>
                  <label className="space-y-1">
                    <span className={labelCls}>Margem (%)</span>
                    <input
                      inputMode="decimal"
                      className={inputCls}
                      value={base.marginPercent || ""}
                      onChange={(e) => setMargin(Number(e.target.value.replace(",", ".") || 0))}
                    />
                  </label>
                  <label className="space-y-1">
                    <span className={labelCls}>Preço final</span>
                    <MoneyInput value={base.price} onChange={(v) => setBase((b) => ({ ...b, price: v }))} />
                  </label>
                </div>

                <label className="flex items-center gap-2 text-xs text-foreground/70">
                  <input
                    type="checkbox"
                    checked={base.importCostIncluded}
                    onChange={(e) => setImportIncluded(e.target.checked)}
                  />
                  Somar imposto de importação estimado (R${" "}
                  {importTaxFor(base.costSupplier).toLocaleString("pt-BR")}) no custo
                </label>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <label className="space-y-1">
                    <span className={labelCls}>Numeração mín.</span>
                    <input
                      type="number"
                      className={inputCls}
                      value={base.numMin}
                      onChange={(e) => setBase((b) => ({ ...b, numMin: Number(e.target.value || 0) }))}
                    />
                  </label>
                  <label className="space-y-1">
                    <span className={labelCls}>Numeração máx.</span>
                    <input
                      type="number"
                      className={inputCls}
                      value={base.numMax}
                      onChange={(e) => setBase((b) => ({ ...b, numMax: Number(e.target.value || 0) }))}
                    />
                  </label>
                  <label className="space-y-1">
                    <span className={labelCls}>Estoque</span>
                    <input
                      type="number"
                      className={inputCls}
                      value={base.stock}
                      onChange={(e) => setBase((b) => ({ ...b, stock: Number(e.target.value || 0) }))}
                    />
                  </label>
                  <div className="flex flex-col justify-end gap-2 pb-1 text-xs text-foreground/70">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={base.venderSemEstoque}
                        onChange={(e) => setBase((b) => ({ ...b, venderSemEstoque: e.target.checked }))}
                      />
                      Vender sem estoque
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={base.siteVisible}
                        onChange={(e) => setBase((b) => ({ ...b, siteVisible: e.target.checked }))}
                      />
                      Exibir no site
                    </label>
                  </div>
                </div>

                <label className="space-y-1 block">
                  <span className={labelCls}>Descrição</span>
                  <textarea
                    rows={3}
                    className={inputCls}
                    value={base.description}
                    onChange={(e) => setBase((b) => ({ ...b, description: e.target.value }))}
                  />
                </label>
              </section>

              {/* Variações */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wide text-[color:var(--cyan-brand)]">
                    Cores do lote ({variations.length}) · {totalImages} imagem(ns)
                  </h3>
                  <button
                    onClick={addVariation}
                    className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-offwhite hover:bg-border"
                  >
                    <Plus size={14} /> Adicionar cor
                  </button>
                </div>

                {variations.map((v, index) => (
                  <div key={v.id} className="space-y-3 rounded-2xl border border-border bg-background/40 p-4">
                    <div className="flex flex-wrap items-end gap-3">
                      <label className="min-w-[160px] flex-1 space-y-1">
                        <span className={labelCls}>Cor #{index + 1} *</span>
                        <input
                          className={inputCls}
                          value={v.color}
                          onChange={(e) => patchVar(v.id, { color: e.target.value })}
                          placeholder="Infrared / White"
                        />
                      </label>
                      <label className="min-w-[140px] space-y-1">
                        <span className={labelCls}>Gênero</span>
                        <select
                          className={inputCls}
                          value={v.genero}
                          onChange={(e) => patchVar(v.id, { genero: e.target.value })}
                        >
                          {GENDERS.map((g) => (
                            <option key={g} value={g}>
                              {g}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-[color:var(--cyan-brand)] px-3 py-2 text-xs font-bold text-[color:var(--cyan-brand)] hover:brightness-110">
                        <Upload size={14} /> Imagens
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            e.target.value = "";
                            if (files.length) void uploadTo(v, files);
                          }}
                        />
                      </label>
                      {variations.length > 1 && (
                        <button
                          onClick={() => removeVariation(v.id)}
                          className="rounded-xl border border-border p-2 text-rose-400 hover:bg-border"
                          title="Remover cor"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    {v.images.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {v.images.map((img) => (
                          <div
                            key={img.id}
                            className={`relative h-20 w-20 overflow-hidden rounded-xl border ${img.principal ? "border-[color:var(--mint-brand)]" : "border-border"}`}
                          >
                            <img src={img.url} alt="" className="h-full w-full object-cover" />
                            <button
                              onClick={() =>
                                patchVar(v.id, {
                                  images: v.images.map((i) => ({ ...i, principal: i.id === img.id })),
                                })
                              }
                              className="absolute left-1 top-1 rounded bg-background/80 p-1 text-[color:var(--mint-brand)]"
                              title="Foto principal"
                            >
                              <Star size={12} fill={img.principal ? "currentColor" : "none"} />
                            </button>
                            <button
                              onClick={() => patchVar(v.id, { images: v.images.filter((i) => i.id !== img.id) })}
                              className="absolute right-1 top-1 rounded bg-background/80 p-1 text-rose-400"
                              title="Remover"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </section>

              {error && (
                <p className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-300">{error}</p>
              )}
            </div>

            <div className="flex flex-col gap-3 border-t border-border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <span className="text-xs text-foreground/60">
                {variations.length} produto(s) serão criados e vinculados como o mesmo modelo.
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-border px-4 py-2.5 text-sm font-bold text-foreground/70 hover:bg-border"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-[color:var(--cyan-brand)] px-5 py-2.5 text-sm font-bold text-navy transition hover:brightness-110 disabled:opacity-60"
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  {saving ? progress || "Salvando…" : "Criar produtos do lote"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
