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
  /** Código do produto no padrão MXR-#### (gerado automaticamente). */
  sku: string;
  color: string;
  genero: string;
  numMin: number;
  numMax: number;
  images: BatchImage[];
  /** SKU do tênis já cadastrado ao qual esta cor foi vinculada (referência interna). */
  linkedSku: string;
};

/** Tênis já cadastrado, para o campo de vínculo das cores. */
type LinkOption = {
  sku: string;
  name: string;
  brand: string;
  category: string;
  type: string;
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

/** Código no padrão MXR-#### (4 dígitos). */
const makeSku = (taken: Set<string> = new Set()) => {
  for (let i = 0; i < 200; i += 1) {
    const code = `MXR-${Math.floor(1000 + Math.random() * 9000)}`;
    if (!taken.has(code)) return code;
  }
  return `MXR-${Date.now().toString().slice(-6)}`;
};


const inputCls =
  "w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-offwhite focus:border-[color:var(--cyan-brand)] focus:outline-none";
const labelCls = "text-[11px] font-bold uppercase tracking-wide text-foreground/50";

/** Mesmo campo monetário do cadastro individual (Fase1Catalog). */
function MoneyInput({
  value,
  onChange,
  placeholder = "0,00",
  className = "",
  prefix = "R$ ",
}: { value: number; onChange: (val: number) => void; placeholder?: string; className?: string; prefix?: string }) {
  const formatDisplay = (val: number) => {
    if (val === null || val === undefined || val === 0) return "";
    return val.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const [displayValue, setDisplayValue] = useState(formatDisplay(value));

  useEffect(() => {
    setDisplayValue(formatDisplay(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (!raw) {
      setDisplayValue("");
      onChange(0);
      return;
    }
    const numeric = parseFloat(raw) / 100;
    setDisplayValue(numeric.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    onChange(numeric);
  };

  return (
    <div className="relative flex items-center">
      {prefix && <span className="absolute left-3.5 text-xs font-bold text-foreground/50 select-none">{prefix}</span>}
      <input
        type="text"
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        className={`w-full rounded-xl border border-border bg-background text-sm text-offwhite focus:border-[color:var(--cyan-brand)] focus:outline-none ${prefix ? "pl-11 pr-3.5 py-2.5" : "px-3.5 py-2.5"} ${className}`}
      />
    </div>
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

  const newVariation = (
    genero = "Masculino",
    fallback: [number, number] = [28, 34],
    taken: Set<string> = new Set(),
  ): Variation => {
    const [min, max] = gradeFor(genero, fallback);
    return {
      id: rid("var"),
      sku: makeSku(taken),
      color: "",
      genero,
      numMin: min,
      numMax: max,
      images: [],
      linkedSku: "",
    };
  };

  const [variations, setVariations] = useState<Variation[]>([
    {
      id: rid("var"),
      sku: makeSku(),
      color: "",
      genero: "Masculino",
      numMin: 38,
      numMax: 44,
      images: [],
      linkedSku: "",
    },
  ]);

  /** Tênis já cadastrados, para vincular uma cor nova a um modelo existente. */
  const [linkOptions, setLinkOptions] = useState<LinkOption[]>([]);


  useEffect(() => {
    if (!open) return;
    void (async () => {
      try {
        setTaxonomy(await fetchTaxonomy());
      } catch {
        setTaxonomy([]);
      }
      try {
        const { data } = await supabase
          .from("products")
          .select("sku, name, brand, category, type")
          .order("updated_at", { ascending: false })
          .limit(400);
        const seen = new Set<string>();
        const list: LinkOption[] = [];
        for (const row of data ?? []) {
          const sku = clean((row as { sku?: string }).sku);
          if (!sku || seen.has(sku)) continue;
          seen.add(sku);
          list.push({
            sku,
            name: clean((row as { name?: string }).name),
            brand: clean((row as { brand?: string }).brand),
            category: clean((row as { category?: string }).category),
            type: clean((row as { type?: string }).type),
          });
        }
        setLinkOptions(list);
      } catch {
        setLinkOptions([]);
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
  /** Preço Venda Final = (Custo + Frete + [Importação]) × (1 + Margem/100) */
  const recalcPrice = (cost: number, ship: number, margin: number, ex: number) =>
    round2((cost + ship + ex) * (1 + margin / 100));
  /** Margem % = (Preço / (Custo + Frete + [Importação]) - 1) × 100 */
  const recalcMargin = (cost: number, ship: number, price: number, ex: number) => {
    const b = cost + ship + ex;
    if (b <= 0) return 0;
    return round2((price / b - 1) * 100);
  };

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
  const setFinalPrice = (v: number) =>
    setBase((b) => ({ ...b, price: v, marginPercent: recalcMargin(b.costSupplier, b.shippingCost, v, extra) }));
  const setImportIncluded = (on: boolean) =>
    setBase((b) => ({
      ...b,
      importCostIncluded: on,
      price: recalcPrice(b.costSupplier, b.shippingCost, b.marginPercent, on ? importTaxFor(b.costSupplier) : 0),
    }));

  const importTax = importTaxFor(base.costSupplier);
  const lucroBruto = round2(base.price - (base.costSupplier + base.shippingCost + extra));


  const patchVar = (id: string, patch: Partial<Variation>) =>
    setVariations((list) => list.map((v) => (v.id === id ? { ...v, ...patch } : v)));

  const addVariation = () =>
    setVariations((list) => [
      ...list,
      newVariation(list.at(-1)?.genero ?? "Masculino", infantilGrade, new Set(list.map((v) => v.sku))),
    ]);


  const removeVariation = (id: string) =>
    setVariations((list) => (list.length <= 1 ? list : list.filter((v) => v.id !== id)));

  const uploadTo = async (variation: Variation, files: File[]) => {
    setError(null);
    const skuBase = clean(variation.sku) || `LOTE-${Date.now().toString(36).toUpperCase()}`;
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
    setBase((b) => ({ ...b, name: "", modelGroup: "", description: "" }));
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
      // Todo produto criado em lote nasce visível no site com selo Normal.
      const siteVisible = true;

      // Códigos MXR-#### únicos: confere o que já existe no banco e troca as colisões.
      setProgress("Conferindo códigos…");
      const { data: existing } = await supabase.from("products").select("sku").like("sku", "MXR-%");
      const taken = new Set<string>((existing ?? []).map((r) => clean((r as { sku?: string }).sku)).filter(Boolean));
      const skuByVariation = new Map<string, string>();
      for (const v of filled) {
        let sku = clean(v.sku);
        if (!sku || taken.has(sku)) sku = makeSku(taken);
        taken.add(sku);
        skuByVariation.set(v.id, sku);
      }
      setVariations((list) => list.map((v) => ({ ...v, sku: skuByVariation.get(v.id) ?? v.sku })));

      const rows = filled.map((v) => {
        const generoLc = v.genero.toLowerCase();
        const section = generoLc.includes("fem")
          ? "feminino"
          : generoLc.includes("inf")
            ? "infantil"
            : "masculino";
        const principal = v.images.find((i) => i.principal)?.url || v.images[0]?.url || "";
        const gallery = [...v.images].sort((a, b) => Number(b.principal) - Number(a.principal)).map((i) => i.url);
        const name = `${clean(base.name)} - ${clean(v.color)}`;
        // Cada cor é um produto INDEPENDENTE: agrupamento próprio (modelo + cor +
        // gênero) para o site exibir um card separado por cor.
        const modelGroup = deriveModelGroup(
          name,
          "",
          base.brand,
          `${clean(base.modelGroup) || clean(base.name)} ${clean(v.color)} ${v.genero}`,
        );
        const [gradeMin, gradeMax] = gradeFor(v.genero, infantilGrade);
        const numMin = Number(v.numMin || gradeMin);
        const numMax = Number(v.numMax || gradeMax);

        return {
          org_id: orgId,
          // Código no padrão MXR-####, único no catálogo — a cor nunca entra no
          // código, ela vive só em `color_variant`.
          sku: skuByVariation.get(v.id) ?? clean(v.sku),
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
          section,
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
          num_cal_min: numMin,
          num_cal_max: numMax,

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
                  <div className="space-y-1">
                    <span className={labelCls}>Código</span>
                    <p className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground/70">
                      Automático no padrão MXR-#### · um por cor
                    </p>
                  </div>
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
                  <div className="space-y-1">
                    <span className={labelCls}>Selo</span>
                    <p className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground/70">
                      {LOTE_TAG} · troque depois na edição do produto
                    </p>
                  </div>
                </div>



                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <label className="space-y-1">
                    <span className={labelCls}>Custo fornecedor (R$)</span>
                    <MoneyInput value={base.costSupplier} onChange={setCost} />
                  </label>
                  <label className="space-y-1">
                    <span className={labelCls}>Valor envio/frete (R$)</span>
                    <MoneyInput value={base.shippingCost} onChange={setShipping} />
                  </label>
                  <label className="space-y-1">
                    <span className={labelCls}>Margem de venda (%)</span>
                    <MoneyInput value={base.marginPercent} onChange={setMargin} prefix="% " />
                  </label>
                  <label className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wide text-[color:var(--mint-brand)]">
                      Preço venda final (R$)
                    </span>
                    <MoneyInput value={base.price} onChange={setFinalPrice} />
                  </label>
                </div>

                {/* IMPOSTO DE IMPORTAÇÃO — igual ao cadastro individual */}
                <div className="flex flex-col gap-3 rounded-xl border border-[color:var(--cyan-brand)]/30 bg-[color:var(--cyan-brand)]/5 px-4 py-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[color:var(--cyan-brand)]">
                      Imposto de Importação (sugerido)
                    </p>
                    <p className="mt-0.5 text-[10px] text-foreground/50">
                      VA × 60% + ICMS 17% por dentro + R$ 15 · arredondado pra cima
                    </p>
                  </div>
                  <div className="flex items-center gap-5">
                    <span className="font-display text-xl font-black text-offwhite">
                      R$ {importTax.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={base.importCostIncluded}
                        onChange={(e) => setImportIncluded(e.target.checked)}
                        className="accent-[color:var(--mint-brand)]"
                      />
                      <span className="text-[11px] font-bold uppercase text-foreground/70">Somar no custo</span>
                    </label>
                  </div>
                </div>

                <p className="text-[11px] text-foreground/50">
                  Lucro bruto estimado:{" "}
                  <span className={lucroBruto >= 0 ? "font-bold text-[color:var(--mint-brand)]" : "font-bold text-rose-400"}>
                    R$ {lucroBruto.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>{" "}
                  · Fórmula: (Custo + Frete{base.importCostIncluded ? " + Importação" : ""}) × (1 + Margem/100)
                </p>



                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <label className="space-y-1">
                    <span className={labelCls}>Numeração infantil mín.</span>
                    <input
                      type="number"
                      className={inputCls}
                      value={base.numMin}
                      onChange={(e) => setBase((b) => ({ ...b, numMin: Number(e.target.value || 0) }))}
                    />
                  </label>
                  <label className="space-y-1">
                    <span className={labelCls}>Numeração infantil máx.</span>
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
                    <span className="text-[11px] text-foreground/50">
                      Todo produto do lote nasce visível no site com selo Normal.
                    </span>
                  </div>
                </div>

                <label className="space-y-1 block">
                  <span className={labelCls}>Descrição principal</span>
                  <textarea
                    rows={3}
                    className={inputCls}
                    value={base.description}
                    onChange={(e) => setBase((b) => ({ ...b, description: e.target.value }))}
                    placeholder="Descrição única do modelo — será aplicada a todas as cores cadastradas abaixo."
                  />
                  <p className="text-[11px] text-foreground/50">
                    Esta descrição vai no campo "Descrição" de todos os produtos do lote, sem alterações. A cor de cada variação tem seu próprio campo abaixo.
                  </p>
                </label>
              </section>

              {/* Variações */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wide text-[color:var(--cyan-brand)]">
                      Cores do lote ({variations.length}) · {totalImages} imagem(ns)
                    </h3>
                    <p className="mt-0.5 text-[11px] text-foreground/50">
                      Cada bloco vira um produto independente: a descrição da cor abaixo vai no campo "Cor variante" do cadastro (o mesmo do cadastro individual), junto com suas fotos e gênero.
                    </p>
                  </div>
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
                      <label className="min-w-[220px] flex-1 space-y-1">
                        <span className={labelCls}>Descrição da cor #{index + 1} * · vira "Cor variante" no cadastro</span>
                        <input
                          className={inputCls}
                          value={v.color}
                          onChange={(e) => patchVar(v.id, { color: e.target.value })}
                          placeholder="Ex.: Preto/Volt ou Branco com detalhes dourados"
                        />
                      </label>
                      <label className="min-w-[140px] space-y-1">
                        <span className={labelCls}>Gênero</span>
                        <select
                          className={inputCls}
                          value={v.genero}
                          onChange={(e) => {
                            const genero = e.target.value;
                            const [min, max] = gradeFor(genero, infantilGrade);
                            patchVar(v.id, { genero, numMin: min, numMax: max });
                          }}
                        >
                          {GENDERS.map((g) => (
                            <option key={g} value={g}>
                              {g}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="w-[92px] space-y-1">
                        <span className={labelCls}>Num. mín.</span>
                        <input
                          type="number"
                          className={inputCls}
                          value={v.numMin}
                          onChange={(e) => patchVar(v.id, { numMin: Number(e.target.value || 0) })}
                        />
                      </label>
                      <label className="w-[92px] space-y-1">
                        <span className={labelCls}>Num. máx.</span>
                        <input
                          type="number"
                          className={inputCls}
                          value={v.numMax}
                          onChange={(e) => patchVar(v.id, { numMax: Number(e.target.value || 0) })}
                        />
                      </label>
                      <div className="w-[150px] space-y-1">
                        <span className={labelCls}>Código gerado</span>
                        <div className="flex items-center gap-1">
                          <input className={inputCls} value={v.sku} readOnly />
                          <button
                            type="button"
                            title="Gerar outro código"
                            onClick={() =>
                              patchVar(v.id, { sku: makeSku(new Set(variations.map((x) => x.sku))) })
                            }
                            className="rounded-lg border border-border px-2 py-2 text-xs text-foreground/70 hover:text-offwhite"
                          >
                            ↻
                          </button>
                        </div>
                      </div>
                      <label className="min-w-[220px] flex-1 space-y-1">
                        <span className={labelCls}>Vincular a um tênis já cadastrado</span>
                        <select
                          className={inputCls}
                          value={v.linkedSku}
                          onChange={(e) => {
                            const sku = e.target.value;
                            patchVar(v.id, { linkedSku: sku });
                            const ref = linkOptions.find((o) => o.sku === sku);
                            if (!ref) return;
                            // Aproveita marca, categoria, tipo e nome do modelo já cadastrado.
                            setBase((b) => ({
                              ...b,
                              name: clean(b.name) || ref.name,
                              brand: ref.brand || b.brand,
                              category: ref.category || b.category,
                              type: ref.type || b.type,
                            }));
                          }}
                        >
                          <option value="">Não vincular (produto novo)</option>
                          {linkOptions.map((o) => (
                            <option key={o.sku} value={o.sku}>
                              {o.sku} · {o.name}
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
                {variations.length} produto(s) independentes serão criados — um card por cor no site.
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
