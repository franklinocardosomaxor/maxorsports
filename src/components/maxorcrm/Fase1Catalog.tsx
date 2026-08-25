import React, { useState, useEffect } from 'react';
import { useServerFn } from "@tanstack/react-start";
import { 
  Plus, Edit, Search, Eye, EyeOff, Package, 
  DollarSign, X, Upload, Shield, RefreshCw, Star 
} from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { getMyOrgId } from "@/lib/maxorcrm-org";
import { uploadProductImage } from "@/lib/product-images.functions";
// Fonte única de marcas (src/lib/brands.ts) — nunca hardcodar lista aqui.
import { BRAND_NAMES } from "@/lib/brands";

type ProductImage = {
  id: string;
  url_imagem: string;
  is_principal: boolean;
  exibir_no_site: boolean;
};

const makeImageId = (index: number) => `img_${Date.now()}_${index}_${Math.random().toString(36).slice(2, 7)}`;

const PRODUCT_LIST_COLUMNS =
  "id, sku, name, name_prod, brand, marca_prod, category, categoria_prod, price, valor_dec, site_visible, tag, badge_text, img, foto_principal, created_at, status";

const PRODUCT_EDIT_COLUMNS =
  "id, sku, name, name_prod, brand, marca_prod, category, categoria_prod, type, tipo_prod, gender, genero, model_group, color_variant, cost_supplier, shipping_cost, margin_percent, import_cost_included, price, valor_dec, old_price, discount_price, num_cal_min, num_cal_max, qtde_est, stock, vender_sem_estoque, site_visible, brand_visible, tag, badge_text, status, descricao, description, imagens, foto_principal, img, images";

const isDataImageUrl = (url: string) => /^data:image\//i.test(url.trim());

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
          if (!blob) {
            reject(new Error("Não foi possível otimizar a imagem."));
            return;
          }
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

const normalizeProductImages = (prod: any): ProductImage[] => {
  const rawImagens = Array.isArray(prod.imagens) ? prod.imagens : [];
  const fromJson = rawImagens
    .map((item: any, index: number) => {
      const url = typeof item === "string" ? item : item?.url_imagem ?? item?.url ?? item?.src ?? item?.path;
      if (!url) return null;
      return {
        id: String(item?.id ?? makeImageId(index)),
        url_imagem: String(url),
        is_principal: Boolean(item?.is_principal),
        exibir_no_site: item?.exibir_no_site ?? true,
      } satisfies ProductImage;
    })
    .filter((item: ProductImage | null): item is ProductImage => Boolean(item));

  const fromArray = (Array.isArray(prod.images) ? prod.images : [])
    .filter(Boolean)
    .map((url: string, index: number) => ({
      id: makeImageId(index + fromJson.length),
      url_imagem: String(url),
      is_principal: false,
      exibir_no_site: true,
    } satisfies ProductImage));

  const all = [...fromJson, ...fromArray];
  const seen = new Set<string>();
  const unique = all.filter((img) => {
    if (seen.has(img.url_imagem)) return false;
    seen.add(img.url_imagem);
    return true;
  });

  const preferred = String(prod.foto_principal || prod.img || unique[0]?.url_imagem || "");
  const selectedIndex = unique.findIndex((img) => img.is_principal || img.url_imagem === preferred);
  return unique.map((img, index) => ({ ...img, is_principal: index === (selectedIndex >= 0 ? selectedIndex : 0) }));
};

export function CurrencyInput({ value, onChange, placeholder = "0,00", className = "", prefix = "R$ " }: { value: number; onChange: (val: number) => void; placeholder?: string; className?: string; prefix?: string }) {
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
      {prefix && <span className="absolute left-3.5 text-xs font-bold text-slate-400 select-none">{prefix}</span>}
      <input
        type="text"
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        className={`w-full rounded-xl border border-slate-800 bg-slate-950 text-sm text-white focus:border-[color:var(--cyan-brand)] focus:outline-none ${prefix ? 'pl-11 pr-3.5 py-2.5' : 'px-3.5 py-2.5'} ${className}`}
      />
    </div>
  );
}

export function Fase1Catalog() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [loadingProductId, setLoadingProductId] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const uploadImage = useServerFn(uploadProductImage);

  const emptyForm = {
    sku: "",
    name_prod: "",
    marca_prod: "Nike",
    categoria_prod: "Calçados Esportivos",
    tipo_prod: "Tênis de Corrida",
    genero: "Masculino",
    modelGroup: "",
    colorVariant: "",
    costSupplier: 0,
    shippingCost: 0,
    marginPercent: 0,
    importCostIncluded: false,
    valor_dec: 0,
    discountPrice: 0,
    num_cal_min: 37,
    num_cal_max: 44,
    qtde_est: 0,
    vender_sem_estoque: true,
    siteVisible: true,
    brandVisible: true,
    badgeText: "Normal",
    descricao: "",
    imagens: [] as ProductImage[]
  };

  const [form, setForm] = useState(emptyForm);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select(PRODUCT_LIST_COLUMNS)
      .neq('status', 'deleted')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProducts(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenModal = async (prod: any = null) => {
    setImageError(null);
    if (prod) {
      setLoadingProductId(prod.id);
      const { data, error } = await supabase
        .from('products')
        .select(PRODUCT_EDIT_COLUMNS)
        .eq('id', prod.id)
        .maybeSingle();
      setLoadingProductId(null);
      if (error) {
        alert(`Erro ao abrir produto: ${error.message}`);
        return;
      }
      const source = data ?? prod;
      setEditingId(source.id);
      setForm({
        sku: source.sku || "",
        name_prod: source.name_prod || source.name || "",
        marca_prod: source.marca_prod || source.brand || "Nike",
        categoria_prod: source.categoria_prod || source.category || "Calçados Esportivos",
        tipo_prod: source.tipo_prod || source.type || "Calçados Esportivos",
        genero: source.genero || source.gender || "Masculino",
        modelGroup: source.model_group || "",
        colorVariant: source.color_variant || "",
        costSupplier: Number(source.cost_supplier || 0),
        shippingCost: Number(source.shipping_cost || 0),
        marginPercent: Number(source.margin_percent || 0),
        importCostIncluded: Boolean(source.import_cost_included ?? false),
        valor_dec: Number(source.price || source.valor_dec || 0),
        discountPrice: Number(source.old_price || source.discount_price || 0),
        num_cal_min: source.num_cal_min || 37,
        num_cal_max: source.num_cal_max || 44,
        qtde_est: source.qtde_est ?? source.stock ?? 0,
        vender_sem_estoque: source.vender_sem_estoque ?? true,
        siteVisible: source.site_visible ?? true,
        brandVisible: source.brand_visible ?? true,
        badgeText: source.tag || source.badge_text || "Normal",
        descricao: source.descricao || source.description || "",
        imagens: normalizeProductImages(source)
      });
    } else {
      setEditingId(null);
      const generatedSku = `MXR-${Math.floor(2000 + Math.random() * 7000)}`;
      setForm({ ...emptyForm, sku: generatedSku });
    }
    setModalOpen(true);
  };

  const storeProductImage = async (dataUrl: string, index: number) => {
    const sku = form.sku.trim() || `produto-${Date.now()}`;
    const { url } = await uploadImage({ data: { imageDataUrl: dataUrl, sku } });
    if (!url) throw new Error(`Imagem ${index + 1} não foi salva.`);
    return url;
  };

  const prepareImagesForSave = async () => {
    const resolved: ProductImage[] = [];
    for (let index = 0; index < form.imagens.length; index += 1) {
      const img = form.imagens[index];
      const currentUrl = img.url_imagem.trim();
      const url = isDataImageUrl(currentUrl) ? await storeProductImage(currentUrl, index) : currentUrl;
      if (url) resolved.push({ ...img, url_imagem: url });
    }
    return resolved.map((img, index) => ({ ...img, is_principal: index === 0 ? resolved.every((i) => !i.is_principal) || img.is_principal : img.is_principal }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setImageError(null);

    try {
      const orgId = await getMyOrgId();
      if (!orgId) {
        setSaving(false);
        alert("Não foi possível identificar sua organização no CRM. Faça login novamente.");
        return;
      }

      const resolvedImages = await prepareImagesForSave();
      setForm((current) => ({ ...current, imagens: resolvedImages }));

      const isHiddenByTag = !form.badgeText || form.badgeText.toLowerCase() === "nenhum";
      const finalSiteVisible = isHiddenByTag ? false : Boolean(form.siteVisible);
      const finalTag = isHiddenByTag ? "Nenhum" : form.badgeText;

      // Seção da vitrine: derivada do gênero; selo "Oferta" vai para a prateleira /ofertas.
      // Sem isso a coluna `section` caía no default 'masculino' e Feminino/Infantil/Ofertas
      // nunca apareciam nas páginas correspondentes do site.
      const generoLc = String(form.genero || "").toLowerCase();
      const sectionFromGenero = generoLc.includes("fem")
        ? "feminino"
        : generoLc.includes("inf")
          ? "infantil"
          : "masculino";
      const isOferta = /ofert|promo/.test(finalTag.toLowerCase());

      // Preço "de" (riscado) só existe quando a equipe digita um valor promocional
      // real — nunca inventado a partir do preço de venda (valor * 1.2).
      const promoPrice = Number(form.discountPrice || 0);
      const principalImage = resolvedImages.find(i => i.is_principal)?.url_imagem || resolvedImages[0]?.url_imagem || "";
      const visibleImages = resolvedImages
        .filter((i) => i.exibir_no_site !== false)
        .sort((a, b) => Number(b.is_principal) - Number(a.is_principal))
        .map((i) => i.url_imagem)
        .filter(Boolean);

      const payload: any = {
        org_id: orgId,
        sku: form.sku,
        name: form.name_prod,
        name_prod: form.name_prod,
        brand: form.marca_prod,
        marca_prod: form.marca_prod,
        category: form.categoria_prod,
        categoria_prod: form.categoria_prod,
        type: form.tipo_prod,
        tipo_prod: form.tipo_prod,
        gender: form.genero,
        genero: form.genero,
        section: isOferta ? "ofertas" : sectionFromGenero,
        model_group: form.modelGroup,
        color_variant: form.colorVariant,
        cost_supplier: Number(form.costSupplier || 0),
        shipping_cost: Number(form.shippingCost || 0),
        margin_percent: Number(form.marginPercent || 0),
        import_cost: importTaxFor(Number(form.costSupplier || 0)),
        import_cost_included: Boolean(form.importCostIncluded),
        price: Number(form.valor_dec || 0),
        valor_dec: Number(form.valor_dec || 0),
        old_price: promoPrice > 0 ? promoPrice : null,
        discount_price: promoPrice > 0 ? promoPrice : 0,
        num_cal_min: Number(form.num_cal_min || 37),
        num_cal_max: Number(form.num_cal_max || 44),
        stock: Number(form.qtde_est ?? 0),
        qtde_est: Number(form.qtde_est ?? 0),
        vender_sem_estoque: Boolean(form.vender_sem_estoque),
        site_visible: finalSiteVisible,
        brand_visible: Boolean(form.brandVisible),
        tag: finalTag,
        badge_text: finalTag,
        status: finalSiteVisible ? 'published' : 'hidden',
        descricao: form.descricao,
        description: form.descricao,
        imagens: resolvedImages,
        foto_principal: principalImage,
        img: principalImage,
        images: visibleImages
      };

      let error = null;
      if (editingId) {
        const { error: err } = await supabase.from('products').update(payload).eq('id', editingId);
        error = err;
      } else {
        const { error: err } = await supabase.from('products').insert([payload]);
        error = err;
      }

      setSaving(false);
      if (!error) {
        setModalOpen(false);
        fetchProducts();
      } else {
        alert(`Erro ao salvar no banco: ${error.message}`);
      }
    } catch (err) {
      setSaving(false);
      const message = err instanceof Error ? err.message : "Falha inesperada ao salvar o produto.";
      setImageError(message);
      alert(`Erro ao salvar no banco: ${message}`);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;
    setUploadingImages(true);
    setImageError(null);
    try {
      for (const file of files) {
        if (file.size > 12 * 1024 * 1024) throw new Error(`A imagem "${file.name}" é muito grande. Use até 12MB.`);
        const dataUrl = await imageFileToUploadDataUrl(file);
        const url = await storeProductImage(dataUrl, form.imagens.length);
        setForm(prev => ({
          ...prev,
          imagens: [...prev.imagens, { id: makeImageId(prev.imagens.length), url_imagem: url, is_principal: prev.imagens.length === 0, exibir_no_site: true }]
        }));
      }
    } catch (err) {
      setImageError(err instanceof Error ? err.message : "Não foi possível enviar a imagem.");
    } finally {
      setUploadingImages(false);
    }
  };

  const round2 = (n: number) => Math.round((Number.isFinite(n) ? n : 0) * 100) / 100;

  /**
   * Imposto de importação: VA × 60% + ICMS 17% "por dentro" + R$ 15,
   * arredondado pra cima. VA = valor de compra (Custo Fornecedor).
   * ICMS por dentro => divide por (1 - 0,17) = 0,83.
   */
  const importTaxFor = (va: number) => (va > 0 ? Math.ceil((va * 0.60) / 0.83 + 15) : 0);

  /** Custo extra entra na base de preço quando a caixa "Somar no custo" está marcada. */
  const extraCost = (f: { costSupplier: number; importCostIncluded: boolean }) =>
    f.importCostIncluded ? importTaxFor(f.costSupplier) : 0;

  /** Preço Venda Final = (Custo + Frete + [Importação]) × (1 + Margem/100) */
  const recalcPrice = (cost: number, ship: number, margin: number, extra = 0) =>
    round2((cost + ship + extra) * (1 + margin / 100));

  /** Margem % = (Preço / (Custo + Frete + [Importação]) - 1) × 100 */
  const recalcMargin = (cost: number, ship: number, price: number, extra = 0) => {
    const base = cost + ship + extra;
    if (base <= 0) return 0;
    return round2((price / base - 1) * 100);
  };

  const setCost = (v: number) =>
    setForm(f => ({ ...f, costSupplier: v, valor_dec: recalcPrice(v, f.shippingCost, f.marginPercent, f.importCostIncluded ? importTaxFor(v) : 0) }));

  const setShipping = (v: number) =>
    setForm(f => ({ ...f, shippingCost: v, valor_dec: recalcPrice(f.costSupplier, v, f.marginPercent, extraCost(f)) }));

  const setMargin = (v: number) =>
    setForm(f => ({ ...f, marginPercent: v, valor_dec: recalcPrice(f.costSupplier, f.shippingCost, v, extraCost(f)) }));

  const setFinalPrice = (v: number) =>
    setForm(f => ({ ...f, valor_dec: v, marginPercent: recalcMargin(f.costSupplier, f.shippingCost, v, extraCost(f)) }));

  /** Caixa "Somar no custo": liga/desliga o imposto na base de formação de preço. */
  const setImportIncluded = (on: boolean) =>
    setForm(f => ({
      ...f,
      importCostIncluded: on,
      valor_dec: recalcPrice(f.costSupplier, f.shippingCost, f.marginPercent, on ? importTaxFor(f.costSupplier) : 0),
    }));

  /** Trava: selo "Nenhum" força site_visible = false */
  const setBadge = (v: string) =>
    setForm(f => ({ ...f, badgeText: v, siteVisible: v === "Nenhum" ? false : f.siteVisible }));

  const setPrincipalImage = (id: string) =>
    setForm(f => ({
      ...f,
      imagens: f.imagens.map((img) => ({ ...img, is_principal: img.id === id })),
    }));

  const removeImage = (id: string) =>
    setForm(f => {
      const removed = f.imagens.find((img) => img.id === id);
      const next = f.imagens.filter((img) => img.id !== id);
      if (removed?.is_principal && next.length > 0) {
        return { ...f, imagens: next.map((img, index) => ({ ...img, is_principal: index === 0 })) };
      }
      return { ...f, imagens: next };
    });

  const badgeBlocked = form.badgeText === "Nenhum";
  const importTax = importTaxFor(form.costSupplier);
  const lucroBruto = round2(form.valor_dec - (form.costSupplier + form.shippingCost + extraCost(form)));


  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="text-xl font-black uppercase text-offwhite flex items-center gap-2">
            <Package className="text-[color:var(--cyan-brand)]" size={24} /> Estoque · Catálogo de Produtos
        </h1>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-[color:var(--cyan-brand)] text-navy font-bold px-5 py-2.5 rounded-xl hover:brightness-110 transition"
        >
          <Plus size={18} /> Novo Produto
        </button>
      </div>

      <div className="bg-card border border-border p-4 rounded-2xl flex items-center gap-4">
        <Search className="text-foreground/50" size={18} />
        <input
          type="text"
          placeholder="Buscar por SKU, nome do produto ou marca..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:border-[color:var(--cyan-brand)] focus:outline-none"
        />
        <button onClick={fetchProducts} className="p-2.5 bg-background rounded-xl hover:bg-border transition">
          <RefreshCw size={18} className="text-foreground/60" />
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-sm text-foreground/70">
          <thead className="bg-background text-xs font-semibold uppercase text-foreground/50 border-b border-border">
            <tr>
              <th className="p-4">SKU / Foto</th>
              <th className="p-4">Produto / Marca</th>
              <th className="p-4">Preço</th>
              <th className="p-4">Vitrine</th>
              <th className="p-4">Selo</th>
              <th className="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center text-foreground/50">Carregando estoque...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-foreground/50">Nenhum produto cadastrado.</td></tr>
            ) : (
              products
                .filter(p => (p.name || p.name_prod || '').toLowerCase().includes(search.toLowerCase()) || (p.sku || '').toLowerCase().includes(search.toLowerCase()))
                .map(prod => (
                  <tr key={prod.id} className="hover:bg-border/50 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-background rounded-xl border border-border overflow-hidden flex items-center justify-center">
                          {prod.img || (prod.imagens && prod.imagens[0]?.url_imagem) ? (
                            <img src={prod.img || prod.imagens[0]?.url_imagem} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Package size={20} className="text-foreground/30" />
                          )}
                        </div>
                        <span className="font-mono text-xs font-bold text-[color:var(--cyan-brand)]">{prod.sku}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-offwhite">{prod.name_prod || prod.name}</div>
                      <div className="text-xs text-foreground/50">{prod.brand || prod.marca_prod} • {prod.category || prod.categoria_prod}</div>
                    </td>
                    <td className="p-4 font-bold text-[color:var(--mint-brand)]">
                      R$ {Number(prod.price || prod.valor_dec || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-4">
                      {prod.site_visible ? (
                        <span className="text-[10px] font-bold text-[color:var(--mint-brand)] uppercase">Ativo</span>
                      ) : (
                        <span className="text-[10px] font-bold text-rose-400 uppercase">Oculto</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="text-[10px] font-bold text-purple-300 uppercase px-2 py-0.5 rounded border border-border">
                        {prod.tag || prod.badge_text || "Normal"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button disabled={loadingProductId === prod.id} onClick={() => handleOpenModal(prod)} className="p-2 bg-background hover:bg-border rounded-lg text-foreground/60 transition disabled:opacity-50">
                        {loadingProductId === prod.id ? <RefreshCw size={16} className="animate-spin" /> : <Edit size={16} />}
                      </button>
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl max-w-4xl w-full p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="font-bold text-offwhite">{editingId ? "Editar" : "Cadastrar"} — SKU: {form.sku}</h3>
              <button onClick={() => setModalOpen(false)} className="text-foreground/50 hover:text-offwhite"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* BLOCO A — Dados Principais */}
              <section className="space-y-4 rounded-2xl border border-border bg-background/30 p-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-[color:var(--cyan-brand)] flex items-center gap-2">
                  <Shield size={14} /> Bloco A · Dados Principais do Produto
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground/50 uppercase">SKU (MXR-XXXX)</label>
                    <input
                      type="text"
                      value={form.sku}
                      onChange={e => setForm({ ...form, sku: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-mono"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-bold text-foreground/50 uppercase">Nome Completo do Produto *</label>
                    <input
                      type="text"
                      required
                      value={form.name_prod}
                      onChange={e => setForm({ ...form, name_prod: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-xs font-bold text-foreground/50 uppercase">Marca *</label>
                      <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-foreground/60 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.brandVisible}
                          onChange={e => setForm({ ...form, brandVisible: e.target.checked })}
                          className="accent-[color:var(--mint-brand)]"
                        />
                        Exibir
                      </label>
                    </div>
                    <select
                      required
                      value={form.marca_prod}
                      onChange={e => setForm({ ...form, marca_prod: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm"
                    >
                      {BRAND_NAMES.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground/50 uppercase">Categoria *</label>
                    <input
                      type="text"
                      required
                      value={form.categoria_prod}
                      onChange={e => setForm({ ...form, categoria_prod: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground/50 uppercase">Tipo de Produto *</label>
                    <input
                      type="text"
                      required
                      value={form.tipo_prod}
                      onChange={e => setForm({ ...form, tipo_prod: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground/50 uppercase">Gênero</label>
                    <select
                      value={form.genero}
                      onChange={e => setForm({ ...form, genero: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm"
                    >
                      <option value="Masculino">Masculino</option>
                      <option value="Feminino">Feminino</option>
                      <option value="Infantil">Infantil</option>
                      <option value="Unissex">Unissex</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground/50 uppercase">Modelo Agrupado</label>
                    <input
                      type="text"
                      placeholder="Ex.: Pegasus 41"
                      value={form.modelGroup}
                      onChange={e => setForm({ ...form, modelGroup: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground/50 uppercase">Cor (Variante)</label>
                    <input
                      type="text"
                      placeholder="Ex.: Preto/Volt"
                      value={form.colorVariant}
                      onChange={e => setForm({ ...form, colorVariant: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm"
                    />
                  </div>
                </div>
              </section>

              {/* BLOCO B — Formação de Preço */}
              <section className="space-y-4 rounded-2xl border border-border bg-background/30 p-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-[color:var(--cyan-brand)] flex items-center gap-2">
                  <DollarSign size={14} /> Bloco B · Formação de Preço de Venda & Custos
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground/50 uppercase">Custo Fornecedor (R$)</label>
                    <CurrencyInput value={form.costSupplier} onChange={setCost} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground/50 uppercase">Valor Envio/Frete (R$)</label>
                    <CurrencyInput value={form.shippingCost} onChange={setShipping} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground/50 uppercase">Margem de Venda (%)</label>
                    <CurrencyInput value={form.marginPercent} onChange={setMargin} prefix="% " />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[color:var(--mint-brand)] uppercase">Preço Venda Final (R$)</label>
                    <CurrencyInput value={form.valor_dec} onChange={setFinalPrice} />
                  </div>
                </div>

                {/* IMPOSTO DE IMPORTAÇÃO — calculado a partir do Valor de Compra (VA) */}
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
                        checked={form.importCostIncluded}
                        onChange={e => setImportIncluded(e.target.checked)}
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
                  · Fórmula: (Custo + Frete{form.importCostIncluded ? " + Importação" : ""}) × (1 + Margem/100)
                </p>
              </section>

              {/* BLOCO C — Estoque & Numeração */}
              <section className="space-y-4 rounded-2xl border border-border bg-background/30 p-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-[color:var(--cyan-brand)] flex items-center gap-2">
                  <Package size={14} /> Bloco C · Controle de Estoque & Numeração
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground/50 uppercase">Quantidade em Estoque</label>
                    <input
                      type="number"
                      min={0}
                      value={form.qtde_est}
                      onChange={e => setForm({ ...form, qtde_est: Number(e.target.value) })}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground/50 uppercase">Numeração Mínima</label>
                    <input
                      type="number"
                      value={form.num_cal_min}
                      onChange={e => setForm({ ...form, num_cal_min: Number(e.target.value) })}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground/50 uppercase">Numeração Máxima</label>
                    <input
                      type="number"
                      value={form.num_cal_max}
                      onChange={e => setForm({ ...form, num_cal_max: Number(e.target.value) })}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm"
                    />
                  </div>
                  <label className="flex items-center gap-2 pt-7 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.vender_sem_estoque}
                      onChange={e => setForm({ ...form, vender_sem_estoque: e.target.checked })}
                      className="accent-[color:var(--mint-brand)]"
                    />
                    <span className="text-xs font-bold uppercase">Vender sem Estoque</span>
                  </label>
                </div>
              </section>

              {/* BLOCO D — Exposição no E-Commerce */}
              <section className="space-y-4 rounded-2xl border border-border bg-background/30 p-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-[color:var(--cyan-brand)] flex items-center gap-2">
                  <Star size={14} /> Bloco D · Exposição no E-Commerce & SEO
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground/50 uppercase">Selo / Tag</label>
                    <select
                      value={form.badgeText}
                      onChange={e => setBadge(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm"
                    >
                      <option value="Normal">Normal</option>
                      <option value="Destaque">Destaque</option>
                      <option value="Lançamento">Lançamento</option>
                      <option value="Mais Vendido">Mais Vendido</option>
                      <option value="Oferta">Oferta</option>
                      <option value="Nenhum">🚫 Nenhum (Sem Selo)</option>
                    </select>
                  </div>
                  <label className={`flex items-center gap-2 pt-7 ${badgeBlocked ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}>
                    <input
                      type="checkbox"
                      disabled={badgeBlocked}
                      checked={badgeBlocked ? false : form.siteVisible}
                      onChange={e => setForm({ ...form, siteVisible: e.target.checked })}
                      className="accent-[color:var(--mint-brand)]"
                    />
                    <span className="text-xs font-bold uppercase flex items-center gap-1.5">
                      {badgeBlocked ? <EyeOff size={14} /> : <Eye size={14} />} Publicar no Site (Expor Vitrine)
                    </span>
                  </label>
                  <div className="pt-7 text-[11px] text-foreground/50">
                    {badgeBlocked
                      ? "Trava ativa: selo “Nenhum” mantém o produto oculto na vitrine."
                      : "Produto entrará no carrossel do selo escolhido."}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground/50 uppercase">Descrição (SEO)</label>
                  <textarea
                    rows={3}
                    value={form.descricao}
                    onChange={e => setForm({ ...form, descricao: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm"
                  />
                </div>
              </section>

              {/* GALERIA DE FOTOS FÍSICAS REAIS */}
              <div className="space-y-4">
                <label className="text-xs font-bold text-foreground/50 uppercase flex items-center justify-between">
                  Galeria de Fotos Físicas Reais <span>{uploadingImages ? "Enviando…" : `${form.imagens.length} arquivos`}</span>
                </label>
                {imageError && (
                  <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-200">
                    {imageError}
                  </p>
                )}
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                  {form.imagens.map((img) => (
                    <div
                      key={img.id}
                      className={`relative aspect-square bg-background rounded-xl border overflow-hidden ${
                        img.is_principal ? "border-[color:var(--mint-brand)] ring-2 ring-[color:var(--mint-brand)]/40" : "border-border"
                      }`}
                    >
                      <img src={img.url_imagem} alt="Foto do produto" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(img.id)}
                        aria-label="Remover foto"
                        className="absolute top-1 right-1 bg-navy/80 p-1 rounded-md text-offwhite hover:bg-rose-500"
                      >
                        <X size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setPrincipalImage(img.id)}
                        aria-pressed={img.is_principal}
                        className={`absolute bottom-0 inset-x-0 py-1 text-[8px] font-bold uppercase transition ${
                          img.is_principal
                            ? "bg-[color:var(--mint-brand)] text-navy"
                            : "bg-navy/85 text-offwhite hover:bg-[color:var(--cyan-brand)] hover:text-navy"
                        }`}
                      >
                        {img.is_principal ? "Principal" : "Marcar principal"}
                      </button>
                    </div>
                  ))}
                  <label className={`aspect-square bg-background border border-dashed border-border rounded-xl flex flex-col items-center justify-center transition ${uploadingImages ? "cursor-wait opacity-60" : "cursor-pointer hover:bg-border/30"}`}>
                    {uploadingImages ? <RefreshCw size={20} className="animate-spin text-foreground/40" /> : <Upload size={20} className="text-foreground/30" />}
                    <span className="text-[10px] text-foreground/50 mt-1 uppercase">{uploadingImages ? "Enviando" : "Subir"}</span>
                    <input disabled={uploadingImages} type="file" accept="image/*" multiple className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>
              </div>


              <div className="flex items-center justify-end gap-3 pt-6 border-t border-border">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl border border-border font-bold text-foreground/60 hover:bg-border transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingImages}
                  className="bg-[color:var(--cyan-brand)] text-navy font-bold px-8 py-2.5 rounded-xl hover:brightness-110 transition flex items-center gap-2"
                >
                  {saving || uploadingImages ? <RefreshCw size={18} className="animate-spin" /> : <Shield size={18} />}
                  {uploadingImages ? "Enviando fotos..." : saving ? "Salvando..." : editingId ? "Atualizar Produto" : "Criar Produto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
