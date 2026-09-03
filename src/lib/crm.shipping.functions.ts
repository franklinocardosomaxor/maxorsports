import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Marcador usado no seletor para aplicar em todo o catálogo. */
export const ALL_CATEGORIES = "__all__";

export type ShippingCategoryStat = {
  category: string;
  total: number;
  minShipping: number;
  maxShipping: number;
};

const round2 = (n: number) => Math.round((Number.isFinite(n) ? n : 0) * 100) / 100;

/** Mesma fórmula do cadastro de produto: (custo + frete + imposto) × (1 + margem/100). */
function recalcPrice(cost: number, ship: number, margin: number, extra: number) {
  return round2((cost + ship + extra) * (1 + margin / 100));
}

/** Resumo por categoria: quantos produtos e faixa de frete atual. */
export const listShippingByCategory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("products")
      .select("category, shipping_cost");
    if (error) throw error;

    const map = new Map<string, ShippingCategoryStat>();
    for (const row of data ?? []) {
      const category = String((row as { category?: string }).category || "").trim() || "Sem categoria";
      const ship = Number((row as { shipping_cost?: number }).shipping_cost || 0);
      const cur = map.get(category);
      if (!cur) map.set(category, { category, total: 1, minShipping: ship, maxShipping: ship });
      else {
        cur.total += 1;
        cur.minShipping = Math.min(cur.minShipping, ship);
        cur.maxShipping = Math.max(cur.maxShipping, ship);
      }
    }
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  });

/**
 * Aplica um novo valor de frete em todos os produtos de uma categoria
 * (ou em todo o catálogo) e recalcula o preço final mantendo a margem.
 */
export const applyShippingByCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        category: z.string().trim().min(1),
        shipping: z.number().min(0).max(100000),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const ship = round2(data.shipping);

    let query = supabase
      .from("products")
      .select("id, price, cost_supplier, margin_percent, import_cost, import_cost_included, shipping_cost");
    if (data.category !== ALL_CATEGORIES) query = query.eq("category", data.category);

    const { data: rows, error } = await query;
    if (error) throw error;

    let updated = 0;
    for (const raw of rows ?? []) {
      const p = raw as Record<string, unknown>;
      const cost = Number(p.cost_supplier || 0);
      const margin = Number(p.margin_percent || 0);
      const extra = p.import_cost_included ? Number(p.import_cost || 0) : 0;
      const oldShip = Number(p.shipping_cost || 0);
      const oldPrice = Number(p.price || 0);

      // Sem custo ou sem margem cadastrados: apenas ajusta a diferença de frete
      // para não zerar o preço de venda do produto.
      const price =
        cost > 0 && margin > 0
          ? recalcPrice(cost, ship, margin, extra)
          : round2(Math.max(0, oldPrice + (ship - oldShip)));

      const { error: upErr } = await supabase
        .from("products")
        .update({ shipping_cost: ship, price, valor_dec: price })
        .eq("id", String(p.id));
      if (upErr) throw upErr;
      updated += 1;
    }

    return { updated, shipping: ship };
  });
