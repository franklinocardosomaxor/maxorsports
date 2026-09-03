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
  marca_prod: string | null;
  section: string;
  category: string;
  description: string | null;
  price: number | string;
  old_price: number | string | null;
  img: string | null;
  images: string[] | null;
  colors: string[] | null;
  sizes: number[] | null;
  /** Numeração real cadastrada no CRM. */
  num_cal_min: number | null;
  num_cal_max: number | null;
  stock: number;
  backorder: boolean;
  launch: boolean;
  tag: string | null;
  model_group: string | null;
  color_variant: string | null;
  site_visible: boolean;
  brand_visible: boolean | null;
  /** Gênero cadastrado no CRM — soberano sobre a seção para unissex. */
  genero: string | null;
  gender: string | null;
};

/** Busca os produtos publicados no banco compartilhado. */
export async function fetchDbProducts(): Promise<Record<string, unknown>[]> {
  // Busca apenas produtos com visibilidade ativa e ordenados pelos mais recentes
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, sku, name, brand, marca_prod, section, category, description, price, old_price, img, images, colors, sizes, stock, backorder, launch, tag, model_group, color_variant, num_cal_min, num_cal_max, site_visible, brand_visible, genero, gender",
    )
    .eq("site_visible", true)
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((p) => {
    const row = p as unknown as DbProduct;
    return {
      id: row.sku || row.id,
      name: row.name,
      // `brand` é soberana; `marca_prod` é o espelho legado (fallback).
      brand: row.brand ?? row.marca_prod,
      category: row.category,
      section: row.section,
      price: row.price,
      old: undefined, // preço anterior riscado suspenso
      tag: row.tag ?? undefined,
      modelId: row.model_group ?? undefined,
      colorVariant: row.color_variant ?? undefined,
      img: row.img ?? (row.images?.[0] ?? undefined),
      images: row.images ?? undefined,
      colors: row.colors ?? undefined,
      sizes: row.sizes ?? undefined,
      num_cal_min: row.num_cal_min ?? undefined,
      num_cal_max: row.num_cal_max ?? undefined,
      launch: row.launch,
      description: row.description ?? undefined,
      stock: row.stock,
      backorder: row.backorder,
      site_visible: row.site_visible,
      brand_visible: row.brand_visible ?? true,
      genero: row.genero ?? row.gender ?? undefined,
    } satisfies Record<string, unknown>;
  });
}
