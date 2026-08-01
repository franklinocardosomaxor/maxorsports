import type { CatalogProduct } from "@/components/site/CatalogPage";
import { MASCULINO, FEMININO, INFANTIL } from "@/components/site/catalog-data";
import { OFERTAS } from "@/components/site/ofertas-data";
import { normalizeProduct } from "@/lib/crm-catalog";


/**
 * Índice unificado do catálogo — reunimos Masculino, Feminino, Infantil e Ofertas
 * numa lista única para viabilizar a PDP (`/produto/$id`) e o agrupamento
 * automático por variações de cor.
 *
 * Estratégia de agrupamento de cores (a ser refinada no CRM):
 *  1. Se o produto tiver `modelId` (campo opcional a ser preenchido via CRM),
 *     variantes = todos os produtos com o mesmo `modelId`.
 *  2. Fallback automático (para a demo): mesma URL de imagem base implica
 *     mesmo modelo entre gêneros (Boston/Ultraboost/AF1 etc.). Isso replica
 *     o mesmo "modelo" nas coleções Masculino/Feminino/Infantil.
 *
 * Quando o CRM começar a alimentar `modelId`, o fallback vira supérfluo.
 */
export type ProductWithSection = CatalogProduct & {
  section: "masculino" | "feminino" | "infantil" | "ofertas";
  modelId?: string;
};


const tag = (list: CatalogProduct[], section: ProductWithSection["section"]) =>
  list.map((p) => ({ ...p, section }) as ProductWithSection);

/** Catálogo local (fallback usado enquanto o CRM não sincroniza). */
export const LOCAL_PRODUCTS: ProductWithSection[] = [
  ...tag(MASCULINO, "masculino"),
  ...tag(FEMININO, "feminino"),
  ...tag(INFANTIL, "infantil"),
  ...tag(OFERTAS, "ofertas"),
];

/**
 * Índice vivo do catálogo. É a MESMA referência de array durante toda a vida
 * da aplicação (mutada in-place por `setCrmProducts`), então quem já importou
 * `ALL_PRODUCTS` continua enxergando os dados atualizados do CRM.
 */
export const ALL_PRODUCTS: ProductWithSection[] = [...LOCAL_PRODUCTS];

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

const inferSection = (raw: Record<string, unknown>): ProductWithSection["section"] => {
  const s = String(raw.section ?? raw.secao ?? raw.aba ?? raw.genero ?? "").toLowerCase();
  if (s.includes("fem")) return "feminino";
  if (s.includes("inf") || s.includes("kid")) return "infantil";
  if (s.includes("ofer") || s.includes("promo")) return "ofertas";
  return "masculino";
};

/**
 * Substitui o catálogo do site pelos produtos vindos do CRM Maxor.
 * Passe uma lista vazia/nula para voltar ao catálogo local.
 */
export function setCrmProducts(products: unknown[] | null | undefined): number {
  const next: ProductWithSection[] =
    Array.isArray(products) && products.length > 0
      ? products.map((p) => {
          const raw = p as Record<string, unknown>;
          return {
            ...normalizeProduct(raw),
            section: inferSection(raw),
            modelId: raw.modelId ? String(raw.modelId) : undefined,
          };
        })
      : [...LOCAL_PRODUCTS];

  ALL_PRODUCTS.length = 0;
  ALL_PRODUCTS.push(...next);
  version += 1;
  listeners.forEach((fn) => fn());
  return ALL_PRODUCTS.length;
}

/**
 * Mescla produtos vindos do banco compartilhado (CRM) com o catálogo local.
 * Os produtos do CRM ficam à frente; os locais permanecem como vitrine base.
 */
export function mergeCrmProducts(products: unknown[] | null | undefined): number {
  const crm: ProductWithSection[] =
    Array.isArray(products) && products.length > 0
      ? products.map((p) => {
          const raw = p as Record<string, unknown>;
          return {
            ...normalizeProduct(raw),
            section: inferSection(raw),
            modelId: raw.modelId ? String(raw.modelId) : undefined,
          };
        })
      : [];

  const ids = new Set(crm.map((p) => p.id));
  ALL_PRODUCTS.length = 0;
  ALL_PRODUCTS.push(...crm, ...LOCAL_PRODUCTS.filter((p) => !ids.has(p.id)));
  version += 1;
  listeners.forEach((fn) => fn());
  return crm.length;
}

export function getProduct(id: string): ProductWithSection | undefined {
  return ALL_PRODUCTS.find((p) => p.id === id);
}


/**
 * Retorna variantes de cor do mesmo modelo, incluindo o próprio produto.
 * Preferência: `modelId`. Fallback: mesma `img` base.
 */
export function getVariants(base: ProductWithSection): ProductWithSection[] {
  const key = base.modelId ?? base.img;
  const seen = new Set<string>();
  const out: ProductWithSection[] = [];
  for (const p of ALL_PRODUCTS) {
    const k = p.modelId ?? p.img;
    if (k !== key) continue;
    // deduplica por (nome + primeira cor) para não repetir o mesmo card
    const dedupKey = `${p.name}::${p.colors[0] ?? ""}`;
    if (seen.has(dedupKey)) continue;
    seen.add(dedupKey);
    out.push(p);
  }
  // coloca o produto atual primeiro
  return out.sort((a, b) => (a.id === base.id ? -1 : b.id === base.id ? 1 : 0));
}

export const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/** Produtos de uma seção (inclui os cadastrados no CRM). */
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

/** Produtos de uma marca (inclui os cadastrados no CRM). */
export function getBrandProducts(slug: string) {
  return ALL_PRODUCTS.filter((p) => brandSlug(p.brand) === slug);
}

