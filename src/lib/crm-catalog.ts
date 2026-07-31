/**
 * Integração com o catálogo público do CRM Maxor Sports.
 *
 * Endpoint esperado (CRM):  GET {BASE}/api/site/catalog
 * Resposta esperada:
 *   { tabs: { masculino: [...], feminino: [...], lancamentos: [...], ... } }
 *
 * Configure a URL base no `.env`:
 *   VITE_CRM_API_URL="https://sua-url-da-api"
 * Em testes locais o padrão é http://127.0.0.1:3333
 *
 * Enquanto o CRM não estiver no ar, `loadCatalogTabs()` cai automaticamente
 * nos dados locais (`MASCULINO`, `FEMININO`, `INFANTIL`, `OFERTAS`).
 */

import type { CatalogProduct } from "@/components/site/CatalogPage";
import { MASCULINO, FEMININO, INFANTIL } from "@/components/site/catalog-data";
import { OFERTAS } from "@/components/site/ofertas-data";
import { productPlaceholder } from "@/lib/product-media";

const RAW_CRM_URL = (import.meta.env.VITE_CRM_API_URL as string | undefined)?.replace(/\/$/, "") ?? "";

/**
 * A sincronização só é considerada configurada quando a URL do CRM é pública
 * (http/https e fora de localhost). Assim o site não tenta buscar 127.0.0.1 no
 * navegador do cliente — o que gerava "Failed to fetch" e faixa de erro.
 */
export const CRM_CONFIGURED =
  /^https?:\/\//.test(RAW_CRM_URL) && !/(^https?:\/\/)(localhost|127\.0\.0\.1|0\.0\.0\.0)/.test(RAW_CRM_URL);

export const CRM_API_BASE_URL = RAW_CRM_URL || "http://127.0.0.1:3333";

/** URL pública do catálogo do CRM Maxor Sports. */
export const CRM_CATALOG_URL = `${CRM_API_BASE_URL}/api/site/catalog`;

export type CatalogTabKey =
  | "masculino"
  | "feminino"
  | "infantil"
  | "lancamentos"
  | "ofertas";

export type CatalogTabs = Record<CatalogTabKey, CatalogProduct[]>;

/** Dados locais usados como fallback enquanto o CRM não responde. */
export const LOCAL_CATALOG_TABS: CatalogTabs = {
  masculino: MASCULINO,
  feminino: FEMININO,
  infantil: INFANTIL,
  lancamentos: [...MASCULINO, ...FEMININO].filter(
    (p) => p.launch || p.tag === "Novo" || p.tag === "Drop",
  ),
  ofertas: OFERTAS,
};

const num = (v: unknown, fallback = 0) => {
  const n = typeof v === "string" ? Number(v.replace(",", ".")) : Number(v);
  return Number.isFinite(n) ? n : fallback;
};

/** Normaliza um produto vindo do CRM para o formato usado no site. */
export function normalizeProduct(raw: Record<string, unknown>): CatalogProduct {
  const id = String(raw.id ?? raw.sku ?? raw.codigo ?? crypto.randomUUID());
  const name = String(raw.name ?? raw.nome ?? "Produto");
  return {
    id,
    name,
    brand: String(raw.brand ?? raw.marca ?? "Maxor"),
    category: String(raw.category ?? raw.categoria ?? "Casual"),
    price: num(raw.price ?? raw.preco),
    old: raw.old ?? raw.preco_antigo ? num(raw.old ?? raw.preco_antigo) : undefined,
    tag: raw.tag ? String(raw.tag) : undefined,
    img: String(raw.img ?? raw.image ?? raw.imagem ?? productPlaceholder(name)),
    colors: Array.isArray(raw.colors)
      ? (raw.colors as unknown[]).map(String)
      : Array.isArray(raw.cores)
        ? (raw.cores as unknown[]).map(String)
        : ["#0F1720"],
    sizes: Array.isArray(raw.sizes)
      ? (raw.sizes as unknown[]).map((s) => num(s))
      : Array.isArray(raw.tamanhos)
        ? (raw.tamanhos as unknown[]).map((s) => num(s))
        : [39, 40, 41, 42, 43],
    launch: Boolean(raw.launch ?? raw.lancamento ?? false),
    images: Array.isArray(raw.images)
      ? (raw.images as unknown[]).map(String).filter(Boolean)
      : undefined,
  };
}

/**
 * Busca o catálogo público do CRM.
 * Lança erro se a API não responder — use `loadCatalogTabs()` para fallback.
 */
export async function fetchCrmCatalog(signal?: AbortSignal): Promise<CatalogTabs> {
  const res = await fetch(CRM_CATALOG_URL, {
    signal,
    headers: { accept: "application/json" },
  });
  if (!res.ok) throw new Error(`CRM catalog HTTP ${res.status}`);

  const data = (await res.json()) as { tabs?: Record<string, unknown[]> };
  const tabs = data?.tabs ?? {};

  const pick = (key: CatalogTabKey): CatalogProduct[] => {
    const list = tabs[key];
    if (!Array.isArray(list) || list.length === 0) return LOCAL_CATALOG_TABS[key];
    return list.map((p) => normalizeProduct(p as Record<string, unknown>));
  };

  return {
    masculino: pick("masculino"),
    feminino: pick("feminino"),
    infantil: pick("infantil"),
    lancamentos: pick("lancamentos"),
    ofertas: pick("ofertas"),
  };
}

/** Nunca falha: tenta o CRM e cai nos dados locais em caso de erro. */
export async function loadCatalogTabs(signal?: AbortSignal): Promise<{
  tabs: CatalogTabs;
  source: "crm" | "local";
  error?: string;
}> {
  try {
    if (!CRM_CONFIGURED) return { tabs: LOCAL_CATALOG_TABS, source: "local" };
    const tabs = await fetchCrmCatalog(signal);
    return { tabs, source: "crm" };
  } catch (err) {
    return {
      tabs: LOCAL_CATALOG_TABS,
      source: "local",
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
