import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const favoriteInput = z.object({
  product_id: z.string().trim().min(1).max(120),
  name: z.string().trim().min(1).max(200),
  brand: z.string().trim().max(120).optional().nullable(),
  img: z.string().trim().max(600).optional().nullable(),
  price: z.number().finite().min(0).max(1_000_000).optional(),
});

export type FavoriteRow = {
  id: string;
  product_id: string;
  name: string;
  brand: string | null;
  img: string | null;
  price: number;
};

export const listMyFavorites = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("buyer_favorites")
      .select("id, product_id, name, brand, img, price")
      .order("created_at", { ascending: false });
    if (error) throw new Error("Não foi possível carregar seus favoritos.");
    return (data ?? []) as FavoriteRow[];
  });

export const listMyFavoriteIds = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("buyer_favorites")
      .select("product_id");
    if (error) return [] as string[];
    return (data ?? []).map((r) => r.product_id as string);
  });

export const toggleFavorite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => favoriteInput.parse(raw))
  .handler(async ({ data, context }) => {
    const { data: existing } = await context.supabase
      .from("buyer_favorites")
      .select("id")
      .eq("product_id", data.product_id)
      .maybeSingle();

    if (existing) {
      const { error } = await context.supabase
        .from("buyer_favorites")
        .delete()
        .eq("id", existing.id);
      if (error) throw new Error("Não foi possível remover dos favoritos.");
      return { favorited: false };
    }

    const { error } = await context.supabase.from("buyer_favorites").insert({
      user_id: context.userId,
      product_id: data.product_id,
      name: data.name,
      brand: data.brand ?? null,
      img: data.img ?? null,
      price: data.price ?? 0,
    });
    if (error) throw new Error("Não foi possível salvar nos favoritos.");
    return { favorited: true };
  });

export const removeFavorite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({ id: z.string().uuid() }).parse(raw))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("buyer_favorites")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error("Não foi possível remover dos favoritos.");
    return { ok: true };
  });
