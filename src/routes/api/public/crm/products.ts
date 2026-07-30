/**
 * Endpoint público de ingestão do catálogo — usado pelo CRM Maxor (Antigravity).
 *
 * GET  /api/public/crm/products  -> lista os produtos publicados no site
 * POST /api/public/crm/products  -> insere/atualiza um produto (upsert por SKU)
 *
 * Segurança: o POST exige o header `x-maxor-key` com o valor do segredo
 * CRM_INGEST_SECRET (configurado no backend). Sem isso, retorna 401.
 */
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const productSchema = z.object({
  sku: z.string().min(1).max(64),
  name: z.string().min(1).max(200),
  brand: z.string().min(1).max(80).default("Maxor"),
  section: z.enum(["masculino", "feminino", "infantil", "ofertas"]).default("masculino"),
  category: z.string().min(1).max(80).default("Casual"),
  description: z.string().max(2000).optional().nullable(),
  price: z.coerce.number().min(0).max(1_000_000),
  old_price: z.coerce.number().min(0).max(1_000_000).optional().nullable(),
  img: z.string().url().max(500).optional().nullable(),
  colors: z.array(z.string().max(32)).max(30).optional(),
  sizes: z.array(z.coerce.number().int().min(10).max(60)).max(40).optional(),
  stock: z.coerce.number().int().min(0).max(1_000_000).default(0),
  backorder: z.boolean().default(true),
  launch: z.boolean().default(false),
  tag: z.string().max(40).optional().nullable(),
  site_visible: z.boolean().default(true),
});

const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "cache-control": "no-store" } });

export const Route = createFileRoute("/api/public/crm/products")({
  server: {
    handlers: {
      GET: async () => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin
          .from("products")
          .select(
            "id, sku, name, brand, section, category, description, price, old_price, img, colors, sizes, stock, backorder, launch, tag, site_visible",
          )
          .eq("site_visible", true)
          .order("created_at", { ascending: false });

        if (error) return json({ ok: false, error: error.message }, 500);
        return json({ ok: true, total: data?.length ?? 0, products: data ?? [] });
      },

      POST: async ({ request }) => {
        const secret = process.env.CRM_INGEST_SECRET;
        if (!secret || request.headers.get("x-maxor-key") !== secret) {
          return json({ ok: false, error: "Unauthorized" }, 401);
        }

        let payload: unknown;
        try {
          payload = await request.json();
        } catch {
          return json({ ok: false, error: "JSON inválido" }, 400);
        }

        const items = Array.isArray(payload) ? payload : [payload];
        const parsed = z.array(productSchema).max(200).safeParse(items);
        if (!parsed.success) {
          return json({ ok: false, error: "Payload inválido", issues: parsed.error.issues }, 400);
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin
          .from("products")
          .upsert(parsed.data, { onConflict: "sku" })
          .select("id, sku, name, section, site_visible");

        if (error) return json({ ok: false, error: error.message }, 500);
        return json({ ok: true, upserted: data?.length ?? 0, products: data ?? [] }, 201);
      },
    },
  },
});
