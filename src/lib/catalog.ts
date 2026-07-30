import type { CatalogProduct } from "@/components/site/CatalogPage";
import { MASCULINO, FEMININO, INFANTIL } from "@/components/site/catalog-data";
import { OFERTAS } from "@/components/site/ofertas-data";

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

export const ALL_PRODUCTS: ProductWithSection[] = [
  ...tag(MASCULINO, "masculino"),
  ...tag(FEMININO, "feminino"),
  ...tag(INFANTIL, "infantil"),
  ...tag(OFERTAS, "ofertas"),
];

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
