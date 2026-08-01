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

/** Extrai a URL de uma foto vinda do CRM (string ou objeto {url|src|href|path}). */
const toUrl = (v: unknown): string | null => {
  if (typeof v === "string") return v.trim() || null;
  if (v && typeof v === "object") {
    const o = v as Record<string, unknown>;
    const raw = o.url ?? o.src ?? o.href ?? o.path ?? o.secure_url ?? o.publicUrl;
    if (typeof raw === "string" && raw.trim()) return raw.trim();
  }
  return null;
};

/** Aceita 199, "199.90", "R$ 1.299,90" e devolve número (ou null). */
const toMoney = (v: unknown): number | null => {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v !== "string") return null;
  let s = v.replace(/[^\d,.-]/g, "");
  if (s.includes(",") && s.includes(".")) s = s.replace(/\./g, "").replace(",", ".");
  else if (s.includes(",")) s = s.replace(",", ".");
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};

/**

 * Aceita "Masculino", "MASC", "unissex", "kids", "menina", "promoção"…
 * e devolve sempre uma das 4 seções válidas do site.
 * Antes, qualquer variação fora da lista derrubava o lote inteiro com 400.
 */
const toSection = (v: unknown): "masculino" | "feminino" | "infantil" | "ofertas" => {
  const s = String(v ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (/fem|mulher|menina|woman|women|ela/.test(s)) return "feminino";
  if (/inf|kid|crian|baby|junior|menino/.test(s)) return "infantil";
  if (/ofer|promo|sale|outlet|desconto/.test(s)) return "ofertas";
  return "masculino";
};


/**
 * Normaliza o payload do CRM ANTES da validação.
 * O CRM envia a galeria em campos variados (images, fotos, gallery, photos,
 * imageUrls…) e às vezes como lista de objetos. Antes essas chaves eram
 * simplesmente descartadas — por isso o produto chegava sem imagem.
 */
const normalizeIncoming = (input: unknown) => {
  if (!input || typeof input !== "object") return input;
  const raw = { ...(input as Record<string, unknown>) };

  const galleryKeys = [
    "images", "imgs", "gallery", "galeria", "photos", "fotos",
    "imageUrls", "image_urls", "pictures", "midias", "media",
  ];
  const gallery: string[] = [];
  for (const key of galleryKeys) {
    const v = raw[key];
    if (Array.isArray(v)) for (const item of v) { const u = toUrl(item); if (u) gallery.push(u); }
    else { const u = toUrl(v); if (u) gallery.push(u); }
  }

  const mainKeys = ["img", "image", "imagem", "foto", "imageUrl", "image_url", "cover", "capa", "thumbnail"];
  let main: string | null = null;
  for (const key of mainKeys) {
    const u = toUrl(raw[key]);
    if (u) { main = u; break; }
  }
  if (!main && gallery.length) main = gallery[0];
  if (main && !gallery.includes(main)) gallery.unshift(main);

  for (const key of [...galleryKeys, ...mainKeys]) delete raw[key];

  // Aliases do Maxor CRM (Antigravity): id_produto, name_prod, marca_prod,
  // categoria_prod, tipo_prod, valor_dec, discountPrice, siteVisible, modelGroup.
  return {
    ...raw,
    sku: raw.sku ?? raw.id_produto ?? raw.codigo ?? raw.code ?? raw.id,
    name: raw.name ?? raw.name_prod ?? raw.nome,
    brand: raw.brand ?? raw.marca_prod ?? raw.marca,
    category: raw.category ?? raw.categoria_prod ?? raw.categoria ?? raw.tipo_prod ?? raw.tipo,
    description: raw.description ?? raw.descricao ?? null,
    section: toSection(
      raw.section ?? raw.secao ?? raw.genero ?? raw.genero_prod ?? raw.aba ?? raw.tipo_prod,
    ),

    price: toMoney(raw.price ?? raw.valor_dec ?? raw.preco ?? raw.valor),
    old_price: toMoney(
      raw.old_price ?? raw.oldPrice ?? raw.discountPrice ?? raw.preco_antigo ?? null,
    ),
    model_group: raw.model_group ?? raw.modelGroup ?? raw.grupo_modelo ?? null,
    sizes: raw.sizes ?? raw.numeracao ?? raw.tamanhos,
    colors: raw.colors ?? raw.cores,
    site_visible: raw.site_visible ?? raw.siteVisible ?? raw.publicado ?? true,
    img: main,
    images: Array.from(new Set(gallery)).slice(0, 20),
  };
};


const productSchema = z.preprocess(
  normalizeIncoming,
  z.object({
    sku: z.string().min(1).max(64),
    name: z.string().min(1).max(200),
    brand: z.string().min(1).max(80).default("Maxor"),
    section: z.enum(["masculino", "feminino", "infantil", "ofertas"]).default("masculino"),
    category: z.string().min(1).max(80).default("Casual"),
    description: z.string().max(2000).nullish().default(null),
    price: z.coerce.number().min(0).max(1_000_000),
    old_price: z.coerce.number().min(0).max(1_000_000).nullish().default(null),
    img: z.string().max(1000).nullish().default(null),
    images: z.array(z.string().max(1000)).max(20).default([]),
    // Defaults obrigatórios: no envio em lote o PostgREST une as chaves de
    // todas as linhas e preenche as ausentes com NULL (não com o DEFAULT da
    // coluna) — sem isso um produto sem cor derruba o lote inteiro.
    colors: z.array(z.string().max(32)).max(30).default(["#0F1720"]),
    // min 15 para aceitar numeração infantil/baby.
    sizes: z.array(z.coerce.number().int().min(15).max(60)).max(40).default([38, 39, 40, 41, 42, 43, 44]),
    stock: z.coerce.number().int().min(0).max(1_000_000).default(0),
    backorder: z.boolean().default(true),
    launch: z.boolean().default(false),
    tag: z.string().max(40).nullish().default(null),
    model_group: z.string().max(120).nullish().default(null),

    site_visible: z.boolean().default(true),
  }),
);

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
            "id, sku, name, brand, section, category, description, price, old_price, img, images, colors, sizes, stock, backorder, launch, tag, model_group, site_visible",
          )
          .eq("site_visible", true)
          .order("created_at", { ascending: false });

        if (error) return json({ ok: false, error: error.message }, 500);
        return json({ ok: true, total: data?.length ?? 0, products: data ?? [] });
      },

      POST: async ({ request }) => {
        const provided = request.headers.get("x-maxor-key") ?? "";
        const accepted = [process.env.MAXOR_CRM_INGEST_KEY, process.env.CRM_INGEST_SECRET].filter(
          (v): v is string => typeof v === "string" && v.length > 0,
        );
        if (accepted.length === 0 || !accepted.includes(provided)) {
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

        // Todas as linhas saem do schema com EXATAMENTE as mesmas chaves
        // (colunas nullable ficam null). Isso é obrigatório no upsert em lote:
        // o PostgREST une as chaves do lote e preenche as faltantes com NULL.
        const rows = parsed.data.map((item) =>
          Object.fromEntries(Object.entries(item).filter(([, v]) => v !== undefined)),
        );


        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin
          .from("products")
          .upsert(rows as never, { onConflict: "sku" })
          .select("id, sku, name, section, site_visible");

        if (error) return json({ ok: false, error: error.message }, 500);
        return json({ ok: true, upserted: data?.length ?? 0, products: data ?? [] }, 201);
      },
    },
  },
});
