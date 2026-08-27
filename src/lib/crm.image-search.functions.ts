/**
 * crm.image-search.functions.ts
 *
 * Busca de produtos por NOME e por IMAGEM.
 *
 * Estratégia:
 *  - `searchByName`: filtra o catálogo publicado no CRM (`public.products`) por
 *    nome/marca/categoria. Quando existir a tabela `products` no CRM,
 *    trocamos o `pool` por uma consulta ao Supabase (auth público via
 *    publishable key + policy TO anon SELECT em colunas seguras).
 *  - `searchByImage`: envia a imagem (base64) pro Gemini via AI Gateway,
 *    extrai atributos visuais (brand, model, colors, category, keywords)
 *    e usa esses atributos como termos de busca no mesmo pool de produtos.
 *
 * TODO(CRM): trocar `pool` por SELECT em `public.products` com colunas
 *   { id, name, brand, category, price, image_url, colors, sizes } e
 *   uma policy `SELECT TO anon USING (is_active)`.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { CatalogProduct } from "@/components/site/CatalogPage";

export type ProductHit = CatalogProduct & { score: number };

/**
 * Pool de busca = catálogo publicado no CRM (`public.products` com
 * `site_visible = true`). Não existe fallback local.
 */
async function pool(): Promise<CatalogProduct[]> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("products")
    .select("id, sku, name, brand, category, price, old_price, img, images, colors, sizes, tag")
    .eq("site_visible", true);

  return (data ?? []).map((row) => {
    const r = row as Record<string, unknown>;
    const images = Array.isArray(r.images) ? (r.images as unknown[]).map(String) : [];
    return {
      id: String(r.sku || r.id),
      name: String(r.name ?? ""),
      brand: String(r.brand ?? "Maxor"),
      category: String(r.category ?? "Casual"),
      price: Number(r.price ?? 0),
      old: r.old_price != null ? Number(r.old_price) : undefined,
      tag: r.tag ? String(r.tag) : undefined,
      img: String(r.img ?? images[0] ?? ""),
      images: images.length ? images : undefined,
      colors: Array.isArray(r.colors) ? (r.colors as unknown[]).map(String) : ["#0F1720"],
      sizes: Array.isArray(r.sizes) ? (r.sizes as unknown[]).map(Number) : [],
    } as CatalogProduct;
  }).filter((p) => p.id && p.img);
}

function tokenize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 1);
}

function scoreProduct(p: CatalogProduct, terms: string[]) {
  const hay = tokenize(`${p.name} ${p.brand} ${p.category}`);
  let s = 0;
  for (const t of terms) {
    if (hay.includes(t)) s += 3;
    else if (hay.some((h) => h.includes(t) || t.includes(h))) s += 1;
  }
  return s;
}

async function rank(terms: string[], limit = 12): Promise<ProductHit[]> {
  if (!terms.length) return [];
  return (await pool())
    .map((p) => ({ ...p, score: scoreProduct(p, terms) }))
    .filter((p) => p.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// -------------------- Search by name --------------------

export const searchByName = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ query: z.string().min(1).max(120) }).parse(data),
  )
  .handler(async ({ data }) => {
    const terms = tokenize(data.query);
    const results = await rank(terms);
    return { query: data.query, count: results.length, results };
  });

// -------------------- Search by image --------------------

const VisionSchema = z.object({
  brand: z.string().nullable().optional(),
  model: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  colors: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]),
});

export const searchByImage = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({
      // data URL: "data:image/jpeg;base64,...."
      imageDataUrl: z.string().min(32).max(8_000_000),
      // texto digitado na barra de busca (opcional) — soma aos termos da visão
      query: z.string().trim().max(120).optional(),
    }).parse(data),
  )
  .handler(async ({ data }) => {
    const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY ausente no servidor.");

    // 1) Gemini vision — identifica atributos visuais do tênis.
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": LOVABLE_API_KEY,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "Você identifica tênis esportivos em fotos. Responda SOMENTE JSON válido no formato: " +
              '{"brand":"Nike|Adidas|New Balance|Puma|Asics|Jordan|On|Mizuno|Fila|Crocs|Hoka|Salomon|Vans|Timberland|Gucci|Prada|Louis Vuitton|null",' +
              '"model":"nome do modelo se reconhecer, ex: Air Force 1, Ultraboost 22, Gazelle","category":"Corrida|Casual|Trail|Chuteira|null",' +
              '"colors":["cores dominantes em português"],"keywords":["palavras-chave visuais úteis pra busca"]}',
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Identifique este tênis:" },
              { type: "image_url", image_url: { url: data.imageDataUrl } },
            ],
          },
        ],
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      if (res.status === 429) throw new Error("Muitas buscas — tente de novo em instantes.");
      if (res.status === 402) throw new Error("Créditos de IA esgotados. Contate o admin.");
      throw new Error(`AI Gateway ${res.status}: ${body}`);
    }

    const payload = await res.json();
    const raw: string = payload?.choices?.[0]?.message?.content ?? "{}";
    // Gemini às vezes envolve em ```json ... ```
    const cleaned = raw.replace(/```json\s*|\s*```/g, "").trim();

    let vision: z.infer<typeof VisionSchema>;
    try {
      vision = VisionSchema.parse(JSON.parse(cleaned));
    } catch {
      vision = { colors: [], keywords: [] };
    }

    // 2) Monta termos de busca a partir da visão e rankeia no catálogo.
    const terms = tokenize(
      [
        vision.brand ?? "",
        vision.model ?? "",
        vision.category ?? "",
        ...(vision.keywords ?? []),
      ].join(" "),
    );
    const results = await rank(terms);

    return {
      vision,
      count: results.length,
      results,
    };
  });
