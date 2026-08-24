/**
 * Leitura pública da página de produto — usada no loader SSR de /produto/$id.
 *
 * Antes, o loader lia o array em memória `ALL_PRODUCTS`, que só é populado
 * no cliente (useCrmSync). Resultado: qualquer acesso direto, reload ou
 * compartilhamento de link de produto caía em 404 no servidor.
 *
 * Aqui o servidor consulta `public.products` com a chave pública (anon),
 * respeitando as MESMAS regras de gating da vitrine (setCrmProducts):
 *  1. site_visible = true (RLS pública já filtra)
 *  2. selo/tag válido
 *  3. imagem que o navegador do cliente consegue carregar
 */
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import {
  isPublished,
  isUsableImage,
  normalizeProduct,
  normalizeSelo,
  type ProductWithSection,
} from "@/lib/catalog";

const COLUMNS =
  "id, sku, name, brand, section, category, description, price, old_price, img, images, colors, sizes, stock, backorder, launch, tag, model_group, site_visible, brand_visible";

/** Cliente público (anon) para leitura server-side — RLS `products_public_read` se aplica. */
function createPublicClient() {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"] ?? process.env["SUPABASE_ANON_KEY"];
  if (!url || !key) throw new Error("Configuração pública do banco ausente no servidor.");
  return createClient<Database>(url, key, {
    auth: { persistSession: false },
    // Chaves sb_ não são JWT: envia apenas `apikey`, sem Authorization bearer.
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

type DbRow = {
  id: string;
  sku: string | null;
  name: string;
  brand: string;
  section: string;
  category: string;
  description: string | null;
  price: number | string;
  old_price: number | string | null;
  img: string | null;
  images: string[] | null;
  colors: string[] | null;
  sizes: number[] | null;
  stock: number;
  backorder: boolean;
  launch: boolean;
  tag: string | null;
  model_group: string | null;
  site_visible: boolean;
  brand_visible: boolean | null;
};

/** Mesmo mapeamento linha→registro usado pelo sync do cliente (crm-db-catalog.ts). */
function mapRow(row: DbRow): Record<string, unknown> {
  return {
    id: row.sku || row.id,
    name: row.name,
    brand: row.brand,
    category: row.category,
    section: row.section,
    price: row.price,
    old: row.old_price ?? undefined,
    tag: row.tag ?? undefined,
    modelId: row.model_group ?? undefined,
    img: row.img ?? (row.images?.[0] ?? undefined),
    images: row.images ?? undefined,
    colors: row.colors ?? undefined,
    sizes: row.sizes ?? undefined,
    launch: row.launch,
    description: row.description ?? undefined,
    stock: row.stock,
    backorder: row.backorder,
    site_visible: row.site_visible,
    brand_visible: row.brand_visible ?? true,
  };
}

export type ProductPageData = {
  product: ProductWithSection;
  variants: ProductWithSection[];
};

/**
 * Busca o produto (por SKU ou UUID) e as variantes de cor do mesmo modelo.
 * Retorna `null` quando o produto não existe ou não passa no gating da vitrine.
 */
export async function fetchProductPageData(id: string): Promise<ProductPageData | null> {
  const supabasePublic = createPublicClient();
  const { data, error } = await supabasePublic
    .from("products")
    .select(COLUMNS)
    .eq("site_visible", true);
  if (error) throw new Error(error.message);

  const products = ((data ?? []) as unknown as DbRow[])
    .map(mapRow)
    .filter((p) => isPublished(p) && normalizeSelo(p.tag ?? p.selo) !== null)
    .map(normalizeProduct)
    .filter((p) => p.id && isUsableImage(p.img));

  const product = products.find((p) => p.id === id);
  if (!product) return null;

  // Variantes de cor do mesmo modelo (mesma lógica de getVariants do cliente).
  const groupKey = product.modelId ?? product.id;
  const seen = new Set<string>();
  const variants: ProductWithSection[] = [];
  for (const p of products) {
    if ((p.modelId ?? p.id) !== groupKey) continue;
    const dedupKey = `${p.name}::${p.colors[0] ?? ""}`;
    if (seen.has(dedupKey)) continue;
    seen.add(dedupKey);
    variants.push(p);
  }
  variants.sort((a, b) => (a.id === product.id ? -1 : b.id === product.id ? 1 : 0));

  return { product, variants };
}
