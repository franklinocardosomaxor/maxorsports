import type { CatalogProduct } from "@/components/site/CatalogPage";
import {
  brandSlug,
  buildBrandDirectory,
  canonicalBrandName,
  getBrandDef,
  productMatchesBrand,
  type BrandDirectoryEntry,
} from "@/lib/brands";

export { brandSlug };

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
  /** Nome/descrição da cor cadastrada no CRM para esta variante. */
  colorVariant?: string;
  /** Quantas variantes publicadas existem neste mesmo modelo. */
  variantCount?: number;
  /** Selo normalizado vindo do CRM. */
  selo?: Selo;
  /** Tag original do CRM (para depuração e fallbacks). */
  raw_tag?: string;
  /** Status de visibilidade vindo do CRM. */
  site_visible?: boolean;
  /** Status de visibilidade na página de marcas. */
  brand_visible?: boolean;
  /** Gênero cadastrado no CRM (masculino, feminino, infantil, unissex). */
  gender?: string;
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

let loaded = false;
/** true depois que a PRIMEIRA sincronização com o CRM terminou (sucesso ou não). */
export const isCatalogLoaded = () => loaded;

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

const clean = (v: unknown) => String(v ?? "").trim();

const GENERIC_MODEL_GROUPS = new Set([
  "tenis",
  "tenis-masculino",
  "tenis-feminino",
  "calcado",
  "calcados",
  "calcados-esportivos",
  "sapato",
  "produto",
  "modelo",
  "masculino",
  "feminino",
  "infantil",
  "unissex",
]);

const COLOR_SUFFIX_WORDS = [
  "preto",
  "preta",
  "branco",
  "branca",
  "azul",
  "vermelho",
  "vermelha",
  "verde",
  "amarelo",
  "amarela",
  "cinza",
  "grafite",
  "bege",
  "marrom",
  "rosa",
  "roxo",
  "roxa",
  "laranja",
  "off white",
  "off-white",
  "black",
  "white",
  "blue",
  "red",
  "green",
  "yellow",
  "grey",
  "gray",
  "pink",
  "purple",
  "orange",
  "brown",
  "cream",
  "volt",
];

const MODEL_SUFFIX_WORDS = new Set([
  "ep",
  "se",
  "sp",
  "qs",
  "gs",
  "ps",
  "td",
  "w",
  "wmns",
  "women",
  "womens",
  "premium",
]);

const ROMAN_MODEL_NUMBERS = new Map<string, string>([
  ["i", "1"],
  ["ii", "2"],
  ["iii", "3"],
  ["iv", "4"],
  ["v", "5"],
  ["vi", "6"],
  ["vii", "7"],
  ["viii", "8"],
  ["ix", "9"],
  ["x", "10"],
  ["xi", "11"],
  ["xii", "12"],
  ["xiii", "13"],
  ["xiv", "14"],
  ["xv", "15"],
]);

function stripBrandPrefix(name: string, brand: unknown): string {
  const canonicalBrand = canonicalBrandName(brand);
  const candidates = [canonicalBrand, brand].filter(Boolean).map((v) => String(v));
  let out = name;
  for (const candidate of candidates) {
    const escaped = candidate.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    out = out.replace(new RegExp(`^${escaped}[\\s/|:-]+`, "i"), "").trim();
  }
  return out;
}

function stripTrailingColorWords(name: string): string {
  let out = name;
  for (const word of COLOR_SUFFIX_WORDS) {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    out = out.replace(new RegExp(`[\\s/|:-]+${escaped}$`, "i"), "").trim();
  }
  return out || name;
}

function stripQuotedNickname(name: string): string {
  return name
    .replace(/["'“”‘’][^"'“”‘’]+["'“”‘’]/g, " ")
    .replace(/\([^)]*\)/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function canonicalModelKey(model: unknown, brand: unknown): string {
  const cleaned = stripQuotedNickname(stripTrailingColorWords(stripBrandPrefix(clean(model), brand)));
  if (!cleaned) return "";

  const tokens = brandSlug(cleaned)
    .split("-")
    .filter(Boolean)
    .map((token) => ROMAN_MODEL_NUMBERS.get(token) ?? token);

  while (tokens.length > 2) {
    const last = tokens.at(-1);
    if (!last || !MODEL_SUFFIX_WORDS.has(last)) break;
    tokens.pop();
  }

  return tokens.join("-");
}

function isSpecificModelGroup(modelGroup: unknown, brand: unknown): boolean {
  const model = clean(modelGroup);
  if (!model) return false;
  const modelKey = brandSlug(model);
  if (!modelKey || GENERIC_MODEL_GROUPS.has(modelKey)) return false;
  const brandKey = brandSlug(canonicalBrandName(brand) ?? brand);
  if (brandKey && modelKey === brandKey) return false;
  const asBrand = canonicalBrandName(model);
  if (asBrand && brandSlug(asBrand) === modelKey && modelKey !== brandSlug(model)) return false;
  return true;
}

/**
 * Quando o CRM não envia um `model_group` útil, deriva a família do produto
 * removendo marca e cor. Isso une variações reais sem colapsar uma marca inteira.
 */
export function inferModelGroup(name: unknown, colorVariant: unknown, brand?: unknown): string {
  const rawName = clean(name);
  const rawColor = clean(colorVariant);
  if (!rawName) return "";
  const withoutBrand = stripBrandPrefix(rawName, brand);
  if (!rawColor) return stripTrailingColorWords(withoutBrand);
  const nameLc = withoutBrand.toLowerCase();
  const colorLc = rawColor.toLowerCase();
  if (!nameLc.endsWith(colorLc)) return stripTrailingColorWords(withoutBrand);
  return withoutBrand.slice(0, withoutBrand.length - rawColor.length).replace(/[\s\-/|]+$/g, "").trim() || withoutBrand;
}

/** Chave humana do modelo: usa `model_group` só quando ele não é genérico. */
export function deriveModelGroup(name: unknown, colorVariant: unknown, brand: unknown, modelGroup?: unknown): string {
  const inferred = inferModelGroup(name, colorVariant, brand);
  if (!isSpecificModelGroup(modelGroup, brand)) return inferred;
  // Se o CRM enviou um agrupamento específico, ele é a fonte soberana.
  // Isso preserva a escolha feita no seletor "Modelo Agrupado" e impede que
  // o nome do produto sobrescreva silenciosamente o vínculo entre colorways.
  return clean(modelGroup);
}

function modelKeyFromParts(name: unknown, colorVariant: unknown, brand: unknown, modelGroup?: unknown): string {
  const model = clean(modelGroup);
  const inferred = inferModelGroup(name, colorVariant, brand);
  const modelKey = isSpecificModelGroup(model, brand) ? canonicalModelKey(model, brand) : "";
  const inferredKey = canonicalModelKey(inferred, brand);

  // O agrupamento salvo no CRM deve vencer a inferência do título. A inferência
  // só existe como fallback quando não há `model_group` útil.
  if (modelKey) return modelKey;
  return inferredKey;
}

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
/** Converte vários formatos para boolean. */
export const toBool = (v: unknown, fallback = false): boolean => {
  if (v === null || v === undefined) return fallback;
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v !== 0;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    if (["true", "1", "sim", "s", "yes", "y", "ativo", "publicado"].includes(s)) return true;
    if (["false", "0", "nao", "não", "n", "no", "inativo", "oculto"].includes(s)) return false;
  }
  return fallback;
};


/** Converte uma linha de `public.products` no formato usado pelo site. */
export function normalizeProduct(raw: Record<string, unknown>): ProductWithSection {
  const images = (Array.isArray(raw.images) ? (raw.images as unknown[]) : [])
    .map(String)
    .filter(isUsableImage);
  const mainRaw = raw.img ?? images[0];
  const img = isUsableImage(mainRaw) ? String(mainRaw) : (images[0] ?? "");

  const oldValue = raw.old_price ?? raw.old;
  const colorVariant = clean(raw.color_variant ?? raw.colorVariant ?? raw.cor_variante ?? raw.cor);
  const group = deriveModelGroup(raw.name, colorVariant, raw.brand ?? raw.marca_prod, raw.model_group ?? raw.modelGroup ?? raw.modelId);

  const selo = normalizeSelo(raw.tag ?? raw.selo);

  return {
    id: String(raw.id ?? raw.sku ?? ""),
    name: String(raw.name ?? "Produto"),
    // Marca canonizada pela fonte única (src/lib/brands.ts). Aceita tanto a
    // coluna soberana `brand` quanto o espelho legado `marca_prod`.
    brand: canonicalBrandName(raw.brand ?? raw.marca_prod) ?? "Maxor",
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
    modelId: group || undefined,
    colorVariant: colorVariant || undefined,
    // Armazena o selo original para depuração
    raw_tag: String(raw.tag ?? raw.selo ?? ""),
    site_visible: isPublished(raw),
    brand_visible: toBool(raw.brand_visible ?? raw.brandVisible, true),
    gender: clean(raw.genero ?? raw.gender ?? raw.section) || undefined,
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
      
      // GATING ESTREITO v1.7: site_visible DEVE ser true e o selo deve ser válido.
      // Se o CRM mandou o produto mas site_visible é false (ou não enviado), ele NÃO entra no site.
      return isPub === true && selo !== null && selo !== undefined;
    })
    .map(normalizeProduct)
    .filter((p) => p.id && isUsableImage(p.img));

  // Substituição total e imediata para evitar produtos fantasmas (stale state).
  // Se o banco estiver zerado no CRM, `next` será vazio e o site refletirá isso.
  ALL_PRODUCTS.length = 0;
  if (next.length > 0) {
    ALL_PRODUCTS.push(...next);
  }

  loaded = true;
  version += 1;
  listeners.forEach((fn) => fn());
  return ALL_PRODUCTS.length;

}


/** Alias mantido por compatibilidade — o fluxo é sempre substituição total. */
export const mergeCrmProducts = setCrmProducts;

/** Chave estável para reunir variantes do mesmo modelo na vitrine. */
export function productModelKey(p: ProductWithSection): string {
  const modelKey = modelKeyFromParts(p.name, p.colorVariant, p.brand, p.modelId);
  if (!modelKey) return `${brandSlug(p.brand)}::${p.id}`;
  return `${brandSlug(p.brand)}::${modelKey}`;
}

/** Variantes de cor do mesmo modelo dentro de uma lista informada. */
export function getVariantsFromProducts(
  products: ReadonlyArray<ProductWithSection>,
  base: ProductWithSection,
): ProductWithSection[] {
  const key = productModelKey(base);
  const seen = new Set<string>();
  const out: ProductWithSection[] = [];
  for (const p of products) {
    const k = productModelKey(p);
    if (k !== key) continue;
    const dedupKey = `${p.id}::${p.colorVariant ?? p.colors[0] ?? ""}`;
    if (seen.has(dedupKey)) continue;
    seen.add(dedupKey);
    out.push(p);
  }
  return out.sort((a, b) => (a.id === base.id ? -1 : b.id === base.id ? 1 : 0));
}

/**
 * Mostra um único card por modelo nas vitrines, mantendo as variações reunidas
 * para a página de produto. A referência escolhida aponta para a variante mais
 * recente/visível recebida do CRM.
 */
export function groupProductsByModel(products: ReadonlyArray<ProductWithSection>): ProductWithSection[] {
  const grouped = new Map<string, { index: number; items: ProductWithSection[] }>();
  products.forEach((p, index) => {
    const key = productModelKey(p);
    const bucket = grouped.get(key);
    if (bucket) bucket.items.push(p);
    else grouped.set(key, { index, items: [p] });
  });

  return Array.from(grouped.values())
    .sort((a, b) => a.index - b.index)
    .map(({ items }) => {
      const rep = items[0];
      const colors = Array.from(new Set(items.flatMap((p) => p.colors).filter(Boolean)));
      const images = Array.from(new Set(items.flatMap((p) => [p.img, ...(p.images ?? [])]).filter(Boolean)));
      return {
        ...rep,
        name: rep.modelId || rep.name,
        colors: colors.length > 0 ? colors : rep.colors,
        images: images.length > 0 ? images : rep.images,
        variantCount: items.length,
      };
    });
}

export function getProduct(id: string): ProductWithSection | undefined {
  return ALL_PRODUCTS.find((p) => p.id === id);
}

/** Variantes de cor do mesmo modelo (agrupadas por `model_group` do CRM). */
export function getVariants(base: ProductWithSection): ProductWithSection[] {
  return getVariantsFromProducts(ALL_PRODUCTS, base);
}

export const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/** Produto cadastrado como unissex no CRM (aparece em masculino e feminino). */
export function isUnisexProduct(p: ProductWithSection): boolean {
  const g = slug(p.gender);
  return g.includes("unissex") || g.includes("unisex");
}

/**
 * Produtos de uma seção (sempre vindos do CRM).
 * Nas vitrines de gênero cada variação de cor é listada individualmente
 * (sem agrupar por modelo) e os unissex aparecem em masculino e feminino.
 */
export function getSectionProducts(section: ProductWithSection["section"]) {
  return ALL_PRODUCTS.filter((p) => {
    if (p.section === section) return true;
    if ((section === "masculino" || section === "feminino") && isUnisexProduct(p)) return true;
    return false;
  });
}

/**
 * Vitrine própria de unissex: cada variação de cor listada individualmente,
 * sem alterar a regra que já os exibe em masculino e feminino.
 */
export function getUnisexProducts() {
  return ALL_PRODUCTS.filter(isUnisexProduct);
}

/** Produtos de uma marca (sempre vindos do CRM). */
export function getBrandProducts(slug: string) {
  const def = getBrandDef(slug);
  return groupProductsByModel(ALL_PRODUCTS.filter((p) => {
    if (p.brand_visible === false) return false;
    // Regra única de matching (src/lib/brands.ts). Marcas-categoria como
    // Chuteiras filtram pela categoria — o produto mantém a marca real.
    if (def) return productMatchesBrand(p, def);
    // Marca que existe só no CRM (fora da lista estática): slug derivado
    // do nome canonizado — mesma regra do diretório vivo.
    return brandSlug(p.brand) === slug;
  }));
}

/**
 * Diretório VIVO de marcas: lista estática (src/lib/brands.ts) + marcas
 * descobertas nos produtos do CRM, com contagem atualizada a cada sync.
 * Menu Tênis, /marcas, /marcas/$slug e o carrossel da Home leem daqui.
 */
export function getBrandDirectory(): BrandDirectoryEntry[] {
  return buildBrandDirectory(ALL_PRODUCTS);
}


/**
 * Slugs de marcas que possuem ao menos um produto com `brand_visible = true`.
 * Usado pelo carrossel de marcas da Home para refletir o CRM em tempo real.
 */
export function getVisibleBrandSlugs(): string[] {
  return Array.from(
    new Set(
      ALL_PRODUCTS.filter((p) => p.brand_visible !== false).map((p) => brandSlug(p.brand)),
    ),
  );
}


/** Produtos de uma categoria de roupa/linha (ex.: "Academia"). */
export function getCategoryProducts(category: string) {
  const key = brandSlug(category);
  return groupProductsByModel(ALL_PRODUCTS.filter((p) => brandSlug(p.category) === key));
}
