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

/** Converte uma linha de `public.products` no formato usado pelo site. */
export function normalizeProduct(raw: Record<string, unknown>): ProductWithSection {
  const images = Array.isArray(raw.images)
    ? (raw.images as unknown[]).map(String).filter(Boolean)
    : [];
  const img = String(raw.img ?? images[0] ?? "");

  return {
    id: String(raw.id ?? raw.sku ?? ""),
    name: String(raw.name ?? "Produto"),
    brand: String(raw.brand ?? "Maxor"),
    category: String(raw.category ?? "Casual"),
    price: num(raw.price),
    old: raw.old !== undefined && raw.old !== null ? num(raw.old) : undefined,
    tag: raw.tag ? String(raw.tag) : undefined,
    img,
    images: images.length > 0 ? images : undefined,
    colors: Array.isArray(raw.colors) ? (raw.colors as unknown[]).map(String) : ["#0F1720"],
    sizes: Array.isArray(raw.sizes) ? (raw.sizes as unknown[]).map((s) => num(s)) : [],
    launch: Boolean(raw.launch),
    section: inferSection(raw),
    modelId: raw.modelId ? String(raw.modelId) : undefined,
  } as ProductWithSection;
}

/**
 * Substitui o catálogo do site pelos produtos publicados no CRM.
 * Só entram linhas com `site_visible = true` E com imagem cadastrada no CRM.
 */
export function setCrmProducts(products: unknown[] | null | undefined): number {
  const next: ProductWithSection[] = (Array.isArray(products) ? products : [])
    .map((p) => p as Record<string, unknown>)
    .filter(isPublished)
    .map(normalizeProduct)
    .filter((p) => p.id && p.img);

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
