import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Search, Eye, EyeOff, Package, 
  DollarSign, X, Upload, Shield, RefreshCw, Star 
} from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";

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

  const emptyForm = {
    sku: "",
    name_prod: "",
    marca_prod: "Nike",
    categoria_prod: "Calçados Esportivos",
    tipo_prod: "Tênis de Corrida",
    genero: "Masculino",
    modelGroup: "",
    colorVariant: "",
    costSupplier: 91.00,
    shippingCost: 85.00,
    marginPercent: 87.44,
    valor_dec: 329.90,
    discountPrice: 396.00,
    num_cal_min: 37,
    num_cal_max: 44,
    qtde_est: 0,
    vender_sem_estoque: true,
    siteVisible: true,
    brandVisible: true,
    badgeText: "Normal",
    descricao: "",
    imagens: [] as any[]
  };

  const [form, setForm] = useState(emptyForm);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
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

  const handleOpenModal = (prod: any = null) => {
    if (prod) {
      setEditingId(prod.id);
      setForm({
        sku: prod.sku || "",
        name_prod: prod.name_prod || prod.name || "",
        marca_prod: prod.marca_prod || prod.brand || "Nike",
        categoria_prod: prod.categoria_prod || prod.category || "Calçados Esportivos",
        tipo_prod: prod.tipo_prod || prod.type || "Calçados Esportivos",
        genero: prod.genero || prod.gender || "Masculino",
        modelGroup: prod.model_group || "",
        colorVariant: prod.color_variant || "",
        costSupplier: Number(prod.cost_supplier || 0),
        shippingCost: Number(prod.shipping_cost || 0),
        marginPercent: Number(prod.margin_percent || 0),
        valor_dec: Number(prod.price || prod.valor_dec || 329.90),
        discountPrice: Number(prod.old_price || prod.discount_price || 396.00),
        num_cal_min: prod.num_cal_min || 37,
        num_cal_max: prod.num_cal_max || 44,
        qtde_est: prod.qtde_est ?? prod.stock ?? 0,
        vender_sem_estoque: prod.vender_sem_estoque ?? true,
        siteVisible: prod.site_visible ?? true,
        brandVisible: prod.brand_visible ?? true,
        badgeText: prod.tag || prod.badge_text || "Normal",
        descricao: prod.descricao || prod.description || "",
        imagens: Array.isArray(prod.imagens) ? prod.imagens : []
      });
    } else {
      setEditingId(null);
      const generatedSku = `MXR-${Math.floor(2000 + Math.random() * 7000)}`;
      setForm({ ...emptyForm, sku: generatedSku });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const isHiddenByTag = !form.badgeText || form.badgeText.toLowerCase() === "nenhum";
    const finalSiteVisible = isHiddenByTag ? false : Boolean(form.siteVisible);
    const finalTag = isHiddenByTag ? "Nenhum" : form.badgeText;

    const payload: any = {
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
      model_group: form.modelGroup,
      color_variant: form.colorVariant,
      cost_supplier: Number(form.costSupplier || 0),
      shipping_cost: Number(form.shippingCost || 0),
      margin_percent: Number(form.marginPercent || 0),
      price: Number(form.valor_dec || 0),
      valor_dec: Number(form.valor_dec || 0),
      old_price: Number(form.discountPrice || Number(form.valor_dec || 0) * 1.2),
      discount_price: Number(form.discountPrice || Number(form.valor_dec || 0) * 1.2),
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
      imagens: form.imagens
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
      alert(`Erro ao salvar no Supabase: ${error.message}`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const b64 = reader.result as string;
        setForm(prev => ({
          ...prev,
          imagens: [...prev.imagens, { id: `img_${Date.now()}`, url_imagem: b64, is_principal: prev.imagens.length === 0, exibir_no_site: true }]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="text-xl font-black uppercase text-offwhite flex items-center gap-2">
            <Package className="text-[color:var(--cyan-brand)]" size={24} /> Fase 1 · Catálogo
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
                      <button onClick={() => handleOpenModal(prod)} className="p-2 bg-background hover:bg-border rounded-lg text-foreground/60 transition">
                        <Edit size={16} />
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
            {/* Form omitted for brevity in response, logic is handled in the file */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground/50 uppercase">SKU</label>
                  <input
                    type="text"
                    value={form.sku}
                    onChange={e => setForm({...form, sku: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-foreground/50 uppercase">Nome do Produto</label>
                  <input
                    type="text"
                    value={form.name_prod}
                    onChange={e => setForm({...form, name_prod: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground/50 uppercase">Marca</label>
                  <select
                    value={form.marca_prod}
                    onChange={e => setForm({...form, marca_prod: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm"
                  >
                    <option value="Nike">Nike</option>
                    <option value="Adidas">Adidas</option>
                    <option value="Mizuno">Mizuno</option>
                    <option value="Asics">Asics</option>
                    <option value="Puma">Puma</option>
                    <option value="Oakley">Oakley</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground/50 uppercase">Categoria</label>
                  <input
                    type="text"
                    value={form.categoria_prod}
                    onChange={e => setForm({...form, categoria_prod: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground/50 uppercase">Tipo</label>
                  <input
                    type="text"
                    value={form.tipo_prod}
                    onChange={e => setForm({...form, tipo_prod: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground/50 uppercase">Gênero</label>
                  <select
                    value={form.genero}
                    onChange={e => setForm({...form, genero: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm"
                  >
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                    <option value="Unissex">Unissex</option>
                    <option value="Kids">Kids</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-background/30 p-4 rounded-2xl border border-border">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground/50 uppercase">Custo Fornecedor</label>
                  <CurrencyInput value={form.costSupplier} onChange={v => setForm({...form, costSupplier: v})} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground/50 uppercase">Frete</label>
                  <CurrencyInput value={form.shippingCost} onChange={v => setForm({...form, shippingCost: v})} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground/50 uppercase">Margem (%)</label>
                  <input
                    type="number"
                    value={form.marginPercent}
                    onChange={e => setForm({...form, marginPercent: Number(e.target.value)})}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground/50 uppercase">Preço Venda</label>
                  <CurrencyInput value={form.valor_dec} onChange={v => setForm({...form, valor_dec: v})} />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground/50 uppercase">Estoque Qtd</label>
                  <input
                    type="number"
                    value={form.qtde_est}
                    onChange={e => setForm({...form, qtde_est: Number(e.target.value)})}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground/50 uppercase">Selo Vitrine</label>
                  <select
                    value={form.badgeText}
                    onChange={e => setForm({...form, badgeText: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm"
                  >
                    <option value="Normal">Normal (Sem Selo)</option>
                    <option value="Destaque">Destaque</option>
                    <option value="Lançamento">Lançamento</option>
                    <option value="Oferta">Oferta</option>
                    <option value="Nenhum">Nenhum (Ocultar)</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 pt-8">
                  <input
                    type="checkbox"
                    checked={form.siteVisible}
                    onChange={e => setForm({...form, siteVisible: e.target.checked})}
                  />
                  <label className="text-xs font-bold uppercase">Visível no Site</label>
                </div>
                <div className="flex items-center gap-2 pt-8">
                  <input
                    type="checkbox"
                    checked={form.brandVisible}
                    onChange={e => setForm({...form, brandVisible: e.target.checked})}
                  />
                  <label className="text-xs font-bold uppercase">Visível em Marcas</label>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-bold text-foreground/50 uppercase flex items-center justify-between">
                  Imagens <span>{form.imagens.length} arquivos</span>
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                  {form.imagens.map((img, idx) => (
                    <div key={img.id} className="relative aspect-square bg-background rounded-xl border border-border overflow-hidden">
                      <img src={img.url_imagem} className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => setForm(f => ({...f, imagens: f.imagens.filter(i => i.id !== img.id)}))}
                        className="absolute top-1 right-1 bg-black/50 p-1 rounded-md text-white hover:bg-rose-500"
                      >
                        <X size={12} />
                      </button>
                      {img.is_principal && <div className="absolute bottom-0 inset-x-0 bg-[color:var(--mint-brand)] text-navy text-[8px] font-bold text-center py-0.5">PRINCIPAL</div>}
                    </div>
                  ))}
                  <label className="aspect-square bg-background border border-dashed border-border rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-border/30 transition">
                    <Upload size={20} className="text-foreground/30" />
                    <span className="text-[10px] text-foreground/50 mt-1 uppercase">Subir</span>
                    <input type="file" multiple className="hidden" onChange={handleFileUpload} />
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
                  disabled={saving}
                  className="bg-[color:var(--cyan-brand)] text-navy font-bold px-8 py-2.5 rounded-xl hover:brightness-110 transition flex items-center gap-2"
                >
                  {saving ? <RefreshCw size={18} className="animate-spin" /> : <Shield size={18} />}
                  {saving ? "Salvando..." : editingId ? "Atualizar Produto" : "Criar Produto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
