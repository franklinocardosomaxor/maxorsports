import type { CatalogProduct } from "@/components/site/CatalogPage";

/**
 * FLUXO ÚNICO DO CATÁLOGO (definitivo)
 *
 *   CRM Maxor → tabela `public.products` → filtro `site_visible = true`
 *             → `setCrmProducts()` → todas as vitrines do site.
 *
 * Não existe catálogo local, mock, seed ou imagem substituta. Se o CRM não
 * publicou o produto (ou não enviou foto), o site simplesmente não exibe.
 */
export type ProductWithSection = CatalogProduct & {
  section: "masculino" | "feminino" | "infantil" | "ofertas";
  modelId?: string;
  /** Selo normalizado vindo do CRM. */
  selo?: Selo;
  /** Tag original do CRM (para depuração e fallbacks). */
  raw_tag?: string;
  /** Status de visibilidade vindo do CRM. */
  site_visible?: boolean;
};

/**
 * Índice vivo do catálogo. É a MESMA referência de array durante toda a vida
 * da aplicação (mutada in-place por `setCrmProducts`), então quem já importou
 * `ALL_PRODUCTS` continua enxergando os dados atualizados do CRM.
 */
export const ALL_PRODUCTS: ProductWithSection[] = [];

type Listener = () => void;
const listeners = new Set<Listener>();

/** Assina mudanças no catálogo (usado por hooks React). */
export function subscribeCatalog(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

let version = 0;
/** Versão atual do catálogo — muda a cada sincronização com o CRM. */
export const getCatalogVersion = () => version;

const num = (v: unknown, fallback = 0) => {
  const n = typeof v === "string" ? Number(v.replace(",", ".")) : Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const inferSection = (raw: Record<string, unknown>): ProductWithSection["section"] => {
  const s = String(raw.section ?? raw.secao ?? raw.aba ?? raw.genero ?? "").toLowerCase();
  if (s.includes("fem")) return "feminino";
  if (s.includes("inf") || s.includes("kid")) return "infantil";
  if (s.includes("ofer") || s.includes("promo")) return "ofertas";
  return "masculino";
};

/** `site_visible` é a PRIMEIRA condição: sem `true`, o produto não existe pro site. */
export function isPublished(raw: Record<string, unknown>): boolean {
  const v = raw.site_visible ?? raw.siteVisible;
  if (v === undefined || v === null) return false;
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v === 1;
  return ["true", "1", "sim", "yes"].includes(String(v).trim().toLowerCase());
}

/** Selos aceitos pelo site. Produto sem selo NÃO é exibido. */
export type Selo = "destaque" | "lancamento" | "oferta" | "mais-vendido" | "normal";

const slug = (s: unknown) =>
  String(s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

/** Normaliza a tag vinda do CRM para um selo conhecido (ou `null`). */
export function normalizeSelo(raw: unknown): Selo | null {
  const s = slug(raw);
  
  // Se o campo for nulo, vazio ou explicitamente "nenhum", bloqueia.
  if (!s || s === "nenhum" || s === "sem selo" || s === "none") return null;
  
  // Mapeamento estrito para os selos de vitrine
  if (s.includes("destaq")) return "destaque";
  if (s.includes("lanc") || s.includes("novo") || s.includes("drop")) return "lancamento";
  if (s.includes("ofert") || s.includes("promo") || s.includes("especial")) return "oferta";
  if (s.includes("vend") || s.includes("best") || s.includes("popul") || s.includes("campea") || s.includes("querid")) return "mais-vendido";
  
  // "Normal" ou "Vitrine" aparecem no catálogo geral, mas NÃO em vitrines de destaque da Home
  if (s.includes("normal") || s.includes("padrao") || s.includes("vitrine")) return "normal";
  
  // Se o CRM enviar um valor que não é um selo reconhecido, bloqueia a exibição.
  // Isso impede que textos descritivos no campo Tag forcem a exibição do produto.
  return null;
}

/** Rótulo exibido no card (selos que não mostram badge devem retornar null aqui). */
export const SELO_LABEL: Record<Selo, string | null> = {
  destaque: "Destaque",
  lancamento: "Lançamento",
  oferta: "Oferta",
  "mais-vendido": "Mais Vendido",
  normal: null,
};


/**
 * Imagem utilizável pelo navegador do cliente: https público ou o proxy do
 * próprio site. Links locais do CRM (127.0.0.1/localhost/rede interna) nunca
 * carregam para o cliente final, então o produto é tratado como sem foto.
 */
export function isUsableImage(u: unknown): u is string {
  const s = String(u ?? "").trim();
  if (!s) return false;
  if (s.startsWith("/api/public/crm/image/")) return true;
  if (!/^https?:\/\//i.test(s)) return false;
  return !/^(https?:)?\/\/(127\.0\.0\.1|localhost|0\.0\.0\.0|\[::1\]|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:|\/|$)/i.test(
    s,
  );
}

/** Converte uma linha de `public.products` no formato usado pelo site. */
export function normalizeProduct(raw: Record<string, unknown>): ProductWithSection {
  const images = (Array.isArray(raw.images) ? (raw.images as unknown[]) : [])
    .map(String)
    .filter(isUsableImage);
  const mainRaw = raw.img ?? images[0];
  const img = isUsableImage(mainRaw) ? String(mainRaw) : (images[0] ?? "");

  const oldValue = raw.old_price ?? raw.old;
  const group = raw.model_group ?? raw.modelGroup ?? raw.modelId;

  const selo = normalizeSelo(raw.tag ?? raw.selo);

  return {
    id: String(raw.id ?? raw.sku ?? ""),
    name: String(raw.name ?? "Produto"),
    brand: String(raw.brand ?? "Maxor"),
    category: String(raw.category ?? "Casual"),
    price: num(raw.price),
    old: oldValue !== undefined && oldValue !== null ? num(oldValue) : undefined,
    // Tag visual para o badge do card: selos mapeados para null não exibem badge
    tag: selo ? (SELO_LABEL[selo] ?? undefined) : undefined,
    selo: selo ?? undefined,
    img,
    images: images.length > 0 ? images : undefined,
    colors: Array.isArray(raw.colors) ? (raw.colors as unknown[]).map(String) : ["#0F1720"],
    sizes: Array.isArray(raw.sizes) ? (raw.sizes as unknown[]).map((s) => num(s)) : [],
    launch: selo === "lancamento",
    section: inferSection(raw),
    modelId: group ? String(group) : undefined,
    // Armazena o selo original para depuração
    raw_tag: String(raw.tag ?? raw.selo ?? ""),
    site_visible: isPublished(raw),
  } as ProductWithSection;
}

/**
 * Substitui o catálogo do site pelos produtos publicados no CRM.
 * Regras (todas obrigatórias):
 *  1. `site_visible = true`
 *  2. selo válido (Destaque, Lançamento, Oferta ou Normal) — sem selo, não exibe
 *  3. imagem que o navegador do cliente consegue carregar
 */
export function setCrmProducts(products: unknown[] | null | undefined): number {
  const next: ProductWithSection[] = (Array.isArray(products) ? products : [])
    .map((p) => p as Record<string, unknown>)
    .filter((p) => {
      const isPub = isPublished(p);
      const selo = normalizeSelo(p.tag ?? p.selo);
      
      // GATING ESTREITO v1.6: site_visible DEVE ser true e o selo deve ser válido.
      // Se o CRM mandou o produto mas site_visible é false (ou não enviado), ele NÃO entra no site.
      return isPub === true && selo !== null;
    })
    .map(normalizeProduct)
    .filter((p) => p.id && isUsableImage(p.img));

  // Substituição total e imediata para evitar produtos fantasmas (stale state)
  ALL_PRODUCTS.length = 0;
  ALL_PRODUCTS.push(...next);
  
  version += 1;
  listeners.forEach((fn) => fn());
  return ALL_PRODUCTS.length;
}


/** Alias mantido por compatibilidade — o fluxo é sempre substituição total. */
export const mergeCrmProducts = setCrmProducts;

export function getProduct(id: string): ProductWithSection | undefined {
  return ALL_PRODUCTS.find((p) => p.id === id);
}

/** Variantes de cor do mesmo modelo (agrupadas por `model_group` do CRM). */
export function getVariants(base: ProductWithSection): ProductWithSection[] {
  const key = base.modelId ?? base.id;
  const seen = new Set<string>();
  const out: ProductWithSection[] = [];
  for (const p of ALL_PRODUCTS) {
    const k = p.modelId ?? p.id;
    if (k !== key) continue;
    const dedupKey = `${p.name}::${p.colors[0] ?? ""}`;
    if (seen.has(dedupKey)) continue;
    seen.add(dedupKey);
    out.push(p);
  }
  return out.sort((a, b) => (a.id === base.id ? -1 : b.id === base.id ? 1 : 0));
}

export const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/** Produtos de uma seção (sempre vindos do CRM). */
export function getSectionProducts(section: ProductWithSection["section"]) {
  return ALL_PRODUCTS.filter((p) => p.section === section);
}

/** Converte o nome da marca em slug ("New Balance" -> "new-balance"). */
export const brandSlug = (s: string) =>
  String(s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/** Produtos de uma marca (sempre vindos do CRM). */
export function getBrandProducts(slug: string) {
  return ALL_PRODUCTS.filter((p) => brandSlug(p.brand) === slug);
}

/** Produtos de uma categoria de roupa/linha (ex.: "Academia"). */
export function getCategoryProducts(category: string) {
  const key = brandSlug(category);
  return ALL_PRODUCTS.filter((p) => brandSlug(p.category) === key);
}
