import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const KINDS = ["brand", "category", "type"] as const;
export type TaxonomyKind = (typeof KINDS)[number];

export type TaxonomyItem = {
  id: string;
  kind: TaxonomyKind;
  name: string;
  slug: string;
};

export function taxonomySlug(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Lista marcas, categorias e tipos cadastrados na organização do usuário. */
export const listTaxonomy = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("catalog_taxonomy")
      .select("id, kind, name, slug")
      .order("name", { ascending: true });
    if (error) throw error;
    return (data ?? []) as TaxonomyItem[];
  });

/** Cadastro rápido de um item (marca/categoria/tipo) durante o cadastro de produto. */
export const createTaxonomyItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        kind: z.enum(KINDS),
        name: z.string().trim().min(1).max(80),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: orgRow, error: orgErr } = await supabase
      .from("user_roles")
      .select("org_id")
      .eq("user_id", userId)
      .limit(1)
      .maybeSingle();
    if (orgErr || !orgRow) throw new Error("Organização não encontrada");

    const slug = taxonomySlug(data.name);
    if (!slug) throw new Error("Nome inválido");

    const { data: existing } = await supabase
      .from("catalog_taxonomy")
      .select("id, kind, name, slug")
      .eq("org_id", orgRow.org_id)
      .eq("kind", data.kind)
      .eq("slug", slug)
      .maybeSingle();
    if (existing) return existing as TaxonomyItem;

    const { data: row, error } = await supabase
      .from("catalog_taxonomy")
      .insert({ org_id: orgRow.org_id, kind: data.kind, name: data.name, slug })
      .select("id, kind, name, slug")
      .single();
    if (error) throw error;
    return row as TaxonomyItem;
  });
