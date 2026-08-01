/**
 * Catálogo vindo do banco compartilhado (Lovable Cloud / Supabase).
 *
 * É por aqui que os produtos cadastrados no CRM Maxor (Antigravity) aparecem
 * no site: o CRM grava na tabela `public.products` com `site_visible = true`
 * e o site lê a mesma tabela — sem precisar de API intermediária.
 */

import { supabase } from "@/integrations/supabase/client";

export type DbProduct = {
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
};

/** Busca os produtos publicados no banco compartilhado. */
export async function fetchDbProducts(): Promise<Record<string, unknown>[]> {
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, sku, name, brand, section, category, description, price, old_price, img, images, colors, sizes, stock, backorder, launch, tag, model_group, site_visible",
    )
    .eq("site_visible", true)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((p) => {
    const row = p as unknown as DbProduct;
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
    } satisfies Record<string, unknown>;
  });
}
